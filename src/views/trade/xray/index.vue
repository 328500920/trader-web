<template>
  <div class="xray-page">
    <!-- 顶部AI Banner -->
    <div class="ai-banner">
      <div class="banner-bg">
        <div class="particle" v-for="i in 20" :key="i"></div>
      </div>
      <div class="banner-content">
        <div class="ai-icon">
          <div class="icon-ring"></div>
          <div class="icon-ring"></div>
          <div class="icon-ring"></div>
          <span class="icon-text">AI</span>
        </div>
        <div class="banner-text">
          <h1>交易X光</h1>
          <p class="tagline">
            <span class="typing-text">{{ typingText }}</span>
            <span class="cursor">|</span>
          </p>
          <div class="ai-features">
            <span class="feature"><i class="dot"></i>深度学习分析</span>
            <span class="feature"><i class="dot"></i>智能诊断问题</span>
            <span class="feature"><i class="dot"></i>个性化建议</span>
          </div>
        </div>
        <div class="quota-display" v-if="quota">
          <div class="quota-card" :class="{ 'unlimited': quota.unlimited, 'warning': !quota.unlimited && quota.remaining <= 1 }">
            <span class="quota-label">今日可用</span>
            <span class="quota-value">{{ quota.unlimited ? '∞' : quota.remaining }}</span>
            <span class="quota-unit" v-if="!quota.unlimited">次</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 分析控制区 -->
    <div class="control-section">
      <el-card class="control-card">
        <div class="control-header">
          <div class="step-indicator">
            <div class="step" :class="{ active: true }">1</div>
            <div class="step-line"></div>
            <div class="step" :class="{ active: preview }">2</div>
            <div class="step-line"></div>
            <div class="step" :class="{ active: currentReport }">3</div>
          </div>
          <div class="step-labels">
            <span>选择数据</span>
            <span>确认分析</span>
            <span>查看报告</span>
          </div>
        </div>
        
        <div class="control-body">
          <div class="select-area">
            <div class="select-item">
              <label>分析周期</label>
              <el-select v-model="periodType" @change="handlePeriodChange">
                <el-option label="最近7天" value="7" />
                <el-option label="最近14天" value="14" />
                <el-option label="最近30天" value="30" />
                <el-option label="自定义" value="custom" />
              </el-select>
            </div>
            
            <div class="select-item" v-if="periodType === 'custom'">
              <label>日期范围</label>
              <el-date-picker
                v-model="dateRange"
                type="daterange"
                range-separator="~"
                start-placeholder="开始"
                end-placeholder="结束"
                value-format="YYYY-MM-DD"
                @change="handleDateChange"
              />
            </div>
            
            <el-button class="preview-btn" @click="loadPreview" :loading="previewLoading">
              扫描数据
            </el-button>
          </div>
          
          <div class="preview-area" v-if="preview">
            <div class="data-stats">
              <div class="stat-item">
                <div class="stat-icon trade-icon">📊</div>
                <div class="stat-info">
                  <span class="stat-value">{{ preview.tradeCount }}</span>
                  <span class="stat-label">成交记录</span>
                </div>
              </div>
              <div class="stat-item">
                <div class="stat-icon position-icon">📈</div>
                <div class="stat-info">
                  <span class="stat-value">{{ preview.positionCount }}</span>
                  <span class="stat-label">仓位历史</span>
                </div>
              </div>
              <div class="stat-item">
                <div class="stat-icon date-icon">📅</div>
                <div class="stat-info">
                  <span class="stat-value">{{ getDayCount }}</span>
                  <span class="stat-label">分析天数</span>
                </div>
              </div>
            </div>
            
            <button 
              class="analyze-btn" 
              @click="startAnalyze" 
              :disabled="!canAnalyze || analyzing"
              :class="{ analyzing: analyzing }"
            >
              <span class="btn-bg"></span>
              <span class="btn-content" v-if="!analyzing">
                <svg class="ai-spark" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" fill="currentColor"/>
                </svg>
                开始AI分析
              </span>
              <span class="btn-content" v-else>
                <span class="loading-dots">
                  <span></span><span></span><span></span>
                </span>
                AI正在分析中...
              </span>
            </button>
            
            <p class="analyze-tip" v-if="!canAnalyze && quota && !quota.unlimited && quota.remaining <= 0">
              今日分析次数已用完，明天再来吧 ~
            </p>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 分析结果区 -->
    <div class="result-section" v-if="currentReport">
      <div class="result-header">
        <h2>🎯 AI分析报告</h2>
        <span class="report-meta">
          📅 {{ currentReport.startDate }} ~ {{ currentReport.endDate }} · {{ currentReport.modelName }} · {{ formatDate(currentReport.createTime) }}
        </span>
      </div>
      
      <!-- 综合评分 -->
      <div class="score-card">
        <div class="score-main">
          <div class="score-ring" :class="getScoreClass(currentReport.totalScore)">
            <svg viewBox="0 0 100 100">
              <circle class="bg" cx="50" cy="50" r="45"/>
              <circle class="progress" cx="50" cy="50" r="45" 
                :style="{ strokeDashoffset: 283 - (283 * (currentReport.totalScore || 0) / 100) }"/>
            </svg>
            <div class="score-text">
              <span class="score-num">{{ currentReport.totalScore || 0 }}</span>
              <span class="score-label">综合评分</span>
            </div>
          </div>
          <div class="score-level">
            {{ getScoreLevel(currentReport.totalScore) }}
          </div>
        </div>
        
        <div class="metrics-grid">
          <div class="metric-card">
            <div class="metric-icon">🎯</div>
            <div class="metric-value">{{ currentReport.winRate || '-' }}%</div>
            <div class="metric-name">胜率</div>
          </div>
          <div class="metric-card">
            <div class="metric-icon">⚖️</div>
            <div class="metric-value">{{ currentReport.profitLossRatio || '-' }}</div>
            <div class="metric-name">盈亏比</div>
          </div>
          <div class="metric-card">
            <div class="metric-icon">🛡️</div>
            <div class="metric-value">{{ currentReport.riskScore || '-' }}</div>
            <div class="metric-name">风控</div>
          </div>
          <div class="metric-card">
            <div class="metric-icon">📋</div>
            <div class="metric-value">{{ currentReport.disciplineScore || '-' }}</div>
            <div class="metric-name">纪律</div>
          </div>
        </div>
      </div>
      
      <!-- AI诊断 -->
      <div class="diagnosis-grid">
        <div class="diagnosis-card strengths" v-if="parsedStrengths.length">
          <div class="card-header">
            <span class="card-icon">✅</span>
            <span class="card-title">优势发现</span>
          </div>
          <ul class="card-list">
            <li v-for="(item, index) in parsedStrengths" :key="index">{{ item }}</li>
          </ul>
        </div>
        
        <div class="diagnosis-card problems" v-if="parsedProblems.length">
          <div class="card-header">
            <span class="card-icon">⚠️</span>
            <span class="card-title">问题诊断</span>
          </div>
          <ul class="card-list">
            <li v-for="(item, index) in parsedProblems" :key="index">{{ item }}</li>
          </ul>
        </div>
        
        <div class="diagnosis-card suggestions" v-if="parsedSuggestions.length">
          <div class="card-header">
            <span class="card-icon">💡</span>
            <span class="card-title">改进建议</span>
          </div>
          <ol class="card-list">
            <li v-for="(item, index) in parsedSuggestions" :key="index">{{ item }}</li>
          </ol>
        </div>
      </div>
      
      <!-- 完整报告 -->
      <el-collapse class="full-report-collapse">
        <el-collapse-item title="📄 查看AI完整分析报告" name="full">
          <pre class="full-report">{{ currentReport.fullReport }}</pre>
        </el-collapse-item>
      </el-collapse>
    </div>

    <!-- 历史报告 -->
    <div class="history-section">
      <div class="section-header">
        <h3>📚 历史分析报告</h3>
      </div>
      <el-table :data="reportList" v-loading="historyLoading" class="history-table">
        <el-table-column label="分析周期" min-width="160">
          <template #default="{ row }">
            {{ row.startDate }} ~ {{ row.endDate }}
          </template>
        </el-table-column>
        <el-table-column prop="tradeCount" label="成交数" width="80" align="center" />
        <el-table-column prop="positionCount" label="仓位数" width="80" align="center" />
        <el-table-column label="评分" width="80" align="center">
          <template #default="{ row }">
            <span class="score-badge" :class="getScoreClass(row.totalScore)">
              {{ row.totalScore || '-' }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="modelName" label="AI模型" width="100" />
        <el-table-column prop="createTime" label="分析时间" width="160" />
        <el-table-column label="操作" width="80" align="center">
          <template #default="{ row }">
            <el-button text type="primary" @click="viewReport(row)">查看</el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <div class="pagination" v-if="total > pageSize">
        <el-pagination
          v-model:current-page="pageNum"
          :page-size="pageSize"
          :total="total"
          layout="prev, pager, next"
          @current-change="loadHistory"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import { previewData, analyzeData, getReportList, getQuota } from '@/api/xray'

const periodType = ref('7')
const dateRange = ref([])
const startDate = ref('')
const endDate = ref('')

const preview = ref(null)
const previewLoading = ref(false)
const analyzing = ref(false)
const currentReport = ref(null)

const quota = ref(null)
const reportList = ref([])
const historyLoading = ref(false)
const pageNum = ref(1)
const pageSize = ref(5)
const total = ref(0)

// 打字机效果
const taglines = [
  '让AI透视你的每一笔交易，发现隐藏的问题',
  '基于深度学习的智能交易分析系统',
  '像X光一样，看透你的交易行为模式',
  '专业AI分析师，24小时为你服务'
]
const typingText = ref('')
let typingIndex = 0
let charIndex = 0
let typingTimer = null

const startTyping = () => {
  const currentText = taglines[typingIndex]
  if (charIndex < currentText.length) {
    typingText.value += currentText[charIndex]
    charIndex++
    typingTimer = setTimeout(startTyping, 80)
  } else {
    typingTimer = setTimeout(() => {
      typingText.value = ''
      charIndex = 0
      typingIndex = (typingIndex + 1) % taglines.length
      startTyping()
    }, 3000)
  }
}

const getDayCount = computed(() => {
  if (!preview.value) return 0
  const start = new Date(preview.value.startDate)
  const end = new Date(preview.value.endDate)
  return Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1
})

const canAnalyze = computed(() => {
  if (!preview.value) return false
  if (preview.value.tradeCount === 0 && preview.value.positionCount === 0) return false
  if (quota.value && !quota.value.unlimited && quota.value.remaining <= 0) return false
  return true
})

const parsedStrengths = computed(() => {
  if (!currentReport.value?.strengths) return []
  try { return JSON.parse(currentReport.value.strengths) } catch { return [] }
})

const parsedProblems = computed(() => {
  if (!currentReport.value?.problems) return []
  try { return JSON.parse(currentReport.value.problems) } catch { return [] }
})

const parsedSuggestions = computed(() => {
  if (!currentReport.value?.suggestions) return []
  try { return JSON.parse(currentReport.value.suggestions) } catch { return [] }
})

const getScoreClass = (score) => {
  if (!score) return ''
  if (score >= 80) return 'excellent'
  if (score >= 60) return 'good'
  if (score >= 40) return 'fair'
  return 'poor'
}

const getScoreLevel = (score) => {
  if (!score) return '暂无评分'
  if (score >= 90) return '🏆 顶级交易员'
  if (score >= 80) return '⭐ 优秀'
  if (score >= 70) return '👍 良好'
  if (score >= 60) return '📈 及格'
  if (score >= 40) return '⚠️ 需改进'
  return '🔴 需要加强'
}

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  return dateStr.replace('T', ' ').substring(0, 16)
}

