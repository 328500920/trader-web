<template>
  <div class="topic-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <h1>📖 专题学习</h1>
        <p>深度专题内容，系统掌握进阶知识</p>
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
            <span class="stat-label">全部专题</span>
          </div>
        </div>
        <div class="stat-card supplement">
          <div class="stat-icon">📝</div>
          <div class="stat-info">
            <span class="stat-value">{{ stats.supplement }}</span>
            <span class="stat-label">补充内容</span>
          </div>
        </div>
        <div class="stat-card advanced">
          <div class="stat-icon">🚀</div>
          <div class="stat-info">
            <span class="stat-value">{{ stats.advanced }}</span>
            <span class="stat-label">进阶内容</span>
          </div>
        </div>
        <div class="stat-card special">
          <div class="stat-icon">⭐</div>
          <div class="stat-info">
            <span class="stat-value">{{ stats.special }}</span>
            <span class="stat-label">特别专题</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 筛选区域 -->
    <div class="filter-section">
      <div class="filter-row">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索专题标题、描述..."
          prefix-icon="Search"
          clearable
          class="search-input"
          @keyup.enter="handleSearch"
        />
        
        <el-select v-model="filterType" placeholder="专题类型" clearable>
          <el-option label="补充内容" value="supplement">📝 补充内容</el-option>
          <el-option label="进阶内容" value="advanced">🚀 进阶内容</el-option>
          <el-option label="特别专题" value="special">⭐ 特别专题</el-option>
        </el-select>
        
        <el-select v-model="filterDifficulty" placeholder="难度" clearable>
          <el-option label="入门" :value="1">🟢 入门</el-option>
          <el-option label="进阶" :value="2">🟡 进阶</el-option>
          <el-option label="高级" :value="3">🔴 高级</el-option>
        </el-select>
        
        <el-button type="primary" @click="handleSearch">
          <el-icon><Search /></el-icon>搜索
        </el-button>
        
        <el-button @click="resetFilter">
          <el-icon><Refresh /></el-icon>重置
        </el-button>
      </div>
    </div>

    <!-- 专题列表 -->
    <div class="topic-list">
      <!-- 骨架屏 -->
      <template v-if="loading">
        <SkeletonCard v-for="i in 6" :key="i" type="grid" />
      </template>
      
      <!-- 实际内容 -->
      <template v-else>
      <div 
        v-for="item in topicList" 
        :key="item.id" 
        class="topic-card"
        @click="goToDetail(item.id)"
      >
        <div class="topic-cover" v-if="item.coverImage">
          <img :src="item.coverImage" :alt="item.title" />
        </div>
        <div class="topic-cover placeholder" v-else>
          <span>{{ getTypeIcon(item.topicType) }}</span>
        </div>
        
        <div class="topic-content">
          <div class="topic-header">
            <div class="topic-tags">
              <el-tag size="small" :type="getTypeTagType(item.topicType)">
                {{ getTypeName(item.topicType) }}
              </el-tag>
              <el-tag size="small" :type="getDifficultyType(item.difficulty)">
                {{ getDifficultyName(item.difficulty) }}
              </el-tag>
            </div>
            <span class="topic-time" v-if="item.estimatedTime">
              <el-icon><Clock /></el-icon>
              {{ item.estimatedTime }}分钟
            </span>
          </div>
          
          <h3 class="topic-title">{{ item.title }}</h3>
          <p class="topic-subtitle" v-if="item.subtitle">{{ item.subtitle }}</p>
          <p class="topic-desc" v-if="item.description">{{ item.description }}</p>
          
          <div class="topic-footer">
            <span class="related-week" v-if="item.relatedWeek">
              <el-icon><Calendar /></el-icon>
              关联第 {{ item.relatedWeek }} 周
            </span>
            <el-button type="primary" text size="small">
              开始学习 <el-icon><ArrowRight /></el-icon>
            </el-button>
          </div>
        </div>
      </div>
      
      <!-- 空状态 -->
      <el-empty v-if="!loading && topicList.length === 0" description="暂无专题数据" />
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
        @size-change="loadTopics"
        @current-change="loadTopics"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Search, Refresh, Clock, Calendar, ArrowRight } from '@element-plus/icons-vue'
import { getTopicList, searchTopics, getTopicStats } from '@/api/learn'
import { SkeletonCard } from '@/components/Skeleton'

const router = useRouter()

const loading = ref(false)
const topicList = ref([])
const total = ref(0)
const pageNum = ref(1)
const pageSize = ref(6)

const searchKeyword = ref('')
const filterType = ref('')
const filterDifficulty = ref('')
const stats = ref(null)

const getTypeIcon = (type) => {
  const icons = { supplement: '📝', advanced: '🚀', special: '⭐' }
  return icons[type] || '📖'
}

const getTypeName = (type) => {
  const names = { supplement: '补充内容', advanced: '进阶内容', special: '特别专题' }
  return names[type] || '专题'
}

const getTypeTagType = (type) => {
  const types = { supplement: 'info', advanced: 'warning', special: 'success' }
  return types[type] || ''
}

const getDifficultyName = (level) => {
  const names = { 1: '入门', 2: '进阶', 3: '高级' }
  return names[level] || '未知'
}

const getDifficultyType = (level) => {
  const types = { 1: 'success', 2: 'warning', 3: 'danger' }
  return types[level] || ''
}

const loadTopics = async () => {
  loading.value = true
  try {
    let res
    if (searchKeyword.value) {
      res = await searchTopics({
        pageNum: pageNum.value,
        pageSize: pageSize.value,
        keyword: searchKeyword.value
      })
    } else {
      res = await getTopicList({
        pageNum: pageNum.value,
        pageSize: pageSize.value,
        topicType: filterType.value || undefined,
        difficulty: filterDifficulty.value || undefined
      })
    }
    
    if (res.code === 200) {
      topicList.value = res.data.list || []
      total.value = res.data.total || 0
    }
  } catch (error) {
    ElMessage.error('加载专题失败')
  } finally {
    loading.value = false
  }
}

const loadStats = async () => {
  try {
    const res = await getTopicStats()
    if (res.code === 200) {
      stats.value = res.data
    }
  } catch (error) {
    console.error('加载统计失败:', error)
  }
}

const handleSearch = () => {
  pageNum.value = 1
  loadTopics()
}

const resetFilter = () => {
  searchKeyword.value = ''
  filterType.value = ''
  filterDifficulty.value = ''
  pageNum.value = 1
  loadTopics()
}

const goToDetail = (id) => {
  router.push(`/learn/topic/${id}`)
}

onMounted(() => {
  loadTopics()
  loadStats()
})
</script>

<style lang="scss" scoped>
.topic-page {
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

.topic-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
}

.topic-card {
  background: var(--bg-primary);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 2px 12px var(--shadow-color);
  cursor: pointer;
  transition: all 0.3s;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px var(--shadow-color);
  }
}

.topic-cover {
  height: 160px;
  overflow: hidden;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s;
  }
  
  &.placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    
    span {
      font-size: 64px;
    }
  }
  
  .topic-card:hover & img {
    transform: scale(1.05);
  }
}

.topic-content {
  padding: 20px;
}

.topic-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.topic-tags {
  display: flex;
  gap: 8px;
}

.topic-time {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: var(--text-secondary);
}

.topic-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 8px;
  line-height: 1.4;
}

.topic-subtitle {
  font-size: 14px;
  color: var(--primary-color);
  margin-bottom: 8px;
}

.topic-desc {
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.6;
  margin-bottom: 16px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.topic-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid var(--border-light);
}

.related-week {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: var(--text-secondary);
  
  .el-icon { color: var(--primary-color); }
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
