<template>
  <div class="plan-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-info">
          <h1>📋 交易计划</h1>
          <p>制定计划，严格执行，提升交易纪律</p>
        </div>
        <el-button type="primary" @click="openCreateDialog">
          <el-icon><Plus /></el-icon>
          新建计划
        </el-button>
      </div>
      
      <!-- 统计卡片 -->
      <div class="stats-cards">
        <div class="stat-card">
          <div class="stat-icon pending">
            <el-icon><Clock /></el-icon>
          </div>
          <div class="stat-info">
            <span class="stat-value">{{ stats.pending || 0 }}</span>
            <span class="stat-label">待执行</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon executed">
            <el-icon><Check /></el-icon>
          </div>
          <div class="stat-info">
            <span class="stat-value">{{ stats.executed || 0 }}</span>
            <span class="stat-label">已执行</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon cancelled">
            <el-icon><Close /></el-icon>
          </div>
          <div class="stat-info">
            <span class="stat-value">{{ stats.cancelled || 0 }}</span>
            <span class="stat-label">已取消</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon rate">
            <el-icon><TrendCharts /></el-icon>
          </div>
          <div class="stat-info">
            <span class="stat-value">{{ stats.executeRate || 0 }}%</span>
            <span class="stat-label">执行率</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 筛选栏 -->
    <div class="filter-bar">
      <div class="filter-tabs">
        <el-radio-group v-model="filterStatus" @change="loadPlans">
          <el-radio-button :label="null">全部</el-radio-button>
          <el-radio-button :label="1">待执行</el-radio-button>
          <el-radio-button :label="2">已执行</el-radio-button>
          <el-radio-button :label="3">已取消</el-radio-button>
        </el-radio-group>
      </div>
      <div class="filter-search">
        <el-input 
          v-model="filterSymbol" 
          placeholder="搜索交易对" 
          clearable
          @clear="loadPlans"
          @keyup.enter="loadPlans"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
      </div>
    </div>

    <!-- 计划列表 -->
    <div class="plan-list" v-loading="loading">
      <div v-if="plans.length === 0" class="empty-state">
        <el-icon><Document /></el-icon>
        <p>暂无交易计划</p>
        <el-button type="primary" @click="openCreateDialog">创建第一个计划</el-button>
      </div>
      
      <div 
        v-for="plan in plans" 
        :key="plan.id" 
        class="plan-card"
        :class="[`status-${plan.status}`, `direction-${plan.direction}`]"
      >
        <div class="card-header">
          <div class="symbol-info">
            <span class="direction-tag" :class="plan.direction === 1 ? 'long' : 'short'">
              {{ plan.direction === 1 ? '做多' : '做空' }}
            </span>
            <span class="symbol">{{ plan.symbol }}</span>
          </div>
          <el-tag :type="getStatusType(plan.status)" size="small">
            {{ getStatusText(plan.status) }}
          </el-tag>
        </div>
        
        <div class="card-body">
          <div class="price-info">
            <div class="price-item">
              <span class="label">入场价</span>
              <span class="value">${{ formatPrice(plan.entryPrice) }}</span>
            </div>
            <div class="price-item stop-loss">
              <span class="label">止损价</span>
              <span class="value">${{ formatPrice(plan.stopLossPrice) }}</span>
              <span class="percent">-{{ plan.stopLossPercent?.toFixed(2) }}%</span>
            </div>
            <div class="price-item take-profit" v-if="plan.takeProfit1">
              <span class="label">止盈1</span>
              <span class="value">${{ formatPrice(plan.takeProfit1) }}</span>
              <span class="ratio">{{ plan.riskRewardRatio1 }}R</span>
            </div>
          </div>
          
          <div class="position-info">
            <span class="info-item">
              <el-icon><Coin /></el-icon>
              仓位 {{ plan.positionRatio }}%
            </span>
            <span class="info-item">
              <el-icon><ScaleToOriginal /></el-icon>
              {{ plan.leverage }}x 杠杆
            </span>
            <span class="info-item" v-if="plan.confidence">
              <el-icon><Star /></el-icon>
              信心 {{ plan.confidence }}/10
            </span>
          </div>
          
          <div class="reason-tags" v-if="plan.entryReasons">
            <el-tag 
              v-for="reason in parseReasons(plan.entryReasons)" 
              :key="reason"
              size="small"
              type="info"
            >
              {{ reason }}
            </el-tag>
          </div>
          
          <div class="plan-time" v-if="plan.planTime">
            <el-icon><Calendar /></el-icon>
            计划时间: {{ formatDateTime(plan.planTime) }}
          </div>
        </div>
        
        <div class="card-footer" v-if="plan.status === 1">
          <el-button type="primary" size="small" @click="handleExecute(plan)">
            <el-icon><Check /></el-icon>执行
          </el-button>
          <el-button size="small" @click="handleEdit(plan)">
            <el-icon><Edit /></el-icon>编辑
          </el-button>
          <el-button type="danger" size="small" plain @click="handleCancel(plan)">
            <el-icon><Close /></el-icon>取消
          </el-button>
        </div>
      </div>
    </div>

    <!-- 分页 -->
    <div class="pagination" v-if="total > pageSize">
      <el-pagination
        v-model:current-page="pageNum"
        :page-size="pageSize"
        :total="total"
        layout="prev, pager, next"
        @current-change="loadPlans"
      />
    </div>

    <!-- 创建/编辑弹窗 -->
    <el-dialog 
      v-model="dialogVisible" 
      :title="isEdit ? '编辑计划' : '新建交易计划'"
      width="680px"
      :close-on-click-modal="false"
      destroy-on-close
    >
      <el-form :model="form" label-width="100px" class="plan-form">
        <!-- 基础信息 -->
        <div class="form-section">
          <h4>基础信息</h4>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="交易对" required>
                <CryptoSelect v-model="form.symbol" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="方向" required>
                <el-radio-group v-model="form.direction">
                  <el-radio-button :label="1">
                    <span class="direction-btn long">做多</span>
                  </el-radio-button>
                  <el-radio-button :label="2">
                    <span class="direction-btn short">做空</span>
                  </el-radio-button>
                </el-radio-group>
              </el-form-item>
            </el-col>
          </el-row>
          <el-form-item label="计划时间">
            <el-date-picker
              v-model="form.planTime"
              type="datetime"
              placeholder="选择计划执行时间"
              style="width: 100%"
            />
          </el-form-item>
        </div>

        <!-- 价格设置 -->
        <div class="form-section">
          <h4>价格设置</h4>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="入场价格" required>
                <el-input-number 
                  v-model="form.entryPrice" 
                  :precision="2" 
                  :min="0"
                  :controls="false"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="止损价格" required>
                <el-input-number 
                  v-model="form.stopLossPrice" 
                  :precision="2" 
                  :min="0"
                  :controls="false"
                  style="width: 100%"
                />
                <div class="field-hint" v-if="stopLossPercent">
                  止损幅度: {{ stopLossPercent }}%
                </div>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="止盈目标1">
                <el-input-number 
                  v-model="form.takeProfit1" 
                  :precision="2" 
                  :min="0"
                  :controls="false"
                  style="width: 100%"
                />
                <div class="field-hint" v-if="riskRewardRatio1">
                  盈亏比: {{ riskRewardRatio1 }}
                </div>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="止盈目标2">
                <el-input-number 
                  v-model="form.takeProfit2" 
                  :precision="2" 
                  :min="0"
                  :controls="false"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="止盈目标3">
                <el-input-number 
                  v-model="form.takeProfit3" 
                  :precision="2" 
                  :min="0"
                  :controls="false"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
          </el-row>
        </div>

        <!-- 仓位管理 -->
        <div class="form-section">
          <h4>仓位管理</h4>
          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="仓位比例">
                <el-slider v-model="form.positionRatio" :max="100" :format-tooltip="val => val + '%'" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="杠杆倍数">
                <el-select v-model="form.leverage" style="width: 100%">
                  <el-option v-for="n in [1,2,3,5,10,20,25,50,75,100,125]" :key="n" :label="n + 'x'" :value="n" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="风险金额">
                <el-input-number 
                  v-model="form.riskAmount" 
                  :precision="2" 
                  :min="0"
                  :controls="false"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
          </el-row>
        </div>

        <!-- 交易逻辑 -->
        <div class="form-section">
          <h4>入场理由</h4>
          <el-form-item label="技术信号">
            <el-checkbox-group v-model="selectedReasons">
              <el-checkbox label="支撑位反弹" />
              <el-checkbox label="阻力位突破" />
              <el-checkbox label="趋势线支撑" />
              <el-checkbox label="均线金叉" />
              <el-checkbox label="MACD背离" />
              <el-checkbox label="RSI超卖" />
              <el-checkbox label="RSI超买" />
              <el-checkbox label="K线形态" />
            </el-checkbox-group>
          </el-form-item>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="市场趋势">
                <el-radio-group v-model="form.marketTrend">
                  <el-radio :label="1">上涨</el-radio>
                  <el-radio :label="2">震荡</el-radio>
                  <el-radio :label="3">下跌</el-radio>
                </el-radio-group>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="信心指数">
                <el-slider v-model="form.confidence" :min="1" :max="10" show-stops />
              </el-form-item>
            </el-col>
          </el-row>
          <el-form-item label="详细说明">
            <el-input 
              v-model="form.remark" 
              type="textarea" 
              :rows="3"
              placeholder="描述你的交易逻辑和入场理由..."
            />
          </el-form-item>
        </div>
      </el-form>
      
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting">
          {{ isEdit ? '保存修改' : '创建计划' }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  Plus, Clock, Check, Close, TrendCharts, Search, Document,
  Coin, ScaleToOriginal, Star, Calendar, Edit
} from '@element-plus/icons-vue'
import { 
  getPlanList, getPlanStats, createPlan, updatePlan, 
  executePlan, cancelPlan 
} from '@/api/trade'
import CryptoSelect from '@/components/CryptoSelect.vue'

