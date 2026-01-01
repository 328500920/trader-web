<template>
  <div class="md-candlestick-wrapper">
    <CandlestickChart 
      :pattern="patternId" 
      :height="height"
      :showVolume="showVolume"
      :showTooltip="showTooltip"
    />
    <div class="pattern-info" v-if="patternData">
      <div class="pattern-name">{{ patternData.name }}</div>
      <div class="pattern-type" :class="patternData.type">
        {{ typeLabels[patternData.type] }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import CandlestickChart from './index.vue'
import { patterns } from './patterns'

const props = defineProps({
  patternId: { type: String, required: true },
  height: { type: Number, default: 300 },
  showVolume: { type: Boolean, default: false },
  showTooltip: { type: Boolean, default: true }
})

const typeLabels = {
  bullish: '看涨',
  bearish: '看跌',
  neutral: '中性'
}

const patternData = computed(() => patterns[props.patternId])
</script>

<style lang="scss" scoped>
.md-candlestick-wrapper {
  margin: 16px 0;
  padding: 16px;
  background: var(--bg-secondary);
  border-radius: 12px;
  border: 1px solid var(--border-light);
}

.pattern-info {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--border-light);
}

.pattern-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}

.pattern-type {
  padding: 2px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  
  &.bullish {
    background: rgba(38, 166, 154, 0.15);
    color: #26a69a;
  }
  &.bearish {
    background: rgba(239, 83, 80, 0.15);
    color: #ef5350;
  }
  &.neutral {
    background: rgba(255, 152, 0, 0.15);
    color: #ff9800;
  }
}
</style>
