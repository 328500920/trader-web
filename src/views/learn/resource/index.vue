<template>
  <div class="resource-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <h1>🔗 学习资源库</h1>
        <p>精选视频、文章、工具等优质学习资源</p>
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
          placeholder="搜索资源标题、描述、作者..."
          prefix-icon="Search"
          clearable
          class="search-input"
          @keyup.enter="handleSearch"
        />
        
        <el-select v-model="filterType" placeholder="资源类型" clearable>
          <el-option v-for="item in typeOptions" :key="item.value" :label="item.label" :value="item.value">
            <span>{{ item.icon }} {{ item.label }}</span>
          </el-option>
        </el-select>
        
        <el-select v-model="filterPlatform" placeholder="平台" clearable>
          <el-option v-for="p in platforms" :key="p" :label="p" :value="p" />
        </el-select>
        
        <el-select v-model="filterLanguage" placeholder="语言" clearable>
          <el-option label="中文" value="zh">🇨🇳 中文</el-option>
          <el-option label="英文" value="en">🇺🇸 英文</el-option>
        </el-select>
        
        <el-button type="primary" @click="handleSearch">
          <el-icon><Search /></el-icon>搜索
        </el-button>
        
        <el-button @click="resetFilter">
          <el-icon><Refresh /></el-icon>重置
        </el-button>
      </div>
    </div>

    <!-- 资源列表 -->
    <div class="resource-list">
      <!-- 骨架屏 -->
      <template v-if="loading">
        <SkeletonCard v-for="i in 5" :key="i" type="list" />
      </template>
      
      <!-- 实际内容 -->
      <template v-else>
      <div 
        v-for="item in resourceList" 
        :key="item.id" 
        class="resource-card"
        :class="`type-${item.resourceType}`"
      >
        <div class="resource-icon">
          {{ getTypeIcon(item.resourceType) }}
        </div>
        
        <div class="resource-content">
          <div class="resource-header">
            <h3 class="resource-title">{{ item.title }}</h3>
            <div class="resource-tags">
              <el-tag size="small" :type="getTypeTagType(item.resourceType)">
                {{ getTypeName(item.resourceType) }}
              </el-tag>
              <el-tag v-if="item.platform" size="small" type="info">
                {{ item.platform }}
              </el-tag>
              <el-tag v-if="item.language === 'en'" size="small">EN</el-tag>
              <el-tag v-if="item.isFree === 0" size="small" type="warning">付费</el-tag>
            </div>
          </div>
          
          <p class="resource-desc" v-if="item.description">
            {{ item.description }}
          </p>
          
          <div class="resource-meta">
            <span v-if="item.author" class="meta-item">
              <el-icon><User /></el-icon>{{ item.author }}
            </span>
            <span v-if="item.chapter" class="meta-item">
              <el-icon><Reading /></el-icon>{{ item.chapter.title }}
            </span>
          </div>
        </div>
        
        <div class="resource-action">
          <el-button type="primary" @click="openResource(item)">
            <el-icon><Link /></el-icon>
            访问资源
          </el-button>
        </div>
      </div>
      
      <!-- 空状态 -->
      <el-empty v-if="!loading && resourceList.length === 0" description="暂无资源数据" />
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
        @size-change="loadResources"
        @current-change="loadResources"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Search, Refresh, User, Reading, Link } from '@element-plus/icons-vue'
import { getResourceList, searchResources, getResourcePlatforms, getResourceStats } from '@/api/learn'
import { SkeletonCard } from '@/components/Skeleton'

const loading = ref(false)
const resourceList = ref([])
const total = ref(0)
const pageNum = ref(1)
const pageSize = ref(10)

const searchKeyword = ref('')
const filterType = ref('')
const filterPlatform = ref('')
const filterLanguage = ref('')
const platforms = ref([])
const stats = ref(null)

const typeOptions = [
  { value: 'video', label: '视频', icon: '🎬' },
  { value: 'article', label: '文章', icon: '📄' },
  { value: 'tool', label: '工具', icon: '🛠️' },
  { value: 'chart', label: '图表', icon: '📊' },
  { value: 'book', label: '书籍', icon: '📚' },
  { value: 'report', label: '报告', icon: '📋' }
]

