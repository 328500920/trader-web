<template>
  <div class="material-page">
    <!-- 顶部导航栏 -->
    <header class="material-header">
      <div class="header-left">
        <el-button class="back-btn" text @click="goBack">
          <el-icon><ArrowLeft /></el-icon>
          <span>返回课程</span>
        </el-button>
        <div class="material-title-mini">{{ material.title }}</div>
      </div>
      
      <div class="header-right">
        <el-tag type="info" size="small">
          <el-icon><Document /></el-icon>
          学习资料
        </el-tag>
      </div>
    </header>

    <!-- 主内容区 -->
    <div class="material-body">
      <!-- 左侧：文章内容 -->
      <main class="material-content" ref="contentRef">
        <!-- 文章头部 -->
        <div class="article-header">
          <div class="article-meta">
            <el-tag v-if="material.chapterTitle" type="info" size="small">
              {{ material.chapterTitle }}
            </el-tag>
            <span class="material-type">
              <el-icon><Document /></el-icon>
              {{ getMaterialTypeName(material.materialType) }}
            </span>
          </div>
          <h1 class="article-title">{{ material.title }}</h1>
        </div>

        <!-- Markdown 内容 -->
        <article class="article-body" v-loading="loading">
          <MdRenderer 
            v-if="material.content"
            :content="material.content" 
            :theme="themeStore.isDark ? 'dark' : 'light'"
            class="md-content"
          />
          <div v-else-if="!loading" class="empty-content">
            <el-icon><Document /></el-icon>
            <p>暂无内容</p>
          </div>
        </article>

        <!-- 底部导航 -->
        <footer class="article-footer" v-if="chapterId">
          <el-button @click="goBack">
            <el-icon><ArrowLeft /></el-icon>
            返回章节
          </el-button>
        </footer>
      </main>

      <!-- 右侧：目录导航 + 笔记 -->
      <aside class="material-sidebar">
        <!-- 目录卡片 -->
        <div class="sidebar-card toc-card" v-if="tocList.length > 0">
          <div class="card-header">
            <el-icon><Menu /></el-icon>
            <h3>目录</h3>
          </div>
          <div class="toc-wrapper">
            <div class="toc-list">
              <div 
                v-for="(item, index) in tocList" 
                :key="index"
                class="toc-item"
                :class="[`level-${item.level}`, { active: activeHeading === item.id }]"
                @click="scrollToHeading(item.id)"
              >
                {{ item.text }}
              </div>
            </div>
          </div>
        </div>

        <!-- 笔记卡片 -->
        <div class="sidebar-card notes-card">
          <div class="card-header">
            <el-icon><EditPen /></el-icon>
            <h3>我的笔记</h3>
            <el-button text size="small" @click="showNoteDialog = true">
              <el-icon><Plus /></el-icon>
            </el-button>
          </div>
          <div class="notes-list" v-if="notes.length > 0">
            <div v-for="item in notes" :key="item.id" class="note-item">
              <p>{{ item.content }}</p>
              <span class="note-time">{{ formatTime(item.createTime) }}</span>
            </div>
          </div>
          <div v-else class="empty-notes">
            <el-icon><EditPen /></el-icon>
            <p>记录学习心得</p>
          </div>
        </div>
      </aside>
    </div>

    <!-- 笔记弹窗 -->
    <el-dialog 
      v-model="showNoteDialog" 
      title="📝 添加学习笔记" 
      width="600px"
      :close-on-click-modal="false"
    >
      <el-input
        v-model="noteContent"
        type="textarea"
        :rows="8"
        placeholder="记录你的学习心得、疑问或重点..."
        maxlength="1000"
        show-word-limit
      />
      <template #footer>
        <el-button @click="showNoteDialog = false">取消</el-button>
        <el-button type="primary" @click="saveNoteContent" :loading="noteSaving">
          保存笔记
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import MdRenderer from '@/components/MdRenderer/index.vue'
import { useThemeStore } from '@/store'
import { ElMessage } from 'element-plus'
import { ArrowLeft, Document, Menu, EditPen, Plus } from '@element-plus/icons-vue'
import { getMaterialDetail, getNote, saveNote } from '@/api/learn'

