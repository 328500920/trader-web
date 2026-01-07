<template>
  <div class="page-container">
    <div class="page-header">
      <h2>课程管理</h2>
      <el-button type="primary" @click="openCreateCourse">
        <el-icon><Plus /></el-icon>新建课程
      </el-button>
    </div>
    
    <div class="card">
      <el-table :data="courseList" v-loading="loading" row-key="id">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="title" label="课程名称" min-width="200" />
        <el-table-column prop="weekNumber" label="周数" width="80" />
        <el-table-column prop="stage" label="阶段" width="120">
          <template #default="{ row }">
            <el-tag :type="getStageType(row.stage)">阶段{{ row.stage }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="chapterCount" label="章节数" width="100" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'info'">
              {{ row.status === 1 ? '已发布' : '草稿' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="280" fixed="right">
          <template #default="{ row }">
            <el-button text type="primary" size="small" @click="editCourse(row)">编辑</el-button>
            <el-button text type="primary" size="small" @click="manageChapters(row)">管理章节</el-button>
            <el-button text type="warning" size="small" @click="toggleStatus(row)">
              {{ row.status === 1 ? '下架' : '发布' }}
            </el-button>
            <el-button text type="danger" size="small" @click="handleDeleteCourse(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    
    <!-- 课程编辑抽屉 -->
    <el-drawer 
      v-model="showCourseDrawer" 
      :title="editingCourse ? '编辑课程' : '新建课程'" 
      size="50%"
      :close-on-click-modal="false"
    >
      <el-form :model="courseForm" label-width="100px" :rules="courseRules" ref="courseFormRef">
        <el-form-item label="课程名称" prop="title">
          <el-input v-model="courseForm.title" placeholder="请输入课程名称" />
        </el-form-item>
        <el-form-item label="周数" prop="weekNumber">
          <el-input-number v-model="courseForm.weekNumber" :min="1" :max="24" />
        </el-form-item>
        <el-form-item label="所属阶段" prop="stage">
          <el-select v-model="courseForm.stage" style="width: 100%;">
            <el-option label="阶段一：基础构建期（1-8周）" :value="1" />
            <el-option label="阶段二：策略实战期（9-16周）" :value="2" />
            <el-option label="阶段三：进阶稳定期（17-24周）" :value="3" />
          </el-select>
        </el-form-item>
        <el-form-item label="课程描述" prop="description">
          <el-input v-model="courseForm.description" type="textarea" :rows="4" placeholder="请输入课程描述" />
        </el-form-item>
        <el-form-item label="排序" prop="sortOrder">
          <el-input-number v-model="courseForm.sortOrder" :min="0" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="courseForm.status">
            <el-radio :label="0">草稿</el-radio>
            <el-radio :label="1">发布</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showCourseDrawer = false">取消</el-button>
        <el-button type="primary" @click="saveCourse" :loading="saving">保存</el-button>
      </template>
    </el-drawer>
    
    <!-- 章节管理抽屉 -->
    <el-drawer 
      v-model="showChapterDrawer" 
      :title="`章节管理 - ${currentCourse?.title || ''}`" 
      size="60%"
      :close-on-click-modal="false"
    >
      <div class="chapter-header">
        <el-button type="primary" size="small" @click="openCreateChapter">
          <el-icon><Plus /></el-icon>添加章节
        </el-button>
      </div>
      <el-table :data="chapterList" v-loading="chapterLoading">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="title" label="章节名称" min-width="200" />
        <el-table-column prop="sortOrder" label="排序" width="80" />
        <el-table-column label="操作" width="150">
          <template #default="{ row }">
            <el-button text type="primary" size="small" @click="editChapter(row)">编辑</el-button>
            <el-button text type="danger" size="small" @click="handleDeleteChapter(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-drawer>
    
    <!-- 章节编辑抽屉 -->
    <el-drawer 
      v-model="showChapterEditDrawer" 
      :title="editingChapter ? '编辑章节' : '新建章节'" 
      size="70%"
      :close-on-click-modal="false"
    >
      <el-form :model="chapterForm" label-width="100px" :rules="chapterRules" ref="chapterFormRef">
        <el-form-item label="章节名称" prop="title">
          <el-input v-model="chapterForm.title" placeholder="请输入章节名称" />
        </el-form-item>
        <el-form-item label="章节内容" prop="content">
          <div style="width: 100%; border: 1px solid var(--border-color); border-radius: 4px;">
            <MdEditor 
              v-model="chapterForm.content" 
              :theme="themeStore.isDark ? 'dark' : 'light'" 
              style="height: 500px;" 
            />
          </div>
        </el-form-item>
        <el-form-item label="排序" prop="sortOrder">
          <el-input-number v-model="chapterForm.sortOrder" :min="0" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showChapterEditDrawer = false">取消</el-button>
        <el-button type="primary" @click="saveChapter" :loading="chapterSaving">保存</el-button>
      </template>
    </el-drawer>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { MdEditor } from 'md-editor-v3'
import 'md-editor-v3/lib/style.css'
import { useThemeStore } from '@/store'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { 
  getAllCourses, 
  createCourse, 
  updateCourse, 
  deleteCourse,
  getChapterList,
  createChapter,
  updateChapter,
  deleteChapter
} from '@/api/learn'

const themeStore = useThemeStore()
const loading = ref(false)
const saving = ref(false)
const chapterLoading = ref(false)
const chapterSaving = ref(false)

const showCourseDrawer = ref(false)
const showChapterDrawer = ref(false)
const showChapterEditDrawer = ref(false)

const editingCourse = ref(null)
const editingChapter = ref(null)
const currentCourse = ref(null)

const courseFormRef = ref(null)
const chapterFormRef = ref(null)

const courseForm = reactive({ 
  title: '', 
  weekNumber: 1,
  stage: 1, 
  description: '', 
  sortOrder: 0, 
  status: 0 
})

const chapterForm = reactive({ 
  title: '', 
  content: '', 
  sortOrder: 0 
})

const courseRules = {
  title: [{ required: true, message: '请输入课程名称', trigger: 'blur' }],
  stage: [{ required: true, message: '请选择所属阶段', trigger: 'change' }]
}

const chapterRules = {
  title: [{ required: true, message: '请输入章节名称', trigger: 'blur' }]
}

const courseList = ref([])
const chapterList = ref([])

const getStageType = (stage) => {
  const types = { 1: '', 2: 'success', 3: 'warning' }
  return types[stage] || ''
}

// 加载课程列表
const loadCourses = async () => {
  loading.value = true
  try {
    const res = await getAllCourses()
    if (res.code === 200) {
      courseList.value = res.data || []
    }
  } catch (error) {
    ElMessage.error('加载课程列表失败')
  } finally {
    loading.value = false
  }
}

// 打开新建课程
const openCreateCourse = () => {
  editingCourse.value = null
  Object.assign(courseForm, { 
    title: '', 
    weekNumber: courseList.value.length + 1,
    stage: 1, 
    description: '', 
    sortOrder: courseList.value.length, 
    status: 0 
  })
  showCourseDrawer.value = true
}

// 编辑课程
const editCourse = (row) => {
  editingCourse.value = row
  Object.assign(courseForm, {
    title: row.title,
    weekNumber: row.weekNumber,
    stage: row.stage,
    description: row.description,
    sortOrder: row.sortOrder,
    status: row.status
  })
  showCourseDrawer.value = true
}

// 保存课程
const saveCourse = async () => {
  try {
    await courseFormRef.value.validate()
  } catch {
    return
  }
  
  saving.value = true
  try {
    if (editingCourse.value) {
      await updateCourse(editingCourse.value.id, courseForm)
    } else {
      await createCourse(courseForm)
    }
    ElMessage.success('保存成功')
    showCourseDrawer.value = false
    loadCourses()
  } catch (error) {
    ElMessage.error(error.message || '保存失败')
  } finally {
    saving.value = false
  }
}

// 切换发布状态
const toggleStatus = async (row) => {
  const newStatus = row.status === 1 ? 0 : 1
  const action = newStatus === 1 ? '发布' : '下架'
  
  try {
    await ElMessageBox.confirm(`确定${action}该课程吗？`, '提示')
    await updateCourse(row.id, { ...row, status: newStatus })
    ElMessage.success(`${action}成功`)
    loadCourses()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(`${action}失败`)
    }
  }
}

// 删除课程
const handleDeleteCourse = async (row) => {
  try {
    await ElMessageBox.confirm('确定删除该课程吗？删除后无法恢复', '警告', { type: 'warning' })
    await deleteCourse(row.id)
    ElMessage.success('删除成功')
    loadCourses()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

// 管理章节
const manageChapters = async (row) => {
  currentCourse.value = row
  showChapterDrawer.value = true
  await loadChapters(row.id)
}

// 加载章节列表
const loadChapters = async (courseId) => {
  chapterLoading.value = true
  try {
    const res = await getChapterList({ courseId })
    if (res.code === 200) {
      chapterList.value = res.data || []
    }
  } catch (error) {
    ElMessage.error('加载章节列表失败')
  } finally {
    chapterLoading.value = false
  }
}

// 打开新建章节
const openCreateChapter = () => {
  editingChapter.value = null
  Object.assign(chapterForm, { 
    title: '', 
    content: '', 
    sortOrder: chapterList.value.length 
  })
  showChapterEditDrawer.value = true
}

// 编辑章节
const editChapter = (row) => {
  editingChapter.value = row
  Object.assign(chapterForm, {
    title: row.title,
    content: row.content || '',
    sortOrder: row.sortOrder
  })
  showChapterEditDrawer.value = true
}

// 保存章节
const saveChapter = async () => {
  try {
    await chapterFormRef.value.validate()
  } catch {
    return
  }
  
  chapterSaving.value = true
  try {
    const data = {
      ...chapterForm,
      courseId: currentCourse.value.id
    }
    
    if (editingChapter.value) {
      await updateChapter(editingChapter.value.id, data)
    } else {
      await createChapter(data)
    }
    ElMessage.success('保存成功')
    showChapterEditDrawer.value = false
    loadChapters(currentCourse.value.id)
    loadCourses() // 刷新课程列表以更新章节数
  } catch (error) {
    ElMessage.error(error.message || '保存失败')
  } finally {
    chapterSaving.value = false
  }
}

// 删除章节
const handleDeleteChapter = async (row) => {
  try {
    await ElMessageBox.confirm('确定删除该章节吗？删除后无法恢复', '警告', { type: 'warning' })
    await deleteChapter(row.id)
    ElMessage.success('删除成功')
    loadChapters(currentCourse.value.id)
    loadCourses()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

onMounted(() => {
  loadCourses()
})
</script>

<style lang="scss" scoped>
.page-container {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  
  h2 {
    margin: 0;
    font-size: 20px;
  }
}

.card {
  background: var(--bg-primary);
  border-radius: 8px;
  padding: 20px;
}

.chapter-header {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 16px;
}
</style>
