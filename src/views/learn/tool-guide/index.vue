<template>
  <div class="tool-guide-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <h1>🛠️ 工具指南</h1>
        <p>交易必备工具使用教程，快速上手提升效率</p>
      </div>
      
      <!-- 统计卡片骨架屏 -->
      <div class="stats-cards" v-if="!stats">
        <SkeletonCard v-for="i in 4" :key="i" type="stat" />
      </div>
      
      <!-- 统计卡片 -->
      <div class="stats-cards" v-else>
        <div class="stat-card" v-for="item in statItems" :key="item.key">
          <div class="stat-icon">{{ item.icon }}</div>
          <div class="stat-info">
            <span class="stat-value">{{ stats[item.key] || 0 }}</span>
            <span class="stat-label">{{ item.label }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 筛选区域 -->
    <div class="filter-section">
      <div class="filter-row">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索工具名称、描述..."
          prefix-icon="Search"
          clearable
          class="search-input"
          @keyup.enter="handleSearch"
        />
        
        <el-select v-model="filterType" placeholder="工具类型" clearable>
          <el-option v-for="item in typeOptions" :key="item.value" :label="item.label" :value="item.value">
            <span>{{ item.icon }} {{ item.label }}</span>
          </el-option>
        </el-select>
        
        <el-select v-model="filterDifficulty" placeholder="上手难度" clearable>
          <el-option label="简单" :value="1">🟢 简单</el-option>
          <el-option label="中等" :value="2">🟡 中等</el-option>
          <el-option label="复杂" :value="3">🔴 复杂</el-option>
        </el-select>
        
        <el-button type="primary" @click="handleSearch">
          <el-icon><Search /></el-icon>搜索
        </el-button>
        
        <el-button @click="resetFilter">
          <el-icon><Refresh /></el-icon>重置
        </el-button>
      </div>
    </div>

    <!-- 工具列表 -->
    <div class="tool-list">
      <!-- 骨架屏 -->
      <template v-if="loading">
        <SkeletonCard v-for="i in 6" :key="i" type="grid" />
      </template>
      
      <!-- 实际内容 -->
      <template v-else>
      <div 
        v-for="item in toolList" 
        :key="item.id" 
        class="tool-card"
        @click="goToDetail(item.id)"
      >
        <div class="tool-logo">
          <img v-if="item.logoUrl" :src="item.logoUrl" :alt="item.toolName" />
          <span v-else class="logo-placeholder">{{ getTypeIcon(item.toolType) }}</span>
        </div>
        
        <div class="tool-content">
          <div class="tool-header">
            <h3 class="tool-name">{{ item.toolName }}</h3>
            <div class="tool-tags">
              <el-tag size="small" :type="getTypeTagType(item.toolType)">
                {{ getTypeName(item.toolType) }}
              </el-tag>
              <el-tag size="small" :type="getDifficultyType(item.difficulty)">
                {{ getDifficultyName(item.difficulty) }}
              </el-tag>
              <el-tag v-if="item.pricing" size="small" type="warning">
                {{ item.pricing }}
              </el-tag>
            </div>
          </div>
          
          <p class="tool-desc">{{ item.description }}</p>
          
          <div class="tool-features" v-if="item.features">
            <span v-for="(f, i) in parseFeatures(item.features).slice(0, 3)" :key="i" class="feature-tag">
              {{ f }}
            </span>
          </div>
          
          <div class="tool-footer">
            <a v-if="item.officialUrl" :href="item.officialUrl" target="_blank" @click.stop class="official-link">
              <el-icon><Link /></el-icon>官网
            </a>
            <el-button type="primary" text size="small">
              查看指南 <el-icon><ArrowRight /></el-icon>
            </el-button>
          </div>
        </div>
      </div>
      
      <!-- 空状态 -->
      <el-empty v-if="!loading && toolList.length === 0" description="暂无工具数据" />
      </template>
    </div>

    <!-- 分页 -->
    <div class="pagination-wrapper" v-if="total > 0">
      <el-pagination
        v-model:current-page="pageNum"
        v-model:page-size="pageSize"
        :total="total"
        :page-sizes="[6, 12, 18, 24]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="loadTools"
        @current-change="loadTools"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Search, Refresh, Link, ArrowRight } from '@element-plus/icons-vue'
import { getToolGuideList, searchToolGuides, getToolGuideStats } from '@/api/learn'
import { SkeletonCard } from '@/components/Skeleton'

const router = useRouter()

