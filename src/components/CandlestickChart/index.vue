<template>
  <div class="candlestick-chart" ref="chartRef" :style="{ height: totalHeight + 'px' }"></div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, computed } from 'vue'
import * as echarts from 'echarts'
import { useThemeStore } from '@/store'
import { patterns } from './patterns'

const props = defineProps({
  pattern: { type: String, default: '' },
  data: { type: Array, default: () => [] },
  annotations: { type: Array, default: () => [] },
  indicators: { type: Object, default: () => ({}) },
  height: { type: Number, default: 400 },
  showVolume: { type: Boolean, default: false },
  showTooltip: { type: Boolean, default: true },
  highlights: { type: Array, default: () => [] }
})

const themeStore = useThemeStore()
const chartRef = ref(null)
let chart = null

const patternConfig = computed(() => {
  if (props.pattern && patterns[props.pattern]) {
    return patterns[props.pattern]
  }
  return null
})

const chartData = computed(() => {
  if (patternConfig.value) return patternConfig.value.data
  return props.data
})

const chartAnnotations = computed(() => {
  if (patternConfig.value) return patternConfig.value.annotations || []
  return props.annotations
})

const chartHighlights = computed(() => {
  if (patternConfig.value) return patternConfig.value.highlights || []
  return props.highlights
})

const chartIndicators = computed(() => {
  if (patternConfig.value) return patternConfig.value.indicators || {}
  return props.indicators
})

const chartShowVolume = computed(() => {
  if (patternConfig.value) return patternConfig.value.showVolume || false
  return props.showVolume
})

// 计算总高度（如果显示成交量，增加高度）
const totalHeight = computed(() => {
  return chartShowVolume.value ? props.height + 100 : props.height
})

const getThemeColors = () => {
  const isDark = themeStore.isDark
  return {
    bg: isDark ? '#1a1a2e' : '#ffffff',
    text: isDark ? '#e0e0e0' : '#333333',
    border: isDark ? '#333' : '#e0e0e0',
    upColor: '#26a69a',
    downColor: '#ef5350',
    gridLine: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
    ma5: '#ff9800',
    ma10: '#2196f3',
    ma20: '#9c27b0',
    ma60: '#4caf50',
    bollingerUpper: '#f44336',
    bollingerMiddle: '#ff9800',
    bollingerLower: '#4caf50'
  }
}

// 计算均线
const calculateMA = (data, period) => {
  const result = []
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      result.push('-')
    } else {
      let sum = 0
      for (let j = 0; j < period; j++) {
        sum += data[i - j].close
      }
      result.push((sum / period).toFixed(2))
    }
  }
  return result
}

// 计算布林带
const calculateBollinger = (data, period = 20, multiplier = 2) => {
  const upper = [], middle = [], lower = []
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      upper.push('-')
      middle.push('-')
      lower.push('-')
    } else {
      let sum = 0
      for (let j = 0; j < period; j++) {
        sum += data[i - j].close
      }
      const ma = sum / period
      let variance = 0
      for (let j = 0; j < period; j++) {
        variance += Math.pow(data[i - j].close - ma, 2)
      }
      const std = Math.sqrt(variance / period)
      middle.push(ma.toFixed(2))
      upper.push((ma + multiplier * std).toFixed(2))
      lower.push((ma - multiplier * std).toFixed(2))
    }
  }
  return { upper, middle, lower }
}

