<template>
  <div class="chapter-page" :class="{ 'split-mode': showSplitView }">
    <!-- 顶部导航栏 -->
    <header class="chapter-header">
      <div class="header-left">
        <el-button class="back-btn" text @click="router.back()">
          <el-icon><ArrowLeft /></el-icon>
          <span>返回课程</span>
        </el-button>
        <div class="chapter-title-mini">{{ chapter.title }}</div>
      </div>
      
      <div class="header-center">
        <el-button 
          :disabled="!prevChapter" 
          size="small"
          @click="goToChapter(prevChapter)"
        >
          <el-icon><ArrowLeft /></el-icon>上一章
        </el-button>
        <div class="chapter-indicator">
          <span class="current">{{ currentIndex + 1 }}</span>
          <span class="divider">/</span>
          <span class="total">{{ totalChapters }}</span>
        </div>
        <el-button 
          :disabled="!nextChapter" 
          size="small"
          @click="goToChapter(nextChapter)"
        >
          下一章<el-icon><ArrowRight /></el-icon>
        </el-button>
      </div>

      <div class="header-right">
        <el-button 
          v-if="!chapter.isCompleted"
          type="primary" 
          size="small"
          @click="markComplete"
        >
          <el-icon><Check /></el-icon>标记完成
        </el-button>
        <el-tag v-else type="success" effect="dark" size="small">
          <el-icon><CircleCheckFilled /></el-icon>
          已完成
        </el-tag>
      </div>
    </header>

    <!-- 主内容区 -->
    <div class="chapter-body">
      <!-- 左侧：文章内容 -->
      <main class="chapter-content" :style="showSplitView ? { width: leftPanelWidth + '%' } : {}">
        <!-- 文章头部 -->
        <div class="article-header">
          <div class="article-meta">
            <el-tag v-if="chapter.weekNumber" type="info" size="small">
              第 {{ chapter.weekNumber }} 周
            </el-tag>
            <span class="read-time">
              <el-icon><Clock /></el-icon>
              预计阅读 15 分钟
            </span>
          </div>
          <h1 class="article-title">{{ chapter.title }}</h1>
        </div>

        <!-- Markdown 内容 -->
        <article class="article-body">
          <MdPreview 
            :editorId="editorId"
            :modelValue="chapter.content || '暂无内容'" 
            :theme="themeStore.isDark ? 'dark' : 'light'"
            previewTheme="github"
            class="md-content"
          />
        </article>

        <!-- 底部操作区 -->
        <footer class="article-footer">
          <div class="footer-actions">
            <el-button 
              v-if="!chapter.isCompleted"
              type="primary" 
              size="large"
              @click="markComplete"
            >
              <el-icon><CircleCheck /></el-icon>
              完成本章学习
            </el-button>
            <el-button 
              v-else
              type="success" 
              size="large"
              plain
            >
              <el-icon><CircleCheckFilled /></el-icon>
              已完成学习
            </el-button>
            
            <el-button size="large" @click="showNoteDialog = true">
              <el-icon><EditPen /></el-icon>
              添加笔记
            </el-button>
          </div>

          <div class="footer-nav" v-if="nextChapter">
            <span>下一章：</span>
            <a @click="goToChapter(nextChapter)">{{ nextChapter.title }}</a>
            <el-icon><ArrowRight /></el-icon>
          </div>
        </footer>
      </main>

      <!-- 拖动分隔条 -->
      <div 
        v-if="showSplitView" 
        class="resize-handle"
        @mousedown="startResize"
      >
        <div class="handle-bar"></div>
      </div>

      <!-- 右侧：资料内容（分屏模式） -->
      <aside class="material-panel" v-if="showSplitView" :style="{ width: (100 - leftPanelWidth) + '%' }">
        <div class="panel-header">
          <div class="panel-title">
            <el-icon><Document /></el-icon>
            <span>{{ currentMaterial?.title }}</span>
          </div>
          <el-button class="close-btn" text @click="closeSplitView">
            <el-icon><Close /></el-icon>
          </el-button>
        </div>
        <div class="panel-content">
          <MdPreview 
            :modelValue="currentMaterial?.content || '暂无内容'" 
            :theme="themeStore.isDark ? 'dark' : 'light'"
            previewTheme="github"
            class="material-md-content"
          />
        </div>
      </aside>

      <!-- 侧边栏（非分屏模式） -->
      <aside class="chapter-sidebar" v-if="!showSplitView">
        <!-- 目录导航 -->
        <div class="sidebar-card toc-card">
          <div class="card-header">
            <el-icon><Menu /></el-icon>
            <h3>目录</h3>
          </div>
          <div class="toc-wrapper">
            <MdCatalog 
              :editorId="editorId" 
              :scrollElement="scrollElement"
              :theme="themeStore.isDark ? 'dark' : 'light'"
              class="md-catalog"
            />
          </div>
        </div>

        <!-- 学习笔记 -->
        <div class="sidebar-card notes-card">
          <div class="card-header">
            <el-icon><Notebook /></el-icon>
            <h3>我的笔记</h3>
            <el-button text size="small" @click="showNoteDialog = true">
              <el-icon><Plus /></el-icon>
            </el-button>
          </div>
          <div class="notes-list" v-if="notes.length > 0">
            <div v-for="note in notes" :key="note.id" class="note-item">
              <p>{{ note.content }}</p>
              <span class="note-time">{{ note.createTime }}</span>
            </div>
          </div>
          <div v-else class="empty-notes">
            <el-icon><EditPen /></el-icon>
            <p>记录学习心得</p>
          </div>
        </div>

        <!-- 学习资料 -->
        <div class="sidebar-card materials-card" v-if="materials.length > 0 || materialsLoading">
          <div class="card-header">
            <el-icon><FolderOpened /></el-icon>
            <h3>学习资料</h3>
            <span class="material-badge" v-if="materials.length > 0">{{ materials.length }}</span>
            <el-icon v-if="materialsLoading" class="is-loading"><Loading /></el-icon>
          </div>
          <div class="materials-list" v-if="materials.length > 0">
            <div 
              v-for="item in materials" 
              :key="item.id" 
              class="material-item"
              :class="`type-${item.materialType}`"
              @click="handleMaterialClick(item)"
            >
              <div class="material-icon-mini">
                <el-icon v-if="item.materialType === 'markdown'"><Document /></el-icon>
                <el-icon v-else-if="item.materialType === 'pdf'"><Reading /></el-icon>
                <el-icon v-else-if="item.materialType === 'video'"><VideoPlay /></el-icon>
                <el-icon v-else><Link /></el-icon>
              </div>
              <div class="material-text">
                <span class="material-name">{{ item.title }}</span>
                <span class="material-type">{{ getMaterialTypeName(item.materialType) }}</span>
              </div>
              <el-icon class="material-arrow"><ArrowRight /></el-icon>
            </div>
          </div>
          <div v-else-if="materialsLoading" class="materials-loading">
            <el-icon class="is-loading"><Loading /></el-icon>
            <span>加载中...</span>
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
        <el-button type="primary" @click="saveNote" :loading="savingNote">
          保存笔记
        </el-button>
      </template>
    </el-dialog>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { MdPreview, MdCatalog } from 'md-editor-v3'
