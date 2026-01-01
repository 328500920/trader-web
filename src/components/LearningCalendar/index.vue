<template>
  <div class="learning-calendar">
    <!-- 连续打卡信息 -->
    <div class="streak-info" v-if="streakInfo">
      <div class="streak-card current">
        <div class="streak-icon">🔥</div>
        <div class="streak-content">
          <span class="streak-value">{{ streakInfo.currentStreak }}</span>
          <span class="streak-label">连续打卡</span>
        </div>
      </div>
      <div class="streak-card max">
        <div class="streak-icon">🏆</div>
        <div class="streak-content">
          <span class="streak-value">{{ streakInfo.maxStreak }}</span>
          <span class="streak-label">最长连续</span>
        </div>
      </div>
      <div class="streak-card total">
        <div class="streak-icon">📅</div>
        <div class="streak-content">
          <span class="streak-value">{{ streakInfo.totalDays }}</span>
          <span class="streak-label">累计打卡</span>
        </div>
      </div>
      <div class="streak-card time">
        <div class="streak-icon">⏱️</div>
        <div class="streak-content">
          <span class="streak-value">{{ formatTotalTime(streakInfo.totalMinutes) }}</span>
          <span class="streak-label">累计学习</span>
        </div>
      </div>
    </div>

    <!-- 热力图模式 -->
    <div class="heatmap-section" v-if="mode === 'heatmap'">
      <div class="heatmap-header">
        <h3>📊 学习热力图</h3>
        <span class="heatmap-period">最近 {{ days }} 天</span>
      </div>
      <div class="heatmap-container">
        <div class="heatmap-weekdays">
          <span v-for="day in weekDays" :key="day">{{ day }}</span>
        </div>
        <div class="heatmap-grid">
          <div 
            v-for="(item, index) in heatmapData" 
            :key="index"
            class="heatmap-cell"
            :class="`level-${item.level}`"
            :title="getTooltip(item)"
          ></div>
        </div>
      </div>
      <div class="heatmap-legend">
        <span class="legend-label">少</span>
        <div class="legend-cell level-0"></div>
        <div class="legend-cell level-1"></div>
        <div class="legend-cell level-2"></div>
        <div class="legend-cell level-3"></div>
        <div class="legend-cell level-4"></div>
        <span class="legend-label">多</span>
      </div>
    </div>

    <!-- 日历模式 -->
    <div class="calendar-section" v-else>
      <div class="calendar-header">
        <el-button text @click="prevMonth">
          <el-icon><ArrowLeft /></el-icon>
        </el-button>
        <h3>{{ currentYear }}年{{ currentMonth }}月</h3>
        <el-button text @click="nextMonth" :disabled="isCurrentMonth">
          <el-icon><ArrowRight /></el-icon>
        </el-button>
      </div>
      <div class="calendar-weekdays">
        <span v-for="day in weekDays" :key="day">{{ day }}</span>
      </div>
      <div class="calendar-grid">
        <!-- 填充月初空白 -->
        <div 
          v-for="i in firstDayOfMonth" 
          :key="`empty-${i}`" 
          class="calendar-cell empty"
        ></div>
        <!-- 日期单元格 -->
        <div 
          v-for="item in calendarData" 
          :key="item.date"
          class="calendar-cell"
          :class="[`level-${item.level}`, { today: isToday(item.date) }]"
          @click="showDayDetail(item)"
        >
          <span class="day-number">{{ item.day }}</span>
          <span class="day-minutes" v-if="item.studyMinutes > 0">
            {{ item.studyMinutes }}分钟
          </span>
        </div>
      </div>
    </div>

    <!-- 日期详情弹窗 -->
    <el-dialog 
      v-model="showDetail" 
      :title="selectedDay?.date" 
      width="360px"
      class="day-detail-dialog"
    >
      <div class="day-detail" v-if="selectedDay">
        <div class="detail-item">
          <span class="detail-icon">⏱️</span>
          <span class="detail-label">学习时长</span>
          <span class="detail-value">{{ selectedDay.studyMinutes }} 分钟</span>
        </div>
        <div class="detail-item">
          <span class="detail-icon">📖</span>
          <span class="detail-label">完成章节</span>
          <span class="detail-value">{{ selectedDay.chaptersCompleted }} 个</span>
        </div>
        <div class="detail-item">
          <span class="detail-icon">📝</span>
          <span class="detail-label">完成测验</span>
          <span class="detail-value">{{ selectedDay.quizzesCompleted }} 次</span>
        </div>
        <div class="detail-item">
          <span class="detail-icon">📊</span>
          <span class="detail-label">查看案例</span>
          <span class="detail-value">{{ selectedDay.casesViewed }} 个</span>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { ArrowLeft, ArrowRight } from '@element-plus/icons-vue'
