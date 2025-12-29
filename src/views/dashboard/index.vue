<template>
  <div class="dashboard">
    <!-- 欢迎横幅 -->
    <div class="welcome-banner">
      <div class="banner-content">
        <div class="banner-left">
          <div class="greeting">
            <span class="greeting-icon">{{ greetingIcon }}</span>
            <div class="greeting-text">
              <h1>{{ greeting }}，{{ userStore.nickname }}！</h1>
              <p>{{ currentDate }}</p>
            </div>
          </div>
          <div class="quick-actions">
            <el-button type="primary" size="large" @click="router.push('/trade/create')">
              <el-icon><Plus /></el-icon>新建交易
            </el-button>
            <el-button size="large" @click="router.push('/tool/analysis')">
              <el-icon><DataAnalysis /></el-icon>每日分析
            </el-button>
          </div>
        </div>
        <div class="banner-right">
          <div class="motivational-quote">
            <p>"{{ todayQuote }}"</p>
          </div>
        </div>
      </div>
      <div class="banner-decoration">
        <div class="circle c1"></div>
        <div class="circle c2"></div>
        <div class="circle c3"></div>
      </div>
    </div>

    <!-- 核心指标卡片 -->
    <div class="stats-section">
      <div class="stat-card learning">
        <div class="stat-icon">
          <el-icon><Reading /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.learnProgress }}%</div>
          <div class="stat-label">学习进度</div>
          <el-progress 
            :percentage="stats.learnProgress" 
            :stroke-width="4" 
            :show-text="false"
            color="#667eea"
          />
        </div>
        <div class="stat-action" @click="router.push('/learn')">
          <el-icon><ArrowRight /></el-icon>
        </div>
      </div>

      <div class="stat-card trades">
        <div class="stat-icon">
          <el-icon><TrendCharts /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.monthTrades }}</div>
          <div class="stat-label">本月交易</div>
          <div class="stat-sub">较上月 {{ stats.tradeChange >= 0 ? '+' : '' }}{{ stats.tradeChange || 0 }}</div>
        </div>
        <div class="stat-action" @click="router.push('/trade/list')">
          <el-icon><ArrowRight /></el-icon>
        </div>
      </div>

      <div class="stat-card winrate">
        <div class="stat-icon">
          <el-icon><Aim /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.winRate }}%</div>
          <div class="stat-label">胜率</div>
          <div class="stat-sub">{{ stats.winTrades || 0 }}胜 / {{ stats.loseTrades || 0 }}负</div>
        </div>
        <div class="stat-action" @click="router.push('/trade/analysis')">
          <el-icon><ArrowRight /></el-icon>
        </div>
      </div>

      <div class="stat-card profit" :class="{ negative: stats.monthProfit < 0 }">
        <div class="stat-icon">
          <el-icon><Coin /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.monthProfit >= 0 ? '+' : '' }}{{ stats.monthProfit }}%</div>
          <div class="stat-label">本月收益</div>
          <div class="stat-sub">{{ stats.monthProfitAmount || 0 }} USDT</div>
        </div>
        <div class="stat-action" @click="router.push('/trade/analysis')">
          <el-icon><ArrowRight /></el-icon>
        </div>
      </div>
    </div>

    <!-- 主内容区 -->
    <div class="main-grid">
      <!-- 学习任务 -->
      <div class="grid-card tasks-card">
        <div class="card-header">
          <div class="header-title">
            <el-icon><List /></el-icon>
            <h3>本周学习任务</h3>
          </div>
          <el-button text type="primary" @click="router.push('/learn/progress')">
            查看全部<el-icon><ArrowRight /></el-icon>
          </el-button>
        </div>
        <div class="tasks-progress">
          <el-progress 
            type="circle" 
            :percentage="taskProgress" 
            :width="80"
            :stroke-width="8"
            :color="taskProgressColor"
          />
          <div class="progress-info">
            <span class="completed">{{ completedTasks }}</span>
            <span class="divider">/</span>
            <span class="total">{{ tasks.length }}</span>
            <span class="label">任务完成</span>
          </div>
        </div>
        <div class="tasks-list">
          <div 
            v-for="task in tasks.slice(0, 5)" 
            :key="task.id" 
            class="task-item"
            :class="{ completed: task.completed }"
            @click="toggleTask(task)"
          >
            <el-checkbox v-model="task.completed" @click.stop @change="toggleTask(task)" />
            <span class="task-text">{{ task.content }}</span>
          </div>
          <el-empty v-if="tasks.length === 0" description="暂无任务" :image-size="60" />
        </div>
      </div>

      <!-- 最近交易 -->
      <div class="grid-card trades-card">
        <div class="card-header">
          <div class="header-title">
            <el-icon><DataLine /></el-icon>
            <h3>最近交易</h3>
          </div>
          <el-button text type="primary" @click="router.push('/trade/list')">
            查看全部<el-icon><ArrowRight /></el-icon>
          </el-button>
        </div>
        <div class="trades-list">
          <div 
            v-for="trade in recentTrades" 
            :key="trade.id" 
            class="trade-item"
            @click="router.push(`/trade/detail/${trade.id}`)"
          >
            <div class="trade-left">
              <div class="trade-symbol">
                <span class="symbol">{{ trade.symbol }}</span>
                <el-tag 
                  :type="trade.direction === 1 ? 'success' : 'danger'" 
                  size="small"
                  effect="dark"
                >
                  {{ trade.direction === 1 ? '多' : '空' }}
                </el-tag>
              </div>
              <div class="trade-meta">
                <span class="strategy">{{ trade.strategy }}</span>
                <span class="date">{{ trade.tradeDate }}</span>
              </div>
            </div>
            <div class="trade-right" :class="trade.profitLossPercent >= 0 ? 'profit' : 'loss'">
              <span class="pnl">{{ trade.profitLossPercent >= 0 ? '+' : '' }}{{ trade.profitLossPercent }}%</span>
              <el-icon><ArrowRight /></el-icon>
            </div>
          </div>
          <el-empty v-if="recentTrades.length === 0" description="暂无交易记录" :image-size="60" />
        </div>
      </div>
    </div>

    <!-- 收益曲线 -->
    <div class="grid-card chart-card">
      <div class="card-header">
        <div class="header-title">
          <el-icon><TrendCharts /></el-icon>
          <h3>收益曲线</h3>
        </div>
        <el-radio-group v-model="chartPeriod" size="small">
          <el-radio-button label="week">本周</el-radio-button>
          <el-radio-button label="month">本月</el-radio-button>
          <el-radio-button label="year">今年</el-radio-button>
        </el-radio-group>
      </div>
      <div class="chart-container" ref="chartRef"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/store'