import 'md-editor-v3/lib/preview.css'
import { useThemeStore } from '@/store'
import { ElMessage } from 'element-plus'
import { 
  ArrowLeft, 
  ArrowRight, 
  Check, 
  CircleCheckFilled, 
  Clock, 
  FolderOpened, 
  Document, 
  Reading, 
  VideoPlay, 
  Link, 
  CircleCheck, 
  EditPen, 
  Menu, 
  Notebook, 
  Plus,
  Close,
  Loading
} from '@element-plus/icons-vue'
import { 
  getChapterDetail, 
  completeChapter, 
  createNote, 
  getMaterialList, 
  getMaterialDetail 
} from '@/api/learn'

const router = useRouter()
const route = useRoute()
const themeStore = useThemeStore()

const loading = ref(false)
const savingNote = ref(false)

// 为 MdPreview 和 MdCatalog 设置唯一 ID
const editorId = 'chapter-preview'

// 滚动容器元素
const scrollElement = ref(null)

const chapter = ref({
  id: null,
  title: '',
  content: '',
  weekNumber: null,
  isCompleted: false
})

const siblingChapters = ref([])
const currentIndex = ref(0)
const totalChapters = computed(() => siblingChapters.value.length)

const prevChapter = computed(() => {
  return currentIndex.value > 0 ? siblingChapters.value[currentIndex.value - 1] : null
})

