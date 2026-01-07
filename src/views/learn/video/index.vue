<template>
  <div class="video-course-page">
    <!-- 顶部统计 -->
    <div class="stats-banner">
      <div class="stat-item">
        <div class="stat-value">{{ stats.watchedCount || 0 }}</div>
        <div class="stat-label">已观看</div>
      </div>
      <div class="stat-item">
        <div class="stat-value">{{ stats.completedCount || 0 }}</div>
        <div class="stat-label">已完成</div>
      </div>
      <div class="stat-item">
        <div class="stat-value">{{ formatDuration(stats.totalWatchTime || 0) }}</div>
        <div class="stat-label">学习时长</div>
      </div>
    </div>

    <!-- 分类筛选 -->
    <div class="filter-bar">
      <el-radio-group v-model="currentCategory" @change="handleCategoryChange">
        <el-radio-button label="">全部</el-radio-button>
        <el-radio-button v-for="cat in categories" :key="cat" :label="cat">
          {{ cat }}
        </el-radio-button>
      </el-radio-group>
    </div>

    <!-- 视频列表 -->
    <div class="video-grid" v-loading="loading">
      <div 
        v-for="video in videoList" 
        :key="video.id" 
        class="video-card"
        @click="playVideo(video)"
      >
        <div class="video-cover">
          <img v-if="video.coverUrl" :src="getFullUrl(video.coverUrl)" alt="封面" />
          <div v-else class="cover-placeholder">
            <el-icon><VideoPlay /></el-icon>
          </div>
          <div class="video-duration">{{ formatDuration(video.duration) }}</div>
          <div v-if="video.isCompleted" class="completed-badge">
            <el-icon><CircleCheckFilled /></el-icon>
          </div>
          <div v-else-if="video.userProgress > 0" class="progress-bar">
            <div class="progress-fill" :style="{ width: getProgressPercent(video) + '%' }"></div>
          </div>
        </div>
        <div class="video-info">
          <h3 class="video-title">{{ video.title }}</h3>
          <p class="video-desc">{{ video.description || '暂无描述' }}</p>
          <div class="video-meta">
            <span v-if="video.category" class="category-tag">{{ video.category }}</span>
            <span class="view-count">
              <el-icon><View /></el-icon>
              {{ video.viewCount || 0 }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <el-empty v-if="!loading && videoList.length === 0" description="暂无视频课程" />

    <!-- 分页 -->
    <div class="pagination" v-if="total > pageSize">
      <el-pagination
        v-model:current-page="pageNum"
        v-model:page-size="pageSize"
        :total="total"
        layout="prev, pager, next"
        @current-change="loadVideos"
      />
    </div>

    <!-- 视频播放弹窗 -->
    <el-dialog 
      v-model="showPlayer" 
      :title="currentVideo?.title" 
      width="80%" 
      :close-on-click-modal="false"
      @close="handlePlayerClose"
      class="video-player-dialog"
    >
      <div class="player-container">
        <video 
          ref="videoRef"
          :src="getFullUrl(currentVideo?.videoUrl)"
          controls
          controlsList="nodownload"
          oncontextmenu="return false"
          @timeupdate="handleTimeUpdate"
          @ended="handleVideoEnded"
          @loadedmetadata="handleVideoLoaded"
        ></video>
      </div>
      <div class="video-detail">
        <p class="description">{{ currentVideo?.description }}</p>
        <div class="tags" v-if="currentVideo?.tags">
          <el-tag v-for="tag in currentVideo.tags.split(',')" :key="tag" size="small">
            {{ tag }}
          </el-tag>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { VideoPlay, View, CircleCheckFilled } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { getVideoList, getVideoCategories, getVideoStats, updateVideoProgress } from '@/api/video'

const loading = ref(false)
const videoList = ref([])
const categories = ref([])
const stats = ref({})
const currentCategory = ref('')
const pageNum = ref(1)
const pageSize = ref(12)
const total = ref(0)

const showPlayer = ref(false)
const currentVideo = ref(null)
const videoRef = ref(null)
let progressTimer = null

const getFullUrl = (url) => {
  if (!url) return ''
  if (url.startsWith('http')) return url
  // 视频和图片通过后端静态资源访问，需要加上 /api 前缀
  return '/api' + url
}

const formatDuration = (seconds) => {
  if (!seconds) return '00:00'
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0) {
    return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

const getProgressPercent = (video) => {
  if (!video.duration || !video.userProgress) return 0
  return Math.min(100, (video.userProgress / video.duration) * 100)
}

const loadVideos = async () => {
  loading.value = true
  try {
    const res = await getVideoList({
      pageNum: pageNum.value,
      pageSize: pageSize.value,
      category: currentCategory.value || undefined
    })
    if (res.code === 200) {
      videoList.value = res.data.list || []
      total.value = res.data.total || 0
    }
  } catch (error) {
    ElMessage.error('加载视频列表失败')
  } finally {
    loading.value = false
  }
}

const loadCategories = async () => {
  try {
    const res = await getVideoCategories()
    if (res.code === 200) {
      categories.value = res.data || []
    }
  } catch (error) {
    console.error('加载分类失败', error)
  }
}

const loadStats = async () => {
  try {
    const res = await getVideoStats()
    if (res.code === 200) {
      stats.value = res.data || {}
    }
  } catch (error) {
    console.error('加载统计失败', error)
  }
}

const handleCategoryChange = () => {
  pageNum.value = 1
  loadVideos()
}

const playVideo = (video) => {
  currentVideo.value = video
  showPlayer.value = true
}

const handleVideoLoaded = () => {
  // 恢复上次观看进度
  if (videoRef.value && currentVideo.value?.userProgress) {
    videoRef.value.currentTime = currentVideo.value.userProgress
  }
}

const handleTimeUpdate = () => {
  // 节流保存进度
  if (!progressTimer) {
    progressTimer = setTimeout(() => {
      saveProgress()
      progressTimer = null
    }, 5000) // 每5秒保存一次
  }
}

const handleVideoEnded = () => {
  saveProgress(true)
  ElMessage.success('视频播放完成！')
}

const saveProgress = async (completed = false) => {
  if (!videoRef.value || !currentVideo.value) return
  
  const progress = Math.floor(videoRef.value.currentTime)
  try {
    await updateVideoProgress(currentVideo.value.id, {
      progress,
      completed
    })
    
    // 更新本地数据
    const video = videoList.value.find(v => v.id === currentVideo.value.id)
    if (video) {
      video.userProgress = progress
      if (completed) {
        video.isCompleted = true
      }
    }
  } catch (error) {
    console.error('保存进度失败', error)
  }
}

const handlePlayerClose = () => {
  // 关闭时保存进度
  saveProgress()
  if (progressTimer) {
    clearTimeout(progressTimer)
    progressTimer = null
  }
  // 刷新统计
  loadStats()
}

onMounted(() => {
  loadVideos()
  loadCategories()
  loadStats()
})

onUnmounted(() => {
  if (progressTimer) {
    clearTimeout(progressTimer)
  }
})
</script>

<style lang="scss" scoped>
.video-course-page {
  padding: 20px;
}

.stats-banner {
  display: flex;
  gap: 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  color: white;
}

.stat-item {
  text-align: center;
  min-width: 100px;
  
  .stat-value {
    font-size: 28px;
    font-weight: 700;
  }
  
  .stat-label {
    font-size: 14px;
    opacity: 0.9;
    margin-top: 4px;
  }
}

.filter-bar {
  margin-bottom: 24px;
}

.video-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
}

.video-card {
  background: var(--bg-primary);
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 2px 8px var(--shadow-color);
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px var(--shadow-color);
  }
}

