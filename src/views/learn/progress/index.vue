<template>
  <div class="progress-page">
    <!-- 页面头部 -->
    <div class="page-hero">
      <div class="hero-content">
        <h1>📊 学习进度</h1>
        <p>追踪你的学习旅程，见证每一步成长</p>
      </div>
    </div>

    <!-- 总体进度概览 -->
    <div class="overview-section">
      <div class="overview-card main-progress">
        <div class="progress-ring">
          <el-progress 
            type="circle" 
            :percentage="progress.percent" 
            :width="160"
            :stroke-width="12"
            :color="progressColors"
          >
            <template #default>
              <div class="ring-content">
                <span class="percent">{{ progress.percent }}%</span>
                <span class="label">总进度</span>
              </div>
            </template>
          </el-progress>
        </div>
        <div class="progress-details">
          <h2>学习进度总览</h2>
          <p class="progress-desc">
            你已完成 <strong>{{ progress.completed }}</strong> 个章节，
            还有 <strong>{{ progress.total - progress.completed }}</strong> 个章节等待探索
          </p>
          <div class="progress-actions">
            <el-button type="primary" @click="$router.push('/learn')">
              继续学习
              <el-icon><ArrowRight /></el-icon>
            </el-button>
          </div>
        </div>
      </div>

      <div class="stats-grid">
        <div class="stat-item">
          <div class="stat-icon completed">
            <el-icon><CircleCheckFilled /></el-icon>
          </div>
          <div class="stat-info">
            <span class="stat-value">{{ progress.completed }}</span>
            <span class="stat-label">已完成章节</span>
          </div>
        </div>
        <div class="stat-item">
          <div class="stat-icon pending">
            <el-icon><Clock /></el-icon>
          </div>
          <div class="stat-info">
            <span class="stat-value">{{ progress.total - progress.completed }}</span>
            <span class="stat-label">待学习</span>
          </div>
        </div>
        <div class="stat-item">
          <div class="stat-icon total">
            <el-icon><Document /></el-icon>
          </div>
          <div class="stat-info">
            <span class="stat-value">{{ progress.total }}</span>
            <span class="stat-label">总章节数</span>
          </div>
        </div>
        <div class="stat-item">
          <div class="stat-icon streak">
            <el-icon><Sunny /></el-icon>
          </div>
          <div class="stat-info">
            <span class="stat-value">{{ progress.streak || 0 }}</span>
            <span class="stat-label">连续学习天数</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 学习日历与打卡热力图 -->
    <div class="calendar-section">
      <div class="section-header">
        <h2>📅 学习日历</h2>
        <el-radio-group v-model="calendarMode" size="small">
          <el-radio-button label="calendar">日历</el-radio-button>
          <el-radio-button label="heatmap">热力图</el-radio-button>
        </el-radio-group>
      </div>
      <LearningCalendar :mode="calendarMode" :days="90" />
    </div>

    <!-- 各阶段进度 -->
    <div class="stages-section">
      <div class="section-header">
        <h2>📚 各阶段进度</h2>
      </div>
      
      <div class="stages-list">
        <div 
          v-for="(course, index) in courses" 
          :key="course.id" 
          class="stage-card"
          :class="`stage-${course.stage || 1}`"
        >
          <div class="stage-header">
            <div class="stage-badge">第{{ course.weekNumber || index + 1 }}周</div>
            <div class="stage-status">
              <el-tag 
                v-if="getStageStatus(course) === 'completed'" 
                type="success" 
                effect="dark"
                size="small"
              >
                已完成
              </el-tag>
              <el-tag 
                v-else-if="getStageStatus(course) === 'in-progress'" 
                type="primary" 
                effect="dark"
                size="small"
              >
                进行中
              </el-tag>
              <el-tag v-else type="info" size="small">未开始</el-tag>
            </div>
          </div>
          
          <h3 class="stage-title">{{ course.title }}</h3>
          
          <div class="stage-progress">
            <div class="progress-bar">
              <el-progress 
                :percentage="getStageProgress(course)" 
                :stroke-width="8"
                :show-text="false"
                :color="getStageColor(course.stage)"
              />
            </div>
            <div class="progress-text">
              <span class="current">{{ course.completedCount || 0 }}</span>
              <span class="divider">/</span>
              <span class="total">{{ course.chapterCount || 0 }}</span>
              <span class="unit">章节</span>
            </div>
          </div>

          <div class="stage-action">
            <el-button 
              text 
              type="primary" 
              @click="$router.push(`/learn/course/${course.id}`)"
            >
              {{ getStageStatus(course) === 'completed' ? '复习' : '继续学习' }}
              <el-icon><ArrowRight /></el-icon>
            </el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 学习时间线 -->
    <div class="timeline-section">
      <div class="section-header">
        <h2>🕐 学习时间线</h2>
      </div>
      
      <div class="timeline-container" v-if="timeline.length > 0">
        <div 
          v-for="(item, index) in timeline" 
          :key="item.id"
          class="timeline-item"
          :class="item.type"
        >
          <div class="timeline-dot">
            <el-icon v-if="item.type === 'success'"><CircleCheckFilled /></el-icon>
            <el-icon v-else-if="item.type === 'primary'"><Reading /></el-icon>
            <el-icon v-else><Clock /></el-icon>
          </div>
          <div class="timeline-content">
            <div class="timeline-date">{{ item.date }}</div>
            <div class="timeline-text">{{ item.content }}</div>
          </div>
        </div>
      </div>
      <el-empty v-else description="开始学习后，这里会记录你的学习历程" :image-size="100" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getProgress, getCourseList } from '@/api/learn'