const nextChapter = computed(() => {
  return currentIndex.value < siblingChapters.value.length - 1 
    ? siblingChapters.value[currentIndex.value + 1] 
    : null
})

const notes = ref([])
const showNoteDialog = ref(false)
const noteContent = ref('')

// 学习资料
const materials = ref([])
const materialsLoading = ref(false)
const showSplitView = ref(false)
const currentMaterial = ref(null)
const leftPanelWidth = ref(35) // 左侧面板宽度百分比，初始 4:6
const isResizing = ref(false)

// 获取资料类型名称
const getMaterialTypeName = (type) => {
  const typeMap = {
    'markdown': '文档',
    'pdf': 'PDF',
    'video': '视频',
    'link': '链接'
  }
  return typeMap[type] || '资料'
}

const handleMaterialClick = async (item) => {
  // 链接类型：新标签页打开
  if (item.materialType === 'link') {
    window.open(item.linkUrl, '_blank')
    return
  }
  
  // PDF/视频类型：新标签页打开
  if (item.materialType === 'pdf' || item.materialType === 'video') {
    if (item.fileUrl) {
      window.open(item.fileUrl, '_blank')
    } else {
      try {
        const res = await getMaterialDetail(item.id)
        if (res.code === 200 && res.data.fileUrl) {
          window.open(res.data.fileUrl, '_blank')
        }
      } catch (error) {
        ElMessage.error('无法打开资料')
      }
    }
    return
  }
  
  // Markdown 类型：分屏显示
  if (item.materialType === 'markdown') {
    try {
      const res = await getMaterialDetail(item.id)
      if (res.code === 200) {
        currentMaterial.value = res.data
        showSplitView.value = true
      }
    } catch (error) {
      ElMessage.error('加载资料失败')
    }
  }
}

const closeSplitView = () => {
  showSplitView.value = false
  currentMaterial.value = null
  leftPanelWidth.value = 35 // 重置为 4:6
}

// 拖动调整分屏大小
const startResize = (e) => {
  isResizing.value = true
  document.addEventListener('mousemove', handleResize)
  document.addEventListener('mouseup', stopResize)
  document.body.style.cursor = 'col-resize'
  document.body.style.userSelect = 'none'
}

const handleResize = (e) => {
  if (!isResizing.value) return
  
  const container = document.querySelector('.chapter-body')
  if (!container) return
  
  const containerRect = container.getBoundingClientRect()
  const newWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100
  
  // 限制最小和最大宽度 (30% - 70%)
  leftPanelWidth.value = Math.min(Math.max(newWidth, 30), 70)
}

const stopResize = () => {
  isResizing.value = false
  document.removeEventListener('mousemove', handleResize)
  document.removeEventListener('mouseup', stopResize)
  document.body.style.cursor = ''
  document.body.style.userSelect = ''
}

const loadMaterials = async () => {
  const id = route.params.id
  if (!id) return
  
  materialsLoading.value = true
  try {
    const res = await getMaterialList(id)
    if (res.code === 200) {
      materials.value = res.data || []
    }
  } catch (error) {
    console.error('加载资料失败:', error)
  } finally {
    materialsLoading.value = false
  }
}

const goToChapter = (ch) => {
  if (ch) {
    router.push(`/learn/chapter/${ch.id}`)
  }
}