const statItems = [
  { key: 'total', label: '全部资源', icon: '📦' },
  { key: 'video', label: '视频', icon: '🎬' },
  { key: 'article', label: '文章', icon: '📄' },
  { key: 'tool', label: '工具', icon: '🛠️' }
]

const getTypeIcon = (type) => {
  const icons = { video: '🎬', article: '📄', tool: '🛠️', chart: '📊', book: '📚', report: '📋' }
  return icons[type] || '📎'
}

const getTypeName = (type) => {
  const names = { video: '视频', article: '文章', tool: '工具', chart: '图表', book: '书籍', report: '报告' }
  return names[type] || '资源'
}

const getTypeTagType = (type) => {
  const types = { video: 'success', article: '', tool: 'warning', chart: 'info', book: 'danger', report: '' }
  return types[type] || ''
}

const loadResources = async () => {
  loading.value = true
  try {
    let res
    if (searchKeyword.value) {
      res = await searchResources({
        pageNum: pageNum.value,
        pageSize: pageSize.value,
        keyword: searchKeyword.value
      })
    } else {
      res = await getResourceList({
        pageNum: pageNum.value,
        pageSize: pageSize.value,
        resourceType: filterType.value || undefined,
        platform: filterPlatform.value || undefined,
        language: filterLanguage.value || undefined
      })
    }
    
    if (res.code === 200) {
      resourceList.value = res.data.list || []
      total.value = res.data.total || 0
    }
  } catch (error) {
    ElMessage.error('加载资源失败')
  } finally {
    loading.value = false
  }
}

const loadPlatforms = async () => {
  try {
    const res = await getResourcePlatforms()
    if (res.code === 200) {
      platforms.value = res.data || []
    }
  } catch (error) {
    console.error('加载平台失败:', error)
  }
}

const loadStats = async () => {
  try {
    const res = await getResourceStats()
    if (res.code === 200) {
      stats.value = res.data
    }
  } catch (error) {
    console.error('加载统计失败:', error)
  }
}

const handleSearch = () => {
  pageNum.value = 1
  loadResources()
}

const resetFilter = () => {
  searchKeyword.value = ''
  filterType.value = ''
  filterPlatform.value = ''
  filterLanguage.value = ''
  pageNum.value = 1
  loadResources()
}

const openResource = (item) => {
  if (item.url) {
    window.open(item.url, '_blank')
  } else {
    ElMessage.warning('资源链接不可用')
  }
}

onMounted(() => {
  loadResources()
  loadPlatforms()
  loadStats()
})
</script>

<style lang="scss" scoped>
.resource-page {
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
    width: 280px;
  }
  
  .el-select {
    width: 130px;
  }
}

.resource-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.resource-card {
  display: flex;
  align-items: flex-start;
  gap: 20px;
  background: var(--bg-primary);
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 2px 12px var(--shadow-color);
  transition: all 0.3s;
  border-left: 4px solid var(--primary-color);
  
  &:hover {
    transform: translateX(4px);
    box-shadow: 0 4px 16px var(--shadow-color);
  }
  
  &.type-video { border-left-color: #67c23a; }
  &.type-article { border-left-color: #409eff; }
  &.type-tool { border-left-color: #e6a23c; }
  &.type-chart { border-left-color: #909399; }
  &.type-book { border-left-color: #f56c6c; }
  &.type-report { border-left-color: #9c27b0; }
}

.resource-icon {
  font-size: 40px;
  flex-shrink: 0;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-secondary);
  border-radius: 12px;
}

.resource-content {
  flex: 1;
  min-width: 0;
}

.resource-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.resource-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
  line-height: 1.4;
}

.resource-tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.resource-desc {
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

.resource-meta {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: var(--text-secondary);
  
  .el-icon {
    color: var(--primary-color);
  }
}

.resource-action {
  flex-shrink: 0;
  display: flex;
  align-items: center;
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