import LearningCalendar from '@/components/LearningCalendar/index.vue'

const progressColors = [
  { color: '#f56c6c', percentage: 20 },
  { color: '#e6a23c', percentage: 40 },
  { color: '#409eff', percentage: 60 },
  { color: '#67c23a', percentage: 100 }
]

const stageColors = {
  1: '#667eea',
  2: '#11998e',
  3: '#f093fb'
}

const progress = ref({
  total: 0,
  completed: 0,
  percent: 0,
  streak: 0
})

const courses = ref([])
const timeline = ref([])
const calendarMode = ref('heatmap')

const loadProgress = async () => {
  try {
    const res = await getProgress()
    if (res.code === 200) {
      progress.value = res.data
    }
  } catch (error) {
    console.error('加载进度失败', error)
  }
}

const loadCourses = async () => {
  try {
    const res = await getCourseList()
    if (res.code === 200) {
      courses.value = res.data || []
    }
  } catch (error) {
    console.error('加载课程失败', error)
  }
}

const getStageProgress = (course) => {
  if (!course.chapterCount) return 0
  return Math.round((course.completedCount || 0) / course.chapterCount * 100)
}

const getStageStatus = (course) => {
  const progress = getStageProgress(course)
  if (progress === 100) return 'completed'
  if (progress > 0) return 'in-progress'
  return 'not-started'
}

const getStageColor = (stage) => {
  return stageColors[stage] || '#409eff'
}

onMounted(() => {
  loadProgress()
  loadCourses()
})
</script>

<style lang="scss" scoped>
.progress-page {
  padding-bottom: 40px;
}

// 页面头部
.page-hero {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 20px;
  padding: 40px;
  margin-bottom: 28px;
  color: white;
  text-align: center;

  h1 {
    font-size: 28px;
    font-weight: 700;
    margin-bottom: 8px;
  }

  p {
    font-size: 16px;
    opacity: 0.9;
  }
}

// 总体进度概览
.overview-section {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 24px;
  margin-bottom: 32px;
}

.overview-card {
  background: var(--bg-primary);
  border-radius: 20px;
  padding: 32px;
  box-shadow: 0 4px 20px var(--shadow-color);
}

.main-progress {
  display: flex;
  align-items: center;
  gap: 40px;
}

.progress-ring {
  flex-shrink: 0;

  .ring-content {
    display: flex;
    flex-direction: column;
    align-items: center;

    .percent {
      font-size: 36px;
      font-weight: 700;
      color: var(--text-primary);
    }

    .label {
      font-size: 14px;
      color: var(--text-secondary);
    }
  }
}

