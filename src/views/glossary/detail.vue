<template>
  <div class="detail-page" v-loading="loading">
    <!-- 页面头部 -->
    <div class="page-header">
      <el-button text @click="$router.back()">
        <el-icon><ArrowLeft /></el-icon>
        返回
      </el-button>
      <el-button 
        :type="term.isFavorite ? 'warning' : 'default'"
        @click="handleFavorite"
      >
        <el-icon><Star /></el-icon>
        {{ term.isFavorite ? '已收藏' : '收藏' }}
      </el-button>
    </div>

    <div class="term-content" v-if="term.id">
      <!-- 术语标题 -->
      <div class="term-header">
        <h1>{{ term.name }}</h1>
        <p class="name-en" v-if="term.nameEn">{{ term.nameEn }}</p>
        <div class="term-meta">
          <el-tag type="info">{{ term.categoryName }}</el-tag>
          <el-tag :type="getDifficultyType(term.difficulty)">
            {{ getDifficultyText(term.difficulty) }}
          </el-tag>
        </div>
      </div>

      <!-- 简短定义 -->
      <div class="section definition">
        <h3>📝 定义</h3>
        <p>{{ term.brief }}</p>
      </div>

      <!-- 详细解释 -->
      <div class="section" v-if="term.detail">
        <h3>📖 详细解释</h3>
        <MdPreview :modelValue="term.detail" />
      </div>

      <!-- 应用场景 -->
      <div class="section" v-if="term.application">
        <h3>💡 应用场景</h3>
        <MdPreview :modelValue="term.application" />
      </div>

      <!-- 示例 -->
      <div class="section example" v-if="term.example">
        <h3>📌 示例</h3>
        <div class="example-box">
          {{ term.example }}
        </div>
      </div>

      <!-- 相关术语 -->
      <div class="section" v-if="relatedTerms.length > 0">
        <h3>🔗 相关术语</h3>
        <div class="related-tags">
          <el-tag 
            v-for="t in relatedTerms" 
            :key="t.id"
            class="related-tag"
            @click="goToTerm(t.id)"
          >
            {{ t.name }}
          </el-tag>
        </div>
      </div>

      <!-- 标签 -->
      <div class="section" v-if="term.tags">
        <h3>🏷️ 标签</h3>
        <div class="tag-list">
          <el-tag 
            v-for="tag in parseTags(term.tags)" 
            :key="tag"
            type="info"
          >
            {{ tag }}
          </el-tag>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft, Star } from '@element-plus/icons-vue'
import { getTermById, toggleFavorite } from '@/api/glossary'
import { MdPreview } from 'md-editor-v3'
import 'md-editor-v3/lib/preview.css'

const route = useRoute()
const router = useRouter()

const loading = ref(false)
const term = ref({})
const relatedTerms = ref([])

// 加载术语详情
const loadTerm = async (id) => {
  loading.value = true
  try {
    const res = await getTermById(id)
    if (res.code === 200) {
      term.value = res.data || {}
      // 加载相关术语
      if (term.value.relatedTerms) {
        loadRelatedTerms(term.value.relatedTerms)
      }
    }
  } catch (error) {
    console.error('加载术语失败:', error)
  } finally {
    loading.value = false
  }
}

// 加载相关术语
const loadRelatedTerms = async (relatedIds) => {
  try {
    const ids = JSON.parse(relatedIds)
    if (ids.length === 0) return
    
    // 简单实现：逐个获取
    const terms = []
    for (const id of ids.slice(0, 5)) {
      const res = await getTermById(id)
      if (res.code === 200 && res.data) {
        terms.push({ id: res.data.id, name: res.data.name })
      }
    }
    relatedTerms.value = terms
  } catch (error) {
    console.error('加载相关术语失败:', error)
  }
}

// 收藏
const handleFavorite = async () => {
  try {
    const res = await toggleFavorite(term.value.id)
    if (res.code === 200) {
      term.value.isFavorite = res.data.isFavorite
      ElMessage.success(res.data.isFavorite ? '已收藏' : '已取消收藏')
    }
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

const goToTerm = (id) => {
  router.push(`/glossary/term/${id}`)
}

const getDifficultyType = (d) => {
  const types = { 1: 'success', 2: 'warning', 3: 'danger' }
  return types[d] || 'info'
}

const getDifficultyText = (d) => {
  const texts = { 1: '入门', 2: '进阶', 3: '高级' }
  return texts[d] || '未知'
}

const parseTags = (tags) => {
  if (!tags) return []
  try {
    return JSON.parse(tags)
  } catch {
    return []
  }
}

watch(() => route.params.id, (newId) => {
  if (newId) {
    loadTerm(Number(newId))
    relatedTerms.value = []
  }
}, { immediate: true })

onMounted(() => {
  loadTerm(Number(route.params.id))
})
</script>

<style lang="scss" scoped>
.detail-page {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.term-content {
  background: var(--bg-primary);
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 2px 12px var(--shadow-color);
}

.term-header {
  text-align: center;
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 1px solid var(--border-light);

  h1 {
    font-size: 28px;
    font-weight: 700;
    color: var(--text-primary);
    margin: 0 0 8px;
  }

  .name-en {
    font-size: 16px;
    color: var(--text-secondary);
    margin: 0 0 16px;
  }

  .term-meta {
    display: flex;
    justify-content: center;
    gap: 8px;
  }
}

.section {
  margin-bottom: 28px;

  h3 {
    font-size: 16px;
    font-weight: 600;
    color: var(--text-primary);
    margin: 0 0 12px;
  }

  p {
    font-size: 15px;
    color: var(--text-primary);
    line-height: 1.7;
    margin: 0;
  }

  &.definition {
    background: var(--bg-secondary);
    padding: 20px;
    border-radius: 12px;
    border-left: 4px solid var(--primary-color);
  }
}

.example-box {
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.1), rgba(103, 194, 58, 0.1));
  padding: 20px;
  border-radius: 12px;
  font-size: 15px;
  color: var(--text-primary);
  line-height: 1.7;
  border: 1px solid rgba(64, 158, 255, 0.2);
}

.related-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.related-tag {
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    transform: translateY(-2px);
  }
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
</style>
