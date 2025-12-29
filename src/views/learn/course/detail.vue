<template>
  <div class="course-detail">
    <!-- 顶部导航 -->
    <div class="top-nav">
      <el-button class="back-btn" text @click="router.back()">
        <el-icon><ArrowLeft /></el-icon>
        <span>返回课程列表</span>
      </el-button>
    </div>

    <!-- 课程头部信息 -->
    <div class="course-hero" :class="`stage-${course.stage || 1}`">
      <div class="hero-content">
        <div class="hero-badge">
          <span>第 {{ course.weekNumber || course.id }} 周</span>
        </div>
        <h1>{{ course.title }}</h1>
        <p class="hero-desc">{{ course.description || '系统学习本周交易知识' }}</p>
        
        <div class="hero-stats">
          <div class="stat-item">
            <el-icon><Document /></el-icon>
            <span>{{ course.chapterCount || 0 }} 个章节</span>
          </div>
          <div class="stat-item">
            <el-icon><Clock /></el-icon>
            <span>预计 {{ estimatedTime }} 完成</span>
          </div>
          <div class="stat-item">
            <el-icon><TrendCharts /></el-icon>
            <span>{{ progress }}% 完成</span>
          </div>
        </div>

        <div class="hero-progress">
          <el-progress 
            :percentage="progress" 
            :stroke-width="10"
            :show-text="false"
            color="#fff"
          />
          <span class="progress-text">{{ course.completedCount || 0 }} / {{ course.chapterCount || 0 }} 章节已完成</span>
        </div>
      </div>
      
      <div class="hero-decoration">
        <div class="circle circle-1"></div>
        <div class="circle circle-2"></div>
        <div class="circle circle-3"></div>
      </div>
    </div>

    <!-- 主内容区 -->
    <div class="course-main">
      <!-- 章节时间线 -->
      <div class="chapters-section">
        <div class="section-header">
          <h2>📖 章节目录</h2>
          <span class="section-tip">点击章节开始学习</span>
        </div>

        <div class="chapter-timeline">
          <div 
            v-for="(chapter, index) in chapters" 
            :key="chapter.id"
            class="timeline-item"
            :class="{ 
              completed: chapter.completed, 
              active: chapter.active,
              locked: chapter.locked 
            }"
            @click="goToChapter(chapter)"
          >
            <!-- 时间线节点 -->
            <div class="timeline-node">
              <div class="node-circle">
                <el-icon v-if="chapter.completed"><Check /></el-icon>
                <el-icon v-else-if="chapter.active"><CaretRight /></el-icon>
                <span v-else>{{ index + 1 }}</span>
              </div>
              <div class="node-line" v-if="index < chapters.length - 1"></div>
            </div>

            <!-- 章节卡片 -->
            <div class="timeline-card">
              <div class="card-header">
                <h3>{{ chapter.title }}</h3>
                <el-tag 
                  v-if="chapter.completed" 
                  type="success" 
                  size="small"
                  effect="dark"
                >
                  已完成
                </el-tag>
                <el-tag 
                  v-else-if="chapter.active" 
                  type="primary" 
                  size="small"
                  effect="dark"
                >
                  进行中
                </el-tag>
              </div>
              <p class="card-summary">{{ chapter.summary }}</p>
              <div class="card-footer">
                <span class="read-time">
                  <el-icon><Clock /></el-icon>
                  预计 15 分钟
                </span>
                <span class="go-learn">
                  {{ chapter.completed ? '复习' : '开始学习' }}
                  <el-icon><ArrowRight /></el-icon>
                </span>
              </div>
            </div>
          </div>
        </div>

        <el-empty v-if="chapters.length === 0" description="暂无章节" />
      </div>

      <!-- 侧边栏 -->
      <aside class="course-sidebar">
        <!-- 学习任务卡片 -->
        <div class="sidebar-card tasks-card">
          <div class="card-title">
            <el-icon><List /></el-icon>
            <h3>本周任务</h3>
          </div>
          <div class="tasks-list" v-if="tasks.length > 0">
            <div 
              v-for="task in tasks" 
              :key="task.id"
              class="task-item"
              :class="{ completed: task.isCompleted }"
            >
              <el-checkbox 
                v-model="task.isCompleted"
                @change="handleTaskChange(task)"
              />
              <span class="task-text">{{ task.taskContent }}</span>
            </div>
          </div>
          <el-empty v-else description="暂无任务" :image-size="50" />
          
          <div class="tasks-progress" v-if="tasks.length > 0">
            <span>完成进度</span>
            <el-progress 
              :percentage="taskProgress" 
              :stroke-width="6"
              :color="taskProgress === 100 ? '#67c23a' : '#409eff'"
            />
          </div>
        </div>

        <!-- 学习提示卡片 -->
        <div class="sidebar-card tips-card">
          <div class="card-title">
            <el-icon><InfoFilled /></el-icon>
            <h3>学习建议</h3>
          </div>
          <ul class="tips-list">
            <li>每天保持 1-2 小时的学习时间</li>
            <li>完成章节后及时做笔记</li>
            <li>结合实盘观察加深理解</li>
            <li>遇到问题及时记录并复习</li>
          </ul>
        </div>
      </aside>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { getCourseDetail, completeTask } from '@/api/learn'
