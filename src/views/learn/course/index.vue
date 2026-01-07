<template>
  <div class="learn-center">
    <!-- 顶部欢迎区域 -->
    <div class="welcome-banner">
      <div class="banner-content">
        <div class="banner-text">
          <h1>📚 学习中心</h1>
          <p>系统化学习交易知识，成为顶级交易员</p>
        </div>
        <div class="banner-stats">
          <div class="stat-card">
            <div class="stat-value">{{ totalCourses }}</div>
            <div class="stat-label">课程总数</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{{ completedCourses }}</div>
            <div class="stat-label">已完成</div>
          </div>
          <div class="stat-card progress-card">
            <el-progress 
              type="circle" 
              :percentage="overallProgress" 
              :width="50"
              :stroke-width="5"
              :color="progressColors"
            />
            <div class="stat-label">总进度</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 阶段列表 -->
    <div class="stages-container">
      <div v-for="(stage, stageIndex) in stages" :key="stage.id" class="stage-section">
        <!-- 阶段头部 -->
        <div class="stage-header" :class="`stage-${stage.id}`">
          <div class="stage-icon">
            <span class="icon-text">{{ stageIndex + 1 }}</span>
          </div>
          <div class="stage-info">
            <h2>{{ stage.title }}</h2>
            <p>{{ stage.description }}</p>
          </div>
          <div class="stage-progress">
            <div class="progress-info">
              <span class="progress-text">{{ stage.progress }}%</span>
              <span class="progress-label">完成度</span>
            </div>
            <el-progress 
              :percentage="stage.progress" 
              :stroke-width="8"
              :show-text="false"
              :color="getStageColor(stage.id)"
            />
          </div>
        </div>

        <!-- 课程网格 -->
        <div class="course-grid">
          <div 
            v-for="(course, courseIndex) in stage.courses" 
            :key="course.id" 
            class="course-card"
            :class="{ 
              completed: course.completed, 
              'in-progress': course.inProgress,
              locked: course.locked 
            }"
            @click="handleCourseClick(course)"
          >
            <!-- 课程序号 -->
            <div class="course-number" :class="`stage-${stage.id}-bg`">
              第{{ course.weekNumber || courseIndex + 1 }}周
            </div>
            
            <!-- 状态角标 -->
            <div class="course-badge">
              <el-icon v-if="course.completed" class="badge-icon completed">
                <CircleCheckFilled />
              </el-icon>
              <el-icon v-else-if="course.inProgress" class="badge-icon in-progress">
                <Loading />
              </el-icon>
              <el-icon v-else-if="course.locked" class="badge-icon locked">
                <Lock />
              </el-icon>
            </div>

            <!-- 课程内容 -->
            <div class="course-body">
              <h3 class="course-title">{{ course.title }}</h3>
              <p class="course-desc">{{ course.description || '暂无描述' }}</p>
            </div>

            <!-- 课程底部 -->
            <div class="course-footer">
              <div class="chapter-info">
                <el-icon><Document /></el-icon>
                <span>{{ course.chapterCount || 0 }} 个章节</span>
              </div>
              <div class="progress-mini" v-if="course.chapterCount > 0">
                <el-progress 
                  :percentage="getChapterProgress(course)" 
                  :stroke-width="4"
                  :show-text="false"
                  :color="course.completed ? '#67c23a' : '#409eff'"
                />
                <span class="progress-num">{{ course.completedCount || 0 }}/{{ course.chapterCount }}</span>
              </div>
            </div>

            <!-- 悬浮提示 -->
            <div class="course-hover-tip">
              <el-icon><ArrowRight /></el-icon>
              <span>开始学习</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <el-empty v-if="stages.length === 0 && !loading" description="暂无课程数据" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getCourseList } from '@/api/learn'

const router = useRouter()
const loading = ref(false)
const stages = ref([])

const stageConfig = {
  1: {
    title: '阶段一：基础构建期',
    description: '第1-8周 · 建立交易基础认知与技术分析能力',
    color: '#409eff'
  },
  2: {
    title: '阶段二：策略整合期',
    description: '第9-16周 · 整合策略体系与实战演练',
    color: '#67c23a'
  },
  3: {
    title: '阶段三：进阶稳定期',
    description: '第17-24周 · 高级技巧与稳定盈利',
    color: '#e6a23c'
  }
}

