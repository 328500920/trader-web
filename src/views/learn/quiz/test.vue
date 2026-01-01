<template>
  <div class="quiz-test-page">
    <!-- 顶部信息栏 -->
    <header class="test-header">
      <div class="header-left">
        <el-button text @click="confirmExit">
          <el-icon><ArrowLeft /></el-icon>
          退出测验
        </el-button>
      </div>
      <div class="header-center">
        <span class="chapter-title">{{ chapterTitle }}</span>
      </div>
      <div class="header-right">
        <div class="timer" v-if="!submitted">
          <el-icon><Clock /></el-icon>
          <span>{{ formatTime(timeSpent) }}</span>
        </div>
        <div class="progress-info">
          {{ currentIndex + 1 }} / {{ quizzes.length }}
        </div>
      </div>
    </header>

    <!-- 答题区域 -->
    <div class="test-body" v-loading="loading">
      <div class="quiz-container" v-if="currentQuiz && !submitted">
        <!-- 题目 -->
        <div class="quiz-question">
          <div class="question-header">
            <el-tag :type="getDifficultyType(currentQuiz.difficulty)" size="small">
              {{ getDifficultyName(currentQuiz.difficulty) }}
            </el-tag>
            <el-tag type="info" size="small">
              {{ getTypeName(currentQuiz.questionType) }}
            </el-tag>
            <span class="points">{{ currentQuiz.points || 10 }}分</span>
          </div>
          <div class="question-content">
            <span class="question-number">{{ currentIndex + 1 }}.</span>
            {{ currentQuiz.question }}
          </div>
        </div>

        <!-- 选项 -->
        <div class="quiz-options" v-if="currentQuiz.questionType === 'single' || currentQuiz.questionType === 'multiple'">
          <div 
            v-for="opt in parsedOptions" 
            :key="opt.key"
            class="option-item"
            :class="{ selected: isSelected(opt.key) }"
            @click="selectOption(opt.key)"
          >
            <span class="option-key">{{ opt.key }}</span>
            <span class="option-value">{{ opt.value }}</span>
          </div>
        </div>

        <!-- 判断题 -->
        <div class="quiz-options" v-else-if="currentQuiz.questionType === 'judge'">
          <div 
            class="option-item"
            :class="{ selected: userAnswers[currentQuiz.id] === 'true' }"
            @click="selectOption('true')"
          >
            <span class="option-key">✓</span>
            <span class="option-value">正确</span>
          </div>
          <div 
            class="option-item"
            :class="{ selected: userAnswers[currentQuiz.id] === 'false' }"
            @click="selectOption('false')"
          >
            <span class="option-key">✗</span>
            <span class="option-value">错误</span>
          </div>
        </div>

        <!-- 简答/计算题 -->
        <div class="quiz-input" v-else>
          <el-input
            v-model="userAnswers[currentQuiz.id]"
            type="textarea"
            :rows="4"
            placeholder="请输入你的答案..."
          />
        </div>
      </div>

      <!-- 结果页面 -->
      <div class="result-container" v-if="submitted">
        <div class="result-header">
          <div class="result-icon">{{ resultData.accuracy >= 60 ? '🎉' : '💪' }}</div>
          <h2>测验完成！</h2>
        </div>
        
        <div class="result-stats">
          <div class="stat-item">
            <span class="label">得分</span>
            <span class="value">{{ resultData.score }}</span>
          </div>
          <div class="stat-item">
            <span class="label">正确率</span>
            <span class="value" :class="getAccuracyClass(resultData.accuracy)">
              {{ resultData.accuracy }}%
            </span>
          </div>
          <div class="stat-item">
            <span class="label">正确/总题</span>
            <span class="value">{{ resultData.correctCount }}/{{ resultData.totalQuestions }}</span>
          </div>
          <div class="stat-item">
            <span class="label">用时</span>
            <span class="value">{{ formatTime(timeSpent) }}</span>
          </div>
        </div>

        <!-- 答案解析 -->
        <div class="result-answers">
          <h3>答案解析</h3>
          <div 
            v-for="(ans, index) in resultData.answers" 
            :key="ans.quizId"
            class="answer-item"
            :class="{ correct: ans.correct, wrong: !ans.correct }"
          >
            <div class="answer-header">
              <span class="question-num">第 {{ index + 1 }} 题</span>
              <el-tag :type="ans.correct ? 'success' : 'danger'" size="small">
                {{ ans.correct ? '正确' : '错误' }}
              </el-tag>
            </div>
            <div class="answer-content">
              <p><strong>你的答案：</strong>{{ ans.answer || '未作答' }}</p>
              <p><strong>正确答案：</strong>{{ ans.correctAnswer }}</p>
              <p v-if="ans.explanation"><strong>解析：</strong>{{ ans.explanation }}</p>
            </div>
          </div>
        </div>

        <div class="result-actions">
          <el-button @click="router.push('/learn/quiz')">返回列表</el-button>
          <el-button type="primary" @click="retryQuiz">再做一次</el-button>
        </div>
      </div>

      <!-- 空状态 -->
      <el-empty v-if="!loading && quizzes.length === 0 && !submitted" description="该章节暂无测验题目" />
    </div>

    <!-- 底部导航 -->
    <footer class="test-footer" v-if="quizzes.length > 0 && !submitted">
      <el-button :disabled="currentIndex === 0" @click="prevQuestion">
        <el-icon><ArrowLeft /></el-icon>上一题
      </el-button>
      
      <div class="question-dots">
        <span 
          v-for="(q, i) in quizzes" 
          :key="q.id"
          class="dot"
          :class="{ active: i === currentIndex, answered: userAnswers[q.id] }"
          @click="goToQuestion(i)"
        />
      </div>
      
      <el-button v-if="currentIndex < quizzes.length - 1" type="primary" @click="nextQuestion">
        下一题<el-icon><ArrowRight /></el-icon>
      </el-button>
      <el-button v-else type="success" @click="submitQuizAnswers">
        <el-icon><Check /></el-icon>提交答卷
      </el-button>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowLeft, ArrowRight, Clock, Check } from '@element-plus/icons-vue'
