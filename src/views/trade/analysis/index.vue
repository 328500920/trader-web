<template>
  <div class="analysis-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <h1>📊 绩效分析</h1>
        <p>深度分析交易数据，持续优化交易策略</p>
      </div>
      <div class="header-right">
        <el-date-picker
          v-model="dateRange"
          type="monthrange"
          range-separator="至"
          start-placeholder="开始月份"
          end-placeholder="结束月份"
          @change="loadData"
        />
      </div>
    </div>

    <!-- 核心指标 -->
    <div class="metrics-section">
      <div class="metric-card">
        <div class="metric-icon trades">
          <el-icon><DataLine /></el-icon>
        </div>
        <div class="metric-content">
          <div class="metric-value">{{ stats.totalTrades }}</div>
          <div class="metric-label">总交易次数</div>
        </div>
      </div>

      <div class="metric-card">
        <div class="metric-icon winrate">
          <el-icon><Aim /></el-icon>
        </div>
        <div class="metric-content">
          <div class="metric-value">{{ stats.winRate }}%</div>
          <div class="metric-label">胜率</div>
          <div class="metric-sub">{{ stats.winTrades }}胜 / {{ stats.loseTrades }}负</div>
        </div>
      </div>

      <div class="metric-card">
        <div class="metric-icon ratio">
          <el-icon><TrendCharts /></el-icon>
        </div>
        <div class="metric-content">
          <div class="metric-value">{{ stats.profitFactor }}:1</div>
          <div class="metric-label">盈亏比</div>
        </div>
      </div>

      <div class="metric-card" :class="{ negative: stats.netProfit < 0 }">
        <div class="metric-icon profit">
          <el-icon><Coin /></el-icon>
        </div>
        <div class="metric-content">
          <div class="metric-value" :class="stats.netProfit >= 0 ? 'text-success' : 'text-danger'">
            {{ stats.netProfit >= 0 ? '+' : '' }}{{ stats.netProfit }}%
          </div>
          <div class="metric-label">净收益</div>
          <div class="metric-sub">{{ stats.netProfitAmount }} USDT</div>
        </div>
      </div>

      <div class="metric-card">
        <div class="metric-icon drawdown">
          <el-icon><Bottom /></el-icon>
        </div>
        <div class="metric-content">
          <div class="metric-value text-danger">{{ stats.maxDrawdown }}%</div>
          <div class="metric-label">最大回撤</div>
        </div>
      </div>

      <div class="metric-card">
        <div class="metric-icon time">
          <el-icon><Clock /></el-icon>
        </div>
        <div class="metric-content">
          <div class="metric-value">{{ stats.avgHoldTime }}</div>
          <div class="metric-label">平均持仓</div>
        </div>
      </div>
    </div>

    <!-- 收益曲线 -->
    <div class="chart-section">
      <div class="section-card full-width">
        <div class="card-header">
          <h3><el-icon><TrendCharts /></el-icon>收益曲线</h3>
        </div>
        <div class="chart-container large" ref="profitChartRef"></div>
      </div>
    </div>

    <!-- 分析图表 -->
    <div class="charts-grid">
      <div class="section-card">
        <div class="card-header">
          <h3><el-icon><PieChart /></el-icon>按策略统计</h3>
        </div>
        <div class="chart-container" ref="strategyChartRef"></div>
      </div>

      <div class="section-card">
        <div class="card-header">
          <h3><el-icon><PieChart /></el-icon>按品种统计</h3>
        </div>
        <div class="chart-container" ref="symbolChartRef"></div>
      </div>
    </div>

    <!-- 月度对比 -->
    <div class="chart-section">
      <div class="section-card full-width">
        <div class="card-header">
          <h3><el-icon><Histogram /></el-icon>月度收益对比</h3>
        </div>
        <div class="chart-container large" ref="monthlyChartRef"></div>
      </div>
    </div>

    <!-- 详细数据表 -->
    <div class="table-section">
      <div class="section-card full-width">
        <div class="card-header">
          <h3><el-icon><Document /></el-icon>月度明细</h3>
        </div>
        <el-table :data="monthlyData" stripe>
          <el-table-column prop="month" label="月份" width="120" />
          <el-table-column prop="trades" label="交易次数" width="100" align="center" />
          <el-table-column label="胜率" width="100" align="center">
            <template #default="{ row }">
              <span :class="row.winRate >= 50 ? 'text-success' : 'text-danger'">
                {{ row.winRate }}%
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="profitFactor" label="盈亏比" width="100" align="center" />
          <el-table-column label="净收益" width="120" align="center">
            <template #default="{ row }">
              <span :class="row.netProfit >= 0 ? 'text-success' : 'text-danger'">
                {{ row.netProfit >= 0 ? '+' : '' }}{{ row.netProfit }}%
              </span>
            </template>
          </el-table-column>
          <el-table-column label="最大回撤" width="100" align="center">
            <template #default="{ row }">
              <span class="text-danger">{{ row.maxDrawdown }}%</span>
            </template>
          </el-table-column>
          <el-table-column label="评价" min-width="120">
            <template #default="{ row }">
              <el-tag 
                :type="getMonthRating(row).type" 
                size="small"
              >
                {{ getMonthRating(row).text }}
              </el-tag>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts'