const handlePeriodChange = () => {
  if (periodType.value !== 'custom') {
    const days = parseInt(periodType.value)
    const end = new Date()
    const start = new Date()
    start.setDate(start.getDate() - days + 1)
    startDate.value = formatDateStr(start)
    endDate.value = formatDateStr(end)
    loadPreview()
  }
}

const handleDateChange = () => {
  if (dateRange.value?.length === 2) {
    startDate.value = dateRange.value[0]
    endDate.value = dateRange.value[1]
    loadPreview()
  }
}

const formatDateStr = (date) => {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

const loadPreview = async () => {
  if (!startDate.value || !endDate.value) return
  previewLoading.value = true
  try {
    const res = await previewData(startDate.value, endDate.value)
    if (res.code === 200) preview.value = res.data
  } catch (error) {
    ElMessage.error('加载预览失败')
  } finally {
    previewLoading.value = false
  }
}

const startAnalyze = async () => {
  if (!canAnalyze.value) return
  analyzing.value = true
  try {
    const res = await analyzeData(startDate.value, endDate.value)
    if (res.code === 200) {
      currentReport.value = res.data
      ElMessage.success('AI分析完成！')
      loadQuota()
      loadHistory()
    }
  } catch (error) {
    ElMessage.error(error.message || '分析失败')
  } finally {
    analyzing.value = false
  }
}

const loadQuota = async () => {
  try {
    const res = await getQuota()
    if (res.code === 200) quota.value = res.data
  } catch (error) {
    console.error('加载配额失败', error)
  }
}

const loadHistory = async () => {
  historyLoading.value = true
  try {
    const res = await getReportList({ pageNum: pageNum.value, pageSize: pageSize.value })
    if (res.code === 200) {
      reportList.value = res.data.list || []
      total.value = res.data.total || 0
    }
  } catch (error) {
    console.error('加载历史失败', error)
  } finally {
    historyLoading.value = false
  }
}

const viewReport = (row) => {
  currentReport.value = row
  window.scrollTo({ top: 400, behavior: 'smooth' })
}

onMounted(() => {
  handlePeriodChange()
  loadQuota()
  loadHistory()
  startTyping()
})

onUnmounted(() => {
  if (typingTimer) clearTimeout(typingTimer)
})
</script>

<style scoped>
.xray-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #0a0a1a 0%, #1a1a3a 50%, #0a0a1a 100%);
  padding-bottom: 40px;
}

