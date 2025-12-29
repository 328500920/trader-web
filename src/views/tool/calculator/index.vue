<template>
  <div class="calculator-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <h1>🧮 交易计算器</h1>
      <p>精确计算仓位、盈亏比、复利收益</p>
    </div>

    <div class="calculators-grid">
      <!-- 仓位计算器 -->
      <div class="calculator-card">
        <div class="card-header">
          <div class="header-icon position">
            <el-icon><Coin /></el-icon>
          </div>
          <div class="header-text">
            <h3>仓位计算器</h3>
            <p>根据风险控制计算最佳仓位</p>
          </div>
        </div>

        <div class="card-body">
          <el-form label-position="top">
            <el-form-item label="账户资金 (USDT)">
              <el-input-number 
                v-model="position.capital" 
                :min="0" 
                :controls="false"
                style="width: 100%;"
              />
            </el-form-item>
            <el-form-item label="风险比例 (%)">
              <el-slider 
                v-model="position.riskPercent" 
                :min="0.5" 
                :max="10" 
                :step="0.5"
                :marks="{ 1: '1%', 2: '2%', 5: '5%', 10: '10%' }"
                show-input
              />
            </el-form-item>
            <div class="form-row">
              <el-form-item label="入场价格">
                <el-input-number 
                  v-model="position.entryPrice" 
                  :min="0" 
                  :precision="2"
                  :controls="false"
                  style="width: 100%;"
                />
              </el-form-item>
              <el-form-item label="止损价格">
                <el-input-number 
                  v-model="position.stopLoss" 
                  :min="0" 
                  :precision="2"
                  :controls="false"
                  style="width: 100%;"
                />
              </el-form-item>
            </div>
          </el-form>
        </div>

        <div class="card-result">
          <div class="result-item">
            <span class="label">风险金额</span>
            <span class="value">{{ positionResult.riskAmount.toFixed(2) }} USDT</span>
          </div>
          <div class="result-item">
            <span class="label">止损幅度</span>
            <span class="value text-danger">{{ positionResult.stopLossPercent.toFixed(2) }}%</span>
          </div>
          <div class="result-item highlight">
            <span class="label">建议仓位</span>
            <span class="value primary">{{ positionResult.positionSize.toFixed(2) }} USDT</span>
          </div>
        </div>
      </div>

      <!-- 盈亏比计算器 -->
      <div class="calculator-card">
        <div class="card-header">
          <div class="header-icon ratio">
            <el-icon><TrendCharts /></el-icon>
          </div>
          <div class="header-text">
            <h3>盈亏比计算器</h3>
            <p>评估交易的风险收益比</p>
          </div>
        </div>

        <div class="card-body">
          <el-form label-position="top">
            <el-form-item label="入场价格">
              <el-input-number 
                v-model="ratio.entryPrice" 
                :min="0" 
                :precision="2"
                :controls="false"
                style="width: 100%;"
              />
            </el-form-item>
            <div class="form-row">
              <el-form-item label="止损价格">
                <el-input-number 
                  v-model="ratio.stopLoss" 
                  :min="0" 
                  :precision="2"
                  :controls="false"
                  style="width: 100%;"
                />
              </el-form-item>
              <el-form-item label="止盈价格">
                <el-input-number 
                  v-model="ratio.takeProfit" 
                  :min="0" 
                  :precision="2"
                  :controls="false"
                  style="width: 100%;"
                />
              </el-form-item>
            </div>
          </el-form>
        </div>

        <div class="card-result">
          <div class="result-item">
            <span class="label">风险（止损）</span>
            <span class="value text-danger">-{{ ratioResult.risk.toFixed(2) }}%</span>
          </div>
          <div class="result-item">
            <span class="label">收益（止盈）</span>
            <span class="value text-success">+{{ ratioResult.reward.toFixed(2) }}%</span>
          </div>
          <div class="result-item highlight">
            <span class="label">盈亏比</span>
            <span class="value" :class="ratioResult.ratio >= 2 ? 'success' : ratioResult.ratio >= 1 ? 'warning' : 'danger'">
              {{ ratioResult.ratio.toFixed(2) }} : 1
            </span>
          </div>
          <div class="ratio-indicator">
            <div class="indicator-bar">
              <div 
                class="indicator-fill" 
                :style="{ width: Math.min(ratioResult.ratio / 5 * 100, 100) + '%' }"
                :class="ratioResult.ratio >= 2 ? 'good' : ratioResult.ratio >= 1 ? 'medium' : 'bad'"
              ></div>
            </div>
            <span class="indicator-text">
              {{ ratioResult.ratio >= 2 ? '✅ 优秀' : ratioResult.ratio >= 1 ? '⚠️ 一般' : '❌ 不建议' }}
            </span>
          </div>
        </div>
      </div>

      <!-- 复利计算器 -->
      <div class="calculator-card">
        <div class="card-header">
          <div class="header-icon compound">
            <el-icon><DataAnalysis /></el-icon>
          </div>
          <div class="header-text">
            <h3>复利计算器</h3>
            <p>计算长期复利增长效果</p>
          </div>
        </div>

        <div class="card-body">
          <el-form label-position="top">
            <el-form-item label="初始资金 (USDT)">
              <el-input-number 
                v-model="compound.initial" 
                :min="0"
                :controls="false"
                style="width: 100%;"
              />
            </el-form-item>
            <el-form-item label="月收益率 (%)">
              <el-slider 
                v-model="compound.monthlyReturn" 
                :min="1" 
                :max="30" 
                :step="0.5"
                :marks="{ 5: '5%', 10: '10%', 20: '20%', 30: '30%' }"
                show-input
              />
            </el-form-item>
            <el-form-item label="投资周期 (月)">
              <el-slider 
                v-model="compound.months" 
                :min="1" 
                :max="60" 
                :marks="{ 6: '6月', 12: '1年', 24: '2年', 36: '3年', 60: '5年' }"
                show-input
              />
            </el-form-item>
          </el-form>
        </div>

        <div class="card-result">
          <div class="result-item highlight">
            <span class="label">最终资金</span>
            <span class="value primary">{{ formatNumber(compoundResult.final) }} USDT</span>
          </div>
          <div class="result-item">
            <span class="label">总收益</span>
            <span class="value text-success">+{{ formatNumber(compoundResult.profit) }} USDT</span>
          </div>
          <div class="result-item">
            <span class="label">总收益率</span>
            <span class="value text-success">+{{ compoundResult.totalReturn.toFixed(2) }}%</span>
          </div>
          <div class="compound-chart">
            <div class="chart-bar">
              <div class="bar-initial" :style="{ width: initialPercent + '%' }">
                <span>本金</span>
              </div>
              <div class="bar-profit" :style="{ width: profitPercent + '%' }">
                <span>收益</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 使用提示 -->
    <div class="tips-section">
      <div class="tip-card">
        <el-icon><InfoFilled /></el-icon>
        <div class="tip-content">
          <h4>仓位管理建议</h4>
          <p>单笔交易风险建议控制在账户资金的 1-2%，最大不超过 5%</p>
        </div>
      </div>
      <div class="tip-card">
        <el-icon><InfoFilled /></el-icon>
        <div class="tip-content">
          <h4>盈亏比建议</h4>
          <p>建议盈亏比至少达到 2:1，即潜在收益是潜在风险的 2 倍以上</p>
        </div>
      </div>
      <div class="tip-card">
        <el-icon><InfoFilled /></el-icon>
        <div class="tip-content">
          <h4>复利效应</h4>
          <p>稳定的月收益率比追求高收益更重要，复利是财富增长的关键</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, computed } from 'vue'

