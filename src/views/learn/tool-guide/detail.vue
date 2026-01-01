<template>
  <div class="tool-detail-page" v-loading="loading">
    <!-- 顶部导航 -->
    <header class="page-header">
      <el-button class="back-btn" text @click="router.back()">
        <el-icon><ArrowLeft /></el-icon>
        <span>返回工具列表</span>
      </el-button>
      
      <div class="header-actions" v-if="tool.officialUrl">
        <el-button type="primary" @click="openOfficial">
          <el-icon><Link /></el-icon>
          访问官网
        </el-button>
      </div>
    </header>

    <!-- 工具内容 -->
    <div class="tool-content" v-if="tool.id">
      <!-- 工具头部 -->
      <div class="tool-header">
        <div class="header-logo">
          <img v-if="tool.logoUrl" :src="tool.logoUrl" :alt="tool.toolName" />
          <span v-else class="logo-placeholder">{{ getTypeIcon(tool.toolType) }}</span>
        </div>
        
        <div class="header-info">
          <div class="tool-tags">
            <el-tag :type="getTypeTagType(tool.toolType)">
              {{ getTypeName(tool.toolType) }}
            </el-tag>
            <el-tag :type="getDifficultyType(tool.difficulty)">
              {{ getDifficultyName(tool.difficulty) }}
            </el-tag>
            <el-tag v-if="tool.pricing" type="warning">{{ tool.pricing }}</el-tag>
          </div>
          
          <h1 class="tool-name">{{ tool.toolName }}</h1>
          <p class="tool-desc">{{ tool.description }}</p>
          
          <div class="tool-features" v-if="featureList.length > 0">
            <h4>主要功能</h4>
            <div class="feature-tags">
              <span v-for="(f, i) in featureList" :key="i" class="feature-tag">
                ✓ {{ f }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- 优缺点 -->
      <div class="pros-cons" v-if="tool.pros || tool.cons">
        <div class="pros-card" v-if="tool.pros">
          <h3><span class="icon">👍</span> 优点</h3>
          <p>{{ tool.pros }}</p>
        </div>
        <div class="cons-card" v-if="tool.cons">
          <h3><span class="icon">👎</span> 缺点</h3>
          <p>{{ tool.cons }}</p>
        </div>
      </div>

      <!-- 使用指南 -->
      <div class="tool-guide" v-if="tool.content">
        <h2>📖 使用指南</h2>
        <div class="guide-content">
          <MdRenderer 
            :content="tool.content" 
            :theme="themeStore.isDark ? 'dark' : 'light'"
            class="md-content"
          />
        </div>
      </div>

      <!-- 底部操作 -->
      <div class="tool-footer">
        <el-button @click="router.back()">
          <el-icon><ArrowLeft /></el-icon>
          返回列表
        </el-button>
        <el-button v-if="tool.officialUrl" type="primary" @click="openOfficial">
          <el-icon><Link /></el-icon>
          访问官网
        </el-button>
      </div>
    </div>

    <!-- 空状态 -->
    <el-empty v-if="!loading && !tool.id" description="工具不存在" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import MdRenderer from '@/components/MdRenderer/index.vue'
import { useThemeStore } from '@/store'
import { ElMessage } from 'element-plus'
import { ArrowLeft, Link } from '@element-plus/icons-vue'
import { getToolGuideDetail } from '@/api/learn'

const router = useRouter()
const route = useRoute()
const themeStore = useThemeStore()

const loading = ref(false)
const tool = ref({})

const featureList = computed(() => {
  if (!tool.value.features) return []
  try {
    return JSON.parse(tool.value.features)
  } catch {
    return []
  }
})

const getTypeIcon = (type) => {
  const icons = { chart: '📊', exchange: '🏦', data: '📈', sentiment: '😊', record: '📝' }
  return icons[type] || '🛠️'
}

const getTypeName = (type) => {
  const names = { chart: '图表工具', exchange: '交易所', data: '数据平台', sentiment: '情绪指标', record: '记录工具' }
  return names[type] || '工具'
}

const getTypeTagType = (type) => {
  const types = { chart: 'primary', exchange: 'success', data: 'warning', sentiment: 'info', record: '' }
  return types[type] || ''
}

const getDifficultyName = (level) => {
  const names = { 1: '简单', 2: '中等', 3: '复杂' }
  return names[level] || '未知'
}

const getDifficultyType = (level) => {
  const types = { 1: 'success', 2: 'warning', 3: 'danger' }
  return types[level] || ''
}

const loadTool = async () => {
  const id = route.params.id
  if (!id) return
  
  loading.value = true
  try {
    const res = await getToolGuideDetail(id)
    if (res.code === 200) {
      tool.value = res.data || {}
    }
  } catch (error) {
    ElMessage.error('加载工具失败')
  } finally {
    loading.value = false
  }
}

const openOfficial = () => {
  if (tool.value.officialUrl) {
    window.open(tool.value.officialUrl, '_blank')
  }
}

watch(() => route.params.id, loadTool)

onMounted(loadTool)
</script>

<style lang="scss" scoped>
.tool-detail-page {
  min-height: 100vh;
  background: var(--bg-secondary);
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
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

.tool-content {
  max-width: 900px;
  margin: 0 auto;
  padding: 24px;
}

.tool-header {
  display: flex;
  gap: 24px;
  background: var(--bg-primary);
  border-radius: 16px;
  padding: 32px;
  margin-bottom: 24px;
  box-shadow: 0 2px 12px var(--shadow-color);
  
  @media (max-width: 600px) {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
}

.header-logo {
  width: 120px;
  height: 120px;
  flex-shrink: 0;
  border-radius: 24px;
  overflow: hidden;
  background: var(--bg-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  .logo-placeholder {
    font-size: 60px;
  }
}

.header-info {
  flex: 1;
}

.tool-tags {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
  flex-wrap: wrap;
  
  @media (max-width: 600px) {
    justify-content: center;
  }
}

.tool-name {
  font-size: 28px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 12px;
}

.tool-desc {
  font-size: 15px;
  color: var(--text-secondary);
  line-height: 1.8;
  margin-bottom: 20px;
}

.tool-features {
  h4 {
    font-size: 14px;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 12px;
  }
}

.feature-tags {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.feature-tag {
  font-size: 13px;
  padding: 6px 14px;
  background: rgba(64, 158, 255, 0.1);
  border-radius: 16px;
  color: var(--primary-color);
}

.pros-cons {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-bottom: 24px;
  
  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
}

.pros-card, .cons-card {
  background: var(--bg-primary);
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px var(--shadow-color);
  
  h3 {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 16px;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 12px;
    
    .icon { font-size: 20px; }
  }
  
  p {
    font-size: 14px;
    color: var(--text-secondary);
    line-height: 1.8;
  }
}

.pros-card {
  border-left: 4px solid #67c23a;
}

.cons-card {
  border-left: 4px solid #f56c6c;
}

.tool-guide {
  background: var(--bg-primary);
  border-radius: 16px;
  padding: 32px;
  margin-bottom: 24px;
  box-shadow: 0 2px 12px var(--shadow-color);
  
  h2 {
    font-size: 20px;
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: 24px;
    padding-bottom: 12px;
    border-bottom: 2px solid var(--primary-color);
  }
}

.guide-content {
  .md-content {
    :deep(h2), :deep(h3) {
      margin-top: 24px;
      margin-bottom: 12px;
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
    
    :deep(img) {
      max-width: 100%;
      border-radius: 8px;
      margin: 16px 0;
    }
  }
}

.tool-footer {
  display: flex;
  justify-content: space-between;
  padding: 24px;
  background: var(--bg-primary);
  border-radius: 12px;
  box-shadow: 0 2px 8px var(--shadow-color);
}
</style>
