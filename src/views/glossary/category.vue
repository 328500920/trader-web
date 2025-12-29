<template>
  <div class="category-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <el-button text @click="$router.push('/glossary')">
        <el-icon><ArrowLeft /></el-icon>
        返回
      </el-button>
      <h1>{{ categoryName }}</h1>
    </div>

    <!-- 筛选栏 -->
    <div class="filter-bar">
      <el-radio-group v-model="difficulty" @change="loadTerms">
        <el-radio-button :label="null">全部</el-radio-button>
        <el-radio-button :label="1">入门</el-radio-button>
        <el-radio-button :label="2">进阶</el-radio-button>
        <el-radio-button :label="3">高级</el-radio-button>
      </el-radio-group>
    </div>

    <!-- 术语列表 -->
    <div class="term-list" v-loading="loading">
      <div v-if="terms.length === 0" class="empty-state">
        <p>暂无术语</p>
      </div>
      
      <div 
        v-for="term in terms" 
        :key="term.id"
        class="term-card"
        @click="goToTerm(term.id)"
      >
        <div class="term-header">
          <div class="term-title">
            <span class="name">{{ term.name }}</span>
            <span class="name-en" v-if="term.nameEn">{{ term.nameEn }}</span>
          </div>
          <el-tag :type="getDifficultyType(term.difficulty)" size="small">
            {{ getDifficultyText(term.difficulty) }}
          </el-tag>
        </div>
        <div class="term-brief">{{ term.brief }}</div>
        <div class="term-tags" v-if="term.tags">
          <el-tag 
            v-for="tag in parseTags(term.tags)" 
            :key="tag"
            size="small"
            type="info"
          >
            {{ tag }}
          </el-tag>
        </div>
      </div>
    </div>

    <!-- 分页 -->
    <div class="pagination" v-if="total > pageSize">
      <el-pagination
        v-model:current-page="pageNum"
        :page-size="pageSize"
        :total="total"
        layout="prev, pager, next"
        @current-change="loadTerms"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft } from '@element-plus/icons-vue'
import { getCategoryList, getTermList } from '@/api/glossary'

const route = useRoute()
const router = useRouter()

const categoryId = ref(null)
const categoryName = ref('')
const difficulty = ref(null)
const loading = ref(false)
const terms = ref([])
const total = ref(0)
const pageNum = ref(1)
const pageSize = ref(20)

// 加载分类名称
const loadCategoryName = async () => {
  try {
    const res = await getCategoryList()
    if (res.code === 200) {
      const findCategory = (categories, id) => {
        for (const cat of categories) {
          if (cat.id === id) return cat.name
          if (cat.children) {
            const found = findCategory(cat.children, id)
            if (found) return found
          }
        }
        return null
      }
      categoryName.value = findCategory(res.data || [], categoryId.value) || '术语列表'
    }
  } catch (error) {
    console.error('加载分类失败:', error)
  }
}

// 加载术语列表
const loadTerms = async () => {
  loading.value = true
  try {
    const res = await getTermList({
      pageNum: pageNum.value,
      pageSize: pageSize.value,
      categoryId: categoryId.value,
      difficulty: difficulty.value
    })
    if (res.code === 200) {
      terms.value = res.data.list || []
      total.value = res.data.total || 0
    }
  } catch (error) {
    console.error('加载术语失败:', error)
  } finally {
    loading.value = false
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
    categoryId.value = Number(newId)
    loadCategoryName()
    loadTerms()
  }
}, { immediate: true })

onMounted(() => {
  categoryId.value = Number(route.params.id)
  loadCategoryName()
  loadTerms()
})
</script>

<style lang="scss" scoped>
.category-page {
  padding: 20px;
  max-width: 900px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;

  h1 {
    font-size: 22px;
    font-weight: 700;
    color: var(--text-primary);
    margin: 0;
  }
}

.filter-bar {
  margin-bottom: 20px;
}

.term-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.empty-state {
  text-align: center;
  padding: 60px;
  color: var(--text-secondary);
}

.term-card {
  background: var(--bg-primary);
  border-radius: 12px;
  padding: 16px 20px;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 8px var(--shadow-color);

  &:hover {
    transform: translateX(4px);
    box-shadow: 0 4px 16px var(--shadow-color);
  }
}

.term-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.term-title {
  .name {
    font-size: 16px;
    font-weight: 600;
    color: var(--text-primary);
  }

  .name-en {
    font-size: 14px;
    color: var(--text-secondary);
    margin-left: 8px;
  }
}

.term-brief {
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.5;
  margin-bottom: 8px;
}

.term-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.pagination {
  display: flex;
  justify-content: center;
  margin-top: 24px;
}
</style>