// 仓位计算
const position = reactive({
  capital: 10000,
  riskPercent: 2,
  entryPrice: 43000,
  stopLoss: 42000
})

const positionResult = computed(() => {
  const riskAmount = position.capital * (position.riskPercent / 100)
  const stopLossPercent = Math.abs((position.stopLoss - position.entryPrice) / position.entryPrice * 100)
  const positionSize = stopLossPercent > 0 ? riskAmount / (stopLossPercent / 100) : 0
  return { riskAmount, stopLossPercent, positionSize }
})

// 盈亏比计算
const ratio = reactive({
  entryPrice: 43000,
  stopLoss: 42000,
  takeProfit: 46000
})

const ratioResult = computed(() => {
  const risk = Math.abs((ratio.stopLoss - ratio.entryPrice) / ratio.entryPrice * 100)
  const reward = Math.abs((ratio.takeProfit - ratio.entryPrice) / ratio.entryPrice * 100)
  const ratioValue = risk > 0 ? reward / risk : 0
  return { risk, reward, ratio: ratioValue }
})

// 复利计算
const compound = reactive({
  initial: 10000,
  monthlyReturn: 5,
  months: 12
})

const compoundResult = computed(() => {
  const finalValue = compound.initial * Math.pow(1 + compound.monthlyReturn / 100, compound.months)
  const profit = finalValue - compound.initial
  const totalReturn = (profit / compound.initial) * 100
  return { final: finalValue, profit, totalReturn }
})