.progress-details {
  flex: 1;

  h2 {
    font-size: 22px;
    font-weight: 600;
    margin-bottom: 12px;
    color: var(--text-primary);
  }

  .progress-desc {
    font-size: 15px;
    color: var(--text-secondary);
    line-height: 1.6;
    margin-bottom: 20px;

    strong {
      color: var(--primary-color);
      font-weight: 600;
    }
  }
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.stat-item {
  background: var(--bg-primary);
  border-radius: 16px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 2px 12px var(--shadow-color);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;

  .el-icon {
    font-size: 24px;
    color: white;
  }

  &.completed { background: linear-gradient(135deg, #67c23a, #85ce61); }
  &.pending { background: linear-gradient(135deg, #e6a23c, #ebb563); }
  &.total { background: linear-gradient(135deg, #409eff, #66b1ff); }
  &.streak { background: linear-gradient(135deg, #f093fb, #f5576c); }
}

.stat-info {
  .stat-value {
    display: block;
    font-size: 28px;
    font-weight: 700;
    color: var(--text-primary);
    line-height: 1.2;
  }

  .stat-label {
    font-size: 13px;
    color: var(--text-secondary);
  }
}

// 各阶段进度
.stages-section {
  margin-bottom: 32px;
}

// 学习日历
.calendar-section {
  margin-bottom: 32px;
  
  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
}

.section-header {
  margin-bottom: 20px;

  h2 {
    font-size: 20px;
    font-weight: 600;
    color: var(--text-primary);
  }
}

.stages-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
}

.stage-card {
  background: var(--bg-primary);
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 2px 12px var(--shadow-color);
  border-left: 4px solid;
  transition: all 0.3s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px var(--shadow-color);
  }

  &.stage-1 { border-left-color: #667eea; }
  &.stage-2 { border-left-color: #11998e; }
  &.stage-3 { border-left-color: #f093fb; }
}

.stage-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.stage-badge {
  background: var(--bg-secondary);
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  color: var(--text-secondary);
}

.stage-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 16px;
  line-height: 1.4;
}

.stage-progress {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;

  .progress-bar {
    flex: 1;
  }

  .progress-text {
    display: flex;
    align-items: baseline;
    gap: 2px;
    font-size: 14px;
    white-space: nowrap;

    .current {
      font-weight: 600;
      color: var(--primary-color);
    }

    .divider, .total, .unit {
      color: var(--text-secondary);
    }
  }
}

.stage-action {
  text-align: right;
}

// 学习时间线
.timeline-section {
  background: var(--bg-primary);
  border-radius: 20px;
  padding: 32px;
  box-shadow: 0 2px 12px var(--shadow-color);
}

.timeline-container {
  position: relative;
  padding-left: 32px;

  &::before {
    content: '';
    position: absolute;
    left: 11px;
    top: 0;
    bottom: 0;
    width: 2px;
    background: var(--border-light);
  }
}

.timeline-item {
  position: relative;
  padding-bottom: 24px;

  &:last-child {
    padding-bottom: 0;
  }

  &.success .timeline-dot { background: var(--success-color); }
  &.primary .timeline-dot { background: var(--primary-color); }
  &.info .timeline-dot { background: var(--info-color); }
}

.timeline-dot {
  position: absolute;
  left: -32px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--border-color);
  display: flex;
  align-items: center;
  justify-content: center;

  .el-icon {
    font-size: 14px;
    color: white;
  }
}

.timeline-content {
  background: var(--bg-secondary);
  border-radius: 12px;
  padding: 16px;

  .timeline-date {
    font-size: 12px;
    color: var(--text-secondary);
    margin-bottom: 4px;
  }

  .timeline-text {
    font-size: 14px;
    color: var(--text-primary);
  }
}

// 响应式
@media (max-width: 1024px) {
  .overview-section {
    grid-template-columns: 1fr;
  }

  .stats-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media (max-width: 768px) {
  .page-hero {
    padding: 28px 20px;

    h1 {
      font-size: 22px;
    }
  }

  .main-progress {
    flex-direction: column;
    text-align: center;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .stages-list {
    grid-template-columns: 1fr;
  }
}
</style>
