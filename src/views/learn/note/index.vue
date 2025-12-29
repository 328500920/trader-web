<template>
  <div class="notes-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <h1>📝 我的笔记</h1>
        <p>记录学习心得，沉淀交易智慧</p>
      </div>
      <div class="header-right">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索笔记..."
          prefix-icon="Search"
          clearable
          style="width: 240px;"
          @input="handleSearch"
        />
        <el-button type="primary" @click="openCreateDialog">
          <el-icon><Plus /></el-icon>新建笔记
        </el-button>
      </div>
    </div>

    <!-- 统计概览 -->
    <div class="stats-bar">
      <div class="stat-item">
        <el-icon><Document /></el-icon>
        <span class="value">{{ total }}</span>
        <span class="label">笔记总数</span>
      </div>
      <div class="stat-item">
        <el-icon><Calendar /></el-icon>
        <span class="value">{{ thisWeekCount }}</span>
        <span class="label">本周新增</span>
      </div>
      <div class="stat-item">
        <el-icon><Collection /></el-icon>
        <span class="value">{{ categoriesCount }}</span>
        <span class="label">关联章节</span>
      </div>
    </div>

    <!-- 笔记列表 -->
    <div class="notes-container" v-loading="loading">
      <div v-if="notes.length > 0" class="notes-grid">
        <div 
          v-for="note in notes" 
          :key="note.id" 
          class="note-card"
          @click="viewNote(note)"
        >
          <div class="note-header">
            <div class="note-date">
              <el-icon><Calendar /></el-icon>
              {{ formatDate(note.createTime) }}
            </div>
            <el-dropdown trigger="click" @command="handleCommand($event, note)">
              <el-button text size="small" @click.stop>
                <el-icon><MoreFilled /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="edit">
                    <el-icon><Edit /></el-icon>编辑
                  </el-dropdown-item>
                  <el-dropdown-item command="delete" divided>
                    <el-icon><Delete /></el-icon>删除
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>

          <h3 class="note-title">{{ note.title }}</h3>
          <p class="note-content">{{ note.content }}</p>

          <div class="note-footer">
            <el-tag 
              v-if="note.chapterTitle" 
              size="small" 
              type="info"
              effect="plain"
            >
              <el-icon><Link /></el-icon>
              {{ note.chapterTitle }}
            </el-tag>
          </div>
        </div>
      </div>

      <el-empty 
        v-else 
        description="还没有笔记，开始记录你的学习心得吧"
        :image-size="120"
      >
        <el-button type="primary" @click="openCreateDialog">
          <el-icon><Plus /></el-icon>创建第一篇笔记
        </el-button>
      </el-empty>
    </div>

    <!-- 分页 -->
    <div class="pagination-wrapper" v-if="total > pageSize">
      <el-pagination
        v-model:current-page="pageNum"
        v-model:page-size="pageSize"
        :total="total"
        :page-sizes="[12, 24, 48]"
        layout="total, sizes, prev, pager, next"
        @size-change="loadNotes"
        @current-change="loadNotes"
      />
    </div>

    <!-- 笔记编辑弹窗 -->
    <el-dialog 
      v-model="showDialog" 
      :title="editingNote ? '✏️ 编辑笔记' : '📝 新建笔记'" 
      width="700px"
      :close-on-click-modal="false"
      class="note-dialog"
    >
      <el-form :model="noteForm" label-position="top">
        <el-form-item label="标题">
          <el-input 
            v-model="noteForm.title" 
            placeholder="给笔记起个标题..."
            maxlength="100"
            show-word-limit
          />
        </el-form-item>
        <el-form-item label="内容">
          <el-input 
            v-model="noteForm.content" 
            type="textarea" 
            :rows="12" 
            placeholder="记录你的学习心得、重点知识、交易感悟..."
            maxlength="5000"
            show-word-limit
          />
        </el-form-item>
        <el-form-item label="关联章节（可选）">
          <el-select 
            v-model="noteForm.chapterId" 
            placeholder="选择关联的学习章节"
            clearable
            filterable
            style="width: 100%;"
          >
            <el-option
              v-for="chapter in chapters"
              :key="chapter.id"
              :label="chapter.title"
              :value="chapter.id"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showDialog = false">取消</el-button>
        <el-button type="primary" @click="saveNote" :loading="saving">
          {{ editingNote ? '保存修改' : '创建笔记' }}
        </el-button>
      </template>
    </el-dialog>

    <!-- 笔记详情弹窗 -->
    <el-dialog 
      v-model="showViewDialog" 
      :title="viewingNote?.title"
      width="700px"
      class="note-view-dialog"
    >
      <div class="note-view-content" v-if="viewingNote">
        <div class="view-meta">
          <span><el-icon><Calendar /></el-icon>{{ viewingNote.createTime }}</span>
          <el-tag v-if="viewingNote.chapterTitle" size="small" type="info">
            {{ viewingNote.chapterTitle }}
          </el-tag>
        </div>
        <div class="view-body">
          {{ viewingNote.content }}
        </div>
      </div>
      <template #footer>
        <el-button @click="editNote(viewingNote)">
          <el-icon><Edit /></el-icon>编辑
        </el-button>
        <el-button type="primary" @click="showViewDialog = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getNoteList, createNote, updateNote, deleteNote as deleteNoteApi } from '@/api/learn'

const showDialog = ref(false)
const showViewDialog = ref(false)
const editingNote = ref(null)
const viewingNote = ref(null)
const loading = ref(false)
const saving = ref(false)
const searchKeyword = ref('')