const markComplete = async () => {
  try {
    await completeChapter(chapter.value.id)
    chapter.value.isCompleted = true
    ElMessage.success('🎉 恭喜完成本章学习！')
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

const saveNote = async () => {
  if (!noteContent.value.trim()) {
    ElMessage.warning('请输入笔记内容')
    return
  }
  
  savingNote.value = true
  try {
    await createNote({
      chapterId: chapter.value.id,
      title: chapter.value.title + ' - 笔记',
      content: noteContent.value
    })
    
    notes.value.unshift({
      id: Date.now(),
      content: noteContent.value,
      createTime: new Date().toLocaleString()
    })
    
    noteContent.value = ''
    showNoteDialog.value = false
    ElMessage.success('笔记保存成功')
  } catch (error) {
    ElMessage.error('保存失败')
  } finally {
    savingNote.value = false
  }
}

const loadChapter = async () => {
  const id = route.params.id
  if (!id) return
  
  loading.value = true
  try {
    const res = await getChapterDetail(id)
    if (res.code === 200) {
      chapter.value = res.data
    }
  } catch (error) {
    ElMessage.error('加载章节失败')
  } finally {
    loading.value = false
  }
}

// 设置滚动元素
const setupScrollElement = () => {
  nextTick(() => {
    // 使用 document 作为滚动容器，或者使用页面主体
    scrollElement.value = document.documentElement
  })
}

watch(() => route.params.id, () => {
  // 并行加载章节和资料
  Promise.all([loadChapter(), loadMaterials()])
  setupScrollElement()
})

onMounted(() => {
  // 并行加载章节和资料
  Promise.all([loadChapter(), loadMaterials()])
  setupScrollElement()
})
</script>

<style lang="scss" scoped>
.chapter-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--bg-secondary);
}