import { getQuizForTest, submitQuiz, getChapterDetail } from '@/api/learn'

const router = useRouter()
const route = useRoute()

const loading = ref(false)
const quizzes = ref([])
const currentIndex = ref(0)
const userAnswers = ref({})
const timeSpent = ref(0)
const submitted = ref(false)
const resultData = ref({})
const chapterTitle = ref('')

let timer = null

const currentQuiz = computed(() => quizzes.value[currentIndex.value])

const parsedOptions = computed(() => {
  if (!currentQuiz.value?.options) return []
  try {
    return JSON.parse(currentQuiz.value.options)
  } catch {
    return []
  }
})

const getDifficultyName = (level) => {
  const names = { 1: '基础', 2: '进阶', 3: '挑战' }
  return names[level] || '未知'
}

const getDifficultyType = (level) => {
  const types = { 1: 'success', 2: 'warning', 3: 'danger' }
  return types[level] || ''
}

const getTypeName = (type) => {
  const names = { single: '单选', multiple: '多选', judge: '判断', calculate: '计算', short: '简答' }
  return names[type] || '未知'
}

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

const getAccuracyClass = (accuracy) => {
  if (accuracy >= 80) return 'excellent'
  if (accuracy >= 60) return 'good'
  return 'poor'
}

const isSelected = (key) => {
  const answer = userAnswers.value[currentQuiz.value?.id] || ''
  if (currentQuiz.value?.questionType === 'multiple') {
    return answer.includes(key)
  }
  return answer === key
}

const selectOption = (key) => {
  const quizId = currentQuiz.value?.id
  if (!quizId) return
  
  if (currentQuiz.value.questionType === 'multiple') {
    let current = userAnswers.value[quizId] || ''
    if (current.includes(key)) {
      current = current.replace(key, '')
    } else {
      current = (current + key).split('').sort().join('')
    }
    userAnswers.value[quizId] = current
  } else {
    userAnswers.value[quizId] = key
  }
}

const prevQuestion = () => {
  if (currentIndex.value > 0) {
    currentIndex.value--
  }
}

const nextQuestion = () => {
  if (currentIndex.value < quizzes.value.length - 1) {
    currentIndex.value++
  }
}

const goToQuestion = (index) => {
  currentIndex.value = index
}

const confirmExit = () => {
  ElMessageBox.confirm('确定要退出测验吗？当前答题进度将不会保存。', '提示', {
    confirmButtonText: '确定退出',
    cancelButtonText: '继续答题',
    type: 'warning'
  }).then(() => {
    router.push('/learn/quiz')
  }).catch(() => {})
}

const submitQuizAnswers = async () => {
  const unanswered = quizzes.value.filter(q => !userAnswers.value[q.id]).length
  if (unanswered > 0) {
    try {
      await ElMessageBox.confirm(`还有 ${unanswered} 道题未作答，确定要提交吗？`, '提示', {
        confirmButtonText: '确定提交',
        cancelButtonText: '继续答题',
        type: 'warning'
      })
    } catch {
      return
    }
  }
  
  const answers = quizzes.value.map(q => ({
    quizId: q.id,
    answer: userAnswers.value[q.id] || ''
  }))
  
  try {
    const res = await submitQuiz({
      chapterId: route.params.chapterId,
      answers,
      timeSpent: timeSpent.value
    })
    
    if (res.code === 200) {
      resultData.value = res.data
      submitted.value = true
      clearInterval(timer)
    }
  } catch (error) {
    ElMessage.error('提交失败')
  }
}

const retryQuiz = () => {
  submitted.value = false
  userAnswers.value = {}
  currentIndex.value = 0
  timeSpent.value = 0
  startTimer()
}

const startTimer = () => {
  timer = setInterval(() => {
    timeSpent.value++
  }, 1000)
}