import { getCheckinCalendar, getCheckinHeatmap, getCheckinStreak } from '@/api/learn'

const props = defineProps({
  mode: {
    type: String,
    default: 'calendar' // calendar | heatmap
  },
  days: {
    type: Number,
    default: 90
  },
  userId: {
    type: Number,
    default: 1
  }
})

const weekDays = ['日', '一', '二', '三', '四', '五', '六']
const currentYear = ref(new Date().getFullYear())
const currentMonth = ref(new Date().getMonth() + 1)
const calendarData = ref([])
const heatmapData = ref([])
const streakInfo = ref(null)
const showDetail = ref(false)
const selectedDay = ref(null)

const isCurrentMonth = computed(() => {
  const now = new Date()
  return currentYear.value === now.getFullYear() && currentMonth.value === now.getMonth() + 1
})

const firstDayOfMonth = computed(() => {
  const date = new Date(currentYear.value, currentMonth.value - 1, 1)
  return date.getDay()
})

const isToday = (dateStr) => {
  const today = new Date().toISOString().split('T')[0]
  return dateStr === today
}

const formatTotalTime = (minutes) => {
  if (!minutes) return '0小时'
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (hours === 0) return `${mins}分钟`
  if (mins === 0) return `${hours}小时`
  return `${hours}小时${mins}分`
}

const getTooltip = (item) => {
  if (!item.value) return `${item.date}: 无学习记录`
  return `${item.date}: 学习 ${item.value} 分钟`
}

const loadCalendarData = async () => {
  try {
    const res = await getCheckinCalendar({
      userId: props.userId,
      year: currentYear.value,
      month: currentMonth.value
    })
    if (res.code === 200) {
      calendarData.value = res.data || []
    }
  } catch (error) {
    console.error('加载日历数据失败:', error)
  }
}

const loadHeatmapData = async () => {
  try {
    const res = await getCheckinHeatmap({
      userId: props.userId,
      days: props.days
    })
    if (res.code === 200) {
      heatmapData.value = res.data || []
    }
  } catch (error) {
    console.error('加载热力图数据失败:', error)
  }
}

const loadStreakInfo = async () => {
  try {
    const res = await getCheckinStreak({
      userId: props.userId
    })
    if (res.code === 200) {
      streakInfo.value = res.data
    }
  } catch (error) {
    console.error('加载打卡信息失败:', error)
  }
}

const prevMonth = () => {
  if (currentMonth.value === 1) {
    currentMonth.value = 12
    currentYear.value--
  } else {
    currentMonth.value--
  }
}

const nextMonth = () => {
  if (!isCurrentMonth.value) {
    if (currentMonth.value === 12) {
      currentMonth.value = 1
      currentYear.value++
    } else {
      currentMonth.value++
    }
  }
}

const showDayDetail = (item) => {
  selectedDay.value = item
  showDetail.value = true
}

watch([currentYear, currentMonth], () => {
  if (props.mode === 'calendar') {
    loadCalendarData()
  }
})

