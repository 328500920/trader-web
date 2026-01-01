<template>
  <div>
    <!-- 搜索触发按钮 -->
    <el-tooltip content="全局搜索 (Ctrl+K)">
      <el-button circle class="search-trigger" @click="openSearch">
        <el-icon :size="18"><Search /></el-icon>
      </el-button>
    </el-tooltip>
    
    <!-- 搜索弹窗 -->
    <el-dialog
      v-model="visible"
      class="global-search-dialog"
      :show-close="false"
      :close-on-click-modal="true"
      width="600px"
      top="15vh"
      @opened="focusInput"
    >
      <div class="search-container">
        <!-- 搜索输入框 -->
        <div class="search-header">
          <el-icon class="search-icon"><Search /></el-icon>
          <input
            ref="inputRef"
            v-model="keyword"
            type="text"
            class="search-input"
            placeholder="搜索课程、案例、资源、专题..."
            @input="handleInput"
            @keydown="handleKeydown"
          />
          <span class="search-shortcut" v-if="!keyword">ESC 关闭</span>
          <el-icon v-else class="clear-icon" @click="clearKeyword"><Close /></el-icon>
        </div>
        
        <!-- 搜索结果 -->
        <div class="search-body" v-if="keyword">
          <div v-if="searching" class="search-loading">
            <el-icon class="is-loading"><Loading /></el-icon>
            <span>搜索中...</span>
          </div>
          
          <div v-else-if="hasResults" class="search-results">
            <div 
              v-for="(group, index) in groupedResults" 
              :key="group.type" 
              class="result-group"
            >
              <div class="group-header">
                <span class="group-icon">{{ group.icon }}</span>
                <span class="group-title">{{ group.title }}</span>
                <span class="group-count">{{ group.items.length }}</span>
              </div>
              <div 
                v-for="(item, itemIndex) in group.items.slice(0, 5)" 
                :key="item.id"
                class="result-item"
                :class="{ active: isActiveItem(index, itemIndex) }"
                @click="goToItem(item)"
                @mouseenter="setActiveIndex(index, itemIndex)"
              >
                <span class="item-title">{{ item.title }}</span>
                <span class="item-desc" v-if="item.description">{{ truncate(item.description, 50) }}</span>
                <el-icon class="item-arrow"><ArrowRight /></el-icon>
              </div>
            </div>
          </div>
          
          <div v-else class="search-empty">
            <el-icon><Search /></el-icon>
            <span>未找到相关内容</span>
          </div>
        </div>
        
        <!-- 快捷提示 -->
        <div class="search-footer" v-if="keyword && hasResults">
          <div class="shortcut-item">
            <span class="key">↑↓</span>
            <span>导航</span>
          </div>
          <div class="shortcut-item">
            <span class="key">↵</span>
            <span>打开</span>
          </div>
          <div class="shortcut-item">
            <span class="key">ESC</span>
            <span>关闭</span>
          </div>
        </div>
        
        <!-- 搜索历史 -->
        <div class="search-history" v-if="!keyword && searchHistory.length > 0">
          <div class="history-header">
            <span>最近搜索</span>
            <el-button text size="small" @click="clearHistory">清除</el-button>
          </div>
          <div class="history-list">
            <div 
              v-for="item in searchHistory" 
              :key="item" 
              class="history-item"
              @click="searchFromHistory(item)"
            >
              <el-icon><Clock /></el-icon>
              <span>{{ item }}</span>
            </div>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { Search, Close, Loading, ArrowRight, Clock } from '@element-plus/icons-vue'
import { debounce } from '@/utils/debounce'
import { globalSearch } from '@/api/learn'

const router = useRouter()

const visible = ref(false)
const keyword = ref('')
const searching = ref(false)
const inputRef = ref(null)
const activeGroupIndex = ref(0)
const activeItemIndex = ref(0)

// 搜索结果
const results = ref({
  chapters: [],
  cases: [],
  resources: [],
  topics: [],
  tools: []
})

// 搜索历史
const searchHistory = ref([])