// 顶部导航
.chapter-header {
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

  .chapter-title-mini {
    font-size: 14px;
    color: var(--text-primary);
    font-weight: 500;
    max-width: 200px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.header-center {
  display: flex;
  align-items: center;
  gap: 12px;
}

.chapter-indicator {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 12px;
  background: var(--bg-secondary);
  border-radius: 20px;
  font-size: 13px;

  .current {
    color: var(--primary-color);
    font-weight: 600;
  }

  .divider {
    color: var(--text-secondary);
  }

  .total {
    color: var(--text-secondary);
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
.chapter-body {
  display: flex;
  gap: 24px;
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
  flex: 1;
}

// 文章内容
.chapter-content {
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

  .read-time {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 13px;
    color: var(--text-secondary);
  }
}

.article-title {
  font-size: 28px;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1.4;
}

.article-body {
  padding: 32px 40px;

  .md-content {
    // 一级标题 - 学习目标、学习内容、实践任务
    :deep(h2) {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 20px;
      font-weight: 700;
      color: var(--text-primary);
      margin: 40px 0 20px;
      padding: 16px 20px;
      background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.05) 100%);
      border-left: 4px solid #667eea;
      border-radius: 0 12px 12px 0;
      scroll-margin-top: 80px;

      &::before {
        content: '📌';
        font-size: 20px;
      }

      &:first-of-type {
        margin-top: 0;
      }
    }

    // 二级标题 - K线基础、常见K线形态等
    :deep(h3) {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 17px;
      font-weight: 600;
      color: var(--text-primary);
      margin: 28px 0 16px;
      padding: 12px 16px;
      background: var(--bg-secondary);
      border-radius: 8px;
      scroll-margin-top: 80px;

      &::before {
        content: '📖';
        font-size: 16px;
      }
    }

    // 三级标题
    :deep(h4) {
      font-size: 15px;
      font-weight: 600;
      color: var(--text-primary);
      margin: 20px 0 12px;
      padding-left: 12px;
      border-left: 3px solid var(--primary-color);
      scroll-margin-top: 80px;
    }

    // 段落
    :deep(p) {
      line-height: 1.9;
      margin-bottom: 16px;
      color: var(--text-primary);
    }

    // 无序列表 - 学习要点
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
        line-height: 1.7;
        transition: all 0.2s;

        &::before {
          content: '✓';
          position: absolute;
          left: 16px;
          top: 12px;
          width: 20px;
          height: 20px;
          background: linear-gradient(135deg, #67c23a, #85ce61);
          color: white;
          border-radius: 50%;
          font-size: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        &:hover {
          background: var(--bg-tertiary);
          transform: translateX(4px);
        }

        // 嵌套列表
        ul {
          margin: 12px 0 0;

          li {
            padding: 8px 12px 8px 32px;
            background: transparent;
            margin-bottom: 4px;

            &::before {
              content: '•';
              background: none;
              color: var(--primary-color);
              font-size: 18px;
              width: auto;
              height: auto;
              left: 12px;
              top: 8px;
            }

            &:hover {
              background: rgba(64, 158, 255, 0.05);
            }
          }
        }
      }
    }

    // 有序列表
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
        line-height: 1.7;
        counter-increment: item;

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
      }
    }

    // 任务列表 - 实践任务中的 checkbox
    :deep(ul) {
      li {
        // 包含 checkbox 的任务项
        &:has(input[type="checkbox"]) {
          padding: 14px 16px 14px 16px;
          background: linear-gradient(135deg, rgba(230, 162, 60, 0.08) 0%, rgba(230, 162, 60, 0.02) 100%);
          border: 1px solid rgba(230, 162, 60, 0.2);
          border-radius: 10px;

          &::before {
            display: none;
          }

          input[type="checkbox"] {
            width: 20px;
            height: 20px;
            margin-right: 12px;
            accent-color: #67c23a;
            cursor: pointer;
          }

          &:hover {
            border-color: rgba(230, 162, 60, 0.4);
            background: linear-gradient(135deg, rgba(230, 162, 60, 0.12) 0%, rgba(230, 162, 60, 0.04) 100%);
          }
        }
      }
    }

    // 代码块
    :deep(code) {
      background: rgba(64, 158, 255, 0.1);
      color: var(--primary-color);
      padding: 3px 8px;
      border-radius: 4px;
      font-size: 14px;
      font-family: 'Monaco', 'Menlo', monospace;
    }

    :deep(pre) {
      background: var(--bg-secondary);
      padding: 20px;
      border-radius: 12px;
      overflow-x: auto;
      margin: 16px 0;

      code {
        background: none;
        color: inherit;
        padding: 0;
      }
    }

    // 引用块
    :deep(blockquote) {
      border-left: 4px solid var(--primary-color);
      padding: 16px 20px;
      margin: 20px 0;
      background: rgba(64, 158, 255, 0.05);
      border-radius: 0 8px 8px 0;
      color: var(--text-secondary);
      font-style: italic;

      p {
        margin: 0;
      }
    }

    // 表格
    :deep(table) {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 2px 8px var(--shadow-color);

      th, td {
        padding: 14px 16px;
        text-align: left;
        border-bottom: 1px solid var(--border-light);
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

    // 分割线
    :deep(hr) {
      border: none;
      height: 2px;
      background: linear-gradient(90deg, transparent, var(--border-light), transparent);
      margin: 32px 0;
    }

    // 强调文本
    :deep(strong) {
      color: var(--primary-color);
      font-weight: 600;
    }

    :deep(em) {
      color: var(--text-secondary);
      font-style: italic;
    }

    // 链接
    :deep(a) {
      color: var(--primary-color);
      text-decoration: none;
      border-bottom: 1px dashed var(--primary-color);
      transition: all 0.2s;

      &:hover {
        border-bottom-style: solid;
      }
    }
  }
}

// 文章底部
.article-footer {
  padding: 32px 40px;
  border-top: 1px solid var(--border-light);
  background: var(--bg-secondary);
}

.footer-actions {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
}

.footer-nav {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 16px;
  background: var(--bg-primary);
  border-radius: 8px;
  font-size: 14px;

  span {
    color: var(--text-secondary);
  }

  a {
    color: var(--primary-color);
    cursor: pointer;
    font-weight: 500;

    &:hover {
      text-decoration: underline;
    }
  }

  .el-icon {
    color: var(--primary-color);
  }
}

// 侧边栏
.chapter-sidebar {
  width: 280px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 20px;
  position: sticky;
  top: 80px;
  height: fit-content;
  max-height: calc(100vh - 100px);
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
    flex: 1;
  }
}

// 目录导航 - 使用 MdCatalog 组件
.toc-wrapper {
  max-height: 350px;
  overflow-y: auto;

  .md-catalog {
    padding: 8px 0;

    :deep(.md-editor-catalog-link) {
      display: block;
      padding: 8px 16px;
      font-size: 13px;
      color: var(--text-secondary);
      text-decoration: none;
      border-left: 2px solid transparent;
      transition: all 0.2s;
      cursor: pointer;
      line-height: 1.4;

      &:hover {
        color: var(--primary-color);
        background: var(--bg-secondary);
      }

      &.md-editor-catalog-active {
        color: var(--primary-color);
        border-left-color: var(--primary-color);
        background: rgba(64, 158, 255, 0.08);
        font-weight: 500;
      }

      // 根据层级设置缩进
      &[data-level="1"] {
        padding-left: 16px;
        font-weight: 500;
      }

      &[data-level="2"] {
        padding-left: 28px;
      }

      &[data-level="3"] {
        padding-left: 40px;
        font-size: 12px;
      }
    }

    // 隐藏默认的连接线
    :deep(.md-editor-catalog-wrapper) {
      position: relative;
    }
  }
}

// 笔记列表
.notes-list {
  padding: 12px;
  max-height: 250px;
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
    color: var(--text-primary);
    line-height: 1.5;
    margin-bottom: 8px;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .note-time {
    font-size: 11px;
    color: var(--text-secondary);
  }
}

.empty-notes {
  padding: 32px;
  text-align: center;
  color: var(--text-secondary);

  .el-icon {
    font-size: 32px;
    margin-bottom: 8px;
    opacity: 0.5;
  }

  p {
    font-size: 13px;
  }
}

// 侧边栏学习资料
.materials-card {
  .card-header {
    .material-badge {
      background: var(--primary-color);
      color: white;
      font-size: 11px;
      padding: 2px 8px;
      border-radius: 10px;
      font-weight: 600;
    }
  }
}

.materials-list {
  padding: 8px;
}

.materials-loading {
  padding: 24px;
  text-align: center;
  color: var(--text-secondary);
  font-size: 13px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  .el-icon {
    font-size: 16px;
  }
}

.material-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 4px;

  &:last-child {
    margin-bottom: 0;
  }

  &:hover {
    background: var(--bg-secondary);

    .material-arrow {
      color: var(--primary-color);
      transform: translateX(2px);
    }
  }

  &.active {
    background: rgba(64, 158, 255, 0.1);
    
    .material-icon-mini {
      transform: scale(1.1);
    }
  }
}

