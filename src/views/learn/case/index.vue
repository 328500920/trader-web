<template>
  <div class="case-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <h1>📊 实战案例库</h1>
        <p>真实交易案例分析，从成功与失败中学习</p>
      </div>
      
      <!-- 统计卡片骨架屏 -->
      <div class="stats-cards" v-if="!stats">
        <SkeletonCard v-for="i in 4" :key="i" type="stat" />
      </div>
      
      <!-- 统计卡片 -->
      <div class="stats-cards" v-else>
        <div class="stat-card total">
          <div class="stat-icon">📚</div>
          <div class="stat-info">
            <span class="stat-value">{{ stats.total }}</span>
            <span class="stat-label">全部案例</span>
          </div>
        </div>
        <div class="stat-card success">
          <div class="stat-icon">✅</div>
          <div class="stat-info">
            <span class="stat-value">{{ stats.success }}</span>
            <span class="stat-label">成功案例</span>
          </div>
        </div>
        <div class="stat-card failure">
          <div class="stat-icon">❌</div>
          <div class="stat-info">
            <span class="stat-value">{{ stats.failure }}</span>
            <span class="stat-label">失败案例</span>
          </div>
        </div>
        <div class="stat-card analysis">
          <div class="stat-icon">🔍</div>
          <div class="stat-info">
            <span class="stat-value">{{ stats.analysis }}</span>
            <span class="stat-label">分析案例</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 筛选区域 -->
    <div class="filter-section">
      <div class="filter-row">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索案例标题、品种、经验总结..."
          prefix-icon="Search"
          clearable
          class="search-input"
          @keyup.enter="handleSearch"
        />
        
        <el-select v-model="filterType" placeholder="案例类型" clearable>
          <el-option label="成功案例" value="success">
            <span>✅ 成功案例</span>
          </el-option>
          <el-option label="失败案例" value="failure">
            <span>❌ 失败案例</span>
          </el-option>
          <el-option label="分析案例" value="analysis">
            <span>🔍 分析案例</span>
          </el-option>
        </el-select>
        
        <el-select v-model="filterSymbol" placeholder="交易品种" clearable>
          <el-option 
            v-for="symbol in symbols" 
            :key="symbol" 
            :label="symbol" 
            :value="symbol"
          />
        </el-select>
        
        <el-button type="primary" @click="handleSearch">
          <el-icon><Search /></el-icon>
          搜索
        </el-button>
        
        <el-button @click="resetFilter">
          <el-icon><Refresh /></el-icon>
          重置
        </el-button>
      </div>
    </div>

    <!-- 案例列表 -->
    <div class="case-list">
      <!-- 骨架屏 -->
      <template v-if="loading">
        <SkeletonCard v-for="i in 5" :key="i" type="list" />
      </template>
      
      <!-- 实际内容 -->
      <template v-else>
      <div 
        v-for="item in caseList" 
        :key="item.id" 
        class="case-card"
        :class="`type-${item.caseType}`"
        @click="goToDetail(item.id)"
      >
        <div class="case-header">
          <div class="case-type-badge" :class="item.caseType">
            <span v-if="item.caseType === 'success'">✅ 成功</span>
            <span v-else-if="item.caseType === 'failure'">❌ 失败</span>
            <span v-else>🔍 分析</span>
          </div>
          <div class="case-meta">
            <span class="symbol" v-if="item.symbol">{{ item.symbol }}</span>
            <span class="timeframe" v-if="item.timeframe">{{ item.timeframe }}</span>
            <span class="date" v-if="item.entryDate">{{ item.entryDate }}</span>
          </div>
        </div>
        
        <h3 class="case-title">{{ item.title }}</h3>
        
        <p class="case-background" v-if="item.background">
          {{ truncateText(item.background, 120) }}
        </p>
        
        <div class="case-lessons" v-if="item.lessons">
          <div class="lessons-label">💡 经验总结</div>
          <p>{{ truncateText(item.lessons, 100) }}</p>
        </div>
        
        <div class="case-footer">
          <div class="chapter-info" v-if="item.chapter">
            <el-icon><Reading /></el-icon>
            <span>{{ item.chapter.title }}</span>
          </div>
          <el-button type="primary" text size="small">
            查看详情 <el-icon><ArrowRight /></el-icon>
          </el-button>
        </div>
      </div>
      
      <!-- 空状态 -->
      <el-empty v-if="!loading && caseList.length === 0" description="暂无案例数据" />
      </template>
    </div>

    <!-- 分页 -->
    <div class="pagination-wrapper" v-if="total > 0">
      <el-pagination
        v-model:current-page="pageNum"
        v-model:page-size="pageSize"
        :total="total"
        :page-sizes="[10, 20, 30, 50]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="loadCases"
        @current-change="loadCases"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Search, Refresh, Reading, ArrowRight } from '@element-plus/icons-vue'
import { getCaseList, searchCases, getCaseSymbols, getCaseStats } from '@/api/learn'
import { SkeletonCard } from '@/components/Skeleton'

const router = useRouter()

const loading = ref(false)
const caseList = ref([])
const total = ref(0)
const pageNum = ref(1)
const pageSize = ref(10)

