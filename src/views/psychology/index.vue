<template>
  <div class="psychology-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-info">
          <h1>🧠 交易心理日记</h1>
          <p>记录情绪，认识自己，提升交易心态</p>
        </div>
        <el-button type="primary" @click="openDailyDialog">
          <el-icon><Edit /></el-icon>
          今日打卡
        </el-button>
      </div>
      
      <!-- 月度概览 -->
      <div class="month-overview" v-loading="overviewLoading">
        <div class="overview-item">
          <span class="label">平均情绪</span>
          <span class="value">{{ overview.avgMood?.toFixed(1) || '-' }}/10</span>
        </div>
        <div class="overview-item">
          <span class="label">打卡天数</span>
          <span class="value">{{ overview.totalDays || 0 }}/{{ overview.daysInMonth || 30 }}</span>
        </div>
        <div class="overview-item">
          <span class="label">心理陷阱</span>
          <span class="value warning">{{ overview.trapDays || 0 }}天</span>
        </div>
      </div>
    </div>

    <!-- 日历区域 -->
    <div class="calendar-section">
      <div class="calendar-header">
        <el-button text @click="prevMonth">
          <el-icon><ArrowLeft /></el-icon>
        </el-button>
        <span class="current-month">{{ currentYear }}年{{ currentMonth }}月</span>
        <el-button text @click="nextMonth">
          <el-icon><ArrowRight /></el-icon>
        </el-button>
      </div>
      
      <div class="calendar-grid" v-loading="calendarLoading">
        <div class="weekday-header">
          <span v-for="day in weekDays" :key="day">{{ day }}</span>
        </div>
        <div class="days-grid">
          <div 
            v-for="(day, index) in calendarDays" 
            :key="index"
            class="day-cell"
            :class="{ 
              'other-month': !day.currentMonth,
              'today': day.isToday,
              'has-record': day.record
            }"
            @click="handleDayClick(day)"
          >
            <span class="day-number">{{ day.day }}</span>
            <div class="day-mood" v-if="day.record">
              <span class="mood-emoji">{{ getMoodEmoji(day.record.moodScore) }}</span>
              <span class="trap-indicator" v-if="day.record.hasTraps">⚠️</span>
            </div>
          </div>
        </div>
      </div>
      
      <div class="calendar-legend">
        <span class="legend-item">😊 良好(7-10)</span>
        <span class="legend-item">😐 一般(4-6)</span>
        <span class="legend-item">😰 较差(1-3)</span>
        <span class="legend-item">⚠️ 触发心理陷阱</span>
      </div>
    </div>

    <!-- 最近记录 -->
    <div class="recent-records">
      <h3>最近记录</h3>
      <div class="record-list" v-loading="recordsLoading">
        <div v-if="recentRecords.length === 0" class="empty-state">
          <p>暂无记录，开始今日打卡吧</p>
        </div>
        <div 
          v-for="record in recentRecords" 
          :key="record.id" 
          class="record-card"
          @click="viewRecord(record)"
        >
          <div class="record-header">
            <span class="record-date">{{ formatDate(record.recordDate) }}</span>
            <span class="record-mood">
              {{ getMoodEmoji(record.moodScore) }} {{ record.moodScore }}/10
            </span>
          </div>
          <div class="record-traps" v-if="record.traps && parseTraps(record.traps).length">
            <el-tag 
              v-for="trap in parseTraps(record.traps)" 
              :key="trap" 
              type="warning" 
              size="small"
            >
              {{ trap }}
            </el-tag>
          </div>
          <div class="record-reflection" v-if="record.dailyReflection">
            {{ truncate(record.dailyReflection, 80) }}
          </div>
        </div>
      </div>
    </div>

    <!-- 打卡弹窗 -->
    <el-dialog 
      v-model="dialogVisible" 
      :title="isEdit ? '编辑打卡' : '每日情绪打卡'"
      width="600px"
      :close-on-click-modal="false"
    >
      <div class="daily-form">
        <!-- 日期 -->
        <div class="form-item">
          <label>日期</label>
          <el-date-picker 
            v-model="form.recordDate" 
            type="date" 
            placeholder="选择日期"
            :disabled-date="disabledDate"
            value-format="YYYY-MM-DD"
          />
        </div>
        
        <!-- 整体情绪 -->
        <div class="form-item mood-slider">
          <label>整体情绪</label>
          <div class="slider-container">
            <span class="mood-label low">😰</span>
            <el-slider 
              v-model="form.moodScore" 
              :min="1" 
              :max="10" 
              :marks="moodMarks"
              show-stops
            />
            <span class="mood-label high">😊</span>
          </div>
          <div class="mood-desc">当前: {{ form.moodScore }}/10 - {{ getMoodDesc(form.moodScore) }}</div>
        </div>
        
        <!-- 情绪标签 -->
        <div class="form-item">
          <label>情绪标签</label>
          <div class="tag-group">
            <el-check-tag 
              v-for="tag in moodTagOptions" 
              :key="tag"
              :checked="form.moodTags.includes(tag)"
              @change="toggleMoodTag(tag)"
            >
              {{ tag }}
            </el-check-tag>
          </div>
        </div>
        
        <!-- 身心状态 -->
        <div class="form-item state-row">
          <div class="state-item">
            <label>睡眠质量</label>
            <el-rate v-model="form.sleepQuality" :max="5" :texts="sleepTexts" show-text />
          </div>
          <div class="state-item">
            <label>身体状态</label>
            <el-radio-group v-model="form.physicalState">
              <el-radio :label="1">疲惫</el-radio>
              <el-radio :label="2">一般</el-radio>
              <el-radio :label="3">精力充沛</el-radio>
            </el-radio-group>
          </div>
        </div>
        
        <!-- 外部压力 -->
        <div class="form-item">
          <label>外部压力</label>
          <el-slider v-model="form.externalPressure" :min="1" :max="10" show-stops />
        </div>
        
        <!-- 心理陷阱 -->
        <div class="form-item">
          <label>今日是否触发心理陷阱？</label>
          <div class="trap-group">
            <el-checkbox-group v-model="form.traps">
              <el-checkbox v-for="trap in trapOptions" :key="trap.value" :label="trap.value">
                {{ trap.label }}
              </el-checkbox>
            </el-checkbox-group>
          </div>
        </div>
        
        <!-- 今日反思 -->
        <div class="form-item">
          <label>今日反思</label>
          <el-input 
            v-model="form.dailyReflection" 
            type="textarea" 
            :rows="4"
            placeholder="记录今天的交易心得、情绪变化、经验教训..."
          />
        </div>
      </div>
      
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting">
          保存打卡
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Edit, ArrowLeft, ArrowRight } from '@element-plus/icons-vue'
import { 
  saveDaily, getDailyByDate, getDailyList, 
  getCalendarData, getMonthOverview 
} from '@/api/psychology'