import { getTradeSummary, getTradeChart, getStrategyStats, getSymbolStats } from '@/api/trade'

const dateRange = ref([])
const profitChartRef = ref()
const strategyChartRef = ref()
const symbolChartRef = ref()
const monthlyChartRef = ref()

let profitChart = null
let strategyChart = null
let symbolChart = null
let monthlyChart = null

const stats = ref({
  totalTrades: 0,
  winTrades: 0,
  loseTrades: 0,
  winRate: 0,
  profitFactor: 0,
  netProfit: 0,
  netProfitAmount: 0,
  maxDrawdown: 0,
  avgHoldTime: '-'
})

const chartData = ref([])
const strategyData = ref([])
const symbolData = ref([])
const monthlyData = ref([])

const getMonthRating = (row) => {
  if (row.netProfit >= 10 && row.winRate >= 60) return { type: 'success', text: '优秀' }
  if (row.netProfit >= 5 && row.winRate >= 50) return { type: 'primary', text: '良好' }
  if (row.netProfit >= 0) return { type: 'warning', text: '一般' }
  return { type: 'danger', text: '需改进' }
}

const loadStats = async () => {
  try {
    const res = await getTradeSummary()
    if (res.code === 200) Object.assign(stats.value, res.data)
  } catch (error) {
    console.error('加载统计失败', error)
  }
}

const loadChartData = async () => {
  try {
    const res = await getTradeChart()
    if (res.code === 200) {
      chartData.value = res.data || []
      updateProfitChart()
    }
  } catch (error) {
    console.error('加载图表数据失败', error)
  }
}

const loadStrategyStats = async () => {
  try {
    const res = await getStrategyStats()
    if (res.code === 200) {
      strategyData.value = res.data || []
      updateStrategyChart()
    }
  } catch (error) {
    console.error('加载策略统计失败', error)
  }
}

const loadSymbolStats = async () => {
  try {
    const res = await getSymbolStats()
    if (res.code === 200) {
      symbolData.value = res.data || []
      updateSymbolChart()
    }
  } catch (error) {
    console.error('加载品种统计失败', error)
  }
}

// 图表初始化和更新
const initProfitChart = () => {
  if (!profitChartRef.value) return
  profitChart = echarts.init(profitChartRef.value)
  updateProfitChart()
}

