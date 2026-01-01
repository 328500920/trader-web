<template>
  <div class="wrong-book-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <h1>📕 错题本</h1>
        <p>记录错题，反复练习，攻克薄弱环节</p>
      </div>
      
      <!-- 统计卡片 -->
      <div class="stats-cards" v-if="stats">
        <div class="stat-card total">
          <div class="stat-icon">📚</div>
          <div class="stat-info">
            <span class="stat-value">{{ stats.total }}</span>
            <span class="stat-label">全部错题</span>
          </div>
        </div>
        <div class="stat-card unmastered">
          <div class="stat-icon">❌</div>
          <div class="stat-info">
            <span class="stat-value">{{ stats.unmastered }}</span>
            <span class="stat-label">待掌握</span>
          </div>
        </div>
        <div class="stat-card mastered">
          <div class="stat-icon">✅</div>
          <div class="stat-info">
            <span class="stat-value">{{ stats.mastered }}</span>
            <span class="stat-label">已掌握</span>
          </div>
        </div>
        <div class="stat-card rate">
          <div class="stat-icon">📊</div>
          <div class="stat-info">
            <span class="stat-value">{{ masteredRate }}%</span>
            <span class="stat-label">掌握率</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 筛选区域 -->
    <div class="filter-section">
      <div class="filter-row">
        <el-radio-group v-model="filterMastered" @change="loadWrongQuestions">
          <el-radio-button :label="null">全部</el-radio-button>
          <el-radio-button :label="0">待掌握</el-radio-button>
          <el-radio-button :label="1">已掌握</el-radio-button>
        </el-radio-group>
        
        <el-button type="primary" @click="startPractice" :disabled="wrongList.length === 0">
          <el-icon><VideoPlay /></el-icon>
          开始练习
        </el-button>
      </div>
    </div>

    <!-- 错题列表 -->
    <div class="wrong-list" v-loading="loading">
      <div 
        v-for="item in wrongList" 
        :key="item.id" 
        class="wrong-card"
        :class="{ mastered: item.isMastered === 1 }"
      >
        <div class="wrong-header">
          <div class="wrong-meta">
            <el-tag size="small" :type="item.isMastered === 1 ? 'success' : 'danger'">
              {{ item.isMastered === 1 ? '已掌握' : '待掌握' }}
            </el-tag>
            <span class="wrong-count">错误 {{ item.wrongCount }} 次</span>
            <span class="wrong-time">{{ formatTime(item.lastWrongTime) }}</span>
          </div>
          <div class="wrong-actions">
            <el-button 
              v-if="item.isMastered !== 1"
              type="success" 
              text 
              size="small"
              @click="handleMaster(item)"
            >
              <el-icon><CircleCheck /></el-icon>
              标记掌握
            </el-button>
            <el-button 
              v-else
              type="warning" 
              text 
              size="small"
              @click="handleUnmaster(item)"
            >
              <el-icon><RefreshRight /></el-icon>
              重新学习
            </el-button>
            <el-button 
              type="danger" 
              text 
              size="small"
              @click="handleRemove(item)"
            >
              <el-icon><Delete /></el-icon>
              删除
            </el-button>
          </div>
        </div>
        
        <div class="wrong-content" v-if="item.quiz">
          <div class="question-text">{{ item.quiz.question }}</div>
          
          <div class="options-list" v-if="item.quiz.options">
            <div 
              v-for="(opt, idx) in parseOptions(item.quiz.options)" 
              :key="idx"
              class="option-item"
              :class="{
                correct: isCorrectOption(item.quiz, idx),
                wrong: isWrongOption(item, idx)
              }"
            >
              <span class="option-label">{{ getOptionLabel(idx) }}</span>
              <span class="option-text">{{ opt }}</span>
            </div>
          </div>
          
          <div class="answer-info">
            <div class="your-answer" v-if="item.userAnswer">
              <span class="label">你的答案：</span>
              <span class="value wrong">{{ item.userAnswer }}</span>
            </div>
            <div class="correct-answer">
              <span class="label">正确答案：</span>
              <span class="value correct">{{ item.quiz.answer }}</span>
            </div>
          </div>
          
          <div class="explanation" v-if="item.quiz.explanation">
            <div class="explanation-label">💡 解析</div>
            <div class="explanation-text">{{ item.quiz.explanation }}</div>
          </div>
        </div>
      </div>
      
      <!-- 空状态 -->
      <el-empty v-if="!loading && wrongList.length === 0" description="暂无错题记录，继续加油！" />
    </div>

    <!-- 分页 -->
    <div class="pagination-wrapper" v-if="total > 0">
      <el-pagination
        v-model:current-page="pageNum"
        v-model:page-size="pageSize"
        :total="total"
        :page-sizes="[10, 20, 30]"
        layout="total, sizes, prev, pager, next"
        @size-change="loadWrongQuestions"
        @current-change="loadWrongQuestions"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { VideoPlay, CircleCheck, RefreshRight, Delete } from '@element-plus/icons-vue'
import { 
  getWrongQuestionList, 
  getWrongQuestionStats, 
  markQuestionMastered, 
  unmarkQuestionMastered,
  removeWrongQuestion 
} from '@/api/learn'