const router = useRouter()
const route = useRoute()
const themeStore = useThemeStore()

const loading = ref(false)
const contentRef = ref(null)

const material = ref({
  id: null,
  title: '',
  content: '',
  materialType: 'markdown',
  chapterTitle: ''
})

// 目录相关
const tocList = ref([])
const activeHeading = ref('')

// 笔记相关
const notes = ref([])
const noteContent = ref('')
const showNoteDialog = ref(false)
const noteSaving = ref(false)

// 来源章节ID（用于返回）
const chapterId = ref(null)

const getMaterialTypeName = (type) => {
  const typeMap = {
    'markdown': '文档',
    'pdf': 'PDF',
    'video': '视频',
    'link': '链接'
  }
  return typeMap[type] || '资料'
}

const goBack = () => {
  if (chapterId.value) {
    router.push(`/learn/chapter/${chapterId.value}`)
  } else {
    router.back()
  }
}

// 从 Markdown 内容解析目录
const parseToc = (content) => {
  if (!content) return []
  
  const headingRegex = /^(#{1,4})\s+(.+)$/gm
  const toc = []
  let match
  let index = 0
  
  while ((match = headingRegex.exec(content)) !== null) {
    const level = match[1].length
    const text = match[2].replace(/[*_`]/g, '').trim() // 移除 markdown 格式符号
    const id = `heading-${index}`
    toc.push({ level, text, id })
    index++
  }
  
  return toc
}

// 获取所有标题元素（包括 MdPreview 内部渲染的标题）
const getHeadingElements = () => {
  if (!contentRef.value) return []
  // MdPreview 渲染的标题在 .md-editor-preview 内部
  const selectors = [
    '.article-body h1',
    '.article-body h2', 
    '.article-body h3',
    '.article-body h4',
    '.article-body .md-editor-preview h1',
    '.article-body .md-editor-preview h2',
    '.article-body .md-editor-preview h3',
    '.article-body .md-editor-preview h4'
  ].join(', ')
  
  const headings = contentRef.value.querySelectorAll(selectors)
  // 去重并按文档顺序排序
  const uniqueHeadings = [...new Set(headings)]
  return uniqueHeadings
}

// 滚动到指定标题
const scrollToHeading = (id) => {
  const index = parseInt(id.replace('heading-', ''))
  const headings = getHeadingElements()
  
  if (headings && headings[index]) {
    headings[index].scrollIntoView({ behavior: 'smooth', block: 'start' })
    activeHeading.value = id
  }
}

// 监听滚动，更新当前激活的标题
const handleScroll = () => {
  const headings = getHeadingElements()
  if (!headings || headings.length === 0) return
  
  const scrollTop = window.scrollY || document.documentElement.scrollTop
  const offset = 120 // 偏移量，考虑顶部固定导航
  
  for (let i = headings.length - 1; i >= 0; i--) {
    const heading = headings[i]
    const rect = heading.getBoundingClientRect()
    const elementTop = rect.top + scrollTop - document.documentElement.clientTop
    
    if (elementTop <= scrollTop + offset) {
      activeHeading.value = `heading-${i}`
      return
    }
  }
  
  if (headings.length > 0) {
    activeHeading.value = 'heading-0'
  }
}

const loadMaterial = async () => {
  const id = route.params.id
  if (!id) return
  
  loading.value = true
  try {
    const res = await getMaterialDetail(id)
    if (res.code === 200) {
      material.value = res.data
      // 解析目录 - 延迟执行确保 MdPreview 渲染完成
      nextTick(() => {
        tocList.value = parseToc(material.value.content)
        // 再次延迟，等待 DOM 完全渲染后初始化滚动监听
        setTimeout(() => {
          handleScroll()
        }, 500)
      })
      // 加载笔记
      loadNote()
    }
  } catch (error) {
    ElMessage.error('加载资料失败')
  } finally {
    loading.value = false
  }
}

// 加载笔记（通过章节ID关联）
const loadNote = async () => {
  // 使用章节ID来获取笔记
  if (!chapterId.value) return
  
  try {
    const res = await getNote({ chapterId: chapterId.value })
    if (res.code === 200 && res.data) {
      // 将单个笔记转为数组显示
      notes.value = [res.data]
    }
  } catch (error) {
    console.error('加载笔记失败', error)
  }
}

// 保存笔记
const saveNoteContent = async () => {
  if (!noteContent.value.trim()) {
    ElMessage.warning('请输入笔记内容')
    return
  }
  
  if (!chapterId.value) {
    ElMessage.warning('无法保存笔记：缺少章节信息')
    return
  }
  
  noteSaving.value = true
  try {
    const res = await saveNote({
      chapterId: chapterId.value,
      title: material.value.title + ' - 笔记',
      content: noteContent.value
    })
    if (res.code === 200) {
      // 添加到笔记列表
      notes.value.unshift({
        id: res.data?.id || Date.now(),
        content: noteContent.value,
        createTime: new Date().toISOString()
      })
      noteContent.value = ''
      showNoteDialog.value = false
      ElMessage.success('笔记保存成功')
    }
  } catch (error) {
    ElMessage.error('保存笔记失败')
  } finally {
    noteSaving.value = false
  }
}

// 格式化时间
const formatTime = (time) => {
  if (!time) return ''
  const date = new Date(time)
  const now = new Date()
  const diff = now - date
  
  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`
  if (diff < 604800000) return `${Math.floor(diff / 86400000)}天前`
  
  return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
}

onMounted(() => {
  // 获取来源章节ID
  chapterId.value = route.query.chapterId || null
  
  loadMaterial()
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})

// 监听内容变化，重新解析目录
watch(() => material.value.content, (newContent) => {
  if (newContent) {
    nextTick(() => {
      tocList.value = parseToc(newContent)
    })
  }
})
</script>


<style lang="scss" scoped>
.material-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--bg-secondary);
}

// 顶部导航
.material-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 24px;
  background: var(--bg-primary);
  border-bottom: 1px solid var(--border-light);
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 2px 8px var(--shadow-color);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;

  .back-btn {
    color: var(--text-secondary);
    
    &:hover {
      color: var(--primary-color);
    }

    span {
      margin-left: 4px;
    }
  }

  .material-title-mini {
    font-size: 14px;
    color: var(--text-primary);
    font-weight: 500;
    max-width: 300px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.header-right {
  .el-tag {
    display: flex;
    align-items: center;
    gap: 4px;
  }
}

// 主内容区
.material-body {
  display: flex;
  gap: 24px;
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
  flex: 1;
}

// 文章内容
.material-content {
  flex: 1;
  min-width: 0;
  background: var(--bg-primary);
  border-radius: 16px;
  box-shadow: 0 2px 12px var(--shadow-color);
  overflow: hidden;
}

.article-header {
  padding: 32px 40px 24px;
  border-bottom: 1px solid var(--border-light);
}

.article-meta {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;

  .material-type {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 13px;
    color: var(--text-secondary);
  }
}

.article-title {
  font-size: 26px;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1.4;
}

.article-body {
  padding: 32px 40px;
  min-height: 400px;
}

.empty-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px;
  color: var(--text-secondary);

  .el-icon {
    font-size: 48px;
    margin-bottom: 16px;
    opacity: 0.5;
  }

  p {
    font-size: 14px;
  }
}

.article-footer {
  padding: 24px 40px;
  border-top: 1px solid var(--border-light);
  background: var(--bg-secondary);
}

// 侧边栏
.material-sidebar {
  width: 280px;
  flex-shrink: 0;
  position: sticky;
  top: 80px;
  height: fit-content;
  max-height: calc(100vh - 100px);
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.sidebar-card {
  background: var(--bg-primary);
  border-radius: 12px;
  box-shadow: 0 2px 12px var(--shadow-color);
  overflow: hidden;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 16px;
  border-bottom: 1px solid var(--border-light);

  .el-icon {
    font-size: 16px;
    color: var(--primary-color);
  }

  h3 {
    font-size: 14px;
    font-weight: 600;
    color: var(--text-primary);
    margin: 0;
    flex: 1;
  }

  .edit-btn {
    padding: 4px;
    color: var(--text-secondary);
    
    &:hover {
      color: var(--primary-color);
    }
  }
}

// 目录卡片
.toc-card {
  .toc-wrapper {
    max-height: 540px;
    overflow-y: auto;
  }
}

.toc-list {
  padding: 8px 0;
}

.toc-item {
  padding: 8px 16px;
  font-size: 13px;
  color: var(--text-secondary);
  cursor: pointer;
  border-left: 2px solid transparent;
  transition: all 0.2s;
  line-height: 1.5;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  &:hover {
    color: var(--primary-color);
    background: var(--bg-secondary);
  }

  &.active {
    color: var(--primary-color);
    border-left-color: var(--primary-color);
    background: rgba(64, 158, 255, 0.08);
    font-weight: 500;
  }

  &.level-1 {
    padding-left: 16px;
    font-weight: 600;
    font-size: 14px;
  }

  &.level-2 {
    padding-left: 28px;
    font-weight: 500;
  }

  &.level-3 {
    padding-left: 40px;
    font-size: 12px;
  }

  &.level-4 {
    padding-left: 52px;
    font-size: 12px;
    color: var(--text-tertiary);
  }
}

// 笔记卡片
.notes-card {
  .notes-list {
    padding: 12px;
    max-height: 200px;
    overflow-y: auto;
  }

  .note-item {
    padding: 12px;
    background: var(--bg-secondary);
    border-radius: 8px;
    margin-bottom: 8px;

    &:last-child {
      margin-bottom: 0;
    }

    p {
      font-size: 13px;
      line-height: 1.6;
      color: var(--text-primary);
      margin: 0 0 8px;
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .note-time {
      font-size: 12px;
      color: var(--text-tertiary);
    }
  }

  .empty-notes {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 24px;
    color: var(--text-tertiary);

    .el-icon {
      font-size: 24px;
      margin-bottom: 8px;
      opacity: 0.5;
    }

    p {
      font-size: 13px;
      margin: 0;
    }
  }
}

// Markdown 内容样式
.md-content {
  :deep(h1) {
    font-size: 24px;
    font-weight: 700;
    color: var(--text-primary);
    margin: 0 0 24px;
    padding-bottom: 12px;
    border-bottom: 2px solid var(--border-light);
    scroll-margin-top: 80px;
  }

  :deep(h2) {
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 20px;
    font-weight: 700;
    color: var(--text-primary);
    margin: 36px 0 18px;
    padding: 14px 18px;
    background: linear-gradient(135deg, rgba(102, 126, 234, 0.08) 0%, rgba(118, 75, 162, 0.04) 100%);
    border-left: 4px solid #667eea;
    border-radius: 0 12px 12px 0;
    scroll-margin-top: 80px;

    &::before {
      content: '📌';
      font-size: 18px;
    }

    &:first-of-type {
      margin-top: 0;
    }
  }

  :deep(h3) {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 17px;
    font-weight: 600;
    color: var(--text-primary);
    margin: 28px 0 14px;
    padding: 12px 16px;
    background: var(--bg-secondary);
    border-radius: 8px;
    scroll-margin-top: 80px;

    &::before {
      content: '📖';
      font-size: 15px;
    }
  }

  :deep(h4) {
    font-size: 15px;
    font-weight: 600;
    color: var(--text-primary);
    margin: 22px 0 12px;
    padding-left: 12px;
    border-left: 3px solid var(--primary-color);
    scroll-margin-top: 80px;
  }

  :deep(p) {
    font-size: 15px;
    line-height: 1.9;
    margin-bottom: 16px;
    color: var(--text-primary);
  }

  :deep(ul) {
    padding: 0;
    margin: 16px 0;
    list-style: none;

    > li {
      position: relative;
      padding: 12px 16px 12px 44px;
      margin-bottom: 8px;
      background: var(--bg-secondary);
      border-radius: 8px;
      line-height: 1.8;
      font-size: 14px;
      transition: all 0.2s;

      &::before {
        content: '✓';
        position: absolute;
        left: 14px;
        top: 12px;
        width: 20px;
        height: 20px;
        background: linear-gradient(135deg, #67c23a, #85ce61);
        color: white;
        border-radius: 50%;
        font-size: 11px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      &:hover {
        background: var(--bg-tertiary);
        transform: translateX(4px);
      }

      ul {
        margin: 10px 0 0;

        li {
          padding: 6px 10px 6px 28px;
          background: transparent;
          margin-bottom: 4px;

          &::before {
            content: '•';
            background: none;
            color: var(--primary-color);
            font-size: 16px;
            width: auto;
            height: auto;
            left: 10px;
            top: 6px;
          }

          &:hover {
            background: rgba(64, 158, 255, 0.05);
            transform: none;
          }
        }
      }
    }
  }

  :deep(ol) {
    padding: 0;
    margin: 16px 0;
    list-style: none;
    counter-reset: item;

    > li {
      position: relative;
      padding: 12px 16px 12px 48px;
      margin-bottom: 8px;
      background: var(--bg-secondary);
      border-radius: 8px;
      line-height: 1.8;
      font-size: 14px;
      counter-increment: item;
      transition: all 0.2s;

      &::before {
        content: counter(item);
        position: absolute;
        left: 12px;
        top: 10px;
        width: 24px;
        height: 24px;
        background: linear-gradient(135deg, #409eff, #66b1ff);
        color: white;
        border-radius: 50%;
        font-size: 13px;
        font-weight: 600;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      &:hover {
        background: var(--bg-tertiary);
        transform: translateX(4px);
      }
    }
  }

  :deep(code) {
    background: rgba(64, 158, 255, 0.1);
    color: var(--primary-color);
    padding: 3px 8px;
    border-radius: 4px;
    font-size: 13px;
    font-family: 'Monaco', 'Menlo', 'Consolas', monospace;
  }

  :deep(pre) {
    background: #1e1e1e;
    padding: 20px;
    border-radius: 12px;
    overflow-x: auto;
    margin: 18px 0;

    code {
      background: none;
      color: #d4d4d4;
      padding: 0;
      font-size: 13px;
      line-height: 1.6;
    }
  }

  :deep(blockquote) {
    border-left: 4px solid var(--primary-color);
    padding: 16px 20px;
    margin: 20px 0;
    background: rgba(64, 158, 255, 0.05);
    border-radius: 0 10px 10px 0;
    color: var(--text-secondary);
    font-style: italic;

    p {
      margin: 0;
      font-size: 14px;
    }
  }

  :deep(table) {
    width: 100%;
    border-collapse: collapse;
    margin: 20px 0;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 2px 12px var(--shadow-color);

    th, td {
      padding: 12px 16px;
      text-align: left;
      border-bottom: 1px solid var(--border-light);
      font-size: 14px;
    }

    th {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      font-weight: 600;
    }

    tr:nth-child(even) {
      background: var(--bg-secondary);
    }

    tr:hover {
      background: rgba(64, 158, 255, 0.05);
    }
  }

  :deep(hr) {
    border: none;
    height: 2px;
    background: linear-gradient(90deg, transparent, var(--border-light), transparent);
    margin: 32px 0;
  }

  :deep(strong) {
    color: var(--primary-color);
    font-weight: 600;
  }

  :deep(a) {
    color: var(--primary-color);
    text-decoration: none;
    border-bottom: 1px dashed var(--primary-color);

    &:hover {
      border-bottom-style: solid;
    }
  }

  :deep(img) {
    max-width: 100%;
    border-radius: 8px;
    margin: 16px 0;
    box-shadow: 0 4px 16px var(--shadow-color);
  }
}

// 响应式
@media (max-width: 1200px) {
  .material-sidebar {
    display: none;
  }
}

@media (max-width: 768px) {
  .material-header {
    padding: 12px 16px;
  }

  .header-left .material-title-mini {
    display: none;
  }

  .material-body {
    padding: 16px;
  }

  .article-header,
  .article-body,
  .article-footer {
    padding: 20px;
  }

  .article-title {
    font-size: 20px;
  }
}
</style>