const initialPercent = computed(() => {
  return (compound.initial / compoundResult.value.final) * 100
})

const profitPercent = computed(() => {
  return 100 - initialPercent.value
})

const formatNumber = (num) => {
  if (num >= 1000000) return (num / 1000000).toFixed(2) + 'M'
  if (num >= 1000) return (num / 1000).toFixed(2) + 'K'
  return num.toFixed(2)
}
</script>

<style lang="scss" scoped>
.calculator-page {
  padding-bottom: 40px;
}

// 页面头部
.page-header {
  text-align: center;
  margin-bottom: 32px;

  h1 {
    font-size: 28px;
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: 8px;
  }

  p {
    font-size: 15px;
    color: var(--text-secondary);
  }
}

// 计算器网格
.calculators-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(380px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
}

.calculator-card {
  background: var(--bg-primary);
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 4px 20px var(--shadow-color);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 24px;
  background: var(--bg-secondary);
}

.header-icon {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;

  .el-icon {
    font-size: 28px;
    color: white;
  }

  &.position { background: linear-gradient(135deg, #667eea, #764ba2); }
  &.ratio { background: linear-gradient(135deg, #11998e, #38ef7d); }
  &.compound { background: linear-gradient(135deg, #f093fb, #f5576c); }
}

.header-text {
  h3 {
    font-size: 18px;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 4px;
  }

  p {
    font-size: 13px;
    color: var(--text-secondary);
  }
}

.card-body {
  padding: 24px;
}

.form-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.card-result {
  padding: 24px;
  background: var(--bg-secondary);
  border-top: 1px solid var(--border-light);
}

.result-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid var(--border-light);

  &:last-child {
    border-bottom: none;
  }

  &.highlight {
    background: var(--bg-primary);
    margin: 12px -24px -24px;
    padding: 20px 24px;
    border-bottom: none;
  }

  .label {
    font-size: 14px;
    color: var(--text-secondary);
  }

  .value {
    font-size: 16px;
    font-weight: 600;
    color: var(--text-primary);

    &.primary { color: var(--primary-color); font-size: 20px; }
    &.success { color: var(--success-color); }
    &.warning { color: var(--warning-color); }
    &.danger { color: var(--danger-color); }
  }
}

// 盈亏比指示器
.ratio-indicator {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid var(--border-light);

  .indicator-bar {
    height: 8px;
    background: var(--bg-tertiary);
    border-radius: 4px;
    overflow: hidden;
    margin-bottom: 8px;
  }

  .indicator-fill {
    height: 100%;
    border-radius: 4px;
    transition: width 0.3s;

    &.good { background: linear-gradient(90deg, #67c23a, #85ce61); }
    &.medium { background: linear-gradient(90deg, #e6a23c, #ebb563); }
    &.bad { background: linear-gradient(90deg, #f56c6c, #f89898); }
  }

  .indicator-text {
    font-size: 13px;
    color: var(--text-secondary);
  }
}

// 复利图表
.compound-chart {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid var(--border-light);

  .chart-bar {
    display: flex;
    height: 32px;
    border-radius: 8px;
    overflow: hidden;
  }

  .bar-initial {
    background: linear-gradient(90deg, #409eff, #66b1ff);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 12px;
    font-weight: 500;
    min-width: 40px;
  }

  .bar-profit {
    background: linear-gradient(90deg, #67c23a, #85ce61);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 12px;
    font-weight: 500;
    min-width: 40px;
  }
}

// 提示区域
.tips-section {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.tip-card {
  display: flex;
  gap: 12px;
  padding: 20px;
  background: var(--bg-primary);
  border-radius: 12px;
  box-shadow: 0 2px 12px var(--shadow-color);

  > .el-icon {
    font-size: 24px;
    color: var(--primary-color);
    flex-shrink: 0;
  }

  .tip-content {
    h4 {
      font-size: 14px;
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: 4px;
    }

    p {
      font-size: 13px;
      color: var(--text-secondary);
      line-height: 1.5;
    }
  }
}

// 响应式
@media (max-width: 1200px) {
  .tips-section {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .calculators-grid {
    grid-template-columns: 1fr;
  }

  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>