.material-icon-mini {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: transform 0.2s;

  .el-icon {
    font-size: 16px;
    color: white;
  }

  .type-markdown & { background: linear-gradient(135deg, #409eff, #66b1ff); }
  .type-pdf & { background: linear-gradient(135deg, #f56c6c, #f89898); }
  .type-video & { background: linear-gradient(135deg, #67c23a, #85ce61); }
  .type-link & { background: linear-gradient(135deg, #e6a23c, #ebb563); }
}

.material-text {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.material-name {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.material-type {
  font-size: 11px;
  color: var(--text-secondary);
}

.material-arrow {
  font-size: 12px;
  color: var(--text-secondary);
  transition: all 0.2s;
  flex-shrink: 0;
}

// 分屏模式
.chapter-page.split-mode {
  .chapter-body {
    max-width: 100%;
    padding: 16px;
    gap: 0; // 移除 gap，用 resize-handle 代替
  }

  .chapter-content {
    flex: none; // 使用固定宽度
  }

  .article-header {
    padding: 20px 24px 16px;
  }

  .article-body {
    padding: 20px 24px;
  }

  .article-footer {
    padding: 20px 24px;
  }

  .article-title {
    font-size: 22px;
  }
}

// 拖动分隔条
.resize-handle {
  width: 12px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: col-resize;
  position: relative;
  z-index: 10;

  &:hover .handle-bar,
  &:active .handle-bar {
    background: var(--primary-color);
    width: 4px;
  }
}

.handle-bar {
  width: 3px;
  height: 48px;
  background: var(--border-light);
  border-radius: 3px;
  transition: all 0.2s;
}

// 资料面板（分屏右侧）
.material-panel {
  flex: none; // 使用固定宽度
  background: var(--bg-primary);
  border-radius: 16px;
  box-shadow: 0 2px 12px var(--shadow-color);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.panel-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 16px;
  font-weight: 600;
  min-width: 0;

  .el-icon {
    font-size: 20px;
    flex-shrink: 0;
  }

  span {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.panel-header .close-btn {
  color: white;
  font-size: 18px;
  padding: 8px;
  border-radius: 8px;
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }
}

.panel-content {
  flex: 1;
  overflow-y: auto;
  padding: 24px;

  .material-md-content {
    :deep(h2) {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 18px;
      font-weight: 700;
      color: var(--text-primary);
      margin: 28px 0 16px;
      padding: 14px 18px;
      background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.05) 100%);
      border-left: 4px solid #667eea;
      border-radius: 0 12px 12px 0;

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
      font-size: 16px;
      font-weight: 600;
      color: var(--text-primary);
      margin: 24px 0 14px;
      padding: 10px 14px;
      background: var(--bg-secondary);
      border-radius: 8px;

      &::before {
        content: '📖';
        font-size: 15px;
      }
    }

    :deep(h4) {
      font-size: 15px;
      font-weight: 600;
      color: var(--text-primary);
      margin: 18px 0 10px;
      padding-left: 12px;
      border-left: 3px solid var(--primary-color);
    }

    :deep(p) {
      line-height: 1.8;
      margin-bottom: 14px;
      color: var(--text-primary);
    }

    :deep(ul) {
      padding: 0;
      margin: 14px 0;
      list-style: none;

      > li {
        position: relative;
        padding: 10px 14px 10px 40px;
        margin-bottom: 6px;
        background: var(--bg-secondary);
        border-radius: 8px;
        line-height: 1.7;
        transition: all 0.2s;

        &::before {
          content: '✓';
          position: absolute;
          left: 12px;
          top: 10px;
          width: 18px;
          height: 18px;
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
        }

        ul li {
          padding: 6px 10px 6px 28px;
          background: transparent;
          margin-bottom: 2px;

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
        }
      }
    }

    :deep(ol) {
      padding: 0;
      margin: 14px 0;
      list-style: none;
      counter-reset: item;

      > li {
        position: relative;
        padding: 10px 14px 10px 44px;
        margin-bottom: 6px;
        background: var(--bg-secondary);
        border-radius: 8px;
        line-height: 1.7;
        counter-increment: item;

        &::before {
          content: counter(item);
          position: absolute;
          left: 10px;
          top: 8px;
          width: 22px;
          height: 22px;
          background: linear-gradient(135deg, #409eff, #66b1ff);
          color: white;
          border-radius: 50%;
          font-size: 12px;
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: center;
        }
      }
    }

    :deep(code) {
      background: rgba(64, 158, 255, 0.1);
      color: var(--primary-color);
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 13px;
      font-family: 'Monaco', 'Menlo', monospace;
    }

    :deep(pre) {
      background: var(--bg-secondary);
      padding: 16px;
      border-radius: 10px;
      overflow-x: auto;
      margin: 14px 0;

      code {
        background: none;
        color: inherit;
        padding: 0;
      }
    }

    :deep(blockquote) {
      border-left: 4px solid var(--primary-color);
      padding: 14px 18px;
      margin: 18px 0;
      background: rgba(64, 158, 255, 0.05);
      border-radius: 0 8px 8px 0;
      color: var(--text-secondary);
      font-style: italic;

      p {
        margin: 0;
      }
    }

    :deep(table) {
      width: 100%;
      border-collapse: collapse;
      margin: 18px 0;
      border-radius: 10px;
      overflow: hidden;
      box-shadow: 0 2px 8px var(--shadow-color);

      th, td {
        padding: 10px 12px;
        text-align: left;
        border-bottom: 1px solid var(--border-light);
      }

      th {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        font-weight: 600;
      }

      tr:nth-child(even) {
        background: var(--bg-secondary);
      }
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
  }
}

// 响应式
@media (max-width: 1200px) {
  .chapter-sidebar {
    display: none;
  }

  // 分屏模式在小屏幕下变成上下布局
  .chapter-page.split-mode {
    .chapter-body {
      flex-direction: column;
    }

    .chapter-content,
    .material-panel {
      max-width: 100%;
    }

    .material-panel {
      max-height: 50vh;
    }
  }
}

@media (max-width: 768px) {
  .chapter-header {
    flex-wrap: wrap;
    gap: 12px;
    padding: 12px 16px;
  }

  .header-left .chapter-title-mini {
    display: none;
  }

  .header-center {
    order: 3;
    width: 100%;
    justify-content: center;
  }

  .chapter-body {
    padding: 16px;
  }

  .article-header,
  .article-body,
  .article-footer {
    padding: 20px;
  }

  .article-title {
    font-size: 22px;
  }

  .footer-actions {
    flex-direction: column;
  }

  .chapter-page.split-mode {
    .chapter-body {
      padding: 12px;
      gap: 12px;
    }

    .article-header,
    .article-body,
    .article-footer {
      padding: 16px;
    }

    .panel-content {
      padding: 16px;
    }
  }
}
</style>