import { ElMessage } from 'element-plus'

const router = useRouter()
const route = useRoute()
const loading = ref(false)

const course = ref({
  id: null,
  title: '',
  description: '',
  stage: 1,
  weekNumber: null,
  chapterCount: 0,
  completedCount: 0,
  chapters: []
})

const chapters = computed(() => {
  const list = course.value.chapters || []
  const firstIncomplete = list.findIndex(c => !c.isCompleted)
  
  return list.map((ch, index) => ({
    ...ch,
    summary: ch.content ? ch.content.substring(0, 80) + '...' : '点击查看详细内容',
    completed: ch.isCompleted,
    active: index === firstIncomplete,
    locked: false
  }))
})

const tasks = computed(() => {
  const activeChapter = course.value.chapters?.find(ch => !ch.isCompleted)
  return activeChapter?.tasks || []
})

const taskProgress = computed(() => {
  if (tasks.value.length === 0) return 0
  const completed = tasks.value.filter(t => t.isCompleted).length
  return Math.round((completed / tasks.value.length) * 100)
})

const progress = computed(() => {
  if (!course.value.chapterCount) return 0
  return Math.round((course.value.completedCount / course.value.chapterCount) * 100)
})

const estimatedTime = computed(() => {
  const chapters = course.value.chapterCount || 0
  const hours = Math.ceil(chapters * 0.5)
  return hours > 1 ? `${hours} 小时` : '30 分钟'
})

const goToChapter = (chapter) => {
  if (chapter.locked) {
    ElMessage.warning('请先完成前面的章节')
    return
  }
  router.push(`/learn/chapter/${chapter.id}`)
}

const handleTaskChange = async (task) => {
  try {
    await completeTask(task.id)
    ElMessage.success(task.isCompleted ? '任务已完成' : '已取消完成')
  } catch (error) {
    task.isCompleted = !task.isCompleted
    ElMessage.error('操作失败')
  }
}

const loadCourse = async () => {
  const id = route.params.id
  if (!id) return
  
  loading.value = true
  try {
    const res = await getCourseDetail(id)
    if (res.code === 200) {
      course.value = res.data
    }
  } catch (error) {
    ElMessage.error('加载课程失败')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadCourse()
})
</script>


<style lang="scss" scoped>
.course-detail {
  min-height: 100%;
  padding-bottom: 40px;
}

// 顶部导航
.top-nav {
  margin-bottom: 20px;
}

.back-btn {
  font-size: 14px;
  color: var(--text-secondary);
  
  &:hover {
    color: var(--primary-color);
  }
  
  span {
    margin-left: 4px;
  }
}

// 课程头部
.course-hero {
  border-radius: 20px;
  padding: 40px;
  margin-bottom: 32px;
  position: relative;
  overflow: hidden;
  color: white;

  &.stage-1 {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  }
  &.stage-2 {
    background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
  }
  &.stage-3 {
    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  }
}

.hero-content {
  position: relative;
  z-index: 2;
}

.hero-badge {
  display: inline-block;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 16px;
}

.course-hero h1 {
  font-size: 32px;
  font-weight: 700;
  margin-bottom: 12px;
}

.hero-desc {
  font-size: 16px;
  opacity: 0.9;
  margin-bottom: 24px;
  max-width: 600px;
}

.hero-stats {
  display: flex;
  gap: 32px;
  margin-bottom: 24px;

  .stat-item {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    opacity: 0.9;
  }
}

.hero-progress {
  max-width: 400px;

  :deep(.el-progress-bar__outer) {
    background: rgba(255, 255, 255, 0.3);
  }

  .progress-text {
    display: block;
    margin-top: 8px;
    font-size: 13px;
    opacity: 0.85;
  }
}

.hero-decoration {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: 50%;
  pointer-events: none;

  .circle {
    position: absolute;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.1);
  }

  .circle-1 {
    width: 300px;
    height: 300px;
    top: -100px;
    right: -50px;
  }

  .circle-2 {
    width: 200px;
    height: 200px;
    bottom: -50px;
    right: 100px;
  }

  .circle-3 {
    width: 100px;
    height: 100px;
    top: 50%;
    right: 30%;
  }
}