const buildOption = () => {
  const colors = getThemeColors()
  const data = chartData.value
  if (!data || data.length === 0) return null

  const dates = data.map(d => d.date)
  const klineData = data.map((d, index) => {
    const isHighlight = chartHighlights.value.includes(index)
    return {
      value: [d.open, d.close, d.low, d.high],
      itemStyle: isHighlight ? {
        color: d.close >= d.open ? '#00e676' : '#ff5252',
        borderColor: d.close >= d.open ? '#00e676' : '#ff5252',
        borderWidth: 2
      } : undefined
    }
  })

  // 成交量数据
  const volumeData = data.map((d, idx) => ({
    value: d.volume || Math.floor(Math.random() * 1000 + 500),
    itemStyle: { color: d.close >= d.open ? colors.upColor : colors.downColor }
  }))

  const markLines = []
  const markPoints = []
  const annotations = chartAnnotations.value

  annotations.forEach(ann => {
    if (['stopLoss', 'target', 'support', 'resistance'].includes(ann.type)) {
      const lineStyle = {
        stopLoss: { color: '#f44336', type: 'solid' },
        target: { color: '#2196f3', type: 'solid' },
        support: { color: '#4caf50', type: 'dashed' },
        resistance: { color: '#f44336', type: 'dashed' }
      }
      markLines.push({
        yAxis: ann.price,
        name: ann.label || '',
        lineStyle: lineStyle[ann.type],
        label: { formatter: ann.label, position: 'end' }
      })
    } else if (ann.type === 'entry') {
      markPoints.push({
        coord: [ann.index, ann.price],
        symbol: 'triangle',
        symbolSize: 12,
        itemStyle: { color: '#4caf50' },
        label: { show: true, formatter: ann.label || '入场', position: 'bottom', color: '#4caf50' }
      })
    } else if (ann.type === 'text') {
      markPoints.push({
        coord: [ann.index, ann.price],
        symbol: 'pin',
        symbolSize: 30,
        itemStyle: { color: '#ff9800' },
        label: { show: true, formatter: ann.label, position: 'inside', color: '#fff', fontSize: 10 }
      })
    }
  })

  const series = [{
    name: 'K线',
    type: 'candlestick',
    data: klineData,
    itemStyle: {
      color: colors.upColor,
      color0: colors.downColor,
      borderColor: colors.upColor,
      borderColor0: colors.downColor
    },
    markLine: markLines.length > 0 ? { silent: true, data: markLines } : undefined,
    markPoint: markPoints.length > 0 ? { data: markPoints } : undefined
  }]

  const indicators = chartIndicators.value
  const legend = ['K线']

  // 添加均线
  if (indicators.ma) {
    const maConfig = indicators.ma
    if (maConfig.ma5) {
      legend.push('MA5')
      series.push({
        name: 'MA5',
        type: 'line',
        data: calculateMA(data, 5),
        smooth: true,
        lineStyle: { width: 1, color: colors.ma5 },
        symbol: 'none'
      })
    }
    if (maConfig.ma10) {
      legend.push('MA10')
      series.push({
        name: 'MA10',
        type: 'line',
        data: calculateMA(data, 10),
        smooth: true,
        lineStyle: { width: 1, color: colors.ma10 },
        symbol: 'none'
      })
    }
    if (maConfig.ma20) {
      legend.push('MA20')
      series.push({
        name: 'MA20',
        type: 'line',
        data: calculateMA(data, 20),
        smooth: true,
        lineStyle: { width: 1, color: colors.ma20 },
        symbol: 'none'
      })
    }
  }

  // 添加布林带
  if (indicators.bollinger) {
    const boll = calculateBollinger(data, indicators.bollinger.period || 20, indicators.bollinger.multiplier || 2)
    legend.push('BOLL上轨', 'BOLL中轨', 'BOLL下轨')
    series.push(
      {
        name: 'BOLL上轨',
        type: 'line',
        data: boll.upper,
        smooth: true,
        lineStyle: { width: 1, color: colors.bollingerUpper, type: 'dashed' },
        symbol: 'none'
      },
      {
        name: 'BOLL中轨',
        type: 'line',
        data: boll.middle,
        smooth: true,
        lineStyle: { width: 1, color: colors.bollingerMiddle },
        symbol: 'none'
      },
      {
        name: 'BOLL下轨',
        type: 'line',
        data: boll.lower,
        smooth: true,
        lineStyle: { width: 1, color: colors.bollingerLower, type: 'dashed' },
        symbol: 'none'
      }
    )
  }

  // 配置grid和axis
  const grids = []
  const xAxes = []
  const yAxes = []

  if (chartShowVolume.value) {
    grids.push(
      { left: 50, right: 20, top: '8%', height: '55%' },
      { left: 50, right: 20, top: '70%', height: '20%' }
    )
    xAxes.push(
      { type: 'category', data: dates, gridIndex: 0, axisLine: { lineStyle: { color: colors.border } }, axisLabel: { show: false } },
      { type: 'category', data: dates, gridIndex: 1, axisLine: { lineStyle: { color: colors.border } }, axisLabel: { color: colors.text, fontSize: 10 } }
    )
    yAxes.push(
      { type: 'value', scale: true, gridIndex: 0, splitLine: { lineStyle: { color: colors.gridLine } }, axisLine: { lineStyle: { color: colors.border } }, axisLabel: { color: colors.text, fontSize: 10 } },
      { type: 'value', scale: true, gridIndex: 1, splitLine: { lineStyle: { color: colors.gridLine } }, axisLine: { lineStyle: { color: colors.border } }, axisLabel: { color: colors.text, fontSize: 10, formatter: (v) => v > 1000 ? (v/1000).toFixed(0) + 'K' : v } }
    )
    // 成交量series
    series.push({
      name: '成交量',
      type: 'bar',
      xAxisIndex: 1,
      yAxisIndex: 1,
      data: volumeData
    })
    legend.push('成交量')
  } else {
    grids.push({ left: 50, right: 20, top: '12%', bottom: '15%' })
    xAxes.push({ type: 'category', data: dates, axisLine: { lineStyle: { color: colors.border } }, axisLabel: { color: colors.text, fontSize: 10 } })
    yAxes.push({ type: 'value', scale: true, splitLine: { lineStyle: { color: colors.gridLine } }, axisLine: { lineStyle: { color: colors.border } }, axisLabel: { color: colors.text, fontSize: 10 } })
  }

  return {
    backgroundColor: colors.bg,
    animation: true,
    legend: legend.length > 1 ? {
      data: legend,
      top: 0,
      textStyle: { color: colors.text, fontSize: 10 },
      itemWidth: 14,
      itemHeight: 10
    } : undefined,
    tooltip: props.showTooltip ? {
      trigger: 'axis',
      axisPointer: { type: 'cross' },
      formatter: (params) => {
        if (!params || params.length === 0) return ''
        const kline = params.find(p => p.seriesName === 'K线')
        if (!kline) return ''
        const [open, close, low, high] = kline.value
        let html = `${kline.name}<br/>开: ${open} 高: ${high}<br/>低: ${low} 收: ${close}`
        params.forEach(p => {
          if (p.seriesName !== 'K线' && p.value !== '-') {
            html += `<br/>${p.seriesName}: ${p.value}`
          }
        })
        return html
      }
    } : undefined,
    grid: grids,
    xAxis: xAxes,
    yAxis: yAxes,
    series
  }
}


const initChart = () => {
  if (!chartRef.value) return
  chart = echarts.init(chartRef.value, themeStore.isDark ? 'dark' : null)
  const option = buildOption()
  if (option) {
    chart.setOption(option)
  }
}

const updateChart = () => {
  if (!chart) {
    initChart()
    return
  }
  const option = buildOption()
  if (option) {
    chart.setOption(option, true)
  }
}

const handleResize = () => {
  chart?.resize()
}

watch(() => [props.pattern, props.data, props.indicators, props.showVolume, themeStore.isDark], () => {
  updateChart()
}, { deep: true })

onMounted(() => {
  initChart()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  chart?.dispose()
})
</script>

<style lang="scss" scoped>
.candlestick-chart {
  width: 100%;
  min-height: 200px;
}
</style>