const progressColors = [
  { color: '#f56c6c', percentage: 20 },
  { color: '#e6a23c', percentage: 40 },
  { color: '#409eff', percentage: 60 },
  { color: '#67c23a', percentage: 100 }
]

const loadCourses = async () => {
  loading.value = true
  try {
    const res = await getCourseList()
    if (res.code === 200) {
      const grouped = {}
      res.data.forEach(course => {
        const stage = course.stage || 1
        if (!grouped[stage]) {
          grouped[stage] = {
            id: stage,
            title: stageConfig[stage]?.title || `阶段${stage}`,
            description: stageConfig[stage]?.description || '',
            courses: []
          }
        }
        grouped[stage].courses.push({
          ...course,
          completed: course.completedCount >= course.chapterCount && course.chapterCount > 0,
          inProgress: course.completedCount > 0 && course.completedCount < course.chapterCount,
          locked: false
        })
      })
      
      stages.value = Object.values(grouped).map(stage => {
        const totalChapters = stage.courses.reduce((sum, c) => sum + (c.chapterCount || 0), 0)
        const completedChapters = stage.courses.reduce((sum, c) => sum + (c.completedCount || 0), 0)
        stage.progress = totalChapters > 0 ? Math.round((completedChapters / totalChapters) * 100) : 0
        return stage
      }).sort((a, b) => a.id - b.id)
    }
  } catch (error) {
    ElMessage.error('加载课程失败')
  } finally {
    loading.value = false
  }
}

const totalCourses = computed(() => {
  return stages.value.reduce((sum, s) => sum + s.courses.length, 0)
})

const completedCourses = computed(() => {
  return stages.value.reduce((sum, s) => 
    sum + s.courses.filter(c => c.completed).length, 0)
})

const overallProgress = computed(() => {
  if (stages.value.length === 0) return 0
  const total = stages.value.reduce((sum, s) => sum + s.progress, 0)
  return Math.round(total / stages.value.length)
})

const getStageColor = (stageId) => {
  return stageConfig[stageId]?.color || '#409eff'
}

const getChapterProgress = (course) => {
  if (!course.chapterCount) return 0
  return Math.round((course.completedCount || 0) / course.chapterCount * 100)
}

const handleCourseClick = (course) => {
  if (course.locked) {
    ElMessage.warning('请先完成前面的课程')
    return
  }
  router.push(`/learn/course/${course.id}`)
}

onMounted(() => {
  loadCourses()
})
</script>


<style lang="scss" scoped>
.learn-center {
  min-height: 100%;
  padding-bottom: 40px;
}

// 欢迎横幅
.welcome-banner {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  padding: 16px 24px;
  margin-bottom: 24px;
  color: white;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: -50%;
    right: -20%;
    width: 400px;
    height: 400px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 50%;
  }

  &::after {
    content: '';
    position: absolute;
    bottom: -30%;
    left: 10%;
    width: 200px;
    height: 200px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 50%;
  }
}

.banner-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  z-index: 1;
}

.banner-text {
  h1 {
    font-size: 22px;
    font-weight: 700;
    margin-bottom: 4px;
  }

  p {
    font-size: 14px;
    opacity: 0.9;
  }
}

.banner-stats {
  display: flex;
  gap: 24px;
}

.stat-card {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border-radius: 10px;
  padding: 10px 18px;
  text-align: center;
  min-width: 80px;

  .stat-value {
    font-size: 24px;
    font-weight: 700;
    line-height: 1.2;
  }

  .stat-label {
    font-size: 12px;
    opacity: 0.85;
    margin-top: 2px;
  }

  &.progress-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;

    :deep(.el-progress__text) {
      color: white !important;
      font-weight: 600;
    }
  }
}

// 阶段区域
.stages-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.stage-section {
  background: var(--bg-primary);
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 12px var(--shadow-color);
}

