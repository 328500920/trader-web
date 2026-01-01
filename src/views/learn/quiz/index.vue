<template>
  <div class="quiz-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <h1>📝 章节测验</h1>
        <p>检验学习成果，巩固知识要点</p>
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
            <span class="stat-label">全部题目</span>
          </div>
        </div>
        <div class="stat-card basic">
          <div class="stat-icon">🟢</div>
          <div class="stat-info">
            <span class="stat-value">{{ stats.basic }}</span>
            <span class="stat-label">基础题</span>
          </div>
        </div>
        <div class="stat-card intermediate">
          <div class="stat-icon">🟡</div>
          <div class="stat-info">
            <span class="stat-value">{{ stats.intermediate }}</span>
            <span class="stat-label">进阶题</span>
          </div>
        </div>
        <div class="stat-card advanced">
          <div class="stat-icon">🔴</div>
          <div class="stat-info">
            <span class="stat-value">{{ stats.advanced }}</span>
            <span class="stat-label">挑战题</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 选择章节 -->
    <div class="chapter-section">
      <div class="section-header">
        <h2>选择章节开始测验</h2>
        <el-radio-group v-model="selectedStage" size="small" @change="filterChapters">
          <el-radio-button :label="0">全部</el-radio-button>
          <el-radio-button :label="1">阶段一 (1-8周)</el-radio-button>
          <el-radio-button :label="2">阶段二 (9-16周)</el-radio-button>
          <el-radio-button :label="3">阶段三 (17-24周)</el-radio-button>
        </el-radio-group>
      </div>
      <div class="chapter-list">
        <!-- 骨架屏 -->
        <template v-if="loadingChapters">
          <SkeletonCard v-for="i in 6" :key="i" type="default" />
        </template>
        
        <!-- 实际内容 -->
        <template v-else>
        <div 
          v-for="chapter in filteredChapters" 
          :key="chapter.id" 
          class="chapter-card"
          :class="getStageClass(chapter.weekNumber)"
          @click="startQuiz(chapter)"
        >
          <div class="chapter-info">
            <div class="chapter-week" v-if="chapter.weekNumber">
              <span class="stage-badge">{{ getStageName(chapter.weekNumber) }}</span>
              第 {{ chapter.weekNumber }} 周
            </div>
            <h3>{{ chapter.title }}</h3>
          </div>
          <div class="chapter-stats" v-if="chapterStats[chapter.id]">
            <div class="stat-item">
              <span class="label">题目数</span>
              <span class="value">{{ chapterStats[chapter.id].totalQuizzes }}</span>
            </div>
            <div class="stat-item" v-if="chapterStats[chapter.id].attemptCount > 0">
              <span class="label">最高分</span>
              <span class="value highlight">{{ chapterStats[chapter.id].bestScore }}</span>
            </div>
          </div>
          <el-button type="primary" size="small">
            开始测验 <el-icon><ArrowRight /></el-icon>
          </el-button>
        </div>
        
        <el-empty v-if="!loadingChapters && filteredChapters.length === 0" description="暂无章节数据" />
        </template>
      </div>
    </div>

    <!-- 测验记录 -->
    <div class="record-section">
      <h2>我的测验记录</h2>
      <div class="record-list" v-loading="loadingRecords">
        <el-table :data="records" stripe>
          <el-table-column label="章节" min-width="200">
            <template #default="{ row }">
              {{ row.chapter?.title || '未知章节' }}
            </template>
          </el-table-column>
          <el-table-column prop="totalQuestions" label="题目数" width="100" align="center" />
          <el-table-column label="正确率" width="120" align="center">
            <template #default="{ row }">
              <el-tag :type="getAccuracyType(row)">
                {{ row.totalQuestions > 0 ? Math.round(row.correctCount * 100 / row.totalQuestions) : 0 }}%
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="score" label="得分" width="100" align="center" />
          <el-table-column label="用时" width="100" align="center">
            <template #default="{ row }">
              {{ formatTime(row.timeSpent) }}
            </template>
          </el-table-column>
          <el-table-column label="时间" width="180">
            <template #default="{ row }">
              {{ row.createTime }}
            </template>
          </el-table-column>
        </el-table>
        
        <el-empty v-if="!loadingRecords && records.length === 0" description="暂无测验记录" />
        
        <div class="pagination-wrapper" v-if="recordTotal > 0">
          <el-pagination
            v-model:current-page="recordPageNum"
            v-model:page-size="recordPageSize"
            :total="recordTotal"
            layout="total, prev, pager, next"
            @current-change="loadRecords"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowRight } from '@element-plus/icons-vue'
import { getChapterList, getQuizStats, getChapterQuizStats, getQuizRecords } from '@/api/learn'
import { SkeletonCard } from '@/components/Skeleton'

const router = useRouter()

const stats = ref(null)
const chapters = ref([])
const chapterStats = ref({})
const records = ref([])
const loadingChapters = ref(false)
const loadingRecords = ref(false)
const recordPageNum = ref(1)
const recordPageSize = ref(10)
const recordTotal = ref(0)
const selectedStage = ref(0)