// 分组结果
const groupedResults = computed(() => {
  const groups = []
  
  if (results.value.chapters?.length) {
    groups.push({
      type: 'chapter',
      title: '课程章节',
      icon: '📚',
      items: results.value.chapters.map(item => ({
        ...item,
        route: `/learn/chapter/${item.id}`
      }))
    })
  }
  
  if (results.value.cases?.length) {
    groups.push({
      type: 'case',
      title: '实战案例',
      icon: '📊',
      items: results.value.cases.map(item => ({
        ...item,
        route: `/learn/case/${item.id}`
      }))
    })
  }
  
  if (results.value.resources?.length) {
    groups.push({
      type: 'resource',
      title: '学习资源',
      icon: '🔗',
      items: results.value.resources.map(item => ({
        ...item,
        route: item.url || '#'
      }))
    })
  }
  
  if (results.value.topics?.length) {
    groups.push({
      type: 'topic',
      title: '专题内容',
      icon: '📖',
      items: results.value.topics.map(item => ({
        ...item,
        route: `/learn/topic/${item.id}`
      }))
    })
  }
  
  if (results.value.tools?.length) {
    groups.push({
      type: 'tool',
      title: '工具指南',
      icon: '🛠️',
      items: results.value.tools.map(item => ({
        ...item,
        title: item.toolName,
        route: `/learn/tool-guide/${item.id}`
      }))
    })
  }
  
  return groups
})

const hasResults = computed(() => groupedResults.value.length > 0)

// 打开搜索
const openSearch = () => {
  visible.value = true
  loadHistory()
}

// 关闭搜索
const closeSearch = () => {
  visible.value = false
  keyword.value = ''
  resetResults()
}

// 聚焦输入框
const focusInput = () => {
  inputRef.value?.focus()
}

// 清除关键词
const clearKeyword = () => {
  keyword.value = ''
  resetResults()
  focusInput()
}

// 重置结果
const resetResults = () => {
  results.value = {
    chapters: [],
    cases: [],
    resources: [],
    topics: [],
    tools: []
  }
  activeGroupIndex.value = 0
  activeItemIndex.value = 0
}

// 搜索处理
const handleInput = debounce(async () => {
  if (!keyword.value.trim()) {
    resetResults()
    return
  }
  
  searching.value = true
  
  try {
    // 模拟搜索 API 调用
    // 实际项目中应该调用后端全局搜索接口
    const response = await mockSearch(keyword.value)
    results.value = response
    activeGroupIndex.value = 0
    activeItemIndex.value = 0
  } catch (error) {
    console.error('搜索失败:', error)
  } finally {
    searching.value = false
  }
}, 300)

// 模拟搜索（实际应调用后端API）
const mockSearch = async (query) => {
  try {
    const res = await globalSearch({ keyword: query, limit: 5 })
    if (res.code === 200) {
      return res.data
    }
  } catch (error) {
    console.error('搜索失败:', error)
  }
  
  return {
    chapters: [],
    cases: [],
    resources: [],
    topics: [],
    tools: []
  }
}

// 键盘导航
const handleKeydown = (e) => {
  if (e.key === 'Escape') {
    closeSearch()
  } else if (e.key === 'ArrowDown') {
    e.preventDefault()
    moveSelection(1)
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    moveSelection(-1)
  } else if (e.key === 'Enter') {
    e.preventDefault()
    selectCurrentItem()
  }
}

// 移动选择
const moveSelection = (direction) => {
  if (!hasResults.value) return
  
  const currentGroup = groupedResults.value[activeGroupIndex.value]
  const maxItemIndex = Math.min(currentGroup.items.length - 1, 4)
  
  if (direction > 0) {
    if (activeItemIndex.value < maxItemIndex) {
      activeItemIndex.value++
    } else if (activeGroupIndex.value < groupedResults.value.length - 1) {
      activeGroupIndex.value++
      activeItemIndex.value = 0
    }
  } else {
    if (activeItemIndex.value > 0) {
      activeItemIndex.value--
    } else if (activeGroupIndex.value > 0) {
      activeGroupIndex.value--
      const prevGroup = groupedResults.value[activeGroupIndex.value]
      activeItemIndex.value = Math.min(prevGroup.items.length - 1, 4)
    }
  }
}

// 选择当前项
const selectCurrentItem = () => {
  if (!hasResults.value) return
  
  const group = groupedResults.value[activeGroupIndex.value]
  const item = group.items[activeItemIndex.value]
  if (item) {
    goToItem(item)
  }
}

// 跳转到项目
const goToItem = (item) => {
  saveHistory(keyword.value)
  closeSearch()
  
  if (item.route.startsWith('http')) {
    window.open(item.route, '_blank')
  } else {
    router.push(item.route)
  }
}