import { getStats, getRecentTrades, getTasks, getChartData } from '@/api/dashboard'
import { completeTask } from '@/api/learn'
import { ElMessage } from 'element-plus'
import * as echarts from 'echarts'

const router = useRouter()
const userStore = useUserStore()
const chartRef = ref()
const chartPeriod = ref('month')
let chartInstance = null

// 问候语
const hour = new Date().getHours()
const greeting = computed(() => {
  if (hour < 6) return '夜深了'
  if (hour < 12) return '早上好'
  if (hour < 14) return '中午好'
  if (hour < 18) return '下午好'
  return '晚上好'
})

const greetingIcon = computed(() => {
  if (hour < 6) return '🌙'
  if (hour < 12) return '🌅'
  if (hour < 14) return '☀️'
  if (hour < 18) return '🌤️'
  return '🌆'
})

const currentDate = new Date().toLocaleDateString('zh-CN', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  weekday: 'long'
})

const quotes = [
  '纪律是交易成功的基石',
  '控制风险，让利润奔跑',
  '市场永远是对的，错的只是我们的判断',
  '耐心等待，果断执行',
  '不要预测市场，要跟随市场'
]
const todayQuote = quotes[new Date().getDate() % quotes.length]

// 数据
const stats = reactive({
  learnProgress: 0,
  monthTrades: 0,
  tradeChange: 0,
  winRate: 0,
  winTrades: 0,
  loseTrades: 0,
  monthProfit: 0,
  monthProfitAmount: 0
})

const tasks = ref([])
const recentTrades = ref([])
const chartData = ref([])

const completedTasks = computed(() => tasks.value.filter(t => t.completed).length)
const taskProgress = computed(() => {
  if (tasks.value.length === 0) return 0
  return Math.round((completedTasks.value / tasks.value.length) * 100)
})
const taskProgressColor = computed(() => {
  if (taskProgress.value === 100) return '#67c23a'
  if (taskProgress.value >= 60) return '#409eff'
  return '#e6a23c'
})

// 加载数据
const loadStats = async () => {
  try {
    const res = await getStats()
    if (res.code === 200) Object.assign(stats, res.data)
  } catch (error) {
    console.error('加载统计数据失败', error)
  }
}