const router = useRouter()

const loading = ref(false)
const wrongList = ref([])
const total = ref(0)
const pageNum = ref(1)
const pageSize = ref(10)
const filterMastered = ref(null)
const stats = ref(null)

const masteredRate = computed(() => {
  if (!stats.value || stats.value.total === 0) return 0
  return Math.round(stats.value.mastered / stats.value.total * 100)
})

const formatTime = (time) => {
  if (!time) return ''
  return time.replace('T', ' ').substring(0, 16)
}

const parseOptions = (options) => {
  if (!options) return []
  try {
    return JSON.parse(options)
  } catch {
    return []
  }
}

const getOptionLabel = (idx) => {
  return String.fromCharCode(65 + idx) // A, B, C, D...
}

const isCorrectOption = (quiz, idx) => {
  if (!quiz || !quiz.answer) return false
  const label = getOptionLabel(idx)
  return quiz.answer.includes(label)
}

const isWrongOption = (item, idx) => {
  if (!item.userAnswer) return false
  const label = getOptionLabel(idx)
  return item.userAnswer.includes(label) && !isCorrectOption(item.quiz, idx)
}

const loadWrongQuestions = async () => {
  loading.value = true
  try {
    const res = await getWrongQuestionList({
      pageNum: pageNum.value,
      pageSize: pageSize.value,
      isMastered: filterMastered.value
    })
    if (res.code === 200) {
      wrongList.value = res.data.list || []
      total.value = res.data.total || 0
    }
  } catch (error) {
    ElMessage.error('加载错题失败')
  } finally {
    loading.value = false
  }
}

const loadStats = async () => {
  try {
    const res = await getWrongQuestionStats({})
    if (res.code === 200) {
      stats.value = res.data
    }
  } catch (error) {
    console.error('加载统计失败:', error)
  }
}

const handleMaster = async (item) => {
  try {
    await markQuestionMastered({ quizId: item.quizId })
    ElMessage.success('已标记为掌握')
    loadWrongQuestions()
    loadStats()
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

const handleUnmaster = async (item) => {
  try {
    await unmarkQuestionMastered({ quizId: item.quizId })
    ElMessage.success('已重新标记为待掌握')
    loadWrongQuestions()
    loadStats()
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

const handleRemove = async (item) => {
  try {
    await ElMessageBox.confirm('确定要删除这道错题吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await removeWrongQuestion({ quizId: item.quizId })
    ElMessage.success('删除成功')
    loadWrongQuestions()
    loadStats()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

const startPractice = () => {
  // 跳转到错题练习模式
  router.push('/learn/wrong-book/practice')
}

onMounted(() => {
  loadWrongQuestions()
  loadStats()
})
</script>

<style lang="scss" scoped>
.wrong-book-page {
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
  
  &.unmastered .stat-value { color: #f56c6c; }
  &.mastered .stat-value { color: #67c23a; }
  &.rate .stat-value { color: #409eff; }
}

.filter-section {
  background: var(--bg-primary);
  padding: 16px 20px;
  border-radius: 12px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px var(--shadow-color);
}

.filter-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}

.wrong-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.wrong-card {
  background: var(--bg-primary);
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 2px 12px var(--shadow-color);
  border-left: 4px solid #f56c6c;
  
  &.mastered {
    border-left-color: #67c23a;
    opacity: 0.85;
  }
}

.wrong-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 12px;
}

.wrong-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  
  .wrong-count, .wrong-time {
    font-size: 13px;
    color: var(--text-secondary);
  }
}

.wrong-actions {
  display: flex;
  gap: 8px;
}

.wrong-content {
  .question-text {
    font-size: 16px;
    font-weight: 500;
    color: var(--text-primary);
    line-height: 1.6;
    margin-bottom: 16px;
  }
}

.options-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
}

.option-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 16px;
  background: var(--bg-secondary);
  border-radius: 8px;
  border: 2px solid transparent;
  
  &.correct {
    border-color: #67c23a;
    background: rgba(103, 194, 58, 0.1);
  }
  
  &.wrong {
    border-color: #f56c6c;
    background: rgba(245, 108, 108, 0.1);
  }
  
  .option-label {
    font-weight: 600;
    color: var(--text-secondary);
    min-width: 24px;
  }
  
  .option-text {
    color: var(--text-primary);
    line-height: 1.5;
  }
}

.answer-info {
  display: flex;
  gap: 24px;
  margin-bottom: 16px;
  padding: 12px 16px;
  background: var(--bg-secondary);
  border-radius: 8px;
  
  .label {
    color: var(--text-secondary);
    font-size: 14px;
  }
  
  .value {
    font-weight: 600;
    
    &.correct { color: #67c23a; }
    &.wrong { color: #f56c6c; }
  }
}

.explanation {
  padding: 16px;
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.05) 0%, rgba(103, 194, 58, 0.05) 100%);
  border-radius: 8px;
  
  .explanation-label {
    font-size: 14px;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 8px;
  }
  
  .explanation-text {
    font-size: 14px;
    color: var(--text-secondary);
    line-height: 1.6;
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