// 日历相关
const currentYear = ref(new Date().getFullYear())
const currentMonth = ref(new Date().getMonth() + 1)
const calendarData = ref([])
const calendarLoading = ref(false)
const weekDays = ['一', '二', '三', '四', '五', '六', '日']

// 概览数据
const overview = ref({})
const overviewLoading = ref(false)

// 最近记录
const recentRecords = ref([])
const recordsLoading = ref(false)

// 弹窗
const dialogVisible = ref(false)
const isEdit = ref(false)
const submitting = ref(false)
const selectedDate = ref(null)

// 表单
const defaultForm = {
  recordDate: new Date().toISOString().split('T')[0],
  moodScore: 5,
  moodTags: [],
  sleepQuality: 3,
  physicalState: 2,
  externalPressure: 5,
  traps: [],
  dailyPlan: '',
  dailyReflection: ''
}
const form = ref({ ...defaultForm })

// 选项配置
const moodMarks = { 1: '1', 5: '5', 10: '10' }
const moodTagOptions = ['平静', '焦虑', '兴奋', '恐惧', '贪婪', '自信', '沮丧', '愤怒', '迷茫']
const sleepTexts = ['很差', '较差', '一般', '良好', '很好']
const trapOptions = [
  { value: 'FOMO', label: 'FOMO（错失恐惧）' },
  { value: '报复性交易', label: '报复性交易' },
  { value: '过度自信', label: '过度自信' },
  { value: '损失厌恶', label: '损失厌恶' },
  { value: '确认偏误', label: '确认偏误' },
  { value: '锚定效应', label: '锚定效应' },
  { value: '赌徒谬误', label: '赌徒谬误' },
  { value: '从众心理', label: '从众心理' }
]

