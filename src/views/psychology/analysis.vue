<template>
  <div class="analysis-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-info">
        <h1>📊 情绪分析</h1>
        <p>分析情绪模式，找出最佳交易状态</p>
      </div>
      <el-radio-group v-model="period" @change="loadAnalysis">
        <el-radio-button label="week">本周</el-radio-button>
        <el-radio-button label="month">本月</el-radio-button>
        <el-radio-button label="all">全部</el-radio-button>
      </el-radio-group>
    </div>

    <div class="analysis-content" v-loading="loading">
      <!-- 情绪趋势 -->
      <div class="analysis-card">
        <h3>情绪趋势</h3>
        <div class="chart-container" ref="trendChartRef"></div>
      </div>

      <!-- 情绪分布 -->
      <div class="stats-row">
        <div class="analysis-card small">
          <h3>情绪分布</h3>
          <div class="distribution-stats">
            <div class="dist-item good">
              <span class="emoji">😊</span>
              <span class="label">良好 (7-10)</span>
              <span class="value">{{ analysis.moodDistribution?.high || 0 }}天</span>
            </div>
            <div class="dist-item normal">
              <span class="emoji">😐</span>
              <span class="label">一般 (4-6)</span>
              <span class="value">{{ analysis.moodDistribution?.medium || 0 }}天</span>
            </div>
            <div class="dist-item bad">
              <span class="emoji">😰</span>
              <span class="label">较差 (1-3)</span>
              <span class="value">{{ analysis.moodDistribution?.low || 0 }}天</span>
            </div>
          </div>
          <div class="avg-mood">
            平均情绪: <strong>{{ analysis.avgMood?.toFixed(1) || '-' }}</strong>/10
          </div>
        </div>

        <div class="analysis-card small">
          <h3>心理陷阱统计</h3>
          <div class="trap-stats" v-if="analysis.trapStats?.length">
            <div 
              v-for="(trap, index) in analysis.trapStats" 
              :key="trap.trap"
              class="trap-item"
            >
              <div class="trap-info">
                <span class="trap-rank">{{ index + 1 }}</span>
                <span class="trap-name">{{ trap.trap }}</span>
              </div>
              <div class="trap-bar">
                <div 
                  class="trap-fill" 
                  :style="{ width: getTrapPercent(trap.count) + '%' }"
                ></div>
              </div>
              <span class="trap-count">{{ trap.count }}次</span>
            </div>
          </div>
          <div v-else class="empty-trap">
            <p>🎉 太棒了！没有触发心理陷阱</p>
          </div>
        </div>
      </div>

      <!-- 建议卡片 -->
      <div class="analysis-card suggestion">
        <h3>💡 交易建议</h3>
        <div class="suggestion-content">
          <div class="suggestion-item" v-if="analysis.avgMood">
            <el-icon><InfoFilled /></el-icon>
            <span v-if="analysis.avgMood >= 7">
              你的平均情绪状态良好，继续保持！在情绪稳定时交易效果最佳。
            </span>
            <span v-else-if="analysis.avgMood >= 4">
              情绪状态一般，建议在情绪低于5分时减少交易或观望。
            </span>
            <span v-else>
              近期情绪状态较差，建议暂停交易，调整心态后再入场。
            </span>
          </div>
          <div class="suggestion-item" v-if="topTrap">
            <el-icon><WarningFilled /></el-icon>
            <span>
              你最常触发的心理陷阱是「{{ topTrap }}」，建议在交易前特别注意这一点。
            </span>
          </div>
          <div class="suggestion-item">
            <el-icon><StarFilled /></el-icon>
            <span>
              坚持每日打卡，记录情绪变化，有助于更好地认识自己的交易心理模式。
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { InfoFilled, WarningFilled, StarFilled } from '@element-plus/icons-vue'
import { getAnalysis } from '@/api/psychology'
import * as echarts from 'echarts'

const period = ref('month')
const loading = ref(false)
const analysis = ref({})
const trendChartRef = ref(null)
let trendChart = null

// 最常见的心理陷阱
const topTrap = computed(() => {
  if (analysis.value.trapStats?.length) {
    return analysis.value.trapStats[0].trap
  }
  return null
})

// 获取陷阱百分比
const getTrapPercent = (count) => {
  const maxCount = Math.max(...(analysis.value.trapStats?.map(t => t.count) || [1]))
  return (count / maxCount) * 100
}

// 加载分析数据
const loadAnalysis = async () => {
  loading.value = true
  try {
    const res = await getAnalysis(period.value)
    if (res.code === 200) {
      analysis.value = res.data || {}
      await nextTick()
      renderTrendChart()
    }
  } catch (error) {
    console.error('加载分析数据失败:', error)
  } finally {
    loading.value = false
  }
}

