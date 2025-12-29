<template>
  <div class="analysis-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <h1>📋 每日分析</h1>
        <p>系统化记录市场分析，形成交易决策依据</p>
      </div>
      <div class="header-right">
        <el-date-picker 
          v-model="selectedDate" 
          type="date" 
          placeholder="选择日期" 
          @change="loadAnalysis"
          :disabled-date="disabledDate"
        />
        <el-button type="primary" @click="saveAnalysis" :loading="saving">
          <el-icon><Check /></el-icon>保存分析
        </el-button>
      </div>
    </div>

    <!-- 分析表单 -->
    <div class="analysis-form">
      <!-- 宏观环境 -->
      <div class="form-section">
        <div class="section-header">
          <span class="section-icon">🌍</span>
          <h3>宏观环境</h3>
        </div>
        <div class="section-body">
          <el-row :gutter="20">
            <el-col :xs="24" :md="12">
              <div class="form-item">
                <label>今日重要事件</label>
                <el-input 
                  v-model="form.macroEvents" 
                  type="textarea" 
                  :rows="3" 
                  placeholder="重要经济数据、央行会议、政策发布等..."
                />
              </div>
            </el-col>
            <el-col :xs="24" :sm="8" :md="4">
              <div class="form-item">
                <label>美联储态度</label>
                <el-select v-model="form.fedAttitude" placeholder="选择" style="width: 100%;">
                  <el-option label="🦅 鹰派" value="鹰派" />
                  <el-option label="🕊️ 鸽派" value="鸽派" />
                  <el-option label="⚖️ 中性" value="中性" />
                </el-select>
              </div>
            </el-col>
            <el-col :xs="24" :sm="8" :md="4">
              <div class="form-item">
                <label>DXY趋势</label>
                <el-select v-model="form.dxyTrend" placeholder="选择" style="width: 100%;">
                  <el-option label="📈 上涨" value="上涨" />
                  <el-option label="📉 下跌" value="下跌" />
                  <el-option label="➡️ 震荡" value="震荡" />
                </el-select>
              </div>
            </el-col>
            <el-col :xs="24" :sm="8" :md="4">
              <div class="form-item">
                <label>美股走势</label>
                <el-select v-model="form.stockTrend" placeholder="选择" style="width: 100%;">
                  <el-option label="📈 上涨" value="上涨" />
                  <el-option label="📉 下跌" value="下跌" />
                  <el-option label="➡️ 震荡" value="震荡" />
                </el-select>
              </div>
            </el-col>
          </el-row>
        </div>
      </div>

      <!-- 链上数据 -->
      <div class="form-section">
        <div class="section-header">
          <span class="section-icon">⛓️</span>
          <h3>链上数据</h3>
        </div>
        <div class="section-body">
          <el-row :gutter="20">
            <el-col :xs="24" :sm="12" :md="6">
              <div class="form-item">
                <label>交易所流向</label>
                <el-select v-model="form.exchangeFlow" placeholder="选择" style="width: 100%;">
                  <el-option label="🔴 净流入" value="净流入" />
                  <el-option label="🟢 净流出" value="净流出" />
                  <el-option label="⚪ 持平" value="持平" />
                </el-select>
              </div>
            </el-col>
            <el-col :xs="24" :sm="12" :md="6">
              <div class="form-item">
                <label>巨鲸动向</label>
                <el-input v-model="form.whaleAction" placeholder="买入/卖出/无明显动作" />
              </div>
            </el-col>
            <el-col :xs="24" :sm="12" :md="6">
              <div class="form-item">
                <label>矿工行为</label>
                <el-input v-model="form.minerAction" placeholder="持有/抛售/正常" />
              </div>
            </el-col>
            <el-col :xs="24" :sm="12" :md="6">
              <div class="form-item">
                <label>稳定币流入</label>
                <el-input v-model="form.stablecoinFlow" placeholder="增加/减少/持平" />
              </div>
            </el-col>
          </el-row>
        </div>
      </div>

      <!-- 市场情绪 -->
      <div class="form-section">
        <div class="section-header">
          <span class="section-icon">📊</span>
          <h3>市场情绪</h3>
        </div>
        <div class="section-body">
          <el-row :gutter="20">
            <el-col :xs="12" :sm="6">
              <div class="form-item">
                <label>恐惧贪婪指数</label>
                <el-input-number 
                  v-model="form.fearGreedIndex" 
                  :min="0" 
                  :max="100" 
                  style="width: 100%;"
                />
                <div class="input-hint" :class="getFearGreedClass(form.fearGreedIndex)">
                  {{ getFearGreedText(form.fearGreedIndex) }}
                </div>
              </div>
            </el-col>
            <el-col :xs="12" :sm="6">
              <div class="form-item">
                <label>资金费率</label>
                <el-input v-model="form.fundingRate" placeholder="如 0.01%" />
              </div>
            </el-col>
            <el-col :xs="12" :sm="6">
              <div class="form-item">
                <label>多空比</label>
                <el-input v-model="form.longShortRatio" placeholder="如 1.2" />
              </div>
            </el-col>
            <el-col :xs="12" :sm="6">
              <div class="form-item">
                <label>OI变化</label>
                <el-select v-model="form.oiChange" placeholder="选择" style="width: 100%;">
                  <el-option label="📈 增加" value="增加" />
                  <el-option label="📉 减少" value="减少" />
                  <el-option label="➡️ 持平" value="持平" />
                </el-select>
              </div>
            </el-col>
          </el-row>
        </div>
      </div>

      <!-- 技术分析 -->
      <div class="form-section">
        <div class="section-header">
          <span class="section-icon">📈</span>
          <h3>技术分析</h3>
        </div>
        <div class="section-body">
          <el-row :gutter="20">
            <el-col :xs="24" :sm="8" :md="4">
              <div class="form-item">
                <label>BTC价格</label>
                <el-input-number 
                  v-model="form.btcPrice" 
                  :precision="0"
                  :controls="false"
                  style="width: 100%;"
                />
              </div>
            </el-col>
            <el-col :xs="12" :sm="8" :md="4">
              <div class="form-item">
                <label>周线趋势</label>
                <el-select v-model="form.weeklyTrend" placeholder="选择" style="width: 100%;">
                  <el-option label="📈 上涨" value="上涨" />
                  <el-option label="📉 下跌" value="下跌" />
                  <el-option label="➡️ 震荡" value="震荡" />
                </el-select>
              </div>
            </el-col>
            <el-col :xs="12" :sm="8" :md="4">
              <div class="form-item">
                <label>日线趋势</label>
                <el-select v-model="form.dailyTrend" placeholder="选择" style="width: 100%;">
                  <el-option label="📈 上涨" value="上涨" />
                  <el-option label="📉 下跌" value="下跌" />
                  <el-option label="➡️ 震荡" value="震荡" />
                </el-select>
              </div>
            </el-col>
            <el-col :xs="12" :sm="6" :md="4">
              <div class="form-item">
                <label>关键支撑</label>
                <el-input-number 
                  v-model="form.keySupport" 
                  :precision="0"
                  :controls="false"
                  style="width: 100%;"
                />
              </div>
            </el-col>
            <el-col :xs="12" :sm="6" :md="4">
              <div class="form-item">
                <label>关键阻力</label>
                <el-input-number 
                  v-model="form.keyResistance" 
                  :precision="0"
                  :controls="false"
                  style="width: 100%;"
                />
              </div>
            </el-col>
            <el-col :xs="24" :sm="12" :md="4">
              <div class="form-item">
                <label>技术信号</label>
                <el-input v-model="form.technicalSignal" placeholder="MACD/RSI等" />
              </div>
            </el-col>
          </el-row>
        </div>
      </div>

      <!-- 综合判断 -->
      <div class="form-section conclusion">
        <div class="section-header">
          <span class="section-icon">🎯</span>
          <h3>综合判断</h3>
        </div>
        <div class="section-body">
          <el-row :gutter="20">
            <el-col :xs="12" :sm="6">
              <div class="form-item">
                <label>综合评分</label>
                <el-slider 
                  v-model="form.overallScore" 
                  :min="0" 
                  :max="100"
                  :marks="{ 0: '0', 25: '25', 50: '50', 75: '75', 100: '100' }"
                  show-input
                />
              </div>
            </el-col>
            <el-col :xs="12" :sm="6">
              <div class="form-item">
                <label>市场观点</label>
                <el-select v-model="form.marketView" placeholder="选择" style="width: 100%;">
                  <el-option label="🚀 强烈看多" value="强烈看多" />
                  <el-option label="📈 偏多" value="偏多" />
                  <el-option label="⚖️ 中性" value="中性" />
                  <el-option label="📉 偏空" value="偏空" />
                  <el-option label="💥 强烈看空" value="强烈看空" />
                </el-select>
              </div>
            </el-col>
            <el-col :xs="24" :sm="12">
              <div class="form-item">
                <label>今日策略</label>
                <el-radio-group v-model="form.todayStrategy" size="large">
                  <el-radio-button label="做多">
                    <span class="strategy-btn long">📈 做多</span>
                  </el-radio-button>
                  <el-radio-button label="做空">
                    <span class="strategy-btn short">📉 做空</span>
                  </el-radio-button>
                  <el-radio-button label="观望">
                    <span class="strategy-btn wait">👀 观望</span>
                  </el-radio-button>
                </el-radio-group>
              </div>
            </el-col>
            <el-col :xs="24">
              <div class="form-item">
                <label>备注说明</label>
                <el-input 
                  v-model="form.notes" 
                  type="textarea" 
                  :rows="4" 
                  placeholder="记录其他重要观察、交易计划、风险提示等..."
                />
              </div>
            </el-col>
          </el-row>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'

