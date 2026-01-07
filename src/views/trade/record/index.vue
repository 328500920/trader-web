<template>
  <div class="trade-record-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <h1>📊 成交记录</h1>
        <p>导入交易所数据，分析交易表现</p>
      </div>
    </div>

    <!-- Tab 切换 -->
    <el-tabs v-model="activeTab" class="record-tabs">
      <!-- 成交明细 Tab -->
      <el-tab-pane label="成交明细" name="records">
        <div class="tab-header">
          <div class="stats-section">
            <div class="stat-card">
              <div class="stat-icon total"><el-icon><DataLine /></el-icon></div>
              <div class="stat-info">
                <span class="stat-value">{{ recordStats.totalCount }}</span>
                <span class="stat-label">成交笔数</span>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon amount"><el-icon><Coin /></el-icon></div>
              <div class="stat-info">
                <span class="stat-value">{{ formatNumber(recordStats.totalAmount) }}</span>
                <span class="stat-label">成交额(USDT)</span>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon fee"><el-icon><Tickets /></el-icon></div>
              <div class="stat-info">
                <span class="stat-value">{{ formatNumber(recordStats.totalFee) }}</span>
                <span class="stat-label">手续费(USDT)</span>
              </div>
            </div>
            <div class="stat-card" :class="{ negative: recordStats.netPnl < 0 }">
              <div class="stat-icon pnl"><el-icon><TrendCharts /></el-icon></div>
              <div class="stat-info">
                <span class="stat-value" :class="recordStats.netPnl >= 0 ? 'text-success' : 'text-danger'">
                  {{ recordStats.netPnl >= 0 ? '+' : '' }}{{ formatNumber(recordStats.netPnl) }}
                </span>
                <span class="stat-label">净盈亏(USDT)</span>
              </div>
            </div>
          </div>
          <el-upload
            :auto-upload="false"
            :show-file-list="false"
            accept=".xlsx,.xls"
            :on-change="handleRecordFileChange"
          >
            <el-button type="primary"><el-icon><Upload /></el-icon>导入成交明细</el-button>
          </el-upload>
        </div>

        <!-- 筛选区 -->
        <div class="filter-section">
          <el-input v-model="recordFilter.symbol" placeholder="合约/交易对" clearable style="width: 150px;" />
          <el-select v-model="recordFilter.direction" placeholder="方向" clearable style="width: 100px;">
            <el-option label="买入" value="买入" />
            <el-option label="卖出" value="卖出" />
          </el-select>
          <el-date-picker
            v-model="recordFilter.dateRange"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            style="width: 360px;"
          />
          <el-button type="primary" @click="loadRecords"><el-icon><Search /></el-icon>查询</el-button>
          <el-button @click="resetRecordFilter">重置</el-button>
        </div>

        <!-- 成交记录表格 -->
        <div class="table-container">
          <el-table :data="recordList" v-loading="recordLoading" stripe>
            <el-table-column prop="tradeTime" label="成交时间" width="170">
              <template #default="{ row }">{{ formatDateTime(row.tradeTime) }}</template>
            </el-table-column>
            <el-table-column prop="symbol" label="合约" width="120" />
            <el-table-column prop="direction" label="方向" width="80">
              <template #default="{ row }">
                <el-tag :type="row.direction === '买入' ? 'success' : 'danger'" size="small">{{ row.direction }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="price" label="价格" width="120" align="right">
              <template #default="{ row }">{{ formatNumber(row.price) }}</template>
            </el-table-column>
            <el-table-column prop="quantity" label="数量" width="100" align="right">
              <template #default="{ row }">{{ formatNumber(row.quantity) }}</template>
            </el-table-column>
            <el-table-column prop="amount" label="成交额" width="120" align="right">
              <template #default="{ row }">{{ formatNumber(row.amount) }}</template>
            </el-table-column>
            <el-table-column prop="fee" label="手续费" width="100" align="right">
              <template #default="{ row }">{{ formatNumber(row.fee) }}</template>
            </el-table-column>
            <el-table-column prop="realizedPnl" label="已实现盈亏" width="120" align="right">
              <template #default="{ row }">
                <span :class="row.realizedPnl >= 0 ? 'text-success' : 'text-danger'">
                  {{ row.realizedPnl >= 0 ? '+' : '' }}{{ formatNumber(row.realizedPnl) }}
                </span>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="80" fixed="right">
              <template #default="{ row }">
                <el-button text type="danger" size="small" @click="handleDeleteRecord(row)">
                  <el-icon><Delete /></el-icon>
                </el-button>
              </template>
            </el-table-column>
          </el-table>
          <div class="pagination-wrapper" v-if="recordPagination.total > 0">
            <el-pagination
              v-model:current-page="recordPagination.page"
              v-model:page-size="recordPagination.size"
              :total="recordPagination.total"
              :page-sizes="[20, 50, 100]"
              layout="total, sizes, prev, pager, next"
              @size-change="loadRecords"
              @current-change="loadRecords"
            />
          </div>
        </div>
      </el-tab-pane>

      <!-- 仓位历史 Tab -->
      <el-tab-pane label="仓位历史" name="positions">
        <div class="tab-header">
          <div class="stats-section">
            <div class="stat-card">
              <div class="stat-icon total"><el-icon><DataLine /></el-icon></div>
              <div class="stat-info">
                <span class="stat-value">{{ positionStats.totalCount }}</span>
                <span class="stat-label">总交易数</span>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon winrate"><el-icon><Aim /></el-icon></div>
              <div class="stat-info">
                <span class="stat-value">{{ positionStats.winRate }}%</span>
                <span class="stat-label">胜率</span>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon ratio"><el-icon><TrendCharts /></el-icon></div>
              <div class="stat-info">
                <span class="stat-value">{{ positionStats.profitFactor }}</span>
                <span class="stat-label">盈亏比</span>
              </div>
            </div>
            <div class="stat-card" :class="{ negative: positionStats.totalPnl < 0 }">
              <div class="stat-icon pnl"><el-icon><Coin /></el-icon></div>
              <div class="stat-info">
                <span class="stat-value" :class="positionStats.totalPnl >= 0 ? 'text-success' : 'text-danger'">
                  {{ positionStats.totalPnl >= 0 ? '+' : '' }}{{ formatNumber(positionStats.totalPnl) }}
                </span>
                <span class="stat-label">总盈亏(USDT)</span>
              </div>
            </div>
          </div>
          <el-upload
            :auto-upload="false"
            :show-file-list="false"
            accept=".csv"
            :on-change="handlePositionFileChange"
          >
            <el-button type="primary"><el-icon><Upload /></el-icon>导入仓位历史</el-button>
          </el-upload>
        </div>

        <!-- 筛选区 -->
        <div class="filter-section">
          <el-input v-model="positionFilter.symbol" placeholder="合约" clearable style="width: 150px;" />
          <el-select v-model="positionFilter.positionSide" placeholder="方向" clearable style="width: 100px;">
            <el-option label="做多" value="Long" />
            <el-option label="做空" value="Short" />
          </el-select>
          <el-date-picker
            v-model="positionFilter.dateRange"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            style="width: 360px;"
          />
          <el-button type="primary" @click="loadPositions"><el-icon><Search /></el-icon>查询</el-button>
          <el-button @click="resetPositionFilter">重置</el-button>
        </div>

        <!-- 仓位历史表格 -->
        <div class="table-container">
          <el-table :data="positionList" v-loading="positionLoading" stripe>
            <el-table-column prop="symbol" label="合约" width="120" />
            <el-table-column prop="positionSide" label="方向" width="80">
              <template #default="{ row }">
                <el-tag :type="row.positionSide === 'Long' ? 'success' : 'danger'" size="small">
                  {{ row.positionSide === 'Long' ? '做多' : '做空' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="entryPrice" label="入场价" width="110" align="right">
              <template #default="{ row }">{{ formatNumber(row.entryPrice) }}</template>
            </el-table-column>
            <el-table-column prop="closePrice" label="平仓价" width="110" align="right">
              <template #default="{ row }">{{ formatNumber(row.closePrice) }}</template>
            </el-table-column>
            <el-table-column prop="closedQuantity" label="数量" width="80" align="right">
              <template #default="{ row }">{{ formatNumber(row.closedQuantity) }}</template>
            </el-table-column>
            <el-table-column prop="closingPnl" label="盈亏" width="100" align="right">
              <template #default="{ row }">
                <span :class="row.closingPnl >= 0 ? 'text-success' : 'text-danger'">
                  {{ row.closingPnl >= 0 ? '+' : '' }}{{ formatNumber(row.closingPnl) }}
                </span>
              </template>
            </el-table-column>
            <el-table-column prop="openTime" label="开仓时间" width="160">
              <template #default="{ row }">{{ formatDateTime(row.openTime) }}</template>
            </el-table-column>
            <el-table-column prop="closeTime" label="平仓时间" width="160">
              <template #default="{ row }">{{ formatDateTime(row.closeTime) }}</template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="80">
              <template #default="{ row }">
                <el-tag :type="row.status === 'Closed' ? 'info' : 'warning'" size="small">
                  {{ row.status === 'Closed' ? '已平仓' : '持仓中' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="150" fixed="right">
              <template #default="{ row }">
                <el-button 
                  v-if="!row.tradeLogId && row.status === 'Closed'" 
                  text type="primary" size="small" 
                  @click="handleGenerateLog(row)"
                >
                  <el-icon><Document /></el-icon>生成日志
                </el-button>
                <el-button 
                  v-else-if="row.tradeLogId" 
                  text type="success" size="small" 
                  @click="viewTradeLog(row.tradeLogId)"
                >
                  <el-icon><View /></el-icon>查看日志
                </el-button>
                <el-button text type="danger" size="small" @click="handleDeletePosition(row)">
                  <el-icon><Delete /></el-icon>
                </el-button>
              </template>
            </el-table-column>
          </el-table>
          <div class="pagination-wrapper" v-if="positionPagination.total > 0">
            <el-pagination
              v-model:current-page="positionPagination.page"
              v-model:page-size="positionPagination.size"
              :total="positionPagination.total"
              :page-sizes="[20, 50, 100]"
              layout="total, sizes, prev, pager, next"
              @size-change="loadPositions"
              @current-change="loadPositions"
            />
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>

    <!-- 导入结果弹窗 -->
    <el-dialog v-model="importDialogVisible" title="导入结果" width="400px">
      <div class="import-result">
        <div class="result-item success">
          <el-icon><CircleCheck /></el-icon>
          <span>成功导入 <strong>{{ importResult.successCount }}</strong> 条记录</span>
        </div>
        <div class="result-item error" v-if="importResult.failCount > 0">
          <el-icon><CircleClose /></el-icon>
          <span>失败 <strong>{{ importResult.failCount }}</strong> 条</span>
        </div>
        <div class="error-list" v-if="importResult.errors?.length > 0">
          <p class="error-title">错误详情：</p>
          <ul>
            <li v-for="(err, idx) in importResult.errors" :key="idx">{{ err }}</li>
          </ul>
        </div>
      </div>
      <template #footer>
        <el-button type="primary" @click="importDialogVisible = false">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  getRecordList, deleteRecord, importRecords, getRecordStatistics,
  getPositionList, deletePosition, importPositions, getPositionStatistics, generateTradeLog
} from '@/api/trade'

const router = useRouter()
const activeTab = ref('positions')
const importDialogVisible = ref(false)

// 成交明细
const recordLoading = ref(false)
const recordList = ref([])
const recordFilter = reactive({ symbol: '', direction: '', dateRange: [] })
const recordPagination = reactive({ page: 1, size: 20, total: 0 })
const recordStats = reactive({ totalCount: 0, totalAmount: 0, totalFee: 0, netPnl: 0 })

// 仓位历史
const positionLoading = ref(false)
const positionList = ref([])
const positionFilter = reactive({ symbol: '', positionSide: '', dateRange: [] })
const positionPagination = reactive({ page: 1, size: 20, total: 0 })
const positionStats = reactive({ totalCount: 0, winRate: 0, profitFactor: 0, totalPnl: 0 })

const importResult = reactive({ successCount: 0, failCount: 0, errors: [] })

const formatNumber = (num) => {
  if (num === null || num === undefined) return '-'
  return Number(num).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 })
}

const formatDateTime = (dateTime) => {
  if (!dateTime) return '-'
  return dateTime.replace('T', ' ')
}

// 成交明细相关方法
const loadRecords = async () => {
  recordLoading.value = true
  try {
    const params = {
      pageNum: recordPagination.page,
      pageSize: recordPagination.size,
      symbol: recordFilter.symbol || undefined,
      direction: recordFilter.direction || undefined
    }
    if (recordFilter.dateRange?.length === 2) {
      params.startTime = recordFilter.dateRange[0].toISOString()
      params.endTime = recordFilter.dateRange[1].toISOString()
    }
    const res = await getRecordList(params)
    if (res.code === 200) {
      recordList.value = res.data.list || []
      recordPagination.total = res.data.total || 0
    }
  } catch (error) {
    ElMessage.error('加载成交记录失败')
  } finally {
    recordLoading.value = false
  }
}

const loadRecordStats = async () => {
  try {
    const res = await getRecordStatistics({})
    if (res.code === 200) Object.assign(recordStats, res.data)
  } catch (error) {
    console.error('加载统计失败', error)
  }
}

const resetRecordFilter = () => {
  Object.assign(recordFilter, { symbol: '', direction: '', dateRange: [] })
  recordPagination.page = 1
  loadRecords()
}

const handleRecordFileChange = async (file) => {
  if (!file.raw) return
  const formData = new FormData()
  formData.append('file', file.raw)
  recordLoading.value = true
  try {
    const res = await importRecords(formData)
    if (res.code === 200) {
      Object.assign(importResult, res.data)
      importDialogVisible.value = true
      loadRecords()
      loadRecordStats()
    } else {
      ElMessage.error(res.message || '导入失败')
    }
  } catch (error) {
    ElMessage.error('导入失败')
  } finally {
    recordLoading.value = false
  }
}

const handleDeleteRecord = (row) => {
  ElMessageBox.confirm('确定要删除这条成交记录吗？', '删除确认', { type: 'warning' })
    .then(async () => {
      await deleteRecord(row.id)
      ElMessage.success('删除成功')
      loadRecords()
      loadRecordStats()
    }).catch(() => {})
}

// 仓位历史相关方法
const loadPositions = async () => {
  positionLoading.value = true
  try {
    const params = {
      pageNum: positionPagination.page,
      pageSize: positionPagination.size,
      symbol: positionFilter.symbol || undefined,
      positionSide: positionFilter.positionSide || undefined
    }
    if (positionFilter.dateRange?.length === 2) {
      params.startTime = positionFilter.dateRange[0].toISOString()
      params.endTime = positionFilter.dateRange[1].toISOString()
    }
    const res = await getPositionList(params)
    if (res.code === 200) {
      positionList.value = res.data.list || []
      positionPagination.total = res.data.total || 0
    }
  } catch (error) {
    ElMessage.error('加载仓位历史失败')
  } finally {
    positionLoading.value = false
  }
}

const loadPositionStats = async () => {
  try {
    const res = await getPositionStatistics({})
    if (res.code === 200) Object.assign(positionStats, res.data)
  } catch (error) {
    console.error('加载统计失败', error)
  }
}

const resetPositionFilter = () => {
  Object.assign(positionFilter, { symbol: '', positionSide: '', dateRange: [] })
  positionPagination.page = 1
  loadPositions()
}

const handlePositionFileChange = async (file) => {
  if (!file.raw) return
  const formData = new FormData()
  formData.append('file', file.raw)
  positionLoading.value = true
  try {
    const res = await importPositions(formData)
    if (res.code === 200) {
      Object.assign(importResult, res.data)
      importDialogVisible.value = true
      loadPositions()
      loadPositionStats()
    } else {
      ElMessage.error(res.message || '导入失败')
    }
  } catch (error) {
    ElMessage.error('导入失败')
  } finally {
    positionLoading.value = false
  }
}

const handleDeletePosition = (row) => {
  ElMessageBox.confirm('确定要删除这条仓位记录吗？', '删除确认', { type: 'warning' })
    .then(async () => {
      await deletePosition(row.id)
      ElMessage.success('删除成功')
      loadPositions()
      loadPositionStats()
    }).catch(() => {})
}

const handleGenerateLog = async (row) => {
  ElMessageBox.confirm('将根据此仓位记录生成交易日志，是否继续？', '生成交易日志', { type: 'info' })
    .then(async () => {
      try {
        const res = await generateTradeLog(row.id)
        if (res.code === 200) {
          ElMessage.success('生成成功，即将跳转到编辑页面')
          setTimeout(() => {
            router.push(`/trade/edit/${res.data}`)
          }, 500)
        } else {
          ElMessage.error(res.message || '生成失败')
        }
      } catch (error) {
        ElMessage.error('生成失败')
      }
    }).catch(() => {})
}

const viewTradeLog = (tradeLogId) => {
  router.push(`/trade/detail/${tradeLogId}`)
}

// Tab 切换时加载数据
watch(activeTab, (val) => {
  if (val === 'records') {
    loadRecords()
    loadRecordStats()
  } else {
    loadPositions()
    loadPositionStats()
  }
})

onMounted(() => {
  loadPositions()
  loadPositionStats()
})
</script>

<style lang="scss" scoped>
.trade-record-page {
  padding-bottom: 40px;
}

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

.record-tabs {
  :deep(.el-tabs__header) {
    margin-bottom: 20px;
  }
  :deep(.el-tabs__item) {
    font-size: 15px;
    font-weight: 500;
  }
}

.tab-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
}

.stats-section {
  display: flex;
  gap: 16px;
  flex: 1;
}

.stat-card {
  background: var(--bg-primary);
  border-radius: 12px;
  padding: 16px 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 2px 8px var(--shadow-color);
  min-width: 160px;
}

.stat-icon {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  .el-icon { font-size: 20px; color: white; }
  &.total { background: linear-gradient(135deg, #667eea, #764ba2); }
  &.amount { background: linear-gradient(135deg, #f093fb, #f5576c); }
  &.fee { background: linear-gradient(135deg, #ffecd2, #fcb69f); .el-icon { color: #e67e22; } }
  &.pnl { background: linear-gradient(135deg, #67c23a, #85ce61); }
  &.winrate { background: linear-gradient(135deg, #11998e, #38ef7d); }
  &.ratio { background: linear-gradient(135deg, #f093fb, #f5576c); }
}

.stat-card.negative .stat-icon.pnl {
  background: linear-gradient(135deg, #f56c6c, #f89898);
}

.stat-info {
  .stat-value {
    display: block;
    font-size: 20px;
    font-weight: 700;
    color: var(--text-primary);
    line-height: 1.2;
  }
  .stat-label {
    font-size: 12px;
    color: var(--text-secondary);
  }
}

.filter-section {
  background: var(--bg-primary);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px var(--shadow-color);
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
}

.table-container {
  background: var(--bg-primary);
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px var(--shadow-color);
}

.pagination-wrapper {
  margin-top: 16px;
  display: flex;
  justify-content: center;
}

.text-success { color: var(--profit-color, #67c23a); }
.text-danger { color: var(--loss-color, #f56c6c); }

.import-result {
  .result-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px;
    border-radius: 8px;
    margin-bottom: 12px;
    .el-icon { font-size: 20px; }
    &.success { background: rgba(103, 194, 58, 0.1); color: #67c23a; }
    &.error { background: rgba(245, 108, 108, 0.1); color: #f56c6c; }
    strong { font-size: 18px; }
  }
  .error-list {
    background: var(--bg-secondary);
    border-radius: 8px;
    padding: 12px;
    max-height: 200px;
    overflow-y: auto;
    .error-title { font-weight: 600; margin-bottom: 8px; color: var(--text-primary); }
    ul { margin: 0; padding-left: 20px; color: var(--text-secondary); font-size: 13px; }
    li { margin-bottom: 4px; }
  }
}

@media (max-width: 1200px) {
  .tab-header {
    flex-direction: column;
    gap: 16px;
  }
  .stats-section {
    flex-wrap: wrap;
  }
}

@media (max-width: 768px) {
  .stats-section {
    flex-direction: column;
  }
  .stat-card {
    width: 100%;
  }
  .filter-section {
    flex-direction: column;
    .el-input, .el-select, .el-date-picker {
      width: 100% !important;
    }
  }
}
</style>
