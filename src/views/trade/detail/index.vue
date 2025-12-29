<template>
  <div class="page-container">
    <div class="page-header">
      <div class="header-left">
        <el-button text @click="router.back()">
          <el-icon><ArrowLeft /></el-icon>返回
        </el-button>
        <h2>交易详情 #{{ trade.id }}</h2>
        <el-tag :type="trade.status === 1 ? 'info' : 'warning'">
          {{ trade.status === 1 ? '已平仓' : '持仓中' }}
        </el-tag>
      </div>
      <div class="header-actions">
        <el-button @click="router.push(`/trade/edit/${trade.id}`)">
          <el-icon><Edit /></el-icon>编辑
        </el-button>
        <el-button v-if="trade.status === 0" type="primary" @click="showCloseDialog = true">
          平仓
        </el-button>
      </div>
    </div>
    
    <div class="detail-content">
      <!-- 交易概览 -->
      <div class="card overview-card">
        <div class="trade-summary">
          <div class="summary-main">
            <span class="symbol">{{ trade.symbol }}</span>
            <el-tag :type="trade.direction === 1 ? 'success' : 'danger'" size="large">
              {{ trade.direction === 1 ? '做多' : '做空' }}
            </el-tag>
            <span class="strategy">{{ trade.strategy }}</span>
          </div>
          <div v-if="trade.status === 1" class="summary-result" :class="trade.profitLossPercent >= 0 ? 'profit' : 'loss'">
            <span class="result-value">{{ trade.profitLossPercent >= 0 ? '+' : '' }}{{ trade.profitLossPercent }}%</span>
            <span class="result-amount">{{ trade.profitLoss >= 0 ? '+' : '' }}{{ trade.profitLoss }} USDT</span>
          </div>
        </div>
        
        <div class="trade-prices">
          <div class="price-item">
            <span class="label">入场价</span>
            <span class="value">${{ trade.entryPrice }}</span>
          </div>
          <div class="price-item">
            <span class="label">出场价</span>
            <span class="value">{{ trade.exitPrice ? '$' + trade.exitPrice : '-' }}</span>
          </div>
          <div class="price-item">
            <span class="label">止损价</span>
            <span class="value text-danger">${{ trade.stopLoss }}</span>
          </div>
          <div class="price-item">
            <span class="label">止盈价</span>
            <span class="value text-success">${{ trade.takeProfit }}</span>
          </div>
          <div class="price-item">
            <span class="label">仓位</span>
            <span class="value">{{ trade.positionSize }} USDT</span>
          </div>
          <div class="price-item">
            <span class="label">交易日期</span>
            <span class="value">{{ trade.tradeDate }}</span>
          </div>
        </div>
      </div>
      
      <!-- 入场理由 -->
      <div class="card">
        <h3>入场理由</h3>
        <p>{{ trade.entryReason || '暂无' }}</p>
      </div>
      
      <!-- 交易分析 -->
      <div class="card analysis-card">
        <h3>交易前分析</h3>
        <div class="analysis-grid">
          <div class="analysis-item">
            <h4><el-icon><TrendCharts /></el-icon>宏观分析</h4>
            <p>{{ trade.macroAnalysis || '暂无' }}</p>
          </div>
          <div class="analysis-item">
            <h4><el-icon><Connection /></el-icon>链上分析</h4>
            <p>{{ trade.chainAnalysis || '暂无' }}</p>
          </div>
          <div class="analysis-item">
            <h4><el-icon><Mood /></el-icon>情绪分析</h4>
            <p>{{ trade.sentimentAnalysis || '暂无' }}</p>
          </div>
          <div class="analysis-item">
            <h4><el-icon><DataLine /></el-icon>技术分析</h4>
            <p>{{ trade.technicalAnalysis || '暂无' }}</p>
          </div>
        </div>
      </div>
      
      <!-- 交易截图 -->
      <div v-if="trade.images && trade.images.length > 0" class="card">
        <h3>交易截图</h3>
        <div class="image-list">
          <el-image 
            v-for="img in trade.images" 
            :key="img.id"
            :src="img.url"
            :preview-src-list="trade.images.map(i => i.url)"
            fit="cover"
            class="trade-image"
          />
        </div>
      </div>
      
      <!-- 复盘 -->
      <div v-if="trade.status === 1" class="card review-card">
        <h3>交易复盘</h3>
        <p class="review-content">{{ trade.review || '暂无复盘' }}</p>
        <div class="review-meta">
          <div class="meta-item">
            <span class="label">情绪评分</span>
            <el-rate v-model="trade.emotionScore" disabled :max="10" />
          </div>
          <div class="meta-item">
            <span class="label">遵守纪律</span>
            <el-tag :type="trade.disciplineFollowed ? 'success' : 'danger'">
              {{ trade.disciplineFollowed ? '是' : '否' }}
            </el-tag>
          </div>
          <div class="meta-item">
            <span class="label">出场原因</span>
            <span>{{ trade.exitReason }}</span>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 平仓弹窗 -->
    <el-dialog v-model="showCloseDialog" title="平仓" width="400px">
      <el-form :model="closeForm" label-width="80px">
        <el-form-item label="出场价格">
          <el-input-number v-model="closeForm.exitPrice" :precision="2" style="width: 100%;" />
        </el-form-item>
        <el-form-item label="出场原因">
          <el-select v-model="closeForm.exitReason" style="width: 100%;">
            <el-option label="止盈" value="止盈" />
            <el-option label="止损" value="止损" />
            <el-option label="手动平仓" value="手动" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showCloseDialog = false">取消</el-button>
        <el-button type="primary" @click="handleClose">确认平仓</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getTradeDetail, closeTrade } from '@/api/trade'

