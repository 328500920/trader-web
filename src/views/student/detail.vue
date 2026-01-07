<template>
  <div class="student-detail">
    <el-page-header @back="goBack" :content="studentInfo?.nickname || '学员详情'" />
    
    <el-card class="info-card" v-loading="loading">
      <template #header>
        <span>基本信息</span>
      </template>
      <el-descriptions :column="3" border>
        <el-descriptions-item label="用户名">{{ studentInfo?.username }}</el-descriptions-item>
        <el-descriptions-item label="昵称">{{ studentInfo?.nickname }}</el-descriptions-item>
        <el-descriptions-item label="邮箱">{{ studentInfo?.email }}</el-descriptions-item>
        <el-descriptions-item label="注册时间">{{ formatDate(studentInfo?.createTime) }}</el-descriptions-item>
        <el-descriptions-item label="最后登录">{{ formatDate(studentInfo?.lastLoginTime) }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="studentInfo?.status === 1 ? 'success' : 'danger'">
            {{ studentInfo?.status === 1 ? '正常' : '禁用' }}
          </el-tag>
        </el-descriptions-item>
      </el-descriptions>
    </el-card>

    <el-tabs v-model="activeTab" class="detail-tabs">
      <el-tab-pane label="学习进度" name="progress">
        <el-card v-loading="progressLoading">
          <el-row :gutter="20">
            <el-col :span="6">
              <el-statistic title="已完成章节" :value="progress.completedChapters" />
            </el-col>
            <el-col :span="6">
              <el-statistic title="学习进度" :value="progress.progressRate" suffix="%" />
            </el-col>
            <el-col :span="6">
              <el-statistic title="笔记数量" :value="progress.noteCount" />
            </el-col>
            <el-col :span="6">
              <el-statistic title="打卡天数" :value="progress.checkinDays" />
            </el-col>
          </el-row>
          <el-divider />
          <el-row :gutter="20">
            <el-col :span="6">
              <el-statistic title="测验次数" :value="progress.quizCount" />
            </el-col>
            <el-col :span="6">
              <el-statistic title="平均分数" :value="progress.avgScore" />
            </el-col>
          </el-row>
        </el-card>
      </el-tab-pane>

      <el-tab-pane label="交易统计" name="trade">
        <el-card v-loading="tradeLoading">
          <el-row :gutter="20">
            <el-col :span="6">
              <el-statistic title="总交易次数" :value="tradeStats.totalTrades" />
            </el-col>
            <el-col :span="6">
              <el-statistic title="盈利次数" :value="tradeStats.winTrades" />
            </el-col>
            <el-col :span="6">
              <el-statistic title="亏损次数" :value="tradeStats.loseTrades" />
            </el-col>
            <el-col :span="6">
              <el-statistic title="胜率" :value="tradeStats.winRate" suffix="%" />
            </el-col>
          </el-row>
          <el-divider />
          <el-row :gutter="20">
            <el-col :span="6">
              <el-statistic 
                title="总盈亏" 
                :value="tradeStats.totalPnl" 
                :value-style="{ color: tradeStats.totalPnl >= 0 ? '#67c23a' : '#f56c6c' }"
              />
            </el-col>
          </el-row>
        </el-card>
      </el-tab-pane>

      <el-tab-pane label="交易日志" name="tradeLogs">
        <el-card>
          <el-table :data="tradeLogs" v-loading="tradeLogsLoading" stripe>
            <el-table-column prop="tradeDate" label="交易日期" width="120" />
            <el-table-column prop="symbol" label="交易品种" width="100" />
            <el-table-column prop="direction" label="方向" width="80">
              <template #default="{ row }">
                <el-tag :type="row.direction === 1 ? 'success' : 'danger'" size="small">
                  {{ row.direction === 1 ? '做多' : '做空' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="entryPrice" label="入场价" width="100" />
            <el-table-column prop="exitPrice" label="出场价" width="100" />
            <el-table-column prop="profitLoss" label="盈亏" width="100">
              <template #default="{ row }">
                <span :style="{ color: row.profitLoss >= 0 ? '#67c23a' : '#f56c6c' }">
                  {{ row.profitLoss }}
                </span>
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="80">
              <template #default="{ row }">
                <el-tag :type="row.status === 1 ? 'success' : 'info'" size="small">
                  {{ row.status === 1 ? '已平仓' : '持仓中' }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
          <div class="pagination">
            <el-pagination
              v-model:current-page="tradePageNum"
              v-model:page-size="tradePageSize"
              :total="tradeTotal"
              :page-sizes="[10, 20, 50]"
              layout="total, sizes, prev, pager, next"
              @size-change="loadTradeLogs"
              @current-change="loadTradeLogs"
            />
          </div>
        </el-card>
      </el-tab-pane>

      <el-tab-pane label="打卡记录" name="checkin">
        <el-card v-loading="checkinLoading">
          <div class="checkin-header">
            <el-date-picker
              v-model="checkinMonth"
              type="month"
              placeholder="选择月份"
              @change="loadCheckins"
            />
          </div>
          <el-calendar v-model="checkinMonth">
            <template #date-cell="{ data }">
              <div :class="{ 'checkin-day': isCheckedIn(data.day) }">
                {{ data.day.split('-').slice(2).join('') }}
              </div>
            </template>
          </el-calendar>
        </el-card>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { 
  getStudentById, 
  getStudentProgress, 
  getStudentTradeStats,
  getStudentTradeLogs,
  getStudentCheckins 
} from '@/api/student'
import { ElMessage } from 'element-plus'

const route = useRoute()
const router = useRouter()
const studentId = ref(route.params.id)

const loading = ref(false)
const studentInfo = ref(null)
const activeTab = ref('progress')

// 学习进度
const progressLoading = ref(false)
const progress = ref({
  completedChapters: 0,
  totalChapters: 0,
  progressRate: 0,
  noteCount: 0,
  checkinDays: 0,
  quizCount: 0,
  avgScore: 0
})

// 交易统计
const tradeLoading = ref(false)
const tradeStats = ref({
  totalTrades: 0,
  winTrades: 0,
  loseTrades: 0,
  winRate: 0,
  totalPnl: 0
})

// 交易日志
const tradeLogsLoading = ref(false)
const tradeLogs = ref([])
const tradePageNum = ref(1)
const tradePageSize = ref(10)
const tradeTotal = ref(0)

// 打卡记录
const checkinLoading = ref(false)
const checkinMonth = ref(new Date())
const checkinDays = ref([])

const goBack = () => {
  router.push('/student/list')
}

const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  return dateStr.replace('T', ' ').substring(0, 19)
}

const loadStudentInfo = async () => {
  loading.value = true
  try {
    const res = await getStudentById(studentId.value)
    studentInfo.value = res.data
  } catch (error) {
    ElMessage.error('加载学员信息失败')
  } finally {
    loading.value = false
  }
}

const loadProgress = async () => {
  progressLoading.value = true
  try {
    const res = await getStudentProgress(studentId.value)
    progress.value = res.data
  } catch (error) {
    console.error('加载学习进度失败', error)
  } finally {
    progressLoading.value = false
  }
}

const loadTradeStats = async () => {
  tradeLoading.value = true
  try {
    const res = await getStudentTradeStats(studentId.value)
    tradeStats.value = res.data
  } catch (error) {
    console.error('加载交易统计失败', error)
  } finally {
    tradeLoading.value = false
  }
}

const loadTradeLogs = async () => {
  tradeLogsLoading.value = true
  try {
    const res = await getStudentTradeLogs(studentId.value, {
      pageNum: tradePageNum.value,
      pageSize: tradePageSize.value
    })
    tradeLogs.value = res.data.list
    tradeTotal.value = res.data.total
  } catch (error) {
    console.error('加载交易日志失败', error)
  } finally {
    tradeLogsLoading.value = false
  }
}

const loadCheckins = async () => {
  checkinLoading.value = true
  try {
    const date = new Date(checkinMonth.value)
    const res = await getStudentCheckins(studentId.value, {
      year: date.getFullYear(),
      month: date.getMonth() + 1
    })
    checkinDays.value = res.data.map(c => c.checkinDate)
  } catch (error) {
    console.error('加载打卡记录失败', error)
  } finally {
    checkinLoading.value = false
  }
}

const isCheckedIn = (day) => {
  return checkinDays.value.includes(day)
}

watch(activeTab, (tab) => {
  if (tab === 'progress' && !progress.value.completedChapters) {
    loadProgress()
  } else if (tab === 'trade' && !tradeStats.value.totalTrades) {
    loadTradeStats()
  } else if (tab === 'tradeLogs' && tradeLogs.value.length === 0) {
    loadTradeLogs()
  } else if (tab === 'checkin' && checkinDays.value.length === 0) {
    loadCheckins()
  }
})

onMounted(() => {
  loadStudentInfo()
  loadProgress()
})
</script>

<style scoped>
.student-detail {
  padding: 20px;
}
.info-card {
  margin-top: 20px;
}
.detail-tabs {
  margin-top: 20px;
}
.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
.checkin-header {
  margin-bottom: 20px;
}
.checkin-day {
  background-color: #67c23a;
  color: white;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  line-height: 24px;
  text-align: center;
  margin: 0 auto;
}
</style>