// 列表数据
const loading = ref(false)
const plans = ref([])
const total = ref(0)
const pageNum = ref(1)
const pageSize = ref(10)
const filterStatus = ref(null)
const filterSymbol = ref('')
const stats = ref({})

// 弹窗
const dialogVisible = ref(false)
const isEdit = ref(false)
const submitting = ref(false)
const selectedReasons = ref([])

const defaultForm = {
  symbol: '',
  direction: 1,
  planTime: null,
  entryPrice: null,
  stopLossPrice: null,
  takeProfit1: null,
  takeProfit2: null,
  takeProfit3: null,
  positionRatio: 10,
  leverage: 1,
  riskAmount: null,
  marketTrend: 2,
  confidence: 5,
  remark: ''
}
const form = ref({ ...defaultForm })

// 计算止损幅度
const stopLossPercent = computed(() => {
  if (!form.value.entryPrice || !form.value.stopLossPrice) return null
  const diff = Math.abs(form.value.entryPrice - form.value.stopLossPrice)
  return ((diff / form.value.entryPrice) * 100).toFixed(2)
})

// 计算盈亏比
const riskRewardRatio1 = computed(() => {
  if (!form.value.entryPrice || !form.value.stopLossPrice || !form.value.takeProfit1) return null
  const risk = Math.abs(form.value.entryPrice - form.value.stopLossPrice)
  const reward = Math.abs(form.value.takeProfit1 - form.value.entryPrice)
  return (reward / risk).toFixed(2)
})

