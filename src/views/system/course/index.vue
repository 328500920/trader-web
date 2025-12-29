<template>
  <div class="page-container">
    <div class="page-header">
      <h2>课程管理</h2>
      <el-button type="primary" @click="showCourseDialog = true">
        <el-icon><Plus /></el-icon>新建课程
      </el-button>
    </div>
    
    <div class="card">
      <el-table :data="courseList" v-loading="loading" row-key="id" default-expand-all>
        <el-table-column prop="title" label="课程名称" />
        <el-table-column prop="stage" label="阶段" width="100">
          <template #default="{ row }">阶段{{ row.stage }}</template>
        </el-table-column>
        <el-table-column prop="chapterCount" label="章节数" width="100" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'info'">
              {{ row.status === 1 ? '已发布' : '草稿' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="250">
          <template #default="{ row }">
            <el-button text type="primary" size="small" @click="editCourse(row)">编辑</el-button>
            <el-button text type="primary" size="small" @click="manageChapters(row)">管理章节</el-button>
            <el-button text type="danger" size="small" @click="deleteCourse(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    
    <!-- 课程编辑弹窗 -->
    <el-dialog v-model="showCourseDialog" :title="editingCourse ? '编辑课程' : '新建课程'" width="600px">
      <el-form :model="courseForm" label-width="80px">
        <el-form-item label="课程名称">
          <el-input v-model="courseForm.title" />
        </el-form-item>
        <el-form-item label="所属阶段">
          <el-select v-model="courseForm.stage" style="width: 100%;">
            <el-option label="阶段一：基础构建期" :value="1" />
            <el-option label="阶段二：策略实战期" :value="2" />
            <el-option label="阶段三：进阶稳定期" :value="3" />
          </el-select>
        </el-form-item>
        <el-form-item label="课程描述">
          <el-input v-model="courseForm.description" type="textarea" :rows="3" />
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="courseForm.sortOrder" :min="0" />
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="courseForm.status">
            <el-radio :label="0">草稿</el-radio>
            <el-radio :label="1">发布</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showCourseDialog = false">取消</el-button>
        <el-button type="primary" @click="saveCourse">保存</el-button>
      </template>
    </el-dialog>
    
    <!-- 章节管理弹窗 -->
    <el-dialog v-model="showChapterDialog" title="章节管理" width="800px">
      <div class="chapter-header">
        <span>{{ currentCourse?.title }}</span>
        <el-button type="primary" size="small" @click="addChapter">添加章节</el-button>
      </div>
      <el-table :data="chapterList">
        <el-table-column prop="title" label="章节名称" />
        <el-table-column prop="sortOrder" label="排序" width="80" />
        <el-table-column label="操作" width="150">
          <template #default="{ row }">
            <el-button text type="primary" size="small" @click="editChapter(row)">编辑</el-button>
            <el-button text type="danger" size="small" @click="deleteChapter(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
    
    <!-- 章节编辑弹窗 -->
    <el-dialog v-model="showChapterEditDialog" :title="editingChapter ? '编辑章节' : '新建章节'" width="900px">
      <el-form :model="chapterForm" label-width="80px">
        <el-form-item label="章节名称">
          <el-input v-model="chapterForm.title" />
        </el-form-item>
        <el-form-item label="章节内容">
          <MdEditor v-model="chapterForm.content" :theme="themeStore.isDark ? 'dark' : 'light'" style="height: 400px;" />
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="chapterForm.sortOrder" :min="0" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showChapterEditDialog = false">取消</el-button>
        <el-button type="primary" @click="saveChapter">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { MdEditor } from 'md-editor-v3'
import 'md-editor-v3/lib/style.css'
import { useThemeStore } from '@/store'
import { ElMessage, ElMessageBox } from 'element-plus'

const themeStore = useThemeStore()
const loading = ref(false)

const showCourseDialog = ref(false)
const showChapterDialog = ref(false)
const showChapterEditDialog = ref(false)

const editingCourse = ref(null)
const editingChapter = ref(null)
const currentCourse = ref(null)

const courseForm = reactive({ title: '', stage: 1, description: '', sortOrder: 0, status: 0 })
const chapterForm = reactive({ title: '', content: '', sortOrder: 0 })

const courseList = ref([
  { id: 1, title: '第1周：认知重塑', stage: 1, chapterCount: 3, status: 1 },
  { id: 2, title: '第2周：K线基础', stage: 1, chapterCount: 4, status: 1 },
  { id: 3, title: '第3周：MACD精通', stage: 1, chapterCount: 4, status: 1 }
])

const chapterList = ref([])

const editCourse = (row) => {
  editingCourse.value = row
  Object.assign(courseForm, row)
  showCourseDialog.value = true
}

const saveCourse = () => {
  ElMessage.success('保存成功')
  showCourseDialog.value = false
}

const deleteCourse = (row) => {
  ElMessageBox.confirm('确定删除该课程吗？', '提示').then(() => {
    ElMessage.success('删除成功')
  })
}

const manageChapters = (row) => {
  currentCourse.value = row
  chapterList.value = [
    { id: 1, title: 'MACD的构成与原理', sortOrder: 1 },
    { id: 2, title: '金叉与死叉', sortOrder: 2 }
  ]
  showChapterDialog.value = true
}

const addChapter = () => {
  editingChapter.value = null
  Object.assign(chapterForm, { title: '', content: '', sortOrder: 0 })
  showChapterEditDialog.value = true
}

const editChapter = (row) => {
  editingChapter.value = row
  Object.assign(chapterForm, row)
  showChapterEditDialog.value = true
}

const saveChapter = () => {
  ElMessage.success('保存成功')
  showChapterEditDialog.value = false
}

const deleteChapter = (row) => {
  ElMessageBox.confirm('确定删除该章节吗？', '提示').then(() => {
    ElMessage.success('删除成功')
  })
}
</script>

<style lang="scss" scoped>
.chapter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}
</style>
