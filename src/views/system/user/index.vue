<template>
  <div class="page-container">
    <div class="page-header">
      <h2>用户管理</h2>
      <el-button type="primary" @click="showDialog = true">
        <el-icon><Plus /></el-icon>新建用户
      </el-button>
    </div>
    
    <div class="card">
      <el-table :data="userList" v-loading="loading">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="username" label="用户名" width="120" />
        <el-table-column prop="nickname" label="昵称" width="120" />
        <el-table-column prop="email" label="邮箱" />
        <el-table-column label="角色" width="100">
          <template #default="{ row }">
            <el-tag :type="row.roleCode === 'admin' ? 'danger' : 'info'">
              {{ row.roleName }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-switch v-model="row.status" :active-value="1" :inactive-value="0" @change="handleStatusChange(row)" />
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="160" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button text type="primary" size="small" @click="editUser(row)">编辑</el-button>
            <el-button text type="warning" size="small" @click="resetPwd(row)">重置密码</el-button>
            <el-button text type="danger" size="small" @click="deleteUser(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    
    <el-dialog v-model="showDialog" :title="editingUser ? '编辑用户' : '新建用户'" width="500px">
      <el-form :model="userForm" label-width="80px">
        <el-form-item label="用户名">
          <el-input v-model="userForm.username" :disabled="!!editingUser" />
        </el-form-item>
        <el-form-item label="昵称">
          <el-input v-model="userForm.nickname" />
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="userForm.email" />
        </el-form-item>
        <el-form-item label="角色">
          <el-select v-model="userForm.roleId" style="width: 100%;">
            <el-option label="管理员" :value="1" />
            <el-option label="普通用户" :value="2" />
          </el-select>
        </el-form-item>
        <el-form-item v-if="!editingUser" label="初始密码">
          <el-input v-model="userForm.password" type="password" show-password />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showDialog = false">取消</el-button>
        <el-button type="primary" @click="saveUser">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const loading = ref(false)
const showDialog = ref(false)
const editingUser = ref(null)

const userForm = reactive({
  username: '',
  nickname: '',
  email: '',
  roleId: 2,
  password: ''
})

const userList = ref([
  { id: 1, username: 'admin', nickname: '管理员', email: 'admin@example.com', roleCode: 'admin', roleName: '管理员', status: 1, createTime: '2024-12-01 10:00' },
  { id: 2, username: 'user1', nickname: '交易员小王', email: 'user1@example.com', roleCode: 'user', roleName: '普通用户', status: 1, createTime: '2024-12-10 15:30' }
])

const editUser = (row) => {
  editingUser.value = row
  Object.assign(userForm, row)
  showDialog.value = true
}

const saveUser = () => {
  // TODO: 调用API
  ElMessage.success('保存成功')
  showDialog.value = false
}

const handleStatusChange = (row) => {
  // TODO: 调用API
  ElMessage.success('状态已更新')
}

const resetPwd = (row) => {
  ElMessageBox.confirm(`确定重置用户 ${row.username} 的密码吗？`, '提示').then(() => {
    // TODO: 调用API
    ElMessage.success('密码已重置为默认密码')
  })
}

const deleteUser = (row) => {
  ElMessageBox.confirm(`确定删除用户 ${row.username} 吗？`, '提示', { type: 'warning' }).then(() => {
    // TODO: 调用API
    ElMessage.success('删除成功')
  })
}
</script>
