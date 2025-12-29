<template>
  <div class="trade-list-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <h1>📈 交易记录</h1>
        <p>记录每一笔交易，复盘每一次决策</p>
      </div>
      <el-button type="primary" size="large" @click="router.push('/trade/create')">
        <el-icon><Plus /></el-icon>新建交易
      </el-button>
    </div>

    <!-- 统计概览 -->
    <div class="stats-section">
      <div class="stat-card">
        <div class="stat-icon total">
          <el-icon><DataLine /></el-icon>
        </div>
        <div class="stat-info">
          <span class="stat-value">{{ summary.total }}</span>
          <span class="stat-label">总交易</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon winrate">
          <el-icon><Aim /></el-icon>
        </div>
        <div class="stat-info">
          <span class="stat-value">{{ summary.winRate }}%</span>
          <span class="stat-label">胜率</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon ratio">
          <el-icon><TrendCharts /></el-icon>
        </div>
        <div class="stat-info">
          <span class="stat-value">{{ summary.profitFactor }}</span>
          <span class="stat-label">盈亏比</span>
        </div>
      </div>
      <div class="stat-card" :class="{ negative: summary.netProfit < 0 }">
        <div class="stat-icon profit">
          <el-icon><Coin /></el-icon>
        </div>
        <div class="stat-info">
          <span class="stat-value" :class="summary.netProfit >= 0 ? 'text-success' : 'text-danger'">
            {{ summary.netProfit >= 0 ? '+' : '' }}{{ summary.netProfit }}%
          </span>
          <span class="stat-label">净收益</span>
        </div>
      </div>
    </div>

    <!-- 筛选区 -->
    <div class="filter-section">
      <div class="filter-row">
        <CryptoSelect v-model="filterForm.symbol" placeholder="品种" width="150px" />
        <el-select v-model="filterForm.direction" placeholder="方向" clearable style="width: 100px;">
          <el-option label="做多" :value="1" />
          <el-option label="做空" :value="2" />
        </el-select>
        <el-select v-model="filterForm.strategy" placeholder="策略" clearable style="width: 130px;">
          <el-option label="趋势跟随" value="趋势跟随" />
          <el-option label="情绪反转" value="情绪反转" />
          <el-option label="突破策略" value="突破策略" />
        </el-select>
        <el-select v-model="filterForm.status" placeholder="状态" clearable style="width: 110px;">
          <el-option label="持仓中" :value="0" />
          <el-option label="已平仓" :value="1" />
        </el-select>
        <el-date-picker
          v-model="filterForm.dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          style="width: 260px;"
        />
        <el-button type="primary" @click="handleSearch">
          <el-icon><Search /></el-icon>查询
        </el-button>
        <el-button @click="handleReset">重置</el-button>
      </div>
    </div>

    <!-- 交易列表 -->
    <div class="trades-container">
      <div class="trades-list" v-loading="loading">
        <div 
          v-for="trade in tradeList" 
          :key="trade.id" 
          class="trade-card"
          @click="viewDetail(trade)"
        >
          <div class="trade-main">
            <div class="trade-left">
              <div class="trade-symbol">
                <span class="symbol">{{ trade.symbol }}</span>
                <el-tag 
                  :type="trade.direction === 1 ? 'success' : 'danger'" 
                  size="small"
                  effect="dark"
                >
                  {{ trade.direction === 1 ? '做多' : '做空' }}
                </el-tag>
                <el-tag 
                  :type="trade.status === 1 ? 'info' : 'warning'" 
                  size="small"
                >
                  {{ trade.status === 1 ? '已平仓' : '持仓中' }}
                </el-tag>
              </div>
              <div class="trade-meta">
                <span class="strategy">
                  <el-icon><Flag /></el-icon>
                  {{ trade.strategy }}
                </span>
                <span class="date">
                  <el-icon><Calendar /></el-icon>
                  {{ trade.tradeDate }}
                </span>
              </div>
            </div>

            <div class="trade-prices">
              <div class="price-item">
                <span class="label">入场</span>
                <span class="value">${{ trade.entryPrice }}</span>
              </div>
              <div class="price-item">
                <span class="label">出场</span>
                <span class="value">{{ trade.exitPrice ? '$' + trade.exitPrice : '-' }}</span>
              </div>
              <div class="price-item">
                <span class="label">仓位</span>
                <span class="value">{{ trade.positionSize }} U</span>
              </div>
            </div>

            <div class="trade-result" v-if="trade.status === 1">
              <div 
                class="pnl-value" 
                :class="trade.profitLossPercent >= 0 ? 'profit' : 'loss'"
              >
                {{ trade.profitLossPercent >= 0 ? '+' : '' }}{{ trade.profitLossPercent }}%
              </div>
              <div class="pnl-amount">
                {{ trade.profitLoss >= 0 ? '+' : '' }}{{ trade.profitLoss }} USDT
              </div>
            </div>
            <div class="trade-result holding" v-else>
              <div class="holding-text">持仓中</div>
            </div>
          </div>

          <div class="trade-actions">
            <el-button text size="small" @click.stop="viewDetail(trade)">
              <el-icon><View /></el-icon>详情
            </el-button>
            <el-button text size="small" @click.stop="editTrade(trade)">
              <el-icon><Edit /></el-icon>编辑
            </el-button>
            <el-button text type="danger" size="small" @click.stop="deleteTrade(trade)">
              <el-icon><Delete /></el-icon>删除
            </el-button>
          </div>
        </div>

        <el-empty v-if="tradeList.length === 0 && !loading" description="暂无交易记录">
          <el-button type="primary" @click="router.push('/trade/create')">
            <el-icon><Plus /></el-icon>创建第一笔交易
          </el-button>
        </el-empty>
      </div>

      <!-- 分页 -->
      <div class="pagination-wrapper" v-if="pagination.total > 0">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.size"
          :total="pagination.total"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next"
          @size-change="handleSearch"
          @current-change="handleSearch"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getTradeList, deleteTrade as deleteTradeApi, getTradeSummary } from '@/api/trade'