const loadTasks = async () => {
  try {
    const res = await getTasks()
    if (res.code === 200) tasks.value = res.data || []
  } catch (error) {
    console.error('加载任务失败', error)
  }
}

const loadRecentTrades = async () => {
  try {
    const res = await getRecentTrades()
    if (res.code === 200) recentTrades.value = res.data || []
  } catch (error) {
    console.error('加载交易记录失败', error)
  }
}

const loadChartData = async () => {
  try {
    const res = await getChartData(chartPeriod.value)
    if (res.code === 200) {
      chartData.value = res.data || []
      updateChart()
    }
  } catch (error) {
    console.error('加载图表数据失败', error)
  }
}

const toggleTask = async (task) => {
  try {
    await completeTask(task.id)
    task.completed = !task.completed
    ElMessage.success(task.completed ? '🎉 任务完成！' : '已取消完成')
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

// 图表
const initChart = () => {
  if (!chartRef.value) return
  chartInstance = echarts.init(chartRef.value)
  updateChart()
}

const updateChart = () => {
  if (!chartInstance) return
  
  const dates = chartData.value.map(d => d.date)
  const profits = chartData.value.map(d => d.profit)
  
  chartInstance.setOption({
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#eee',
      textStyle: { color: '#333' },
      formatter: '{b}<br/>累计收益: <b>{c}%</b>'
    },
    grid: { left: '3%', right: '4%', bottom: '3%', top: '10%', containLabel: true },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: dates.length > 0 ? dates : ['暂无数据'],
      axisLine: { lineStyle: { color: '#e0e0e0' } },
      axisLabel: { color: '#999' }
    },
    yAxis: {
      type: 'value',
      axisLabel: { color: '#999', formatter: '{value}%' },
      splitLine: { lineStyle: { color: '#f0f0f0', type: 'dashed' } }
    },
    series: [{
      name: '累计收益',
      type: 'line',
      smooth: true,
      symbol: 'circle',
      symbolSize: 6,
      data: profits.length > 0 ? profits : [0],
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(102, 126, 234, 0.4)' },
          { offset: 1, color: 'rgba(102, 126, 234, 0.02)' }
        ])
      },
      lineStyle: { color: '#667eea', width: 3 },
      itemStyle: { color: '#667eea', borderWidth: 2, borderColor: '#fff' }
    }]
  })
}

const handleResize = () => chartInstance?.resize()

onMounted(() => {
  loadStats()
  loadTasks()
  loadRecentTrades()
  loadChartData()
  initChart()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  chartInstance?.dispose()
})

watch(chartPeriod, loadChartData)
</script>


<style lang="scss" scoped>
.dashboard {
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
}

// 欢迎横幅
.welcome-banner {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 20px;
  padding: 32px 40px;
  margin-bottom: 28px;
  position: relative;
  overflow: hidden;
  color: white;
}

.banner-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  z-index: 2;
}

.banner-left {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.greeting {
  display: flex;
  align-items: center;
  gap: 16px;

  .greeting-icon {
    font-size: 48px;
  }

  h1 {
    font-size: 26px;
    font-weight: 700;
    margin-bottom: 4px;
  }

  p {
    font-size: 14px;
    opacity: 0.85;
  }
}

.quick-actions {
  display: flex;
  gap: 12px;

  .el-button {
    border-radius: 10px;
  }
}

.banner-right {
  max-width: 300px;
}

.motivational-quote {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 16px 20px;

  p {
    font-size: 15px;
    font-style: italic;
    line-height: 1.5;
    opacity: 0.95;
  }
}

.banner-decoration {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: 50%;
  pointer-events: none;

  .circle {
    position: absolute;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.1);
  }

  .c1 { width: 200px; height: 200px; top: -60px; right: 10%; }
  .c2 { width: 150px; height: 150px; bottom: -40px; right: 25%; }
  .c3 { width: 80px; height: 80px; top: 40%; right: 5%; }
}

// 统计卡片
.stats-section {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 28px;
}