const selectedDate = ref(new Date())
const saving = ref(false)

const form = reactive({
  macroEvents: '',
  fedAttitude: '',
  dxyTrend: '',
  stockTrend: '',
  exchangeFlow: '',
  whaleAction: '',
  minerAction: '',
  stablecoinFlow: '',
  fearGreedIndex: 50,
  fundingRate: '',
  longShortRatio: '',
  oiChange: '',
  btcPrice: null,
  weeklyTrend: '',
  dailyTrend: '',
  keySupport: null,
  keyResistance: null,
  technicalSignal: '',
  overallScore: 50,
  marketView: '',
  todayStrategy: '',
  notes: ''
})

const disabledDate = (date) => {
  return date > new Date()
}

const getFearGreedText = (value) => {
  if (!value) return ''
  if (value <= 20) return '😱 极度恐惧'
  if (value <= 40) return '😰 恐惧'
  if (value <= 60) return '😐 中性'
  if (value <= 80) return '😊 贪婪'
  return '🤑 极度贪婪'
}

const getFearGreedClass = (value) => {
  if (!value) return ''
  if (value <= 20) return 'extreme-fear'
  if (value <= 40) return 'fear'
  if (value <= 60) return 'neutral'
  if (value <= 80) return 'greed'
  return 'extreme-greed'
}