onMounted(() => {
  loadStreakInfo()
  if (props.mode === 'calendar') {
    loadCalendarData()
  } else {
    loadHeatmapData()
  }
})
</script>

<style lang="scss" scoped>
.learning-calendar {
  background: var(--bg-primary);
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 2px 12px var(--shadow-color);
}

.streak-info {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 24px;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
}

.streak-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: var(--bg-secondary);
  border-radius: 12px;
  
  .streak-icon {
    font-size: 28px;
  }
  
  .streak-content {
    display: flex;
    flex-direction: column;
  }
  
  .streak-value {
    font-size: 20px;
    font-weight: 700;
    color: var(--text-primary);
  }
  
  .streak-label {
    font-size: 12px;
    color: var(--text-secondary);
  }
  
  &.current .streak-value { color: #f56c6c; }
  &.max .streak-value { color: #e6a23c; }
  &.total .streak-value { color: #409eff; }
  &.time .streak-value { color: #67c23a; }
}

// 热力图样式
.heatmap-section {
  .heatmap-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    
    h3 {
      font-size: 16px;
      font-weight: 600;
      color: var(--text-primary);
      margin: 0;
    }
    
    .heatmap-period {
      font-size: 13px;
      color: var(--text-secondary);
    }
  }
}

.heatmap-container {
  display: flex;
  gap: 8px;
}

.heatmap-weekdays {
  display: flex;
  flex-direction: column;
  gap: 2px;
  
  span {
    height: 14px;
    font-size: 10px;
    color: var(--text-secondary);
    line-height: 14px;
  }
}

.heatmap-grid {
  display: grid;
  grid-template-rows: repeat(7, 14px);
  grid-auto-flow: column;
  gap: 2px;
}

.heatmap-cell {
  width: 14px;
  height: 14px;
  border-radius: 2px;
  cursor: pointer;
  transition: transform 0.2s;
  
  &:hover {
    transform: scale(1.2);
  }
}

.heatmap-legend {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 4px;
  margin-top: 12px;
  
  .legend-label {
    font-size: 11px;
    color: var(--text-secondary);
  }
  
  .legend-cell {
    width: 12px;
    height: 12px;
    border-radius: 2px;
  }
}

// 日历样式
.calendar-section {
  .calendar-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    
    h3 {
      font-size: 16px;
      font-weight: 600;
      color: var(--text-primary);
      margin: 0;
    }
  }
}

.calendar-weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
  margin-bottom: 8px;
  
  span {
    text-align: center;
    font-size: 12px;
    color: var(--text-secondary);
    padding: 8px 0;
  }
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
}

.calendar-cell {
  aspect-ratio: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  
  &.empty {
    cursor: default;
  }
  
  &:not(.empty):hover {
    transform: scale(1.05);
  }
  
  &.today {
    border: 2px solid var(--primary-color);
  }
  
  .day-number {
    font-size: 14px;
    font-weight: 500;
    color: var(--text-primary);
  }
  
  .day-minutes {
    font-size: 10px;
    color: var(--text-secondary);
    margin-top: 2px;
  }
}

// 热力图等级颜色
.level-0 { background: var(--bg-secondary); }
.level-1 { background: #9be9a8; }
.level-2 { background: #40c463; }
.level-3 { background: #30a14e; }
.level-4 { background: #216e39; }

// 暗黑模式适配
:root[data-theme="dark"] {
  .level-0 { background: #161b22; }
  .level-1 { background: #0e4429; }
  .level-2 { background: #006d32; }
  .level-3 { background: #26a641; }
  .level-4 { background: #39d353; }
}

// 日期详情弹窗
.day-detail {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: var(--bg-secondary);
  border-radius: 8px;
  
  .detail-icon {
    font-size: 24px;
  }
  
  .detail-label {
    flex: 1;
    font-size: 14px;
    color: var(--text-secondary);
  }
  
  .detail-value {
    font-size: 16px;
    font-weight: 600;
    color: var(--text-primary);
  }
}
</style>
