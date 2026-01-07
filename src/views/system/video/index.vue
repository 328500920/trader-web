<template>
  <div class="page-container">
    <div class="page-header">
      <h2>视频课程管理</h2>
      <el-button type="primary" @click="openCreateDialog">
        <el-icon><Plus /></el-icon>新建视频
      </el-button>
    </div>
    
    <!-- 筛选栏 -->
    <div class="filter-bar">
      <el-select v-model="filterCategory" placeholder="分类筛选" clearable style="width: 150px" @change="loadVideos">
        <el-option v-for="cat in categories" :key="cat" :label="cat" :value="cat" />
      </el-select>
      <el-select v-model="filterStatus" placeholder="状态筛选" clearable style="width: 120px" @change="loadVideos">
        <el-option label="已发布" :value="1" />
        <el-option label="草稿" :value="0" />
      </el-select>
    </div>
    
    <div class="card">
      <el-table :data="videoList" v-loading="loading">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column label="封面" width="120">
          <template #default="{ row }">
            <img v-if="row.coverUrl" :src="getFullUrl(row.coverUrl)" class="cover-thumb" />
            <span v-else class="no-cover">无封面</span>
          </template>
        </el-table-column>
        <el-table-column prop="title" label="标题" min-width="200" />
        <el-table-column prop="category" label="分类" width="100" />
        <el-table-column label="时长" width="100">
          <template #default="{ row }">
            {{ formatDuration(row.duration) }}
          </template>
        </el-table-column>
        <el-table-column prop="viewCount" label="观看" width="80" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'info'">
              {{ row.status === 1 ? '已发布' : '草稿' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button text type="primary" size="small" @click="editVideo(row)">编辑</el-button>
            <el-button text type="warning" size="small" @click="toggleStatus(row)">
              {{ row.status === 1 ? '下架' : '发布' }}
            </el-button>
            <el-button text type="danger" size="small" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <div class="pagination">
        <el-pagination
          v-model:current-page="pageNum"
          v-model:page-size="pageSize"
          :total="total"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next"
          @size-change="loadVideos"
          @current-change="loadVideos"
        />
      </div>
    </div>
    
    <!-- 编辑抽屉 -->
    <el-drawer 
      v-model="showDrawer" 
      :title="editingVideo ? '编辑视频' : '新建视频'" 
      size="50%"
      :close-on-click-modal="false"
    >
      <el-form :model="videoForm" label-width="100px" :rules="rules" ref="formRef">
        <el-form-item label="视频标题" prop="title">
          <el-input v-model="videoForm.title" placeholder="请输入视频标题" />
        </el-form-item>
        
        <el-form-item label="视频文件" prop="videoUrl">
          <div class="upload-area">
            <div v-if="videoForm.videoUrl" class="uploaded-video">
              <el-icon><VideoPlay /></el-icon>
              <span>视频已上传</span>
              <el-button text type="danger" @click="videoForm.videoUrl = ''">删除</el-button>
            </div>
            <el-upload
              v-else
              :show-file-list="false"
              :before-upload="beforeVideoUpload"
              :http-request="handleVideoUpload"
              accept=".mp4,.webm,.avi,.mov,.mkv,.flv,.wmv"
            >
              <div class="upload-trigger">
                <el-icon><Upload /></el-icon>
                <span>点击上传视频</span>
                <p class="upload-tip">支持 mp4, webm, avi, mov 等格式，最大 1GB</p>
              </div>
            </el-upload>
            <el-progress 
              v-if="uploadProgress > 0 && uploadProgress < 100" 
              :percentage="uploadProgress" 
              :stroke-width="6"
            />
          </div>
        </el-form-item>
        
        <el-form-item label="封面图">
          <div class="cover-upload">
            <el-upload
              :show-file-list="false"
              :before-upload="beforeCoverUpload"
              :http-request="handleCoverUpload"
              accept="image/*"
            >
              <img v-if="videoForm.coverUrl" :src="getFullUrl(videoForm.coverUrl)" class="cover-preview" />
              <div v-else class="cover-placeholder">
                <el-icon><Plus /></el-icon>
                <span>上传封面</span>
              </div>
            </el-upload>
          </div>
        </el-form-item>
        
        <el-form-item label="视频描述">
          <el-input v-model="videoForm.description" type="textarea" :rows="3" placeholder="请输入视频描述" />
        </el-form-item>
        
        <el-form-item label="分类" prop="category">
          <el-select v-model="videoForm.category" filterable allow-create placeholder="选择或输入分类" style="width: 100%">
            <el-option v-for="cat in categories" :key="cat" :label="cat" :value="cat" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="标签">
          <el-input v-model="videoForm.tags" placeholder="多个标签用逗号分隔" />
        </el-form-item>
        
        <el-form-item label="时长(秒)">
          <el-input-number v-model="videoForm.duration" :min="0" />
        </el-form-item>
        
        <el-form-item label="排序">
          <el-input-number v-model="videoForm.sortOrder" :min="0" />
        </el-form-item>
        
        <el-form-item label="状态">
          <el-radio-group v-model="videoForm.status">
            <el-radio :label="0">草稿</el-radio>
            <el-radio :label="1">发布</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="showDrawer = false">取消</el-button>
        <el-button type="primary" @click="saveVideo" :loading="saving">保存</el-button>
      </template>
    </el-drawer>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { Plus, Upload, VideoPlay } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  getAdminVideoList, 
  getVideoCategories,
  createVideo, 
  updateVideo, 
  deleteVideo,
  uploadVideoFile,
  uploadVideoCover
} from '@/api/video'

const loading = ref(false)
const saving = ref(false)
const showDrawer = ref(false)
const editingVideo = ref(null)
const uploadProgress = ref(0)

const videoList = ref([])
const categories = ref([])
const pageNum = ref(1)
const pageSize = ref(10)
const total = ref(0)
const filterCategory = ref('')
const filterStatus = ref(null)

const formRef = ref(null)
const videoForm = reactive({
  title: '',
  videoUrl: '',
  coverUrl: '',
  description: '',
  category: '',
  tags: '',
  duration: 0,
  sortOrder: 0,
  status: 0
})

const rules = {
  title: [{ required: true, message: '请输入视频标题', trigger: 'blur' }],
  videoUrl: [{ required: true, message: '请上传视频文件', trigger: 'change' }]
}

const getFullUrl = (url) => {
  if (!url) return ''
  if (url.startsWith('http')) return url
  // 视频和图片通过后端静态资源访问，需要加上 /api 前缀
  return '/api' + url
}

const formatDuration = (seconds) => {
  if (!seconds) return '00:00'
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0) {
    return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

const loadVideos = async () => {
  loading.value = true
  try {
    const res = await getAdminVideoList({
      pageNum: pageNum.value,
      pageSize: pageSize.value,
      category: filterCategory.value || undefined,
      status: filterStatus.value
    })
    if (res.code === 200) {
      videoList.value = res.data.list || []
      total.value = res.data.total || 0
    }
  } catch (error) {
    ElMessage.error('加载视频列表失败')
  } finally {
    loading.value = false
  }
}

const loadCategories = async () => {
  try {
    const res = await getVideoCategories()
    if (res.code === 200) {
      categories.value = res.data || []
    }
  } catch (error) {
    console.error('加载分类失败', error)
  }
}

const openCreateDialog = () => {
  editingVideo.value = null
  Object.assign(videoForm, {
    title: '',
    videoUrl: '',
    coverUrl: '',
    description: '',
    category: '',
    tags: '',
    duration: 0,
    sortOrder: videoList.value.length,
    status: 0
  })
  showDrawer.value = true
}

const editVideo = (row) => {
  editingVideo.value = row
  Object.assign(videoForm, {
    title: row.title,
    videoUrl: row.videoUrl,
    coverUrl: row.coverUrl,
    description: row.description,
    category: row.category,
    tags: row.tags,
    duration: row.duration,
    sortOrder: row.sortOrder,
    status: row.status
  })
  showDrawer.value = true
}

const beforeVideoUpload = (file) => {
  const maxSize = 1024 * 1024 * 1024 // 1GB
  if (file.size > maxSize) {
    ElMessage.error('视频文件不能超过1GB')
    return false
  }
  return true
}

const handleVideoUpload = async ({ file }) => {
  uploadProgress.value = 0
  try {
    const res = await uploadVideoFile(file, (progressEvent) => {
      uploadProgress.value = Math.round((progressEvent.loaded / progressEvent.total) * 100)
    })
    if (res.code === 200) {
      videoForm.videoUrl = res.data.url
      ElMessage.success('视频上传成功')
    } else {
      ElMessage.error(res.message || '上传失败')
    }
  } catch (error) {
    ElMessage.error('上传失败: ' + (error.message || '未知错误'))
  } finally {
    uploadProgress.value = 0
  }
}

const beforeCoverUpload = (file) => {
  const isImage = file.type.startsWith('image/')
  if (!isImage) {
    ElMessage.error('请上传图片文件')
    return false
  }
  return true
}

const handleCoverUpload = async ({ file }) => {
  try {
    const res = await uploadVideoCover(file)
    if (res.code === 200) {
      videoForm.coverUrl = res.data.url
      ElMessage.success('封面上传成功')
    } else {
      ElMessage.error(res.message || '上传失败')
    }
  } catch (error) {
    ElMessage.error('上传失败')
  }
}

const saveVideo = async () => {
  try {
    await formRef.value.validate()
  } catch {
    return
  }
  
  saving.value = true
  try {
    if (editingVideo.value) {
      await updateVideo(editingVideo.value.id, videoForm)
    } else {
      await createVideo(videoForm)
    }
    ElMessage.success('保存成功')
    showDrawer.value = false
    loadVideos()
    loadCategories()
  } catch (error) {
    ElMessage.error(error.message || '保存失败')
  } finally {
    saving.value = false
  }
}

const toggleStatus = async (row) => {
  const newStatus = row.status === 1 ? 0 : 1
  const action = newStatus === 1 ? '发布' : '下架'
  
  try {
    await ElMessageBox.confirm(`确定${action}该视频吗？`, '提示')
    await updateVideo(row.id, { ...row, status: newStatus })
    ElMessage.success(`${action}成功`)
    loadVideos()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(`${action}失败`)
    }
  }
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm('确定删除该视频吗？删除后无法恢复', '警告', { type: 'warning' })
    await deleteVideo(row.id)
    ElMessage.success('删除成功')
    loadVideos()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

onMounted(() => {
  loadVideos()
  loadCategories()
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

.filter-bar {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.card {
  background: var(--bg-primary);
  border-radius: 8px;
  padding: 20px;
}

.cover-thumb {
  width: 80px;
  height: 45px;
  object-fit: cover;
  border-radius: 4px;
}

.no-cover {
  color: var(--text-secondary);
  font-size: 12px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.upload-area {
  width: 100%;
}

.uploaded-video {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: var(--bg-secondary);
  border-radius: 8px;
  
  .el-icon {
    font-size: 24px;
    color: var(--primary-color);
  }
}

.upload-trigger {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  border: 2px dashed var(--border-color);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  
  &:hover {
    border-color: var(--primary-color);
  }
  
  .el-icon {
    font-size: 32px;
    color: var(--text-secondary);
    margin-bottom: 8px;
  }
  
  .upload-tip {
    font-size: 12px;
    color: var(--text-secondary);
    margin-top: 8px;
  }
}

.cover-upload {
  .cover-preview {
    width: 160px;
    height: 90px;
    object-fit: cover;
    border-radius: 8px;
    cursor: pointer;
  }
  
  .cover-placeholder {
    width: 160px;
    height: 90px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    border: 2px dashed var(--border-color);
    border-radius: 8px;
    cursor: pointer;
    
    &:hover {
      border-color: var(--primary-color);
    }
    
    .el-icon {
      font-size: 24px;
      color: var(--text-secondary);
    }
    
    span {
      font-size: 12px;
      color: var(--text-secondary);
      margin-top: 4px;
    }
  }
}
</style>
