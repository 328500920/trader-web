<template>
  <div class="case-detail-page" v-loading="loading">
    <!-- 顶部导航 -->
    <header class="page-header">
      <el-button class="back-btn" text @click="router.back()">
        <el-icon><ArrowLeft /></el-icon>
        <span>返回案例库</span>
      </el-button>
      
      <div class="header-actions">
        <el-button v-if="caseData.chapter" text @click="goToChapter">
          <el-icon><Reading /></el-icon>
          查看相关章节
        </el-button>
      </div>
    </header>

    <!-- 案例内容 -->
    <div class="case-content" v-if="caseData.id">
      <!-- 案例头部信息 -->
      <div class="case-header">
        <div class="case-type-badge" :class="caseData.caseType">
          <span v-if="caseData.caseType === 'success'">✅ 成功案例</span>
          <span v-else-if="caseData.caseType === 'failure'">❌ 失败案例</span>
          <span v-else>🔍 分析案例</span>
        </div>
        
        <h1 class="case-title">{{ caseData.title }}</h1>
        
        <div class="case-meta">
          <div class="meta-item" v-if="caseData.symbol">
            <el-icon><Coin /></el-icon>
            <span>{{ caseData.symbol }}</span>
          </div>
          <div class="meta-item" v-if="caseData.timeframe">
            <el-icon><Timer /></el-icon>
            <span>{{ caseData.timeframe }}</span>
          </div>
          <div class="meta-item" v-if="caseData.entryDate">
            <el-icon><Calendar /></el-icon>
            <span>{{ caseData.entryDate }}</span>
          </div>
          <div class="meta-item" v-if="caseData.chapter">
            <el-icon><Reading /></el-icon>
            <span>{{ caseData.chapter.title }}</span>
          </div>
        </div>
      </div>

      <!-- 案例主体 -->
      <div class="case-body">
        <!-- 结构化信息卡片 -->
        <div class="info-cards">
          <!-- 案例背景 -->
          <div class="info-card" v-if="caseData.background">
            <div class="card-header">
              <span class="card-icon">📋</span>
              <h3>案例背景</h3>
            </div>
            <div class="card-content">
              <p>{{ caseData.background }}</p>
            </div>
          </div>

          <!-- 分析过程 -->
          <div class="info-card" v-if="caseData.analysis">
            <div class="card-header">
              <span class="card-icon">🔍</span>
              <h3>分析过程</h3>
            </div>
            <div class="card-content">
              <p>{{ caseData.analysis }}</p>
            </div>
          </div>

          <!-- 入场设置 -->
          <div class="info-card" v-if="caseData.entrySetup">
            <div class="card-header">
              <span class="card-icon">🎯</span>
              <h3>入场设置</h3>
            </div>
            <div class="card-content">
              <p>{{ caseData.entrySetup }}</p>
            </div>
          </div>

          <!-- 实际结果 -->
          <div class="info-card result-card" :class="caseData.caseType" v-if="caseData.result">
            <div class="card-header">
              <span class="card-icon">📊</span>
              <h3>实际结果</h3>
            </div>
            <div class="card-content">
              <p>{{ caseData.result }}</p>
            </div>
          </div>

          <!-- 经验总结 -->
          <div class="info-card lessons-card" v-if="caseData.lessons">
            <div class="card-header">
              <span class="card-icon">💡</span>
              <h3>经验总结</h3>
            </div>
            <div class="card-content">
              <p>{{ caseData.lessons }}</p>
            </div>
          </div>
        </div>

        <!-- 完整内容（Markdown） -->
        <div class="full-content" v-if="caseData.content">
          <div class="content-header">
            <span class="content-icon">📝</span>
            <h3>详细分析</h3>
          </div>
          <div class="content-body">
            <MdRenderer 
              :content="caseData.content" 
              :theme="themeStore.isDark ? 'dark' : 'light'"
              class="md-content"
            />
          </div>
        </div>

        <!-- 案例图片 -->
        <div class="case-images" v-if="imageList.length > 0">
          <div class="images-header">
            <span class="images-icon">🖼️</span>
            <h3>相关图表</h3>
          </div>
          <div class="images-grid">
            <el-image
              v-for="(img, index) in imageList"
              :key="index"
              :src="img"
              :preview-src-list="imageList"
              :initial-index="index"
              fit="cover"
              class="case-image"
            />
          </div>
        </div>
      </div>

      <!-- 底部导航 -->
      <div class="case-footer">
        <el-button @click="router.back()">
          <el-icon><ArrowLeft /></el-icon>
          返回列表
        </el-button>
        <el-button v-if="caseData.chapter" type="primary" @click="goToChapter">
          <el-icon><Reading /></el-icon>
          学习相关章节
        </el-button>
      </div>
    </div>

    <!-- 空状态 -->
    <el-empty v-if="!loading && !caseData.id" description="案例不存在" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import MdRenderer from '@/components/MdRenderer/index.vue'