/* AI Banner */
.ai-banner {
  position: relative;
  height: 280px;
  overflow: hidden;
  background: linear-gradient(135deg, #1a1a3a 0%, #2d1b4e 50%, #1a2a4a 100%);
}

.banner-bg {
  position: absolute;
  inset: 0;
  overflow: hidden;
}

.particle {
  position: absolute;
  width: 4px;
  height: 4px;
  background: rgba(100, 200, 255, 0.6);
  border-radius: 50%;
  animation: float 8s infinite ease-in-out;
}

.particle:nth-child(odd) {
  background: rgba(180, 100, 255, 0.6);
}

.particle:nth-child(1) { left: 5%; top: 20%; animation-delay: 0s; }
.particle:nth-child(2) { left: 15%; top: 60%; animation-delay: 0.5s; }
.particle:nth-child(3) { left: 25%; top: 30%; animation-delay: 1s; }
.particle:nth-child(4) { left: 35%; top: 70%; animation-delay: 1.5s; }
.particle:nth-child(5) { left: 45%; top: 40%; animation-delay: 2s; }
.particle:nth-child(6) { left: 55%; top: 80%; animation-delay: 2.5s; }
.particle:nth-child(7) { left: 65%; top: 25%; animation-delay: 3s; }
.particle:nth-child(8) { left: 75%; top: 55%; animation-delay: 3.5s; }
.particle:nth-child(9) { left: 85%; top: 35%; animation-delay: 4s; }
.particle:nth-child(10) { left: 95%; top: 65%; animation-delay: 4.5s; }
.particle:nth-child(11) { left: 10%; top: 45%; animation-delay: 5s; }
.particle:nth-child(12) { left: 20%; top: 75%; animation-delay: 5.5s; }
.particle:nth-child(13) { left: 30%; top: 15%; animation-delay: 6s; }
.particle:nth-child(14) { left: 40%; top: 85%; animation-delay: 6.5s; }
.particle:nth-child(15) { left: 50%; top: 50%; animation-delay: 7s; }
.particle:nth-child(16) { left: 60%; top: 10%; animation-delay: 7.5s; }
.particle:nth-child(17) { left: 70%; top: 90%; animation-delay: 0.3s; }
.particle:nth-child(18) { left: 80%; top: 20%; animation-delay: 0.8s; }
.particle:nth-child(19) { left: 90%; top: 50%; animation-delay: 1.3s; }
.particle:nth-child(20) { left: 3%; top: 80%; animation-delay: 1.8s; }

@keyframes float {
  0%, 100% { transform: translateY(0) scale(1); opacity: 0.6; }
  50% { transform: translateY(-30px) scale(1.5); opacity: 1; }
}

.banner-content {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 0 40px;
  gap: 40px;
}

.ai-icon {
  position: relative;
  width: 120px;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-ring {
  position: absolute;
  border: 2px solid rgba(100, 200, 255, 0.3);
  border-radius: 50%;
  animation: pulse-ring 3s infinite ease-out;
}

.icon-ring:nth-child(1) { width: 80px; height: 80px; animation-delay: 0s; }
.icon-ring:nth-child(2) { width: 100px; height: 100px; animation-delay: 0.5s; }
.icon-ring:nth-child(3) { width: 120px; height: 120px; animation-delay: 1s; }

@keyframes pulse-ring {
  0% { transform: scale(0.8); opacity: 1; }
  100% { transform: scale(1.3); opacity: 0; }
}

.icon-text {
  font-size: 32px;
  font-weight: bold;
  background: linear-gradient(135deg, #64c8ff, #b464ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 0 30px rgba(100, 200, 255, 0.5);
}

.banner-text {
  text-align: left;
}

.banner-text h1 {
  font-size: 42px;
  font-weight: bold;
  color: #fff;
  margin: 0 0 12px 0;
  text-shadow: 0 0 20px rgba(100, 200, 255, 0.5);
}

.tagline {
  font-size: 18px;
  color: rgba(255, 255, 255, 0.8);
  margin: 0 0 16px 0;
  min-height: 28px;
}

.typing-text {
  color: #64c8ff;
}

.cursor {
  animation: blink 1s infinite;
  color: #64c8ff;
}

@keyframes blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}

.ai-features {
  display: flex;
  gap: 24px;
}

.feature {
  display: flex;
  align-items: center;
  gap: 8px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
}

.feature .dot {
  width: 6px;
  height: 6px;
  background: linear-gradient(135deg, #64c8ff, #b464ff);
  border-radius: 50%;
}

.quota-display {
  margin-left: auto;
}

.quota-card {
  background: rgba(100, 200, 255, 0.1);
  border: 1px solid rgba(100, 200, 255, 0.3);
  border-radius: 16px;
  padding: 20px 30px;
  text-align: center;
  backdrop-filter: blur(10px);
}

.quota-card.unlimited {
  border-color: rgba(100, 255, 150, 0.5);
  background: rgba(100, 255, 150, 0.1);
}

.quota-card.warning {
  border-color: rgba(255, 180, 100, 0.5);
  background: rgba(255, 180, 100, 0.1);
}

.quota-label {
  display: block;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 8px;
}

.quota-value {
  font-size: 48px;
  font-weight: bold;
  background: linear-gradient(135deg, #64c8ff, #b464ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.quota-unit {
  font-size: 20px;
  color: rgba(255, 255, 255, 0.6);
  margin-left: 4px;
}

/* Control Section */
.control-section {
  padding: 0 24px;
  margin-top: -40px;
  position: relative;
  z-index: 2;
}

.control-card {
  max-width: 900px;
  margin: 0 auto;
  background: rgba(30, 30, 60, 0.9);
  border: 1px solid rgba(100, 200, 255, 0.2);
  border-radius: 20px;
  backdrop-filter: blur(20px);
}

.control-card :deep(.el-card__body) {
  padding: 30px;
}

.control-header {
  margin-bottom: 30px;
}

.step-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0;
  margin-bottom: 12px;
}

.step {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(100, 200, 255, 0.1);
  border: 2px solid rgba(100, 200, 255, 0.3);
  color: rgba(255, 255, 255, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  transition: all 0.3s;
}

.step.active {
  background: linear-gradient(135deg, #64c8ff, #b464ff);
  border-color: transparent;
  color: #fff;
  box-shadow: 0 0 20px rgba(100, 200, 255, 0.5);
}

.step-line {
  width: 80px;
  height: 2px;
  background: rgba(100, 200, 255, 0.2);
}

.step-labels {
  display: flex;
  justify-content: center;
  gap: 80px;
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
}

.control-body {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.select-area {
  display: flex;
  align-items: flex-end;
  gap: 20px;
  flex-wrap: wrap;
}

.select-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.select-item label {
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
}

.select-item :deep(.el-select) {
  width: 160px;
  background: rgba(100, 200, 255, 0.1);
  border-radius: 8px;
}

.select-item :deep(.el-date-editor) {
  background: rgba(100, 200, 255, 0.1);
  border-radius: 8px;
}

.select-item :deep(.el-input__wrapper) {
  background: transparent;
  box-shadow: none;
  border: 1px solid rgba(100, 200, 255, 0.3);
}

.select-item :deep(.el-input__inner) {
  color: #fff;
}

.preview-btn {
  background: linear-gradient(135deg, #3a3a6a, #4a4a8a);
  border: 1px solid rgba(100, 200, 255, 0.3);
  color: #fff;
  padding: 10px 24px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
}

.preview-btn:hover {
  background: linear-gradient(135deg, #4a4a8a, #5a5aaa);
  border-color: rgba(100, 200, 255, 0.5);
}

.preview-area {
  background: rgba(100, 200, 255, 0.05);
  border: 1px solid rgba(100, 200, 255, 0.1);
  border-radius: 16px;
  padding: 24px;
}

.data-stats {
  display: flex;
  justify-content: center;
  gap: 40px;
  margin-bottom: 24px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.stat-icon {
  font-size: 32px;
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  color: #64c8ff;
}

.stat-label {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
}

.analyze-btn {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  max-width: 300px;
  margin: 0 auto;
  padding: 16px 40px;
  border: none;
  border-radius: 50px;
  background: linear-gradient(135deg, #6366f1, #8b5cf6, #a855f7);
  color: #fff;
  font-size: 18px;
  font-weight: bold;
  cursor: pointer;
  overflow: hidden;
  transition: all 0.3s;
}

.analyze-btn:not(:disabled):hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 40px rgba(139, 92, 246, 0.5);
}

.analyze-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.analyze-btn .btn-bg {
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
  transform: translateX(-100%);
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  100% { transform: translateX(100%); }
}

.analyze-btn .btn-content {
  position: relative;
  display: flex;
  align-items: center;
  gap: 10px;
}

.ai-spark {
  width: 24px;
  height: 24px;
  animation: sparkle 1.5s infinite;
}

@keyframes sparkle {
  0%, 100% { transform: scale(1) rotate(0deg); }
  50% { transform: scale(1.2) rotate(180deg); }
}

.loading-dots {
  display: flex;
  gap: 4px;
}

.loading-dots span {
  width: 8px;
  height: 8px;
  background: #fff;
  border-radius: 50%;
  animation: bounce 1.4s infinite ease-in-out;
}

.loading-dots span:nth-child(1) { animation-delay: 0s; }
.loading-dots span:nth-child(2) { animation-delay: 0.2s; }
.loading-dots span:nth-child(3) { animation-delay: 0.4s; }

@keyframes bounce {
  0%, 80%, 100% { transform: scale(0); }
  40% { transform: scale(1); }
}

.analyze-tip {
  text-align: center;
  color: rgba(255, 180, 100, 0.8);
  font-size: 14px;
  margin-top: 12px;
}

/* Result Section */
.result-section {
  max-width: 900px;
  margin: 30px auto 0;
  padding: 0 24px;
}

.result-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.result-header h2 {
  color: #fff;
  font-size: 24px;
  margin: 0;
}

.report-meta {
  color: rgba(255, 255, 255, 0.5);
  font-size: 14px;
}

.score-card {
  background: rgba(30, 30, 60, 0.9);
  border: 1px solid rgba(100, 200, 255, 0.2);
  border-radius: 20px;
  padding: 30px;
  display: flex;
  gap: 40px;
  align-items: center;
  margin-bottom: 24px;
}

.score-main {
  text-align: center;
}

.score-ring {
  position: relative;
  width: 160px;
  height: 160px;
}

.score-ring svg {
  transform: rotate(-90deg);
  width: 100%;
  height: 100%;
}

.score-ring circle {
  fill: none;
  stroke-width: 8;
  stroke-linecap: round;
}

.score-ring .bg {
  stroke: rgba(100, 200, 255, 0.1);
}

.score-ring .progress {
  stroke: url(#scoreGradient);
  stroke-dasharray: 283;
  transition: stroke-dashoffset 1s ease;
}

.score-ring.excellent .progress { stroke: #10b981; }
.score-ring.good .progress { stroke: #64c8ff; }
.score-ring.fair .progress { stroke: #f59e0b; }
.score-ring.poor .progress { stroke: #ef4444; }

.score-text {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.score-num {
  font-size: 48px;
  font-weight: bold;
  color: #fff;
}

.score-label {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
}

.score-level {
  margin-top: 12px;
  font-size: 16px;
  color: #64c8ff;
}

.metrics-grid {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.metric-card {
  background: rgba(100, 200, 255, 0.05);
  border: 1px solid rgba(100, 200, 255, 0.1);
  border-radius: 12px;
  padding: 16px;
  text-align: center;
}

.metric-icon {
  font-size: 28px;
  margin-bottom: 8px;
}

.metric-value {
  font-size: 24px;
  font-weight: bold;
  color: #fff;
}

.metric-name {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  margin-top: 4px;
}

/* Diagnosis Grid */
.diagnosis-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-bottom: 24px;
}

.diagnosis-card {
  background: rgba(30, 30, 60, 0.9);
  border: 1px solid rgba(100, 200, 255, 0.2);
  border-radius: 16px;
  padding: 20px;
}

.diagnosis-card.strengths {
  border-color: rgba(16, 185, 129, 0.3);
}

.diagnosis-card.problems {
  border-color: rgba(245, 158, 11, 0.3);
}

.diagnosis-card.suggestions {
  border-color: rgba(139, 92, 246, 0.3);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
}

.card-icon {
  font-size: 20px;
}

.card-title {
  font-size: 16px;
  font-weight: bold;
  color: #fff;
}

.card-list {
  margin: 0;
  padding-left: 20px;
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
  line-height: 1.8;
}

.card-list li {
  margin-bottom: 8px;
}

/* Full Report */
.full-report-collapse {
  background: rgba(30, 30, 60, 0.9);
  border: 1px solid rgba(100, 200, 255, 0.2);
  border-radius: 16px;
  overflow: hidden;
}

.full-report-collapse :deep(.el-collapse-item__header) {
  background: transparent;
  color: #fff;
  border: none;
  padding: 16px 20px;
}

.full-report-collapse :deep(.el-collapse-item__wrap) {
  background: transparent;
  border: none;
}

.full-report-collapse :deep(.el-collapse-item__content) {
  padding: 0 20px 20px;
}

.full-report {
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  padding: 20px;
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
  line-height: 1.8;
  white-space: pre-wrap;
  word-break: break-word;
  max-height: 400px;
  overflow-y: auto;
}

/* History Section */
.history-section {
  max-width: 900px;
  margin: 30px auto 0;
  padding: 0 24px;
}

.section-header {
  margin-bottom: 16px;
}

.section-header h3 {
  color: #fff;
  font-size: 20px;
  margin: 0;
}

.history-table {
  background: rgba(30, 30, 60, 0.9);
  border: 1px solid rgba(100, 200, 255, 0.2);
  border-radius: 16px;
  overflow: hidden;
}

.history-table :deep(.el-table__header-wrapper) {
  background: rgba(100, 200, 255, 0.1);
}

.history-table :deep(th) {
  background: transparent !important;
  color: rgba(255, 255, 255, 0.8) !important;
  border-color: rgba(100, 200, 255, 0.1) !important;
}

.history-table :deep(tr) {
  background: transparent !important;
}

.history-table :deep(td) {
  color: rgba(255, 255, 255, 0.8) !important;
  border-color: rgba(100, 200, 255, 0.1) !important;
}

.history-table :deep(.el-table__body tr:hover > td) {
  background: rgba(100, 200, 255, 0.1) !important;
}

.score-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 20px;
  font-weight: bold;
  font-size: 14px;
}

.score-badge.excellent {
  background: rgba(16, 185, 129, 0.2);
  color: #10b981;
}

.score-badge.good {
  background: rgba(100, 200, 255, 0.2);
  color: #64c8ff;
}

.score-badge.fair {
  background: rgba(245, 158, 11, 0.2);
  color: #f59e0b;
}

.score-badge.poor {
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
}

.pagination {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.pagination :deep(.el-pagination) {
  --el-pagination-bg-color: transparent;
  --el-pagination-text-color: rgba(255, 255, 255, 0.6);
  --el-pagination-button-bg-color: rgba(100, 200, 255, 0.1);
  --el-pagination-hover-color: #64c8ff;
}

/* Responsive */
@media (max-width: 768px) {
  .banner-content {
    flex-direction: column;
    text-align: center;
    gap: 20px;
    padding: 20px;
  }
  
  .ai-icon {
    width: 80px;
    height: 80px;
  }
  
  .icon-ring:nth-child(1) { width: 50px; height: 50px; }
  .icon-ring:nth-child(2) { width: 65px; height: 65px; }
  .icon-ring:nth-child(3) { width: 80px; height: 80px; }
  
  .icon-text { font-size: 24px; }
  
  .banner-text { text-align: center; }
  .banner-text h1 { font-size: 28px; }
  .tagline { font-size: 14px; }
  
  .ai-features {
    flex-direction: column;
    gap: 8px;
  }
  
  .quota-display { margin: 0; }
  .quota-card { padding: 12px 20px; }
  .quota-value { font-size: 32px; }
  
  .select-area {
    flex-direction: column;
    align-items: stretch;
  }
  
  .data-stats {
    flex-direction: column;
    gap: 16px;
  }
  
  .score-card {
    flex-direction: column;
  }
  
  .metrics-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .diagnosis-grid {
    grid-template-columns: 1fr;
  }
}
</style>
