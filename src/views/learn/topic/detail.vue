<template>
  <div class="topic-detail-page" v-loading="loading">
    <!-- 顶部导航 -->
    <header class="page-header">
      <el-button class="back-btn" text @click="router.back()">
        <el-icon><ArrowLeft /></el-icon>
        <span>返回专题列表</span>
      </el-button>
    </header>

    <!-- 专题内容 -->
    <div class="topic-content" v-if="topic.id">
      <!-- 专题头部 -->
      <div class="topic-header">
        <div class="header-cover" v-if="topic.coverImage">
          <img :src="topic.coverImage" :alt="topic.title" />
        </div>
        <div class="header-cover placeholder" v-else>
          <span>{{ getTypeIcon(topic.topicType) }}</span>
        </div>
        
        <div class="header-info">
          <div class="topic-tags">
            <el-tag :type="getTypeTagType(topic.topicType)">
              {{ getTypeName(topic.topicType) }}
            </el-tag>
            <el-tag :type="getDifficultyType(topic.difficulty)">
              {{ getDifficultyName(topic.difficulty) }}
            </el-tag>
          </div>
          
          <h1 class="topic-title">{{ topic.title }}</h1>
          <p class="topic-subtitle" v-if="topic.subtitle">{{ topic.subtitle }}</p>
          
          <div class="topic-meta">
            <span class="meta-item" v-if="topic.estimatedTime">
              <el-icon><Clock /></el-icon>
              预计 {{ topic.estimatedTime }} 分钟
            </span>
            <span class="meta-item" v-if="topic.relatedWeek">
              <el-icon><Calendar /></el-icon>
              关联第 {{ topic.relatedWeek }} 周
            </span>
          </div>
          
          <p class="topic-desc" v-if="topic.description">{{ topic.description }}</p>
        </div>
      </div>

      <!-- 专题正文 -->
      <div class="topic-body" v-if="topic.content">
        <MdRenderer 
          :content="topic.content" 
          :theme="themeStore.isDark ? 'dark' : 'light'"
          class="md-content"
        />
      </div>

      <!-- 底部导航 -->
      <div class="topic-footer">
        <el-button @click="router.back()">
          <el-icon><ArrowLeft /></el-icon>
          返回列表
        </el-button>
        <el-button v-if="topic.relatedWeek" type="primary" @click="goToWeek">
          <el-icon><Reading /></el-icon>
          查看第 {{ topic.relatedWeek }} 周课程
        </el-button>
      </div>
    </div>

    <!-- 空状态 -->
    <el-empty v-if="!loading && !topic.id" description="专题不存在" />
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import MdRenderer from '@/components/MdRenderer/index.vue'
import { useThemeStore } from '@/store'
import { ElMessage } from 'element-plus'
import { ArrowLeft, Clock, Calendar, Reading } from '@element-plus/icons-vue'
import { getTopicDetail } from '@/api/learn'

const router = useRouter()
const route = useRoute()
const themeStore = useThemeStore()

const loading = ref(false)
const topic = ref({})

const getTypeIcon = (type) => {
  const icons = { supplement: '📝', advanced: '🚀', special: '⭐' }
  return icons[type] || '📖'
}

const getTypeName = (type) => {
  const names = { supplement: '补充内容', advanced: '进阶内容', special: '特别专题' }
  return names[type] || '专题'
}

const getTypeTagType = (type) => {
  const types = { supplement: 'info', advanced: 'warning', special: 'success' }
  return types[type] || ''
}

const getDifficultyName = (level) => {
  const names = { 1: '入门', 2: '进阶', 3: '高级' }
  return names[level] || '未知'
}

const getDifficultyType = (level) => {
  const types = { 1: 'success', 2: 'warning', 3: 'danger' }
  return types[level] || ''
}

const loadTopic = async () => {
  const id = route.params.id
  if (!id) return
  
  loading.value = true
  try {
    const res = await getTopicDetail(id)
    if (res.code === 200) {
      topic.value = res.data || {}
    }
  } catch (error) {
    ElMessage.error('加载专题失败')
  } finally {
    loading.value = false
  }
}

const goToWeek = () => {
  // 跳转到对应周的课程
  router.push('/learn/course')
}

watch(() => route.params.id, loadTopic)

onMounted(loadTopic)
</script>

<style lang="scss" scoped>
.topic-detail-page {
  min-height: 100vh;
  background: var(--bg-secondary);
}

.page-header {
  padding: 16px 24px;
  background: var(--bg-primary);
  border-bottom: 1px solid var(--border-light);
  position: sticky;
  top: 0;
  z-index: 100;
  
  .back-btn {
    color: var(--text-secondary);
    
    &:hover { color: var(--primary-color); }
    span { margin-left: 4px; }
  }
}

.topic-content {
  max-width: 900px;
  margin: 0 auto;
  padding: 24px;
}

.topic-header {
  background: var(--bg-primary);
  border-radius: 16px;
  overflow: hidden;
  margin-bottom: 24px;
  box-shadow: 0 2px 12px var(--shadow-color);
}

.header-cover {
  height: 240px;
  overflow: hidden;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  &.placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    
    span { font-size: 80px; }
  }
}

.header-info {
  padding: 24px 32px;
}

.topic-tags {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

.topic-title {
  font-size: 28px;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1.4;
  margin-bottom: 8px;
}

.topic-subtitle {
  font-size: 16px;
  color: var(--primary-color);
  margin-bottom: 16px;
}

.topic-meta {
  display: flex;
  gap: 24px;
  margin-bottom: 16px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: var(--text-secondary);
  
  .el-icon { color: var(--primary-color); }
}

.topic-desc {
  font-size: 15px;
  color: var(--text-secondary);
  line-height: 1.8;
}

.topic-body {
  background: var(--bg-primary);
  border-radius: 16px;
  padding: 32px;
  margin-bottom: 24px;
  box-shadow: 0 2px 12px var(--shadow-color);
  
  .md-content {
    :deep(h2) {
      font-size: 22px;
      font-weight: 700;
      margin: 32px 0 16px;
      padding-bottom: 8px;
      border-bottom: 2px solid var(--primary-color);
    }
    
    :deep(h3) {
      font-size: 18px;
      font-weight: 600;
      margin: 24px 0 12px;
    }
    
    :deep(p) {
      line-height: 1.8;
      margin-bottom: 16px;
    }
    
    :deep(ul), :deep(ol) {
      padding-left: 20px;
      margin-bottom: 16px;
      
      li {
        line-height: 1.8;
        margin-bottom: 8px;
      }
    }
    
    :deep(blockquote) {
      border-left: 4px solid var(--primary-color);
      padding: 12px 20px;
      margin: 16px 0;
      background: var(--bg-secondary);
      border-radius: 0 8px 8px 0;
    }
    
    :deep(code) {
      background: rgba(64, 158, 255, 0.1);
      color: var(--primary-color);
      padding: 2px 6px;
      border-radius: 4px;
    }
    
    :deep(pre) {
      background: var(--bg-secondary);
      padding: 16px;
      border-radius: 8px;
      overflow-x: auto;
      
      code {
        background: none;
        color: inherit;
        padding: 0;
      }
    }
  }
}

.topic-footer {
  display: flex;
  justify-content: space-between;
  padding: 24px;
  background: var(--bg-primary);
  border-radius: 12px;
  box-shadow: 0 2px 8px var(--shadow-color);
}
</style>
