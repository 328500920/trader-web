<template>
  <div class="page-container">
    <div class="page-header">
      <h2>个人中心</h2>
    </div>
    
    <div class="profile-content">
      <div class="card profile-card">
        <div class="avatar-section">
          <el-avatar :size="80" :src="userStore.userInfo?.avatar">
            {{ userStore.nickname?.charAt(0) }}
          </el-avatar>
          <el-button size="small">更换头像</el-button>
        </div>
        
        <el-form :model="profileForm" label-width="80px">
          <el-form-item label="用户名">
            <el-input v-model="profileForm.username" disabled />
          </el-form-item>
          <el-form-item label="昵称">
            <el-input v-model="profileForm.nickname" />
          </el-form-item>
          <el-form-item label="邮箱">
            <el-input v-model="profileForm.email" />
          </el-form-item>
          <el-form-item label="手机号">
            <el-input v-model="profileForm.phone" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" :loading="profileLoading" @click="saveProfile">保存修改</el-button>
          </el-form-item>
        </el-form>
      </div>
      
      <div class="card password-card">
        <h3>修改密码</h3>
        <el-form :model="passwordForm" label-width="100px">
          <el-form-item label="当前密码">
            <el-input v-model="passwordForm.oldPassword" type="password" show-password />
          </el-form-item>
          <el-form-item label="新密码">
            <el-input v-model="passwordForm.newPassword" type="password" show-password />
          </el-form-item>
          <el-form-item label="确认新密码">
            <el-input v-model="passwordForm.confirmPassword" type="password" show-password />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" :loading="passwordLoading" @click="changePassword">修改密码</el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue'
import { useUserStore } from '@/store'
import { ElMessage } from 'element-plus'
import { updateProfile, changePassword as changePasswordApi } from '@/api/user'

const userStore = useUserStore()
const profileLoading = ref(false)
const passwordLoading = ref(false)

const profileForm = reactive({
  username: '',
  nickname: '',
  email: '',
  phone: ''
})

const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const saveProfile = async () => {
  profileLoading.value = true
  try {
    await updateProfile({
      nickname: profileForm.nickname,
      email: profileForm.email,
      phone: profileForm.phone
    })
    ElMessage.success('保存成功')
    // 刷新用户信息
    await userStore.getUserInfo()
  } catch (error) {
    console.error('保存失败:', error)
  } finally {
    profileLoading.value = false
  }
}

const changePassword = async () => {
  if (!passwordForm.oldPassword) {
    ElMessage.error('请输入当前密码')
    return
  }
  if (!passwordForm.newPassword) {
    ElMessage.error('请输入新密码')
    return
  }
  if (passwordForm.newPassword !== passwordForm.confirmPassword) {
    ElMessage.error('两次输入的密码不一致')
    return
  }
  passwordLoading.value = true
  try {
    await changePasswordApi({
      oldPassword: passwordForm.oldPassword,
      newPassword: passwordForm.newPassword
    })
    ElMessage.success('密码修改成功')
    // 清空表单
    passwordForm.oldPassword = ''
    passwordForm.newPassword = ''
    passwordForm.confirmPassword = ''
  } catch (error) {
    console.error('密码修改失败:', error)
  } finally {
    passwordLoading.value = false
  }
}

onMounted(() => {
  if (userStore.userInfo) {
    Object.assign(profileForm, userStore.userInfo)
  }
})
</script>

<style lang="scss" scoped>
.profile-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  max-width: 1000px;
}

.profile-card {
  .avatar-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    margin-bottom: 24px;
    padding-bottom: 24px;
    border-bottom: 1px solid var(--border-light);
  }
}

.password-card {
  h3 {
    font-size: 16px;
    margin-bottom: 20px;
  }
}

@media (max-width: 768px) {
  .profile-content {
    grid-template-columns: 1fr;
  }
}
</style>