// 主内容区
.course-main {
  display: flex;
  gap: 32px;
}

// 章节区域
.chapters-section {
  flex: 1;
  min-width: 0;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;

  h2 {
    font-size: 20px;
    font-weight: 600;
    color: var(--text-primary);
  }

  .section-tip {
    font-size: 13px;
    color: var(--text-secondary);
  }
}

// 时间线
.chapter-timeline {
  position: relative;
}

.timeline-item {
  display: flex;
  gap: 20px;
  cursor: pointer;

  &:last-child .node-line {
    display: none;
  }

  &:hover .timeline-card {
    transform: translateX(8px);
    box-shadow: 0 8px 24px var(--shadow-color);
  }

  &.completed {
    .node-circle {
      background: var(--success-color);
      border-color: var(--success-color);
      color: white;
    }
    .node-line {
      background: var(--success-color);
    }
  }

  &.active {
    .node-circle {
      background: var(--primary-color);
      border-color: var(--primary-color);
      color: white;
      animation: pulse 2s infinite;
    }
    .timeline-card {
      border-color: var(--primary-color);
    }
  }

  &.locked {
    opacity: 0.5;
    cursor: not-allowed;

    &:hover .timeline-card {
      transform: none;
      box-shadow: none;
    }
  }
}

@keyframes pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(64, 158, 255, 0.4); }
  50% { box-shadow: 0 0 0 10px rgba(64, 158, 255, 0); }
}

.timeline-node {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
}

.node-circle {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--bg-primary);
  border: 3px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 14px;
  color: var(--text-secondary);
  transition: all 0.3s;
}

.node-line {
  width: 3px;
  flex: 1;
  min-height: 20px;
  background: var(--border-light);
  margin: 8px 0;
}

.timeline-card {
  flex: 1;
  background: var(--bg-primary);
  border: 2px solid var(--border-light);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 16px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 12px;

    h3 {
      font-size: 16px;
      font-weight: 600;
      color: var(--text-primary);
      flex: 1;
      margin-right: 12px;
    }
  }

  .card-summary {
    font-size: 14px;
    color: var(--text-secondary);
    line-height: 1.6;
    margin-bottom: 16px;
  }

  .card-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 12px;
    border-top: 1px solid var(--border-light);

    .read-time {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 13px;
      color: var(--text-secondary);
    }

    .go-learn {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 13px;
      color: var(--primary-color);
      font-weight: 500;
    }
  }
}

// 侧边栏
.course-sidebar {
  width: 320px;
  flex-shrink: 0;
}

.sidebar-card {
  background: var(--bg-primary);
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 12px var(--shadow-color);

  .card-title {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 16px;
    padding-bottom: 12px;
    border-bottom: 1px solid var(--border-light);

    .el-icon {
      font-size: 18px;
      color: var(--primary-color);
    }

    h3 {
      font-size: 16px;
      font-weight: 600;
      color: var(--text-primary);
    }
  }
}

// 任务列表
.tasks-list {
  margin-bottom: 16px;
}

.task-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 10px 0;
  border-bottom: 1px solid var(--border-light);

  &:last-child {
    border-bottom: none;
  }

  &.completed .task-text {
    text-decoration: line-through;
    color: var(--text-secondary);
  }

  .task-text {
    font-size: 14px;
    color: var(--text-primary);
    line-height: 1.5;
  }
}

.tasks-progress {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--border-light);

  span {
    font-size: 13px;
    color: var(--text-secondary);
    white-space: nowrap;
  }

  .el-progress {
    flex: 1;
  }
}

// 学习提示
.tips-list {
  list-style: none;
  padding: 0;
  margin: 0;

  li {
    position: relative;
    padding: 8px 0 8px 20px;
    font-size: 14px;
    color: var(--text-secondary);
    line-height: 1.5;

    &::before {
      content: '💡';
      position: absolute;
      left: 0;
      font-size: 12px;
    }
  }
}

// 响应式
@media (max-width: 1024px) {
  .course-main {
    flex-direction: column;
  }

  .course-sidebar {
    width: 100%;
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;

    .sidebar-card {
      margin-bottom: 0;
    }
  }
}

@media (max-width: 768px) {
  .course-hero {
    padding: 24px;

    h1 {
      font-size: 24px;
    }
  }

  .hero-stats {
    flex-wrap: wrap;
    gap: 16px;
  }

  .course-sidebar {
    grid-template-columns: 1fr;
  }

  .timeline-item {
    gap: 12px;
  }

  .timeline-card {
    padding: 16px;
  }
}
</style>