const router = useRouter()
const route = useRoute()
const loading = ref(false)

const showCloseDialog = ref(false)
const closeForm = reactive({
  exitPrice: null,
  exitReason: '',
  exitTime: new Date()
})

const trade = ref({
  id: null,
  tradeDate: '',
  symbol: '',
  direction: 1,
  strategy: '',
  entryPrice: 0,
  exitPrice: null,
  stopLoss: null,
  takeProfit: null,
  positionSize: 0,
  profitLoss: 0,
  profitLossPercent: 0,
  status: 0,
  entryReason: '',
  macroAnalysis: '',
  chainAnalysis: '',
  sentimentAnalysis: '',
  technicalAnalysis: '',
  review: '',
  emotionScore: 5,
  disciplineFollowed: true,
  exitReason: '',
  images: []
})

const loadTrade = async () => {
  loading.value = true
  try {
    const res = await getTradeDetail(route.params.id)
    if (res.code === 200 && res.data) {
      trade.value = res.data
    }
  } catch (error) {
    ElMessage.error('加载交易详情失败')
  } finally {
    loading.value = false
  }
}

const handleClose = async () => {
  if (!closeForm.exitPrice) {
    ElMessage.warning('请输入出场价格')
    return
  }
  try {
    await closeTrade(trade.value.id, closeForm)
    ElMessage.success('平仓成功')
    showCloseDialog.value = false
    loadTrade()
  } catch (error) {
    ElMessage.error('平仓失败')
  }
}

onMounted(() => {
  if (route.params.id) {
    loadTrade()
  }
})
</script>

<style lang="scss" scoped>
.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.detail-content {
  display: grid;
  gap: 20px;
}

.overview-card {
  .trade-summary {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
    padding-bottom: 20px;
    border-bottom: 1px solid var(--border-light);
  }
  
  .summary-main {
    display: flex;
    align-items: center;
    gap: 12px;
    
    .symbol {
      font-size: 24px;
      font-weight: 600;
    }
    
    .strategy {
      color: var(--text-secondary);
    }
  }
  
  .summary-result {
    text-align: right;
    
    &.profit {
      color: var(--profit-color);
    }
    
    &.loss {
      color: var(--loss-color);
    }
    
    .result-value {
      font-size: 28px;
      font-weight: 600;
      display: block;
    }
    
    .result-amount {
      font-size: 14px;
    }
  }
  
  .trade-prices {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 20px;
  }
  
  .price-item {
    .label {
      display: block;
      font-size: 13px;
      color: var(--text-secondary);
      margin-bottom: 4px;
    }
    
    .value {
      font-size: 16px;
      font-weight: 500;
    }
  }
}

.card h3 {
  font-size: 16px;
  margin-bottom: 16px;
}

.analysis-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.analysis-item {
  h4 {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 14px;
    color: var(--text-secondary);
    margin-bottom: 8px;
  }
  
  p {
    line-height: 1.6;
  }
}

.image-list {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.trade-image {
  width: 200px;
  height: 150px;
  border-radius: 8px;
}

.review-card {
  .review-content {
    line-height: 1.8;
    margin-bottom: 20px;
  }
  
  .review-meta {
    display: flex;
    gap: 40px;
    padding-top: 16px;
    border-top: 1px solid var(--border-light);
  }
  
  .meta-item {
    display: flex;
    align-items: center;
    gap: 8px;
    
    .label {
      color: var(--text-secondary);
      font-size: 14px;
    }
  }
}

@media (max-width: 768px) {
  .analysis-grid {
    grid-template-columns: 1fr;
  }
  
  .review-meta {
    flex-direction: column;
    gap: 16px;
  }
}
</style>