// 加载计划列表
const loadPlans = async () => {
  loading.value = true
  try {
    const res = await getPlanList({
      pageNum: pageNum.value,
      pageSize: pageSize.value,
      status: filterStatus.value,
      symbol: filterSymbol.value
    })
    if (res.code === 200) {
      plans.value = res.data.list
      total.value = res.data.total
    }
  } catch (error) {
    console.error('加载计划失败:', error)
  } finally {
    loading.value = false
  }
}

// 加载统计数据
const loadStats = async () => {
  try {
    const res = await getPlanStats()
    if (res.code === 200) {
      stats.value = res.data
    }
  } catch (error) {
    console.error('加载统计失败:', error)
  }
}

// 打开创建弹窗
const openCreateDialog = () => {
  isEdit.value = false
  form.value = { ...defaultForm }
  selectedReasons.value = []
  dialogVisible.value = true
}

// 编辑计划
const handleEdit = (plan) => {
  isEdit.value = true
  form.value = { ...plan }
  selectedReasons.value = parseReasons(plan.entryReasons)
  dialogVisible.value = true
}

// 提交表单
const handleSubmit = async () => {
  if (!form.value.symbol || !form.value.entryPrice || !form.value.stopLossPrice) {
    ElMessage.warning('请填写必填项')
    return
  }
  
  submitting.value = true
  try {
    const data = {
      ...form.value,
      entryReasons: JSON.stringify(selectedReasons.value)
    }
    
    if (isEdit.value) {
      await updatePlan(form.value.id, data)
      ElMessage.success('计划已更新')
    } else {
      await createPlan(data)
      ElMessage.success('计划已创建')
    }
    
    dialogVisible.value = false
    loadPlans()
    loadStats()
  } catch (error) {
    ElMessage.error('操作失败')
  } finally {
    submitting.value = false
  }
}

// 执行计划
const handleExecute = async (plan) => {
  try {
    await ElMessageBox.confirm(
      `确定要执行「${plan.symbol}」的交易计划吗？`,
      '执行计划',
      { confirmButtonText: '确定执行', cancelButtonText: '取消', type: 'info' }
    )
    await executePlan(plan.id)
    ElMessage.success('计划已标记为执行')
    loadPlans()
    loadStats()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('操作失败')
    }
  }
}

// 取消计划
const handleCancel = async (plan) => {
  try {
    await ElMessageBox.confirm(
      `确定要取消「${plan.symbol}」的交易计划吗？`,
      '取消计划',
      { confirmButtonText: '确定取消', cancelButtonText: '返回', type: 'warning' }
    )
    await cancelPlan(plan.id)
    ElMessage.success('计划已取消')
    loadPlans()
    loadStats()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('操作失败')
    }
  }
}