.stage-header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding-bottom: 12px;
  margin-bottom: 16px;
  border-bottom: 2px solid var(--border-light);

  &.stage-1 {
    border-bottom-color: #409eff;
    .stage-icon { background: linear-gradient(135deg, #409eff, #66b1ff); }
  }
  &.stage-2 {
    border-bottom-color: #67c23a;
    .stage-icon { background: linear-gradient(135deg, #67c23a, #85ce61); }
  }
  &.stage-3 {
    border-bottom-color: #e6a23c;
    .stage-icon { background: linear-gradient(135deg, #e6a23c, #ebb563); }
  }
}

.stage-icon {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  .icon-text {
    color: white;
    font-size: 20px;
    font-weight: 700;
  }
}

.stage-info {
  flex: 1;

  h2 {
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 2px;
    color: var(--text-primary);
  }

  p {
    font-size: 13px;
    color: var(--text-secondary);
  }
}

.stage-progress {
  text-align: right;
  min-width: 120px;

  .progress-info {
    display: flex;
    align-items: baseline;
    justify-content: flex-end;
    gap: 6px;
    margin-bottom: 6px;
  }

  .progress-text {
    font-size: 20px;
    font-weight: 700;
    color: var(--text-primary);
  }

  .progress-label {
    font-size: 12px;
    color: var(--text-secondary);
  }
}

// 课程网格
.course-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 12px;
}

.course-card {
  background: var(--bg-secondary);
  border-radius: 10px;
  padding: 14px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 2px solid transparent;
  position: relative;
  overflow: hidden;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 24px var(--shadow-color);
    border-color: var(--primary-color);

    .course-hover-tip {
      opacity: 1;
      transform: translateY(0);
    }
  }

  &.completed {
    background: linear-gradient(135deg, rgba(103, 194, 58, 0.08), rgba(103, 194, 58, 0.02));
    border-color: rgba(103, 194, 58, 0.3);

    .course-number {
      background: linear-gradient(135deg, #67c23a, #85ce61) !important;
    }
  }

  &.in-progress {
    border-color: rgba(64, 158, 255, 0.3);
  }

  &.locked {
    opacity: 0.6;
    cursor: not-allowed;

    &:hover {
      transform: none;
      box-shadow: none;
      border-color: transparent;
    }
  }
}

.course-number {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 16px;
  font-size: 11px;
  font-weight: 600;
  color: white;
  margin-bottom: 8px;

  &.stage-1-bg { background: linear-gradient(135deg, #409eff, #66b1ff); }
  &.stage-2-bg { background: linear-gradient(135deg, #67c23a, #85ce61); }
  &.stage-3-bg { background: linear-gradient(135deg, #e6a23c, #ebb563); }
}

.course-badge {
  position: absolute;
  top: 16px;
  right: 16px;

  .badge-icon {
    font-size: 24px;

    &.completed { color: #67c23a; }
    &.in-progress { color: #409eff; animation: spin 2s linear infinite; }
    &.locked { color: #909399; }
  }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.course-body {
  margin-bottom: 12px;

  .course-title {
    font-size: 14px;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 4px;
    line-height: 1.4;
  }

  .course-desc {
    font-size: 12px;
    color: var(--text-secondary);
    line-height: 1.4;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
}

.course-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 10px;
  border-top: 1px solid var(--border-light);
}

.chapter-info {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: var(--text-secondary);
}

.progress-mini {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 80px;

  .el-progress {
    flex: 1;
  }

  .progress-num {
    font-size: 11px;
    color: var(--text-secondary);
    white-space: nowrap;
  }
}

.course-hover-tip {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(135deg, var(--primary-color), #66b1ff);
  color: white;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  font-size: 13px;
  font-weight: 500;
  opacity: 0;
  transform: translateY(100%);
  transition: all 0.3s;
}

// 响应式
@media (max-width: 768px) {
  .welcome-banner {
    padding: 20px;
  }

  .banner-content {
    flex-direction: column;
    gap: 20px;
    text-align: center;
  }

  .banner-text h1 {
    font-size: 22px;
  }

  .banner-stats {
    width: 100%;
    justify-content: center;
  }

  .stat-card {
    padding: 12px 16px;
    min-width: 80px;

    .stat-value {
      font-size: 24px;
    }
  }

  .stage-header {
    flex-wrap: wrap;
  }

  .stage-progress {
    width: 100%;
    text-align: left;
    margin-top: 12px;
  }

  .course-grid {
    grid-template-columns: 1fr;
  }
}
</style>