const pageNum = ref(1)
const pageSize = ref(12)
const total = ref(0)

const noteForm = reactive({
  id: null,
  title: '',
  content: '',
  chapterId: null
})

const notes = ref([])
const chapters = ref([])

// 统计数据
const thisWeekCount = computed(() => {
  const weekAgo = new Date()
  weekAgo.setDate(weekAgo.getDate() - 7)
  return notes.value.filter(n => new Date(n.createTime) > weekAgo).length
})

const categoriesCount = computed(() => {
  return new Set(notes.value.filter(n => n.chapterId).map(n => n.chapterId)).size
})

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now - date
  
  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return `${Math.floor(diff / 60000)} 分钟前`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)} 小时前`
  if (diff < 604800000) return `${Math.floor(diff / 86400000)} 天前`
  
  return date.toLocaleDateString('zh-CN')
}

const loadNotes = async () => {
  loading.value = true
  try {
    const res = await getNoteList({ 
      pageNum: pageNum.value, 
      pageSize: pageSize.value,
      keyword: searchKeyword.value || undefined
    })
    if (res.code === 200) {
      notes.value = res.data.records || []
      total.value = res.data.total || 0
    }
  } catch (error) {
    ElMessage.error('加载笔记失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pageNum.value = 1
  loadNotes()
}

const openCreateDialog = () => {
  editingNote.value = null
  noteForm.id = null
  noteForm.title = ''
  noteForm.content = ''
  noteForm.chapterId = null
  showDialog.value = true
}

const viewNote = (note) => {
  viewingNote.value = note
  showViewDialog.value = true
}

const editNote = (note) => {
  showViewDialog.value = false
  editingNote.value = note
  noteForm.id = note.id
  noteForm.title = note.title
  noteForm.content = note.content
  noteForm.chapterId = note.chapterId
  showDialog.value = true
}

const handleCommand = (command, note) => {
  if (command === 'edit') {
    editNote(note)
  } else if (command === 'delete') {
    handleDelete(note)
  }
}

const handleDelete = (note) => {
  ElMessageBox.confirm(
    '确定要删除这篇笔记吗？删除后无法恢复。',
    '删除确认',
    { type: 'warning' }
  ).then(async () => {
    try {
      await deleteNoteApi(note.id)
      ElMessage.success('删除成功')
      loadNotes()
    } catch (error) {
      ElMessage.error('删除失败')
    }
  }).catch(() => {})
}

const saveNote = async () => {
  if (!noteForm.title?.trim()) {
    ElMessage.warning('请输入笔记标题')
    return
  }
  if (!noteForm.content?.trim()) {
    ElMessage.warning('请输入笔记内容')
    return
  }
  
  saving.value = true
  try {
    if (editingNote.value) {
      await updateNote(noteForm.id, noteForm)
      ElMessage.success('修改成功')
    } else {
      await createNote(noteForm)
      ElMessage.success('🎉 笔记创建成功')
    }
    showDialog.value = false
    loadNotes()
  } catch (error) {
    ElMessage.error('保存失败')
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  loadNotes()
})
</script>

<style lang="scss" scoped>
.notes-page {
  padding-bottom: 40px;
}

// 页面头部
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;

  .header-left {
    h1 {
      font-size: 26px;
      font-weight: 700;
      color: var(--text-primary);
      margin-bottom: 4px;
    }

    p {
      font-size: 14px;
      color: var(--text-secondary);
    }
  }

  .header-right {
    display: flex;
    gap: 12px;
  }
}

// 统计栏
.stats-bar {
  display: flex;
  gap: 24px;
  padding: 20px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  margin-bottom: 24px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 12px;
  color: white;

  .el-icon {
    font-size: 24px;
    opacity: 0.8;
  }

  .value {
    font-size: 28px;
    font-weight: 700;
  }

  .label {
    font-size: 13px;
    opacity: 0.85;
  }
}

// 笔记网格
.notes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
}

.note-card {
  background: var(--bg-primary);
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 2px 12px var(--shadow-color);
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  flex-direction: column;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 32px var(--shadow-color);
  }
}

.note-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;

  .note-date {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 12px;
    color: var(--text-secondary);
  }
}

.note-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 8px;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.note-content {
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.6;
  flex: 1;
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-bottom: 16px;
}

.note-footer {
  .el-tag {
    display: inline-flex;
    align-items: center;
    gap: 4px;
  }
}

// 分页
.pagination-wrapper {
  margin-top: 24px;
  display: flex;
  justify-content: center;
}

// 笔记详情弹窗
.note-view-content {
  .view-meta {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 20px;
    padding-bottom: 16px;
    border-bottom: 1px solid var(--border-light);
    font-size: 13px;
    color: var(--text-secondary);

    span {
      display: flex;
      align-items: center;
      gap: 4px;
    }
  }

  .view-body {
    font-size: 15px;
    line-height: 1.8;
    color: var(--text-primary);
    white-space: pre-wrap;
  }
}

// 响应式
@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: 16px;

    .header-right {
      width: 100%;
      flex-direction: column;

      .el-input {
        width: 100% !important;
      }
    }
  }

  .stats-bar {
    flex-wrap: wrap;
    gap: 16px;
  }

  .stat-item {
    flex: 1;
    min-width: calc(50% - 8px);
  }

  .notes-grid {
    grid-template-columns: 1fr;
  }
}
</style>