const loading = ref(false)
const toolList = ref([])
const total = ref(0)
const pageNum = ref(1)
const pageSize = ref(6)

const searchKeyword = ref('')
const filterType = ref('')
const filterDifficulty = ref('')
const stats = ref(null)

const typeOptions = [
  { value: 'chart', label: '图表工具', icon: '📊' },
  { value: 'exchange', label: '交易所', icon: '🏦' },
  { value: 'data', label: '数据平台', icon: '📈' },
  { value: 'sentiment', label: '情绪指标', icon: '😊' },
  { value: 'record', label: '记录工具', icon: '📝' }
]

const statItems = [
  { key: 'total', label: '全部工具', icon: '🛠️' },
  { key: 'chart', label: '图表工具', icon: '📊' },
  { key: 'exchange', label: '交易所', icon: '🏦' },
  { key: 'data', label: '数据平台', icon: '📈' }
]

const getTypeIcon = (type) => {
  const icons = { chart: '📊', exchange: '🏦', data: '📈', sentiment: '😊', record: '📝' }
  return icons[type] || '🛠️'
}

const getTypeName = (type) => {
  const names = { chart: '图表工具', exchange: '交易所', data: '数据平台', sentiment: '情绪指标', record: '记录工具' }
  return names[type] || '工具'
}

const getTypeTagType = (type) => {
  const types = { chart: 'primary', exchange: 'success', data: 'warning', sentiment: 'info', record: '' }
  return types[type] || ''
}

const getDifficultyName = (level) => {
  const names = { 1: '简单', 2: '中等', 3: '复杂' }
  return names[level] || '未知'
}

const getDifficultyType = (level) => {
  const types = { 1: 'success', 2: 'warning', 3: 'danger' }
  return types[level] || ''
}

const parseFeatures = (features) => {
  if (!features) return []
  try {
    return JSON.parse(features)
  } catch {
    return []
  }
}

const loadTools = async () => {
  loading.value = true
  try {
    let res
    if (searchKeyword.value) {
      res = await searchToolGuides({
        pageNum: pageNum.value,
        pageSize: pageSize.value,
        keyword: searchKeyword.value
      })
    } else {
      res = await getToolGuideList({
        pageNum: pageNum.value,
        pageSize: pageSize.value,
        toolType: filterType.value || undefined,
        difficulty: filterDifficulty.value || undefined
      })
    }
    
    if (res.code === 200) {
      toolList.value = res.data.list || []
      total.value = res.data.total || 0
    }
  } catch (error) {
    ElMessage.error('加载工具失败')
  } finally {
    loading.value = false
  }
}

const loadStats = async () => {
  try {
    const res = await getToolGuideStats()
    if (res.code === 200) {
      stats.value = res.data
    }
  } catch (error) {
    console.error('加载统计失败:', error)
  }
}

const handleSearch = () => {
  pageNum.value = 1
  loadTools()
}

const resetFilter = () => {
  searchKeyword.value = ''
  filterType.value = ''
  filterDifficulty.value = ''
  pageNum.value = 1
  loadTools()
}

const goToDetail = (id) => {
  router.push(`/learn/tool-guide/${id}`)
}

onMounted(() => {
  loadTools()
  loadStats()
})
</script>

<style lang="scss" scoped>
.tool-guide-page {
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
  
  .stat-icon { font-size: 28px; }
  
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
  
  .search-input { width: 280px; }
  .el-select { width: 130px; }
}

.tool-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
}

.tool-card {
  display: flex;
  gap: 20px;
  background: var(--bg-primary);
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 2px 12px var(--shadow-color);
  cursor: pointer;
  transition: all 0.3s;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px var(--shadow-color);
  }
}

.tool-logo {
  width: 80px;
  height: 80px;
  flex-shrink: 0;
  border-radius: 16px;
  overflow: hidden;
  background: var(--bg-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  .logo-placeholder {
    font-size: 40px;
  }
}

.tool-content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.tool-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 8px;
  flex-wrap: wrap;
}

.tool-name {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.tool-tags {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.tool-desc {
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.6;
  margin-bottom: 12px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.tool-features {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 12px;
}

.feature-tag {
  font-size: 12px;
  padding: 4px 10px;
  background: var(--bg-secondary);
  border-radius: 12px;
  color: var(--text-secondary);
}

.tool-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
}

.official-link {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: var(--primary-color);
  text-decoration: none;
  
  &:hover {
    text-decoration: underline;
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
