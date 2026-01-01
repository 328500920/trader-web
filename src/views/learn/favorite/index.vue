<template>
  <div class="favorite-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <h1>⭐ 我的收藏</h1>
        <p>收藏优质内容，随时回顾学习</p>
      </div>
      
      <!-- 统计卡片 -->
      <div class="stats-cards" v-if="stats">
        <div class="stat-card total">
          <div class="stat-icon">📦</div>
          <div class="stat-info">
            <span class="stat-value">{{ stats.total }}</span>
            <span class="stat-label">全部收藏</span>
          </div>
        </div>
        <div class="stat-card case">
          <div class="stat-icon">📊</div>
          <div class="stat-info">
            <span class="stat-value">{{ stats.case }}</span>
            <span class="stat-label">案例</span>
          </div>
        </div>
        <div class="stat-card resource">
          <div class="stat-icon">🔗</div>
          <div class="stat-info">
            <span class="stat-value">{{ stats.resource }}</span>
            <span class="stat-label">资源</span>
          </div>
        </div>
        <div class="stat-card topic">
          <div class="stat-icon">📖</div>
          <div class="stat-info">
            <span class="stat-value">{{ stats.topic }}</span>
            <span class="stat-label">专题</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 筛选区域 -->
    <div class="filter-section">
      <el-radio-group v-model="filterType" @change="loadFavorites">
        <el-radio-button label="">全部</el-radio-button>
        <el-radio-button label="case">📊 案例</el-radio-button>
        <el-radio-button label="resource">🔗 资源</el-radio-button>
        <el-radio-button label="topic">📖 专题</el-radio-button>
        <el-radio-button label="tool">🛠️ 工具</el-radio-button>
      </el-radio-group>
    </div>

    <!-- 收藏列表 -->
    <div class="favorite-list" v-loading="loading">
      <div 
        v-for="item in favoriteList" 
        :key="item.id" 
        class="favorite-card"
        :class="`type-${item.targetType}`"
        @click="goToDetail(item)"
      >
        <div class="favorite-icon">
          {{ getTypeIcon(item.targetType) }}
        </div>
        
        <div class="favorite-content">
          <div class="favorite-header">
            <el-tag size="small" :type="getTypeTagType(item.targetType)">
              {{ getTypeName(item.targetType) }}
            </el-tag>
            <span class="favorite-time">{{ formatTime(item.createTime) }}</span>
          </div>
          
          <h3 class="favorite-title">{{ getTitle(item) }}</h3>
          <p class="favorite-desc">{{ getDescription(item) }}</p>
        </div>
        
        <div class="favorite-action">
          <el-button 
            type="danger" 
            text 
            @click.stop="handleRemove(item)"
          >
            <el-icon><Star /></el-icon>
            取消收藏
          </el-button>
        </div>
      </div>
      
      <!-- 空状态 -->
      <el-empty v-if="!loading && favoriteList.length === 0" description="暂无收藏内容" />
    </div>

    <!-- 分页 -->
    <div class="pagination-wrapper" v-if="total > 0">
      <el-pagination
        v-model:current-page="pageNum"
        v-model:page-size="pageSize"
        :total="total"
        :page-sizes="[10, 20, 30]"
        layout="total, sizes, prev, pager, next"
        @size-change="loadFavorites"
        @current-change="loadFavorites"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Star } from '@element-plus/icons-vue'
import { getFavoriteList, getFavoriteStats, removeFavorite } from '@/api/learn'

const router = useRouter()

const loading = ref(false)
const favoriteList = ref([])
const total = ref(0)
const pageNum = ref(1)
const pageSize = ref(10)
const filterType = ref('')
const stats = ref(null)

const getTypeIcon = (type) => {
  const icons = { case: '📊', resource: '🔗', topic: '📖', tool: '🛠️', quiz: '📝' }
  return icons[type] || '📎'
}

const getTypeName = (type) => {
  const names = { case: '案例', resource: '资源', topic: '专题', tool: '工具', quiz: '题目' }
  return names[type] || '内容'
}

const getTypeTagType = (type) => {
  const types = { case: 'success', resource: 'primary', topic: 'warning', tool: 'info', quiz: '' }
  return types[type] || ''
}

const formatTime = (time) => {
  if (!time) return ''
  return time.replace('T', ' ').substring(0, 10)
}

const getTitle = (item) => {
  if (!item.targetDetail) return '内容已删除'
  const detail = item.targetDetail
  switch (item.targetType) {
    case 'case': return detail.title
    case 'resource': return detail.title
    case 'topic': return detail.title
    case 'tool': return detail.toolName
    default: return '未知内容'
  }
}

const getDescription = (item) => {
  if (!item.targetDetail) return ''
  const detail = item.targetDetail
  switch (item.targetType) {
    case 'case': return detail.background || detail.lessons || ''
    case 'resource': return detail.description || ''
    case 'topic': return detail.description || detail.subtitle || ''
    case 'tool': return detail.description || ''
    default: return ''
  }
}

const loadFavorites = async () => {
  loading.value = true
  try {
    const res = await getFavoriteList({
      pageNum: pageNum.value,
      pageSize: pageSize.value,
      targetType: filterType.value || undefined
    })
    if (res.code === 200) {
      favoriteList.value = res.data.list || []
      total.value = res.data.total || 0
    }
  } catch (error) {
    ElMessage.error('加载收藏失败')
  } finally {
    loading.value = false
  }
}

const loadStats = async () => {
  try {
    const res = await getFavoriteStats({})
    if (res.code === 200) {
      stats.value = res.data
    }
  } catch (error) {
    console.error('加载统计失败:', error)
  }
}

const goToDetail = (item) => {
  const routes = {
    case: `/learn/case/${item.targetId}`,
    resource: `/learn/resource`,
    topic: `/learn/topic/${item.targetId}`,
    tool: `/learn/tool-guide/${item.targetId}`
  }
  const route = routes[item.targetType]
  if (route) {
    router.push(route)
  }
}

const handleRemove = async (item) => {
  try {
    await removeFavorite({
      targetType: item.targetType,
      targetId: item.targetId
    })
    ElMessage.success('已取消收藏')
    loadFavorites()
    loadStats()
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

onMounted(() => {
  loadFavorites()
  loadStats()
})
</script>

<style lang="scss" scoped>
.favorite-page {
  padding: 24px;
  max-width: 1000px;
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
  padding: 16px 20px;
  border-radius: 12px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px var(--shadow-color);
}

.favorite-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.favorite-card {
  display: flex;
  align-items: flex-start;
  gap: 20px;
  background: var(--bg-primary);
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 2px 12px var(--shadow-color);
  cursor: pointer;
  transition: all 0.3s;
  border-left: 4px solid var(--primary-color);
  
  &:hover {
    transform: translateX(4px);
    box-shadow: 0 4px 16px var(--shadow-color);
  }
  
  &.type-case { border-left-color: #67c23a; }
  &.type-resource { border-left-color: #409eff; }
  &.type-topic { border-left-color: #e6a23c; }
  &.type-tool { border-left-color: #909399; }
}

.favorite-icon {
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

.favorite-content {
  flex: 1;
  min-width: 0;
}

.favorite-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
  
  .favorite-time {
    font-size: 12px;
    color: var(--text-secondary);
  }
}

.favorite-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 8px;
  line-height: 1.4;
}

.favorite-desc {
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.favorite-action {
  flex-shrink: 0;
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
