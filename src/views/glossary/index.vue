<template>
  <div class="glossary-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <h1>📖 交易术语词典</h1>
      <p>快速查阅交易术语，降低学习门槛</p>
    </div>

    <!-- 搜索框 -->
    <div class="search-section">
      <el-input
        v-model="searchKeyword"
        placeholder="搜索术语、拼音或首字母..."
        size="large"
        clearable
        @input="handleSearch"
        @clear="clearSearch"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
      
      <!-- 搜索结果 -->
      <div class="search-results" v-if="showSearchResults && searchResults.length > 0">
        <div 
          v-for="term in searchResults" 
          :key="term.id" 
          class="search-item"
          @click="goToTerm(term.id)"
        >
          <div class="term-name">
            {{ term.name }}
            <span class="term-en" v-if="term.nameEn">{{ term.nameEn }}</span>
          </div>
          <div class="term-brief">{{ term.brief }}</div>
        </div>
      </div>
      <div class="search-results empty" v-else-if="showSearchResults && searchKeyword">
        <p>未找到相关术语</p>
      </div>
    </div>

    <!-- 热门术语 -->
    <div class="hot-section" v-if="!showSearchResults">
      <h3>🔥 热门术语</h3>
      <div class="hot-tags">
        <span 
          v-for="term in hotTerms" 
          :key="term.id"
          class="hot-tag"
          @click="goToTerm(term.id)"
        >
          {{ term.name }}
        </span>
      </div>
    </div>

    <!-- 分类列表 -->
    <div class="category-section" v-if="!showSearchResults">
      <h3>📚 术语分类</h3>
      <div class="category-grid">
        <div 
          v-for="category in categories" 
          :key="category.id"
          class="category-card"
          @click="goToCategory(category.id)"
        >
          <div class="category-icon">
            <el-icon><component :is="getCategoryIcon(category.icon)" /></el-icon>
          </div>
          <div class="category-info">
            <span class="category-name">{{ category.name }}</span>
            <span class="category-count">{{ category.termCount }}个术语</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 最近查看 -->
    <div class="history-section" v-if="!showSearchResults && historyTerms.length > 0">
      <h3>🕐 最近查看</h3>
      <div class="history-list">
        <div 
          v-for="term in historyTerms" 
          :key="term.id"
          class="history-item"
          @click="goToTerm(term.id)"
        >
          <span class="term-name">{{ term.name }}</span>
          <span class="term-category">{{ term.categoryName }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Search, TrendCharts, Operation, DataLine, Link, Document, Memo } from '@element-plus/icons-vue'
import { getCategoryList, getHotTerms, getHistory, searchTerms } from '@/api/glossary'

const router = useRouter()

const searchKeyword = ref('')
const showSearchResults = ref(false)
const searchResults = ref([])
const categories = ref([])
const hotTerms = ref([])
const historyTerms = ref([])

let searchTimer = null

// 图标映射
const iconMap = {
  TrendCharts,
  Operation,
  DataLine,
  Link,
  Document,
  Memo
}

const getCategoryIcon = (icon) => {
  return iconMap[icon] || Document
}

// 搜索
const handleSearch = () => {
  if (searchTimer) clearTimeout(searchTimer)
  
  if (!searchKeyword.value) {
    showSearchResults.value = false
    searchResults.value = []
    return
  }
  
  searchTimer = setTimeout(async () => {
    try {
      const res = await searchTerms(searchKeyword.value)
      if (res.code === 200) {
        searchResults.value = res.data || []
        showSearchResults.value = true
      }
    } catch (error) {
      console.error('搜索失败:', error)
    }
  }, 300)
}

const clearSearch = () => {
  showSearchResults.value = false
  searchResults.value = []
}

// 加载数据
const loadCategories = async () => {
  try {
    const res = await getCategoryList()
    if (res.code === 200) {
      categories.value = res.data || []
    }
  } catch (error) {
    console.error('加载分类失败:', error)
  }
}

const loadHotTerms = async () => {
  try {
    const res = await getHotTerms(12)
    if (res.code === 200) {
      hotTerms.value = res.data || []
    }
  } catch (error) {
    console.error('加载热门术语失败:', error)
  }
}

const loadHistory = async () => {
  try {
    const res = await getHistory(5)
    if (res.code === 200) {
      historyTerms.value = res.data || []
    }
  } catch (error) {
    console.error('加载历史失败:', error)
  }
}

// 导航
const goToTerm = (id) => {
  router.push(`/glossary/term/${id}`)
}

const goToCategory = (id) => {
  router.push(`/glossary/category/${id}`)
}

onMounted(() => {
  loadCategories()
  loadHotTerms()
  loadHistory()
})
</script>

<style lang="scss" scoped>
.glossary-page {
  padding: 20px;
  max-width: 900px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 24px;

  h1 {
    font-size: 26px;
    font-weight: 700;
    color: var(--text-primary);
    margin: 0 0 8px;
  }

  p {
    color: var(--text-secondary);
    margin: 0;
  }
}

.search-section {
  position: relative;
  margin-bottom: 24px;

  :deep(.el-input__wrapper) {
    border-radius: 12px;
    box-shadow: 0 2px 12px var(--shadow-color);
  }
}

.search-results {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: var(--bg-primary);
  border-radius: 12px;
  box-shadow: 0 4px 20px var(--shadow-color);
  margin-top: 8px;
  max-height: 400px;
  overflow-y: auto;
  z-index: 100;

  &.empty {
    padding: 20px;
    text-align: center;
    color: var(--text-secondary);
  }
}

.search-item {
  padding: 12px 16px;
  cursor: pointer;
  border-bottom: 1px solid var(--border-light);
  transition: background 0.2s;

  &:hover {
    background: var(--bg-secondary);
  }

  &:last-child {
    border-bottom: none;
  }

  .term-name {
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 4px;

    .term-en {
      font-weight: 400;
      color: var(--text-secondary);
      margin-left: 8px;
      font-size: 13px;
    }
  }

  .term-brief {
    font-size: 13px;
    color: var(--text-secondary);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.hot-section, .category-section, .history-section {
  margin-bottom: 32px;

  h3 {
    font-size: 16px;
    font-weight: 600;
    color: var(--text-primary);
    margin: 0 0 16px;
  }
}

.hot-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.hot-tag {
  cursor: pointer;
  font-size: 14px;
  padding: 8px 16px;
  border-radius: 20px;
  background: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
  border: 1px solid var(--el-color-primary-light-5);
  transition: all 0.2s;
  display: inline-block;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px var(--shadow-color);
    background: var(--el-color-primary);
    color: white;
  }
}

.category-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.category-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: var(--bg-primary);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 8px var(--shadow-color);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px var(--shadow-color);
  }
}

.category-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: linear-gradient(135deg, var(--primary-color), #66b1ff);
  display: flex;
  align-items: center;
  justify-content: center;

  .el-icon {
    font-size: 24px;
    color: white;
  }
}

.category-info {
  display: flex;
  flex-direction: column;
  gap: 4px;

  .category-name {
    font-size: 16px;
    font-weight: 600;
    color: var(--text-primary);
  }

  .category-count {
    font-size: 13px;
    color: var(--text-secondary);
  }
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.history-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: var(--bg-primary);
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: var(--bg-secondary);
  }

  .term-name {
    font-weight: 500;
    color: var(--text-primary);
  }

  .term-category {
    font-size: 13px;
    color: var(--text-secondary);
  }
}

@media (max-width: 768px) {
  .category-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .category-grid {
    grid-template-columns: 1fr;
  }
}
</style>