const updateProfitChart = () => {
  if (!profitChart || profitChart.isDisposed()) return
  const dates = chartData.value.map(d => d.date)
  const profits = chartData.value.map(d => d.profit)
  
  profitChart.setOption({
    tooltip: { 
      trigger: 'axis',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#eee',
      textStyle: { color: '#333' }
    },
    grid: { left: '3%', right: '4%', bottom: '3%', top: '10%', containLabel: true },
    xAxis: {
      type: 'category',
      data: dates.length > 0 ? dates : ['暂无数据'],
      axisLabel: { color: '#999' },
      axisLine: { lineStyle: { color: '#e0e0e0' } }
    },
    yAxis: {
      type: 'value',
      axisLabel: { color: '#999', formatter: '{value}%' },
      splitLine: { lineStyle: { color: '#f0f0f0', type: 'dashed' } }
    },
    series: [{
      type: 'line',
      smooth: true,
      symbol: 'circle',
      symbolSize: 6,
      data: profits.length > 0 ? profits : [0],
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(103, 194, 58, 0.4)' },
          { offset: 1, color: 'rgba(103, 194, 58, 0.02)' }
        ])
      },
      lineStyle: { color: '#67c23a', width: 3 },
      itemStyle: { color: '#67c23a', borderWidth: 2, borderColor: '#fff' }
    }]
  })
}

const initStrategyChart = () => {
  if (!strategyChartRef.value) return
  strategyChart = echarts.init(strategyChartRef.value)
  updateStrategyChart()
}

const updateStrategyChart = () => {
  if (!strategyChart || strategyChart.isDisposed()) return
  const data = strategyData.value.map(d => ({ value: d.count, name: d.strategy }))
  
  strategyChart.setOption({
    tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
    legend: { bottom: 10, textStyle: { color: '#666' } },
    color: ['#667eea', '#f093fb', '#11998e', '#e6a23c', '#f56c6c'],
    series: [{
      type: 'pie',
      radius: ['45%', '70%'],
      center: ['50%', '45%'],
      data: data.length > 0 ? data : [{ value: 1, name: '暂无数据' }],
      label: { show: false },
      emphasis: {
        label: { show: true, fontSize: 14, fontWeight: 'bold' }
      }
    }]
  })
}

const initSymbolChart = () => {
  if (!symbolChartRef.value) return
  symbolChart = echarts.init(symbolChartRef.value)
  updateSymbolChart()
}

const updateSymbolChart = () => {
  if (!symbolChart || symbolChart.isDisposed()) return
  const data = symbolData.value.map(d => ({ value: d.count, name: d.symbol }))
  
  symbolChart.setOption({
    tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
    legend: { bottom: 10, textStyle: { color: '#666' } },
    color: ['#409eff', '#67c23a', '#e6a23c', '#f56c6c', '#909399'],
    series: [{
      type: 'pie',
      radius: ['45%', '70%'],
      center: ['50%', '45%'],
      data: data.length > 0 ? data : [{ value: 1, name: '暂无数据' }],
      label: { show: false },
      emphasis: {
        label: { show: true, fontSize: 14, fontWeight: 'bold' }
      }
    }]
  })
}

const initMonthlyChart = () => {
  if (!monthlyChartRef.value) return
  monthlyChart = echarts.init(monthlyChartRef.value)
  monthlyChart.setOption({
    tooltip: { trigger: 'axis' },
    legend: { data: ['收益率', '交易次数'], textStyle: { color: '#666' } },
    grid: { left: '3%', right: '4%', bottom: '3%', top: '15%', containLabel: true },
    xAxis: {
      type: 'category',
      data: ['2024-09', '2024-10', '2024-11', '2024-12'],
      axisLabel: { color: '#999' }
    },
    yAxis: [
      { type: 'value', name: '收益率', axisLabel: { formatter: '{value}%', color: '#999' } },
      { type: 'value', name: '交易次数', axisLabel: { color: '#999' } }
    ],
    series: [
      {
        name: '收益率',
        type: 'bar',
        data: [3.0, 5.8, 6.2, 8.5],
        itemStyle: { 
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#67c23a' },
            { offset: 1, color: '#85ce61' }
          ]),
          borderRadius: [4, 4, 0, 0]
        }
      },
      {
        name: '交易次数',
        type: 'line',
        yAxisIndex: 1,
        data: [11, 10, 15, 12],
        lineStyle: { color: '#409eff', width: 2 },
        itemStyle: { color: '#409eff' }
      }
    ]
  })
}

