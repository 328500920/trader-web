<template>
  <div class="not-found">
    <div class="content">
      <div class="code">404</div>
      <div class="title">页面不存在</div>
      <div class="desc">抱歉，您访问的页面不存在或已被移除</div>
      <el-button type="primary" @click="goHome">
        <el-icon><HomeFilled /></el-icon>
        返回首页
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { HomeFilled } from '@element-plus/icons-vue'

const router = useRouter()

const goHome = () => {
  router.push('/dashboard')
}
</script>

<style lang="scss" scoped>
.not-found {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-secondary);
}

.content {
  text-align: center;
}

.code {
  font-size: 120px;
  font-weight: bold;
  color: var(--primary-color);
  line-height: 1;
  margin-bottom: 16px;
}

.title {
  font-size: 24px;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.desc {
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: 24px;
}
</style>