const loadAnalysis = () => {
  // TODO: 加载指定日期的分析数据
}

const saveAnalysis = async () => {
  saving.value = true
  try {
    // TODO: 保存分析数据到后端
    await new Promise(resolve => setTimeout(resolve, 500))
    ElMessage.success('✅ 分析保存成功')
  } catch (error) {
    ElMessage.error('保存失败')
  } finally {
    saving.value = false
  }
}
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
  margin-bottom: 28px;

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

  .header-right {
    display: flex;
    gap: 12px;
  }
}

// 分析表单
.analysis-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.form-section {
  background: var(--bg-primary);
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 4px 20px var(--shadow-color);

  &.conclusion {
    .section-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;

      h3 {
        color: white;
      }
    }
  }
}

.section-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px 24px;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-light);

  .section-icon {
    font-size: 24px;
  }

  h3 {
    font-size: 16px;
    font-weight: 600;
    color: var(--text-primary);
  }
}

.section-body {
  padding: 24px;
}

.form-item {
  margin-bottom: 20px;

  label {
    display: block;
    font-size: 13px;
    font-weight: 500;
    color: var(--text-secondary);
    margin-bottom: 8px;
  }

  .input-hint {
    font-size: 12px;
    margin-top: 4px;
    padding: 4px 8px;
    border-radius: 4px;
    display: inline-block;

    &.extreme-fear { background: #fef0f0; color: #f56c6c; }
    &.fear { background: #fdf6ec; color: #e6a23c; }
    &.neutral { background: #f4f4f5; color: #909399; }
    &.greed { background: #f0f9eb; color: #67c23a; }
    &.extreme-greed { background: #ecf5ff; color: #409eff; }
  }
}

.strategy-btn {
  font-weight: 500;

  &.long { color: var(--success-color); }
  &.short { color: var(--danger-color); }
  &.wait { color: var(--warning-color); }
}

// 响应式
@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: 16px;

    .header-right {
      width: 100%;
      flex-direction: column;
    }
  }

  .section-body {
    padding: 16px;
  }
}
</style>