// 判断是否为当前选中项
const isActiveItem = (groupIndex, itemIndex) => {
  return activeGroupIndex.value === groupIndex && activeItemIndex.value === itemIndex
}

// 设置选中索引
const setActiveIndex = (groupIndex, itemIndex) => {
  activeGroupIndex.value = groupIndex
  activeItemIndex.value = itemIndex
}

// 截断文本
const truncate = (text, length) => {
  if (!text) return ''
  return text.length > length ? text.substring(0, length) + '...' : text
}

// 搜索历史
const loadHistory = () => {
  const saved = localStorage.getItem('searchHistory')
  searchHistory.value = saved ? JSON.parse(saved) : []
}

const saveHistory = (query) => {
  if (!query.trim()) return
  
  const history = searchHistory.value.filter(h => h !== query)
  history.unshift(query)
  searchHistory.value = history.slice(0, 10)
  localStorage.setItem('searchHistory', JSON.stringify(searchHistory.value))
}

const clearHistory = () => {
  searchHistory.value = []
  localStorage.removeItem('searchHistory')
}

const searchFromHistory = (query) => {
  keyword.value = query
  handleInput()
}

// 全局快捷键
const handleGlobalKeydown = (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
    e.preventDefault()
    openSearch()
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleGlobalKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleGlobalKeydown)
})
</script>

<style lang="scss" scoped>
.search-trigger {
  transition: all 0.3s;
  
  &:hover {
    transform: scale(1.05);
  }
}

:deep(.global-search-dialog) {
  .el-dialog__header {
    display: none;
  }
  
  .el-dialog__body {
    padding: 0;
  }
}

.search-container {
  background: var(--bg-primary);
  border-radius: 12px;
  overflow: hidden;
}

.search-header {
  display: flex;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid var(--border-light);
  gap: 12px;
  
  .search-icon {
    font-size: 20px;
    color: var(--text-secondary);
  }
  
  .search-input {
    flex: 1;
    border: none;
    outline: none;
    font-size: 16px;
    background: transparent;
    color: var(--text-primary);
    
    &::placeholder {
      color: var(--text-placeholder);
    }
  }
  
  .search-shortcut {
    font-size: 12px;
    color: var(--text-placeholder);
    padding: 4px 8px;
    background: var(--bg-secondary);
    border-radius: 4px;
  }
  
  .clear-icon {
    cursor: pointer;
    color: var(--text-secondary);
    
    &:hover {
      color: var(--text-primary);
    }
  }
}

.search-body {
  max-height: 400px;
  overflow-y: auto;
}

.search-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 40px;
  color: var(--text-secondary);
}

.search-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 40px;
  color: var(--text-placeholder);
  
  .el-icon {
    font-size: 32px;
  }
}

.result-group {
  padding: 8px 0;
  
  &:not(:last-child) {
    border-bottom: 1px solid var(--border-light);
  }
}

.group-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 20px;
  font-size: 12px;
  color: var(--text-secondary);
  
  .group-icon {
    font-size: 14px;
  }
  
  .group-count {
    margin-left: auto;
    background: var(--bg-secondary);
    padding: 2px 8px;
    border-radius: 10px;
  }
}

.result-item {
  display: flex;
  align-items: center;
  padding: 12px 20px;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover,
  &.active {
    background: var(--bg-secondary);
  }
  
  .item-title {
    font-size: 14px;
    color: var(--text-primary);
    font-weight: 500;
  }
  
  .item-desc {
    flex: 1;
    font-size: 12px;
    color: var(--text-secondary);
    margin-left: 12px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  
  .item-arrow {
    color: var(--text-placeholder);
    opacity: 0;
    transition: opacity 0.2s;
  }
  
  &:hover .item-arrow,
  &.active .item-arrow {
    opacity: 1;
  }
}

.search-footer {
  display: flex;
  gap: 20px;
  padding: 12px 20px;
  border-top: 1px solid var(--border-light);
  background: var(--bg-secondary);
}

.shortcut-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--text-secondary);
  
  .key {
    padding: 2px 6px;
    background: var(--bg-primary);
    border-radius: 4px;
    font-family: monospace;
  }
}

.search-history {
  padding: 16px 20px;
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  font-size: 12px;
  color: var(--text-secondary);
}

.history-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.history-item {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  background: var(--bg-secondary);
  border-radius: 16px;
  font-size: 13px;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: var(--border-light);
    color: var(--text-primary);
  }
  
  .el-icon {
    font-size: 12px;
  }
}
</style>