.video-cover {
  position: relative;
  aspect-ratio: 16 / 9;
  background: #000;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  .cover-placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #1a1a2e, #16213e);
    
    .el-icon {
      font-size: 48px;
      color: rgba(255, 255, 255, 0.5);
    }
  }
  
  .video-duration {
    position: absolute;
    bottom: 8px;
    right: 8px;
    background: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 12px;
  }
  
  .completed-badge {
    position: absolute;
    top: 8px;
    right: 8px;
    background: #67c23a;
    color: white;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .progress-bar {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: rgba(255, 255, 255, 0.3);
    
    .progress-fill {
      height: 100%;
      background: #409eff;
    }
  }
}

.video-info {
  padding: 16px;
  
  .video-title {
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 8px;
    color: var(--text-primary);
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  
  .video-desc {
    font-size: 13px;
    color: var(--text-secondary);
    margin-bottom: 12px;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  
  .video-meta {
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 12px;
    color: var(--text-secondary);
    
    .category-tag {
      background: var(--bg-secondary);
      padding: 2px 8px;
      border-radius: 4px;
    }
    
    .view-count {
      display: flex;
      align-items: center;
      gap: 4px;
    }
  }
}

.pagination {
  margin-top: 24px;
  display: flex;
  justify-content: center;
}

.video-player-dialog {
  :deep(.el-dialog__body) {
    padding: 0;
  }
}

.player-container {
  background: #000;
  
  video {
    width: 100%;
    max-height: 70vh;
    display: block;
  }
}

.video-detail {
  padding: 20px;
  
  .description {
    color: var(--text-secondary);
    margin-bottom: 12px;
  }
  
  .tags {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }
}

@media (max-width: 768px) {
  .stats-banner {
    flex-wrap: wrap;
    justify-content: center;
  }
  
  .video-grid {
    grid-template-columns: 1fr;
  }
}
</style>