import CryptoSelect from '@/components/CryptoSelect.vue'

const router = useRouter()
const loading = ref(false)

const filterForm = reactive({
  symbol: '',
  direction: '',
  strategy: '',
  status: '',
  dateRange: []
})

const pagination = reactive({
  page: 1,
  size: 10,
  total: 0
})

const summary = reactive({
  total: 0,
  winRate: 0,
  profitFactor: 0,
  netProfit: 0
})

const tradeList = ref([])

const loadSummary = async () => {
  try {
    const res = await getTradeSummary()
    if (res.code === 200) {
      summary.total = res.data.totalTrades || 0
      summary.winRate = res.data.winRate || 0
      summary.profitFactor = res.data.profitFactor || 0
      summary.netProfit = res.data.netProfit || 0
    }
  } catch (error) {
    console.error('加载统计失败', error)
  }
}

const handleSearch = async () => {
  loading.value = true
  try {
    const params = {
      pageNum: pagination.page,
      pageSize: pagination.size,
      symbol: filterForm.symbol || undefined,
      direction: filterForm.direction || undefined,
      strategy: filterForm.strategy || undefined,
      status: filterForm.status !== '' ? filterForm.status : undefined
    }
    if (filterForm.dateRange?.length === 2) {
      params.startDate = filterForm.dateRange[0]
      params.endDate = filterForm.dateRange[1]
    }
    
    const res = await getTradeList(params)
    if (res.code === 200) {
      tradeList.value = res.data.records || []
      pagination.total = res.data.total || 0
    }
  } catch (error) {
    ElMessage.error('加载交易记录失败')
  } finally {
    loading.value = false
  }
}

const handleReset = () => {
  Object.assign(filterForm, {
    symbol: '',
    direction: '',
    strategy: '',
    status: '',
    dateRange: []
  })
  pagination.page = 1
  handleSearch()
}

const viewDetail = (row) => {
  router.push(`/trade/detail/${row.id}`)
}

const editTrade = (row) => {
  router.push(`/trade/edit/${row.id}`)
}