const searchKeyword = ref('')
const filterType = ref('')
const filterSymbol = ref('')
const symbols = ref([])
const stats = ref(null)

const truncateText = (text, maxLength) => {
  if (!text) return ''
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text
}

const loadCases = async () => {
  loading.value = true
  try {
    let res
    if (searchKeyword.value) {
      res = await searchCases({
        pageNum: pageNum.value,
        pageSize: pageSize.value,
        keyword: searchKeyword.value
      })
    } else {
      res = await getCaseList({
        pageNum: pageNum.value,
        pageSize: pageSize.value,
        caseType: filterType.value || undefined,
        symbol: filterSymbol.value || undefined
      })
    }
    
    if (res.code === 200) {
      caseList.value = res.data.list || []
      total.value = res.data.total || 0
    }
  } catch (error) {
    ElMessage.error('加载案例失败')
  } finally {
    loading.value = false
  }
}

const loadSymbols = async () => {
  try {
    const res = await getCaseSymbols()
    if (res.code === 200) {
      symbols.value = res.data || []
    }
  } catch (error) {
    console.error('加载品种失败:', error)
  }
}

const loadStats = async () => {
  try {
    const res = await getCaseStats()
    if (res.code === 200) {
      stats.value = res.data
    }
  } catch (error) {
    console.error('加载统计失败:', error)
  }
}

const handleSearch = () => {
  pageNum.value = 1
  loadCases()
}

const resetFilter = () => {
  searchKeyword.value = ''
  filterType.value = ''
  filterSymbol.value = ''
  pageNum.value = 1
  loadCases()
}

const goToDetail = (id) => {
  router.push(`/learn/case/${id}`)
}

onMounted(() => {
  loadCases()
  loadSymbols()
  loadStats()
})
</script>

<style lang="scss" scoped>
.case-page {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 24px;
  
  .header-content {
    margin-bottom: 20px;
    
    h1 {
      font-size: 24px;
      font-weight: 700;
      color: var(--text-primary);
      margin-bottom: 8px;
    }
    
    p {
      color: var(--text-secondary);
      font-size: 14px;
    }
  }
}

.stats-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  background: var(--bg-primary);
  border-radius: 12px;
  box-shadow: 0 2px 8px var(--shadow-color);
  
  .stat-icon {
    font-size: 28px;
  }
  
  .stat-info {
    display: flex;
    flex-direction: column;
    
    .stat-value {
      font-size: 24px;
      font-weight: 700;
      color: var(--text-primary);
    }
    
    .stat-label {
      font-size: 12px;
      color: var(--text-secondary);
    }
  }
  
  &.success .stat-value { color: #67c23a; }
  &.failure .stat-value { color: #f56c6c; }
  &.analysis .stat-value { color: #409eff; }
}

.filter-section {
  background: var(--bg-primary);
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px var(--shadow-color);
}

.filter-row {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  
  .search-input {
    width: 300px;
  }
  
  .el-select {
    width: 140px;
  }
}

.case-list {
  display: grid;
  gap: 20px;
}

.case-card {
  background: var(--bg-primary);
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 2px 12px var(--shadow-color);
  cursor: pointer;
  transition: all 0.3s;
  border-left: 4px solid transparent;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px var(--shadow-color);
  }
  
  &.type-success {
    border-left-color: #67c23a;
    
    &:hover {
      background: linear-gradient(135deg, rgba(103, 194, 58, 0.05) 0%, transparent 100%);
    }
  }
  
  &.type-failure {
    border-left-color: #f56c6c;
    
    &:hover {
      background: linear-gradient(135deg, rgba(245, 108, 108, 0.05) 0%, transparent 100%);
    }
  }
  
  &.type-analysis {
    border-left-color: #409eff;
    
    &:hover {
      background: linear-gradient(135deg, rgba(64, 158, 255, 0.05) 0%, transparent 100%);
    }
  }
}

.case-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.case-type-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  
  &.success {
    background: rgba(103, 194, 58, 0.1);
    color: #67c23a;
  }
  
  &.failure {
    background: rgba(245, 108, 108, 0.1);
    color: #f56c6c;
  }
  
  &.analysis {
    background: rgba(64, 158, 255, 0.1);
    color: #409eff;
  }
}

.case-meta {
  display: flex;
  gap: 12px;
  font-size: 13px;
  color: var(--text-secondary);
  
  .symbol {
    font-weight: 600;
    color: var(--primary-color);
  }
}

.case-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 12px;
  line-height: 1.4;
}

.case-background {
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.6;
  margin-bottom: 16px;
}

.case-lessons {
  background: var(--bg-secondary);
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 16px;
  
  .lessons-label {
    font-size: 12px;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 6px;
  }
  
  p {
    font-size: 13px;
    color: var(--text-secondary);
    line-height: 1.5;
    margin: 0;
  }
}

.case-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid var(--border-light);
}

.chapter-info {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: var(--text-secondary);
  
  .el-icon {
    color: var(--primary-color);
  }
}

.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 24px;
  padding: 20px;
  background: var(--bg-primary);
  border-radius: 12px;
}
</style>