// 工具函数
const getStatusType = (status) => {
  const types = { 1: 'warning', 2: 'success', 3: 'info', 4: 'danger' }
  return types[status] || 'info'
}

const getStatusText = (status) => {
  const texts = { 1: '待执行', 2: '已执行', 3: '已取消', 4: '已过期' }
  return texts[status] || '未知'
}

const formatPrice = (price) => {
  if (!price) return '-'
  return Number(price).toLocaleString()
}

const formatDateTime = (dt) => {
  if (!dt) return '-'
  return new Date(dt).toLocaleString('zh-CN')
}

const parseReasons = (reasons) => {
  if (!reasons) return []
  try {
    return JSON.parse(reasons)
  } catch {
    return []
  }
}

onMounted(() => {
  loadPlans()
  loadStats()
})
</script>

<style lang="scss" scoped>
.plan-page {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 24px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;

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

.stats-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: var(--bg-primary);
  border-radius: 12px;
  box-shadow: 0 2px 8px var(--shadow-color);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: white;

  &.pending { background: linear-gradient(135deg, #e6a23c, #f5c76e); }
  &.executed { background: linear-gradient(135deg, #67c23a, #85ce61); }
  &.cancelled { background: linear-gradient(135deg, #909399, #b1b3b8); }
  &.rate { background: linear-gradient(135deg, #409eff, #66b1ff); }
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: var(--text-primary);
}

.stat-label {
  font-size: 13px;
  color: var(--text-secondary);
}

.filter-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 16px 20px;
  background: var(--bg-primary);
  border-radius: 12px;
}

.filter-search {
  width: 240px;
}

.plan-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  background: var(--bg-primary);
  border-radius: 12px;

  .el-icon {
    font-size: 48px;
    color: var(--text-secondary);
    margin-bottom: 16px;
  }

  p {
    color: var(--text-secondary);
    margin-bottom: 20px;
  }
}

.plan-card {
  background: var(--bg-primary);
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px var(--shadow-color);
  border-left: 4px solid var(--border-light);
  transition: all 0.2s;

  &:hover {
    box-shadow: 0 4px 16px var(--shadow-color);
  }

  &.direction-1 { border-left-color: #67c23a; }
  &.direction-2 { border-left-color: #f56c6c; }
  
  &.status-2 { opacity: 0.7; }
  &.status-3 { opacity: 0.5; }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.symbol-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.direction-tag {
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 13px;
  font-weight: 600;

  &.long {
    background: rgba(103, 194, 58, 0.1);
    color: #67c23a;
  }

  &.short {
    background: rgba(245, 108, 108, 0.1);
    color: #f56c6c;
  }
}

.symbol {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
}

.card-body {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.price-info {
  display: flex;
  gap: 24px;
}

.price-item {
  display: flex;
  flex-direction: column;
  gap: 4px;

  .label {
    font-size: 12px;
    color: var(--text-secondary);
  }

  .value {
    font-size: 16px;
    font-weight: 600;
    color: var(--text-primary);
  }

  .percent {
    font-size: 12px;
    color: #f56c6c;
  }

  .ratio {
    font-size: 12px;
    color: #67c23a;
  }
}

.position-info {
  display: flex;
  gap: 20px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: var(--text-secondary);

  .el-icon {
    font-size: 14px;
  }
}

.reason-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.plan-time {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: var(--text-secondary);
}

.card-footer {
  display: flex;
  gap: 8px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid var(--border-light);
}

.pagination {
  display: flex;
  justify-content: center;
  margin-top: 24px;
}

// 表单样式
.plan-form {
  .form-section {
    margin-bottom: 24px;
    padding-bottom: 20px;
    border-bottom: 1px solid var(--border-light);

    &:last-child {
      border-bottom: none;
      margin-bottom: 0;
    }

    h4 {
      font-size: 15px;
      font-weight: 600;
      color: var(--text-primary);
      margin: 0 0 16px;
      padding-left: 10px;
      border-left: 3px solid var(--primary-color);
    }
  }

  .field-hint {
    font-size: 12px;
    color: var(--text-secondary);
    margin-top: 4px;
  }

  .direction-btn {
    &.long { color: #67c23a; }
    &.short { color: #f56c6c; }
  }
}

// 响应式
@media (max-width: 768px) {
  .stats-cards {
    grid-template-columns: repeat(2, 1fr);
  }

  .filter-bar {
    flex-direction: column;
    gap: 12px;
  }

  .filter-search {
    width: 100%;
  }

  .price-info {
    flex-wrap: wrap;
  }

  .position-info {
    flex-wrap: wrap;
  }
}
</style>