// 根据阶段筛选章节
const filteredChapters = computed(() => {
  if (selectedStage.value === 0) {
    return chapters.value
  }
  return chapters.value.filter(chapter => {
    const week = chapter.weekNumber
    if (selectedStage.value === 1) return week >= 1 && week <= 8
    if (selectedStage.value === 2) return week >= 9 && week <= 16
    if (selectedStage.value === 3) return week >= 17 && week <= 24
    return true
  })
})

// 获取阶段名称
const getStageName = (weekNumber) => {
  if (weekNumber >= 1 && weekNumber <= 8) return '阶段一'
  if (weekNumber >= 9 && weekNumber <= 16) return '阶段二'
  if (weekNumber >= 17 && weekNumber <= 24) return '阶段三'
  return ''
}

// 获取阶段样式类
const getStageClass = (weekNumber) => {
  if (weekNumber >= 1 && weekNumber <= 8) return 'stage-1'
  if (weekNumber >= 9 && weekNumber <= 16) return 'stage-2'
  if (weekNumber >= 17 && weekNumber <= 24) return 'stage-3'
  return ''
}

// 筛选章节
const filterChapters = () => {
  // computed 会自动响应 selectedStage 的变化
}

const getAccuracyType = (row) => {
  const accuracy = row.totalQuestions > 0 ? (row.correctCount * 100 / row.totalQuestions) : 0
  if (accuracy >= 80) return 'success'
  if (accuracy >= 60) return 'warning'
  return 'danger'
}

const formatTime = (seconds) => {
  if (!seconds) return '-'
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}分${secs}秒`
}

const loadStats = async () => {
  try {
    const res = await getQuizStats()
    if (res.code === 200) {
      stats.value = res.data
    }
  } catch (error) {
    console.error('加载统计失败:', error)
  }
}

const loadChapters = async () => {
  loadingChapters.value = true
  try {
    // 加载所有三个阶段的章节
    const allChapters = []
    for (let courseId = 1; courseId <= 3; courseId++) {
      const res = await getChapterList({ courseId })
      if (res.code === 200 && res.data) {
        allChapters.push(...res.data)
      }
    }
    chapters.value = allChapters
    // 加载每个章节的测验统计
    for (const chapter of chapters.value) {
      loadChapterStats(chapter.id)
    }
  } catch (error) {
    ElMessage.error('加载章节失败')
  } finally {
    loadingChapters.value = false
  }
}

const loadChapterStats = async (chapterId) => {
  try {
    const res = await getChapterQuizStats(chapterId)
    if (res.code === 200) {
      chapterStats.value[chapterId] = res.data
    }
  } catch (error) {
    console.error('加载章节统计失败:', error)
  }
}

const loadRecords = async () => {
  loadingRecords.value = true
  try {
    const res = await getQuizRecords({
      pageNum: recordPageNum.value,
      pageSize: recordPageSize.value
    })
    if (res.code === 200) {
      records.value = res.data.list || []
      recordTotal.value = res.data.total || 0
    }
  } catch (error) {
    ElMessage.error('加载记录失败')
  } finally {
    loadingRecords.value = false
  }
}

const startQuiz = (chapter) => {
  router.push(`/learn/quiz/${chapter.id}`)
}

onMounted(() => {
  loadStats()
  loadChapters()
  loadRecords()
})
</script>

<style lang="scss" scoped>
.quiz-page {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 32px;
  
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

.chapter-section, .record-section {
  margin-bottom: 32px;
  
  h2 {
    font-size: 18px;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 16px;
    padding-left: 12px;
    border-left: 4px solid var(--primary-color);
  }
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 12px;
  
  h2 {
    margin-bottom: 0;
  }
}

.chapter-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}

.chapter-card {
  background: var(--bg-primary);
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px var(--shadow-color);
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  flex-direction: column;
  gap: 16px;
  border-left: 4px solid transparent;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px var(--shadow-color);
  }
  
  &.stage-1 {
    border-left-color: #67c23a;
  }
  
  &.stage-2 {
    border-left-color: #e6a23c;
  }
  
  &.stage-3 {
    border-left-color: #f56c6c;
  }
}

.chapter-info {
  .chapter-week {
    font-size: 12px;
    color: var(--primary-color);
    font-weight: 600;
    margin-bottom: 4px;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  h3 {
    font-size: 16px;
    font-weight: 600;
    color: var(--text-primary);
    line-height: 1.4;
  }
}

.stage-badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  
  .stage-1 & {
    background: rgba(103, 194, 58, 0.1);
    color: #67c23a;
  }
  
  .stage-2 & {
    background: rgba(230, 162, 60, 0.1);
    color: #e6a23c;
  }
  
  .stage-3 & {
    background: rgba(245, 108, 108, 0.1);
    color: #f56c6c;
  }
}

.chapter-stats {
  display: flex;
  gap: 20px;
  
  .stat-item {
    display: flex;
    flex-direction: column;
    
    .label {
      font-size: 12px;
      color: var(--text-secondary);
    }
    
    .value {
      font-size: 18px;
      font-weight: 600;
      color: var(--text-primary);
      
      &.highlight {
        color: var(--primary-color);
      }
    }
  }
}

.record-list {
  background: var(--bg-primary);
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px var(--shadow-color);
}

.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}
</style>