const deleteTrade = (row) => {
  ElMessageBox.confirm('确定要删除这条交易记录吗？', '删除确认', {
    type: 'warning'
  }).then(async () => {
    try {
      await deleteTradeApi(row.id)
      ElMessage.success('删除成功')
      handleSearch()
      loadSummary()
    } catch (error) {
      ElMessage.error('删除失败')
    }
  }).catch(() => {})
}

onMounted(() => {
  handleSearch()
  loadSummary()
})
</script>

<style lang="scss" scoped>
.trade-list-page {
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

// 统计卡片
.stats-section {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 24px;
}

.stat-card {
  background: var(--bg-primary);
  border-radius: 16px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 2px 12px var(--shadow-color);
}

.stat-icon {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;

  .el-icon {
    font-size: 24px;
    color: white;
  }

  &.total { background: linear-gradient(135deg, #667eea, #764ba2); }
  &.winrate { background: linear-gradient(135deg, #f093fb, #f5576c); }
  &.ratio { background: linear-gradient(135deg, #11998e, #38ef7d); }
  &.profit { background: linear-gradient(135deg, #67c23a, #85ce61); }
}

.stat-card.negative .stat-icon.profit {
  background: linear-gradient(135deg, #f56c6c, #f89898);
}

.stat-info {
  .stat-value {
    display: block;
    font-size: 26px;
    font-weight: 700;
    color: var(--text-primary);
    line-height: 1.2;
  }

  .stat-label {
    font-size: 13px;
    color: var(--text-secondary);
  }
}

// 筛选区
.filter-section {
  background: var(--bg-primary);
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 24px;
  box-shadow: 0 2px 12px var(--shadow-color);
}

.filter-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
}

// 交易列表
.trades-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.trade-card {
  background: var(--bg-primary);
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 2px 12px var(--shadow-color);
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px var(--shadow-color);
  }
}

.trade-main {
  display: flex;
  align-items: center;
  gap: 24px;
  margin-bottom: 16px;
}

.trade-left {
  flex: 1;
  min-width: 0;

  .trade-symbol {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;

    .symbol {
      font-size: 18px;
      font-weight: 700;
      color: var(--text-primary);
    }
  }

  .trade-meta {
    display: flex;
    gap: 16px;
    font-size: 13px;
    color: var(--text-secondary);

    span {
      display: flex;
      align-items: center;
      gap: 4px;
    }
  }
}

.trade-prices {
  display: flex;
  gap: 32px;

  .price-item {
    text-align: center;

    .label {
      display: block;
      font-size: 12px;
      color: var(--text-secondary);
      margin-bottom: 4px;
    }

    .value {
      font-size: 15px;
      font-weight: 600;
      color: var(--text-primary);
    }
  }
}

.trade-result {
  text-align: right;
  min-width: 100px;

  .pnl-value {
    font-size: 22px;
    font-weight: 700;

    &.profit { color: var(--profit-color); }
    &.loss { color: var(--loss-color); }
  }

  .pnl-amount {
    font-size: 13px;
    color: var(--text-secondary);
  }

  &.holding {
    .holding-text {
      font-size: 16px;
      color: var(--warning-color);
      font-weight: 500;
    }
  }
}

.trade-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding-top: 16px;
  border-top: 1px solid var(--border-light);
}

// 分页
.pagination-wrapper {
  margin-top: 24px;
  display: flex;
  justify-content: center;
}

// 响应式
@media (max-width: 1024px) {
  .trade-main {
    flex-wrap: wrap;
  }

  .trade-prices {
    width: 100%;
    justify-content: flex-start;
    gap: 24px;
  }

  .trade-result {
    width: 100%;
    text-align: left;
    margin-top: 12px;
    padding-top: 12px;
    border-top: 1px dashed var(--border-light);
  }
}

@media (max-width: 768px) {
  .stats-section {
    grid-template-columns: repeat(2, 1fr);
  }

  .filter-row {
    flex-direction: column;

    .el-select, .el-date-picker {
      width: 100% !important;
    }
  }
}
</style>