// 计算日历天数
const calendarDays = computed(() => {
  const year = currentYear.value
  const month = currentMonth.value
  const firstDay = new Date(year, month - 1, 1)
  const lastDay = new Date(year, month, 0)
  const days = []
  
  // 获取第一天是周几（周一为0）
  let startWeekday = firstDay.getDay() - 1
  if (startWeekday < 0) startWeekday = 6
  
  // 上月的天数
  const prevMonthLastDay = new Date(year, month - 1, 0).getDate()
  for (let i = startWeekday - 1; i >= 0; i--) {
    days.push({
      day: prevMonthLastDay - i,
      currentMonth: false,
      date: null
    })
  }
  
  // 当月的天数
  const today = new Date()
  for (let i = 1; i <= lastDay.getDate(); i++) {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(i).padStart(2, '0')}`
    const record = calendarData.value.find(r => r.recordDate === dateStr)
    days.push({
      day: i,
      currentMonth: true,
      date: dateStr,
      isToday: today.getFullYear() === year && today.getMonth() + 1 === month && today.getDate() === i,
      record: record ? {
        moodScore: record.moodScore,
        hasTraps: record.traps && record.traps !== '[]' && record.traps !== ''
      } : null
    })
  }
  
  // 下月的天数（补齐6行）
  const remaining = 42 - days.length
  for (let i = 1; i <= remaining; i++) {
    days.push({
      day: i,
      currentMonth: false,
      date: null
    })
  }
  
  return days
})

// 加载日历数据
const loadCalendarData = async () => {
  calendarLoading.value = true
  try {
    const res = await getCalendarData(currentYear.value, currentMonth.value)
    if (res.code === 200) {
      calendarData.value = res.data || []
    }
  } catch (error) {
    console.error('加载日历数据失败:', error)
  } finally {
    calendarLoading.value = false
  }
}

// 加载月度概览
const loadOverview = async () => {
  overviewLoading.value = true
  try {
    const res = await getMonthOverview(currentYear.value, currentMonth.value)
    if (res.code === 200) {
      overview.value = res.data || {}
    }
  } catch (error) {
    console.error('加载概览失败:', error)
  } finally {
    overviewLoading.value = false
  }
}

// 加载最近记录
const loadRecentRecords = async () => {
  recordsLoading.value = true
  try {
    const endDate = new Date().toISOString().split('T')[0]
    const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    const res = await getDailyList(startDate, endDate)
    if (res.code === 200) {
      recentRecords.value = res.data || []
    }
  } catch (error) {
    console.error('加载记录失败:', error)
  } finally {
    recordsLoading.value = false
  }
}

// 切换月份
const prevMonth = () => {
  if (currentMonth.value === 1) {
    currentMonth.value = 12
    currentYear.value--
  } else {
    currentMonth.value--
  }
}

const nextMonth = () => {
  if (currentMonth.value === 12) {
    currentMonth.value = 1
    currentYear.value++
  } else {
    currentMonth.value++
  }
}

// 监听月份变化
watch([currentYear, currentMonth], () => {
  loadCalendarData()
  loadOverview()
})

// 点击日期
const handleDayClick = async (day) => {
  if (!day.currentMonth || !day.date) return
  
  selectedDate.value = day.date
  form.value = { ...defaultForm, recordDate: day.date }
  
  // 如果有记录，加载详情
  if (day.record) {
    try {
      const res = await getDailyByDate(day.date)
      if (res.code === 200 && res.data) {
        const data = res.data
        form.value = {
          recordDate: data.recordDate,
          moodScore: data.moodScore || 5,
          moodTags: parseTraps(data.moodTags),
          sleepQuality: data.sleepQuality || 3,
          physicalState: data.physicalState || 2,
          externalPressure: data.externalPressure || 5,
          traps: parseTraps(data.traps),
          dailyPlan: data.dailyPlan || '',
          dailyReflection: data.dailyReflection || ''
        }
        isEdit.value = true
      }
    } catch (error) {
      console.error('加载记录失败:', error)
    }
  } else {
    isEdit.value = false
  }
  
  dialogVisible.value = true
}

// 打开今日打卡
const openDailyDialog = () => {
  const today = new Date().toISOString().split('T')[0]
  handleDayClick({ currentMonth: true, date: today, record: null })
}

// 查看记录
const viewRecord = (record) => {
  handleDayClick({ 
    currentMonth: true, 
    date: record.recordDate, 
    record: { moodScore: record.moodScore } 
  })
}

// 切换情绪标签
const toggleMoodTag = (tag) => {
  const index = form.value.moodTags.indexOf(tag)
  if (index > -1) {
    form.value.moodTags.splice(index, 1)
  } else {
    form.value.moodTags.push(tag)
  }
}

// 提交表单
const handleSubmit = async () => {
  if (!form.value.recordDate) {
    ElMessage.warning('请选择日期')
    return
  }
  
  submitting.value = true
  try {
    const data = {
      ...form.value,
      moodTags: JSON.stringify(form.value.moodTags),
      traps: JSON.stringify(form.value.traps)
    }
    await saveDaily(data)
    ElMessage.success('打卡成功')
    dialogVisible.value = false
    loadCalendarData()
    loadOverview()
    loadRecentRecords()
  } catch (error) {
    ElMessage.error('保存失败')
  } finally {
    submitting.value = false
  }
}

// 工具函数
const getMoodEmoji = (score) => {
  if (score >= 7) return '😊'
  if (score >= 4) return '😐'
  return '😰'
}

const getMoodDesc = (score) => {
  if (score >= 8) return '状态很好'
  if (score >= 6) return '状态良好'
  if (score >= 4) return '状态一般'
  if (score >= 2) return '状态较差'
  return '状态很差'
}

const parseTraps = (traps) => {
  if (!traps) return []
  try {
    return JSON.parse(traps)
  } catch {
    return []
  }
}

const formatDate = (date) => {
  if (!date) return ''
  const d = new Date(date)
  return `${d.getMonth() + 1}月${d.getDate()}日`
}

const truncate = (str, len) => {
  if (!str) return ''
  return str.length > len ? str.slice(0, len) + '...' : str
}

const disabledDate = (date) => {
  return date > new Date()
}

onMounted(() => {
  loadCalendarData()
  loadOverview()
  loadRecentRecords()
})
</script>


<style lang="scss" scoped>
.psychology-page {
  padding: 20px;
  max-width: 1000px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 24px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;

  h1 {
    font-size: 24px;
    font-weight: 700;
    color: var(--text-primary);
    margin: 0 0 8px;
  }

  p {
    color: var(--text-secondary);
    margin: 0;
  }
}

.month-overview {
  display: flex;
  gap: 24px;
  padding: 16px 24px;
  background: var(--bg-primary);
  border-radius: 12px;
  box-shadow: 0 2px 8px var(--shadow-color);
}

.overview-item {
  display: flex;
  flex-direction: column;
  gap: 4px;

  .label {
    font-size: 13px;
    color: var(--text-secondary);
  }

  .value {
    font-size: 20px;
    font-weight: 600;
    color: var(--text-primary);

    &.warning {
      color: #e6a23c;
    }
  }
}

.calendar-section {
  background: var(--bg-primary);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px var(--shadow-color);
}

.calendar-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-bottom: 20px;

  .current-month {
    font-size: 18px;
    font-weight: 600;
    color: var(--text-primary);
    min-width: 120px;
    text-align: center;
  }
}

.calendar-grid {
  .weekday-header {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    text-align: center;
    padding-bottom: 12px;
    border-bottom: 1px solid var(--border-light);
    margin-bottom: 8px;

    span {
      font-size: 13px;
      color: var(--text-secondary);
      font-weight: 500;
    }
  }

  .days-grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 4px;
  }
}

.day-cell {
  aspect-ratio: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
  min-height: 60px;

  &:hover {
    background: var(--bg-secondary);
  }

  &.other-month {
    opacity: 0.3;
    cursor: default;
  }

  &.today {
    background: rgba(64, 158, 255, 0.1);
    border: 2px solid var(--primary-color);
  }

  &.has-record {
    background: rgba(103, 194, 58, 0.1);
  }

  .day-number {
    font-size: 14px;
    color: var(--text-primary);
    font-weight: 500;
  }

  .day-mood {
    display: flex;
    align-items: center;
    gap: 2px;
    margin-top: 4px;

    .mood-emoji {
      font-size: 16px;
    }

    .trap-indicator {
      font-size: 12px;
    }
  }
}

.calendar-legend {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid var(--border-light);

  .legend-item {
    font-size: 12px;
    color: var(--text-secondary);
  }
}

.recent-records {
  h3 {
    font-size: 16px;
    font-weight: 600;
    color: var(--text-primary);
    margin: 0 0 16px;
  }
}

.record-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.empty-state {
  text-align: center;
  padding: 40px;
  color: var(--text-secondary);
}

.record-card {
  background: var(--bg-primary);
  border-radius: 12px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 8px var(--shadow-color);

  &:hover {
    box-shadow: 0 4px 16px var(--shadow-color);
  }

  .record-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;

    .record-date {
      font-weight: 600;
      color: var(--text-primary);
    }

    .record-mood {
      font-size: 14px;
      color: var(--text-secondary);
    }
  }

  .record-traps {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-bottom: 8px;
  }

  .record-reflection {
    font-size: 13px;
    color: var(--text-secondary);
    line-height: 1.5;
  }
}

// 弹窗表单样式
.daily-form {
  .form-item {
    margin-bottom: 20px;

    > label {
      display: block;
      font-size: 14px;
      font-weight: 500;
      color: var(--text-primary);
      margin-bottom: 8px;
    }
  }

  .mood-slider {
    .slider-container {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 0 8px;

      .el-slider {
        flex: 1;
      }

      .mood-label {
        font-size: 24px;
      }
    }

    .mood-desc {
      text-align: center;
      font-size: 13px;
      color: var(--text-secondary);
      margin-top: 8px;
    }
  }

  .tag-group {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .state-row {
    display: flex;
    gap: 40px;

    .state-item {
      flex: 1;

      label {
        display: block;
        font-size: 13px;
        color: var(--text-secondary);
        margin-bottom: 8px;
      }
    }
  }

  .trap-group {
    .el-checkbox-group {
      display: flex;
      flex-wrap: wrap;
      gap: 8px 16px;
    }
  }
}

@media (max-width: 768px) {
  .month-overview {
    flex-wrap: wrap;
    gap: 16px;
  }

  .day-cell {
    min-height: 50px;
  }

  .calendar-legend {
    flex-wrap: wrap;
    gap: 12px;
  }

  .state-row {
    flex-direction: column;
    gap: 16px !important;
  }
}
</style>