const loadData = () => {
  loadStats()
  loadChartData()
  loadStrategyStats()
  loadSymbolStats()
}

const handleResize = () => {
  if (profitChart && !profitChart.isDisposed()) profitChart.resize()
  if (strategyChart && !strategyChart.isDisposed()) strategyChart.resize()
  if (symbolChart && !symbolChart.isDisposed()) symbolChart.resize()
  if (monthlyChart && !monthlyChart.isDisposed()) monthlyChart.resize()
}

onMounted(() => {
  initProfitChart()
  initStrategyChart()
  initSymbolChart()
  initMonthlyChart()
  loadData()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  profitChart?.dispose()
  strategyChart?.dispose()
  symbolChart?.dispose()
  monthlyChart?.dispose()
})
</script>

<style lang="scss" scoped>
.analysis-page {
  padding-bottom: 40px;
}

// 页面头部
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;

  .header-left {
    h1 {
      font-size: 26px;
      font-weight: 700;
      color: var(--text-primary);
      margin-bottom: 4px;
    }

    p {
      font-size: 14px;
      color: var(--text-secondary);
    }
  }
}

// 核心指标
.metrics-section {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.metric-card {
  background: var(--bg-primary);
  border-radius: 16px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  box-shadow: 0 2px 12px var(--shadow-color);
  transition: all 0.3s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px var(--shadow-color);
  }
}

.metric-icon {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;

  .el-icon {
    font-size: 24px;
    color: white;
  }

  &.trades { background: linear-gradient(135deg, #667eea, #764ba2); }
  &.winrate { background: linear-gradient(135deg, #f093fb, #f5576c); }
  &.ratio { background: linear-gradient(135deg, #11998e, #38ef7d); }
  &.profit { background: linear-gradient(135deg, #67c23a, #85ce61); }
  &.drawdown { background: linear-gradient(135deg, #f56c6c, #f89898); }
  &.time { background: linear-gradient(135deg, #409eff, #66b1ff); }
}

.metric-card.negative .metric-icon.profit {
  background: linear-gradient(135deg, #f56c6c, #f89898);
}

.metric-content {
  .metric-value {
    font-size: 26px;
    font-weight: 700;
    color: var(--text-primary);
    line-height: 1.2;
  }

  .metric-label {
    font-size: 13px;
    color: var(--text-secondary);
    margin-top: 4px;
  }

  .metric-sub {
    font-size: 12px;
    color: var(--text-placeholder);
    margin-top: 4px;
  }
}

// 图表区域
.chart-section {
  margin-bottom: 24px;
}

.charts-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-bottom: 24px;
}

.section-card {
  background: var(--bg-primary);
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 2px 12px var(--shadow-color);

  &.full-width {
    width: 100%;
  }
}

.card-header {
  margin-bottom: 20px;

  h3 {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 16px;
    font-weight: 600;
    color: var(--text-primary);

    .el-icon {
      color: var(--primary-color);
    }
  }
}

.chart-container {
  height: 280px;

  &.large {
    height: 350px;
  }
}

// 表格区域
.table-section {
  margin-bottom: 24px;
}

// 响应式
@media (max-width: 1400px) {
  .metrics-section {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 1024px) {
  .charts-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: 16px;
  }

  .metrics-section {
    grid-template-columns: repeat(2, 1fr);
  }

  .metric-card {
    padding: 16px;
  }

  .metric-icon {
    width: 44px;
    height: 44px;

    .el-icon {
      font-size: 20px;
    }
  }

  .metric-content .metric-value {
    font-size: 20px;
  }
}
</style>