// 渲染趋势图
const renderTrendChart = () => {
  if (!trendChartRef.value) return
  
  if (!trendChart) {
    trendChart = echarts.init(trendChartRef.value)
  }
  
  if (trendChart.isDisposed()) return
  
  const moodTrend = analysis.value.moodTrend || []
  
  const option = {
    tooltip: {
      trigger: 'axis',
      formatter: (params) => {
        const data = params[0]
        return `${data.name}<br/>情绪评分: ${data.value}/10`
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '10%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: moodTrend.map(d => d.date.slice(5)), // 只显示月-日
      axisLine: { lineStyle: { color: '#ddd' } },
      axisLabel: { color: '#666' }
    },
    yAxis: {
      type: 'value',
      min: 0,
      max: 10,
      axisLine: { show: false },
      axisLabel: { color: '#666' },
      splitLine: { lineStyle: { color: '#eee' } }
    },
    series: [{
      data: moodTrend.map(d => d.score),
      type: 'line',
      smooth: true,
      symbol: 'circle',
      symbolSize: 8,
      lineStyle: { color: '#409eff', width: 3 },
      itemStyle: { color: '#409eff' },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(64, 158, 255, 0.3)' },
          { offset: 1, color: 'rgba(64, 158, 255, 0.05)' }
        ])
      },
      markLine: {
        silent: true,
        data: [
          { yAxis: 5, lineStyle: { color: '#e6a23c', type: 'dashed' } }
        ],
        label: { show: false }
      }
    }]
  }
  
  trendChart.setOption(option)
}

// 窗口大小变化时重绘图表
const handleResize = () => {
  if (trendChart && !trendChart.isDisposed()) trendChart.resize()
}

onMounted(() => {
  loadAnalysis()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  trendChart?.dispose()
})
</script>

<style lang="scss" scoped>
.analysis-page {
  padding: 20px;
  max-width: 1000px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;

  h1 {
    font-size: 24px;
    font-weight: 700;
    color: var(--text-primary);
    margin: 0 0 8px;
  }

  p {
    color: var(--text-secondary);
    margin: 0;
  }
}

.analysis-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.analysis-card {
  background: var(--bg-primary);
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px var(--shadow-color);

  h3 {
    font-size: 16px;
    font-weight: 600;
    color: var(--text-primary);
    margin: 0 0 16px;
  }

  &.small {
    flex: 1;
  }
}

.chart-container {
  height: 300px;
}

.stats-row {
  display: flex;
  gap: 20px;
}

.distribution-stats {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 16px;
}

.dist-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 8px;

  &.good { background: rgba(103, 194, 58, 0.1); }
  &.normal { background: rgba(230, 162, 60, 0.1); }
  &.bad { background: rgba(245, 108, 108, 0.1); }

  .emoji {
    font-size: 24px;
  }

  .label {
    flex: 1;
    font-size: 14px;
    color: var(--text-secondary);
  }

  .value {
    font-size: 16px;
    font-weight: 600;
    color: var(--text-primary);
  }
}

.avg-mood {
  text-align: center;
  font-size: 14px;
  color: var(--text-secondary);
  padding-top: 12px;
  border-top: 1px solid var(--border-light);

  strong {
    font-size: 20px;
    color: var(--primary-color);
  }
}

.trap-stats {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.trap-item {
  display: flex;
  align-items: center;
  gap: 12px;

  .trap-info {
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 120px;

    .trap-rank {
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: var(--primary-color);
      color: white;
      font-size: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .trap-name {
      font-size: 13px;
      color: var(--text-primary);
    }
  }

  .trap-bar {
    flex: 1;
    height: 8px;
    background: var(--bg-secondary);
    border-radius: 4px;
    overflow: hidden;

    .trap-fill {
      height: 100%;
      background: linear-gradient(90deg, #e6a23c, #f5c76e);
      border-radius: 4px;
      transition: width 0.3s;
    }
  }

  .trap-count {
    font-size: 13px;
    color: var(--text-secondary);
    min-width: 40px;
    text-align: right;
  }
}

.empty-trap {
  text-align: center;
  padding: 30px;
  color: var(--text-secondary);
}

.suggestion {
  .suggestion-content {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .suggestion-item {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 12px 16px;
    background: var(--bg-secondary);
    border-radius: 8px;

    .el-icon {
      font-size: 18px;
      color: var(--primary-color);
      margin-top: 2px;
    }

    span {
      font-size: 14px;
      color: var(--text-primary);
      line-height: 1.6;
    }
  }
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: 16px;
  }

  .stats-row {
    flex-direction: column;
  }

  .trap-item {
    flex-wrap: wrap;

    .trap-info {
      min-width: 100%;
    }

    .trap-bar {
      flex: 1;
      min-width: 60%;
    }
  }
}
</style>
