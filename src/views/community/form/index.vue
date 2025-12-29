<template>
  <div class="page-container">
    <div class="page-header">
      <el-button text @click="router.back()"><el-icon><ArrowLeft /></el-icon>返回</el-button>
      <h2>发布帖子</h2>
    </div>
    
    <div class="card">
      <el-form :model="form" label-width="80px">
        <el-form-item label="标题">
          <el-input v-model="form.title" placeholder="请输入标题" maxlength="100" show-word-limit />
        </el-form-item>
        <el-form-item label="分类">
          <el-select v-model="form.category" placeholder="请选择分类">
            <el-option label="学习心得" value="学习心得" />
            <el-option label="交易分享" value="交易分享" />
            <el-option label="问答" value="问答" />
          </el-select>
        </el-form-item>
        <el-form-item label="内容">
          <MdEditor v-model="form.content" :theme="themeStore.isDark ? 'dark' : 'light'" style="height: 400px;" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSubmit">发布</el-button>
          <el-button @click="router.back()">取消</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { reactive } from 'vue'
import { useRouter } from 'vue-router'
import { MdEditor } from 'md-editor-v3'
import 'md-editor-v3/lib/style.css'
import { useThemeStore } from '@/store'
import { ElMessage } from 'element-plus'

const router = useRouter()
const themeStore = useThemeStore()

const form = reactive({
  title: '',
  category: '',
  content: ''
})

const handleSubmit = () => {
  if (!form.title || !form.category || !form.content) {
    ElMessage.warning('请填写完整')
    return
  }
  // TODO: 调用API
  ElMessage.success('发布成功')
  router.push('/community/list')
}
</script>

<style lang="scss" scoped>
.page-header {
  display: flex;
  align-items: center;
  gap: 12px;
}
</style>