.stat-card {
  background: var(--bg-primary);
  border-radius: 16px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 2px 12px var(--shadow-color);
  transition: all 0.3s;
  position: relative;
  overflow: hidden;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px var(--shadow-color);

    .stat-action {
      opacity: 1;
      transform: translateX(0);
    }
  }

  &.learning .stat-icon { background: linear-gradient(135deg, #667eea, #764ba2); }
  &.trades .stat-icon { background: linear-gradient(135deg, #11998e, #38ef7d); }
  &.winrate .stat-icon { background: linear-gradient(135deg, #f093fb, #f5576c); }
  &.profit .stat-icon { background: linear-gradient(135deg, #67c23a, #85ce61); }
  &.profit.negative .stat-icon { background: linear-gradient(135deg, #f56c6c, #f89898); }
}

.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  .el-icon {
    font-size: 26px;
    color: white;
  }
}

.stat-content {
  flex: 1;
  min-width: 0;

  .stat-value {
    font-size: 26px;
    font-weight: 700;
    color: var(--text-primary);
    line-height: 1.2;
  }

  .stat-label {
    font-size: 13px;
    color: var(--text-secondary);
    margin-top: 2px;
  }

  .stat-sub {
    font-size: 12px;
    color: var(--text-placeholder);
    margin-top: 4px;
  }

  .el-progress {
    margin-top: 8px;
  }
}

.stat-action {
  position: absolute;
  right: 16px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--bg-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  opacity: 0;
  transform: translateX(10px);
  transition: all 0.3s;

  &:hover {
    background: var(--primary-color);
    color: white;
  }
}

// 主内容网格
.main-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-bottom: 28px;
}

.grid-card {
  background: var(--bg-primary);
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 2px 12px var(--shadow-color);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;

  .header-title {
    display: flex;
    align-items: center;
    gap: 8px;

    .el-icon {
      font-size: 20px;
      color: var(--primary-color);
    }

    h3 {
      font-size: 16px;
      font-weight: 600;
      color: var(--text-primary);
    }
  }

  .el-button {
    display: flex;
    align-items: center;
    gap: 4px;
  }
}

// 任务卡片
.tasks-progress {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 16px;
  background: var(--bg-secondary);
  border-radius: 12px;
  margin-bottom: 16px;

  .progress-info {
    display: flex;
    align-items: baseline;
    gap: 4px;

    .completed {
      font-size: 32px;
      font-weight: 700;
      color: var(--primary-color);
    }

    .divider {
      font-size: 20px;
      color: var(--text-secondary);
    }

    .total {
      font-size: 20px;
      color: var(--text-secondary);
    }

    .label {
      font-size: 13px;
      color: var(--text-secondary);
      margin-left: 8px;
    }
  }
}

.tasks-list {
  max-height: 280px;
  overflow-y: auto;
}

.task-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: var(--bg-secondary);
  }

  &.completed .task-text {
    text-decoration: line-through;
    color: var(--text-secondary);
  }

  .task-text {
    font-size: 14px;
    color: var(--text-primary);
  }
}

// 交易列表
.trades-list {
  max-height: 340px;
  overflow-y: auto;
}

.trade-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 8px;

  &:last-child {
    margin-bottom: 0;
  }

  &:hover {
    background: var(--bg-secondary);
  }
}

.trade-left {
  .trade-symbol {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 4px;

    .symbol {
      font-size: 15px;
      font-weight: 600;
      color: var(--text-primary);
    }
  }

  .trade-meta {
    display: flex;
    gap: 12px;
    font-size: 12px;
    color: var(--text-secondary);
  }
}

.trade-right {
  display: flex;
  align-items: center;
  gap: 8px;

  .pnl {
    font-size: 16px;
    font-weight: 600;
  }

  &.profit {
    color: var(--profit-color);
  }

  &.loss {
    color: var(--loss-color);
  }

  .el-icon {
    font-size: 14px;
    opacity: 0.5;
  }
}

// 图表卡片
.chart-card {
  .chart-container {
    height: 320px;
  }
}

// 响应式
@media (max-width: 1200px) {
  .stats-section {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .dashboard {
    padding: 16px;
  }

  .welcome-banner {
    padding: 24px;
  }

  .banner-content {
    flex-direction: column;
    gap: 20px;
  }

  .banner-right {
    max-width: 100%;
  }

  .greeting .greeting-icon {
    font-size: 36px;
  }

  .greeting h1 {
    font-size: 20px;
  }

  .stats-section {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }

  .stat-card {
    padding: 16px;
  }

  .stat-icon {
    width: 44px;
    height: 44px;

    .el-icon {
      font-size: 20px;
    }
  }

  .stat-content .stat-value {
    font-size: 20px;
  }

  .main-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .stats-section {
    grid-template-columns: 1fr;
  }

  .quick-actions {
    flex-direction: column;
    width: 100%;

    .el-button {
      width: 100%;
    }
  }
}
</style>
