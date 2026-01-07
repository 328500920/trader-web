<template>
  <div class="video-detail">
    <el-card v-loading="loading">
      <template #header>
        <div class="header">
          <el-button @click="$router.back()" :icon="ArrowLeft">返回</el-button>
          <span class="title">{{ video.title }}</span>
        </div>
      </template>
      
      <!-- 视频播放器 -->
      <div class="video-player">
        <video
          ref="videoRef"
          :src="getFullUrl(video.videoUrl)"
          controls
          controlsList="nodownload"
          oncontextmenu="return false"
          @timeupdate="onTimeUpdate"
          @ended="onVideoEnded"
          @loadedmetadata="onLoadedMetadata"
        ></video>
      </div>
      
      <!-- 视频信息 -->
      <div class="video-info">
        <div class="meta">
          <el-tag v-if="video.category" type="info">{{ video.category }}</el-tag>
          <span class="duration">时长: {{ formatDuration(video.duration) }}</span>
          <span class="views">{{ video.viewCount || 0 }} 次观看</span>
          <el-tag v-if="progress.isCompleted" type="success" size="small">已看完</el-tag>
        </div>
        
        <div class="tags" v-if="video.tags">
          <el-tag v-for="tag in video.tags.split(',')" :key="tag" size="small" class="tag">
            {{ tag }}
          </el-tag>
        </div>
        
        <div class="description" v-if="video.description">
          <h4>视频简介</h4>
          <p>{{ video.description }}</p>
        </div>
        
        <div class="progress-info" v-if="progress.progress > 0">
          <el-progress 
            :percentage="progressPercent" 
            :format="() => `${formatDuration(progress.progress)} / ${formatDuration(video.duration)}`"
          />
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { ArrowLeft } from '@element-plus/icons-vue'
import { getVideoDetail, updateVideoProgress } from '@/api/video'
import { ElMessage } from 'element-plus'

const route = useRoute()
const loading = ref(false)
const videoRef = ref(null)
const video = ref({})
const progress = ref({ progress: 0, isCompleted: 0 })

let saveTimer = null

const getFullUrl = (url) => {
  if (!url) return ''
  if (url.startsWith('http')) return url
  return '/api' + url
}

const progressPercent = computed(() => {
  if (!video.value.duration) return 0
  return Math.round((progress.value.progress / video.value.duration) * 100)
})

const formatDuration = (seconds) => {
  if (!seconds) return '00:00'
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  if (h > 0) {
    return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

const loadVideo = async () => {
  loading.value = true
  try {
    const res = await getVideoDetail(route.params.id)
    video.value = res.data.video || res.data
    progress.value = res.data.progress || { progress: 0, isCompleted: 0 }
  } catch (error) {
    ElMessage.error('加载视频失败')
  } finally {
    loading.value = false
  }
}

const onLoadedMetadata = () => {
  // 恢复上次观看进度
  if (progress.value.progress > 0 && videoRef.value) {
    videoRef.value.currentTime = progress.value.progress
  }
}

const onTimeUpdate = () => {
  if (videoRef.value) {
    progress.value.progress = Math.floor(videoRef.value.currentTime)
  }
}

const onVideoEnded = async () => {
  progress.value.isCompleted = 1
  await saveProgress()
  ElMessage.success('恭喜你看完了这个视频！')
}

const saveProgress = async () => {
  try {
    await updateVideoProgress(route.params.id, {
      progress: progress.value.progress,
      completed: progress.value.isCompleted === 1
    })
  } catch (error) {
    console.error('保存进度失败', error)
  }
}

onMounted(() => {
  loadVideo()
  // 每30秒自动保存进度
  saveTimer = setInterval(saveProgress, 30000)
})

onUnmounted(() => {
  if (saveTimer) clearInterval(saveTimer)
  // 离开页面时保存进度
  saveProgress()
})
</script>

<style scoped>
.video-detail {
  padding: 20px;
}

.header {
  display: flex;
  align-items: center;
  gap: 16px;
}

.header .title {
  font-size: 18px;
  font-weight: 600;
}

.video-player {
  background: #000;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 20px;
}

.video-player video {
  width: 100%;
  max-height: 70vh;
  display: block;
}

.video-info .meta {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 12px;
  color: #666;
  font-size: 14px;
}

.video-info .tags {
  margin-bottom: 16px;
}

.video-info .tags .tag {
  margin-right: 8px;
}

.video-info .description {
  background: #f5f7fa;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 16px;
}

.video-info .description h4 {
  margin: 0 0 8px 0;
  font-size: 14px;
  color: #333;
}

.video-info .description p {
  margin: 0;
  color: #666;
  line-height: 1.6;
}

.progress-info {
  margin-top: 16px;
}
</style>