import { useThemeStore } from '@/store'
import { ElMessage } from 'element-plus'
import { ArrowLeft, Reading, Coin, Timer, Calendar } from '@element-plus/icons-vue'
import { getCaseDetail } from '@/api/learn'

const router = useRouter()
const route = useRoute()
const themeStore = useThemeStore()

const loading = ref(false)
const caseData = ref({})

const imageList = computed(() => {
  if (!caseData.value.imageUrls) return []
  try {
    return JSON.parse(caseData.value.imageUrls)
  } catch {
    return []
  }
})

const loadCase = async () => {
  const id = route.params.id
  if (!id) return
  
  loading.value = true
  try {
    const res = await getCaseDetail(id)
    if (res.code === 200) {
      caseData.value = res.data || {}
    }
  } catch (error) {
    ElMessage.error('加载案例失败')
  } finally {
    loading.value = false
  }
}

const goToChapter = () => {
  if (caseData.value.chapter?.id) {
    router.push(`/learn/chapter/${caseData.value.chapter.id}`)
  }
}

watch(() => route.params.id, loadCase)

onMounted(loadCase)
</script>

<style lang="scss" scoped>
.case-detail-page {
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
    
    &:hover {
      color: var(--primary-color);
    }
    
    span {
      margin-left: 4px;
    }
  }
}

.case-content {
  max-width: 900px;
  margin: 0 auto;
  padding: 24px;
}

.case-header {
  background: var(--bg-primary);
  border-radius: 16px;
  padding: 32px;
  margin-bottom: 24px;
  box-shadow: 0 2px 12px var(--shadow-color);
}

.case-type-badge {
  display: inline-block;
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 16px;
  
  &.success {
    background: rgba(103, 194, 58, 0.1);
    color: #67c23a;
  }
  
  &.failure {
    background: rgba(245, 108, 108, 0.1);
    color: #f56c6c;
  }
  
  &.analysis {
    background: rgba(64, 158, 255, 0.1);
    color: #409eff;
  }
}

.case-title {
  font-size: 28px;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1.4;
  margin-bottom: 20px;
}

.case-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: var(--text-secondary);
  
  .el-icon {
    color: var(--primary-color);
  }
}

.case-body {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.info-cards {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.info-card {
  background: var(--bg-primary);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px var(--shadow-color);
  
  .card-header {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 16px 20px;
    background: var(--bg-secondary);
    border-bottom: 1px solid var(--border-light);
    
    .card-icon {
      font-size: 20px;
    }
    
    h3 {
      font-size: 16px;
      font-weight: 600;
      color: var(--text-primary);
      margin: 0;
    }
  }
  
  .card-content {
    padding: 20px;
    
    p {
      font-size: 15px;
      line-height: 1.8;
      color: var(--text-primary);
      margin: 0;
      white-space: pre-wrap;
    }
  }
  
  &.result-card {
    &.success {
      border-left: 4px solid #67c23a;
      
      .card-header {
        background: rgba(103, 194, 58, 0.08);
      }
    }
    
    &.failure {
      border-left: 4px solid #f56c6c;
      
      .card-header {
        background: rgba(245, 108, 108, 0.08);
      }
    }
  }
  
  &.lessons-card {
    border-left: 4px solid #e6a23c;
    
    .card-header {
      background: rgba(230, 162, 60, 0.08);
    }
    
    .card-content p {
      font-weight: 500;
    }
  }
}

.full-content {
  background: var(--bg-primary);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px var(--shadow-color);
  
  .content-header {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 16px 20px;
    background: var(--bg-secondary);
    border-bottom: 1px solid var(--border-light);
    
    .content-icon {
      font-size: 20px;
    }
    
    h3 {
      font-size: 16px;
      font-weight: 600;
      color: var(--text-primary);
      margin: 0;
    }
  }
  
  .content-body {
    padding: 24px;
    
    .md-content {
      :deep(h2), :deep(h3), :deep(h4) {
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
    }
  }
}

.case-images {
  background: var(--bg-primary);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px var(--shadow-color);
  
  .images-header {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 16px 20px;
    background: var(--bg-secondary);
    border-bottom: 1px solid var(--border-light);
    
    .images-icon {
      font-size: 20px;
    }
    
    h3 {
      font-size: 16px;
      font-weight: 600;
      color: var(--text-primary);
      margin: 0;
    }
  }
  
  .images-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 16px;
    padding: 20px;
  }
  
  .case-image {
    width: 100%;
    height: 150px;
    border-radius: 8px;
    cursor: pointer;
    transition: transform 0.2s;
    
    &:hover {
      transform: scale(1.02);
    }
  }
}

.case-footer {
  display: flex;
  justify-content: space-between;
  padding: 24px;
  background: var(--bg-primary);
  border-radius: 12px;
  margin-top: 24px;
  box-shadow: 0 2px 8px var(--shadow-color);
}
</style>