const loadQuizzes = async () => {
  const chapterId = route.params.chapterId
  if (!chapterId) return
  
  loading.value = true
  try {
    // 加载章节信息
    const chapterRes = await getChapterDetail(chapterId)
    if (chapterRes.code === 200) {
      chapterTitle.value = chapterRes.data?.title || ''
    }
    
    // 加载题目
    const res = await getQuizForTest(chapterId)
    if (res.code === 200) {
      quizzes.value = res.data || []
      if (quizzes.value.length > 0) {
        startTimer()
      }
    }
  } catch (error) {
    ElMessage.error('加载题目失败')
  } finally {
    loading.value = false
  }
}

onMounted(loadQuizzes)

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<style lang="scss" scoped>
.quiz-test-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--bg-secondary);
}

.test-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: var(--bg-primary);
  border-bottom: 1px solid var(--border-light);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-center {
  .chapter-title {
    font-size: 16px;
    font-weight: 600;
    color: var(--text-primary);
  }
}

.header-right {
  display: flex;
  align-items: center;
  gap: 20px;
  
  .timer {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 16px;
    font-weight: 600;
    color: var(--primary-color);
  }
  
  .progress-info {
    font-size: 14px;
    color: var(--text-secondary);
  }
}

.test-body {
  flex: 1;
  padding: 24px;
  max-width: 800px;
  margin: 0 auto;
  width: 100%;
}

.quiz-container {
  background: var(--bg-primary);
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 2px 12px var(--shadow-color);
}

.quiz-question {
  margin-bottom: 32px;
}

.question-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  
  .points {
    margin-left: auto;
    font-size: 14px;
    color: var(--text-secondary);
  }
}

.question-content {
  font-size: 18px;
  line-height: 1.8;
  color: var(--text-primary);
  
  .question-number {
    font-weight: 700;
    color: var(--primary-color);
    margin-right: 8px;
  }
}

.quiz-options {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.option-item {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 16px 20px;
  background: var(--bg-secondary);
  border: 2px solid transparent;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: rgba(64, 158, 255, 0.05);
    border-color: rgba(64, 158, 255, 0.3);
  }
  
  &.selected {
    background: rgba(64, 158, 255, 0.1);
    border-color: var(--primary-color);
    
    .option-key {
      background: var(--primary-color);
      color: white;
    }
  }
}

.option-key {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-primary);
  border-radius: 50%;
  font-weight: 600;
  color: var(--text-primary);
  flex-shrink: 0;
  transition: all 0.2s;
}

.option-value {
  font-size: 15px;
  line-height: 1.6;
  color: var(--text-primary);
  padding-top: 4px;
}

.quiz-input {
  :deep(.el-textarea__inner) {
    font-size: 15px;
    line-height: 1.8;
  }
}

.test-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: var(--bg-primary);
  border-top: 1px solid var(--border-light);
}

.question-dots {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: center;
  max-width: 400px;
}

.dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--border-light);
  cursor: pointer;
  transition: all 0.2s;
  
  &.answered {
    background: #67c23a;
  }
  
  &.active {
    background: var(--primary-color);
    transform: scale(1.3);
  }
}

/* 结果页面 */
.result-container {
  background: var(--bg-primary);
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 2px 12px var(--shadow-color);
}

.result-header {
  text-align: center;
  margin-bottom: 32px;
  
  .result-icon {
    font-size: 64px;
    margin-bottom: 16px;
  }
  
  h2 {
    font-size: 24px;
    font-weight: 700;
    color: var(--text-primary);
  }
}

.result-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 32px;
  
  @media (max-width: 600px) {
    grid-template-columns: repeat(2, 1fr);
  }
}

.result-stats .stat-item {
  text-align: center;
  padding: 20px;
  background: var(--bg-secondary);
  border-radius: 12px;
  
  .label {
    display: block;
    font-size: 13px;
    color: var(--text-secondary);
    margin-bottom: 8px;
  }
  
  .value {
    font-size: 28px;
    font-weight: 700;
    color: var(--text-primary);
    
    &.excellent { color: #67c23a; }
    &.good { color: #e6a23c; }
    &.poor { color: #f56c6c; }
  }
}

.result-answers {
  margin-bottom: 32px;
  
  h3 {
    font-size: 18px;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 16px;
    padding-left: 12px;
    border-left: 4px solid var(--primary-color);
  }
}

.answer-item {
  padding: 16px 20px;
  background: var(--bg-secondary);
  border-radius: 12px;
  margin-bottom: 12px;
  border-left: 4px solid transparent;
  
  &.correct { border-left-color: #67c23a; }
  &.wrong { border-left-color: #f56c6c; }
}

.answer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  
  .question-num {
    font-weight: 600;
    color: var(--text-primary);
  }
}

.answer-content {
  p {
    font-size: 14px;
    line-height: 1.8;
    color: var(--text-secondary);
    margin-bottom: 8px;
    
    &:last-child { margin-bottom: 0; }
    
    strong {
      color: var(--text-primary);
    }
  }
}

.result-actions {
  display: flex;
  justify-content: center;
  gap: 16px;
}
</style>
