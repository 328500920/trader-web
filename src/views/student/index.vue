<template>
  <div class="page-container">
    <div class="page-header">
      <h2>学员管理</h2>
      <el-button type="primary" @click="openCreateDialog">
        <el-icon><Plus /></el-icon>新建用户
      </el-button>
    </div>
    
    <div class="card">
      <div class="search-bar">
        <el-input
          v-model="keyword"
          placeholder="搜索用户名/昵称"
          style="width: 200px"
          clearable
          @clear="loadData"
          @keyup.enter="loadData"
        >
          <template #append>
            <el-button @click="loadData">
              <el-icon><Search /></el-icon>
            </el-button>
          </template>
        </el-input>
      </div>

      <el-table :data="userList" v-loading="loading">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="username" label="用户名" width="120" />
        <el-table-column prop="nickname" label="昵称" width="120" />
        <el-table-column prop="email" label="邮箱" />
        <el-table-column label="角色" width="100">
          <template #default="{ row }">
            <el-tag :type="getRoleTagType(row.role)">
              {{ getRoleName(row.role) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="80">
          <template #default="{ row }">
            <el-switch 
              v-model="row.status" 
              :active-value="1" 
              :inactive-value="0" 
              @change="handleStatusChange(row)" 
            />
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="160">
          <template #default="{ row }">
            {{ formatDate(row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="280" fixed="right">
          <template #default="{ row }">
            <el-button text type="primary" size="small" @click="viewDetail(row)">详情</el-button>
            <el-button text type="primary" size="small" @click="editUser(row)">编辑</el-button>
            <el-button text type="info" size="small" @click="changeRole(row)">角色</el-button>
            <el-button text type="warning" size="small" @click="resetPwd(row)">重置密码</el-button>
            <el-button text type="danger" size="small" @click="deleteUser(row)">删除</el-button>
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
          @size-change="loadData"
          @current-change="loadData"
        />
      </div>
    </div>
    
    <!-- 新建/编辑用户对话框 -->
    <el-dialog v-model="showDialog" :title="editingUser ? '编辑用户' : '新建用户'" width="500px">
      <el-form :model="userForm" label-width="80px">
        <el-form-item label="用户名" required>
          <el-input v-model="userForm.username" :disabled="!!editingUser" />
        </el-form-item>
        <el-form-item label="昵称">
          <el-input v-model="userForm.nickname" />
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="userForm.email" />
        </el-form-item>
        <el-form-item label="角色" required>
          <el-select v-model="userForm.role" style="width: 100%;">
            <el-option label="讲师" value="teacher" />
            <el-option label="学员" value="student" />
          </el-select>
        </el-form-item>
        <el-form-item v-if="!editingUser" label="初始密码" required>
          <el-input v-model="userForm.password" type="password" show-password />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showDialog = false">取消</el-button>
        <el-button type="primary" @click="saveUser" :loading="saving">保存</el-button>
      </template>
    </el-dialog>

    <!-- 修改角色对话框 -->
    <el-dialog v-model="showRoleDialog" title="修改角色" width="400px">
      <el-form label-width="80px">
        <el-form-item label="用户">
          <span>{{ roleForm.username }}</span>
        </el-form-item>
        <el-form-item label="当前角色">
          <el-tag :type="getRoleTagType(roleForm.currentRole)">
            {{ getRoleName(roleForm.currentRole) }}
          </el-tag>
        </el-form-item>
        <el-form-item label="新角色" required>
          <el-select v-model="roleForm.newRole" style="width: 100%;">
            <el-option label="讲师" value="teacher" />
            <el-option label="学员" value="student" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showRoleDialog = false">取消</el-button>
        <el-button type="primary" @click="saveRole" :loading="savingRole">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Plus } from '@element-plus/icons-vue'
import { 
  getStudentList, 
  createStudent, 
  updateStudent, 
  deleteStudent, 
  updateStudentStatus, 
  resetStudentPassword, 
  updateStudentRole 
} from '@/api/student'

const router = useRouter()
const loading = ref(false)
const saving = ref(false)
const savingRole = ref(false)
const showDialog = ref(false)
const showRoleDialog = ref(false)
const editingUser = ref(null)

const userList = ref([])
const total = ref(0)
const pageNum = ref(1)
const pageSize = ref(10)
const keyword = ref('')

const userForm = reactive({
  username: '',
  nickname: '',
  email: '',
  role: 'student',
  password: ''
})

const roleForm = reactive({
  id: null,
  username: '',
  currentRole: '',
  newRole: ''
})

const getRoleName = (role) => {
  const map = { admin: '管理员', teacher: '讲师', student: '学员' }
  return map[role] || '未知'
}

const getRoleTagType = (role) => {
  const map = { admin: 'danger', teacher: 'warning', student: '' }
  return map[role] || 'info'
}

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  return dateStr.replace('T', ' ').substring(0, 19)
}

const loadData = async () => {
  loading.value = true
  try {
    const res = await getStudentList({
      pageNum: pageNum.value,
      pageSize: pageSize.value,
      keyword: keyword.value
    })
    userList.value = res.data.list
    total.value = res.data.total
  } catch (error) {
    ElMessage.error('加载用户列表失败')
  } finally {
    loading.value = false
  }
}

const openCreateDialog = () => {
  editingUser.value = null
  Object.assign(userForm, {
    username: '',
    nickname: '',
    email: '',
    role: 'student',
    password: ''
  })
  showDialog.value = true
}

const editUser = (row) => {
  editingUser.value = row
  Object.assign(userForm, {
    username: row.username,
    nickname: row.nickname,
    email: row.email,
    role: row.role,
    password: ''
  })
  showDialog.value = true
}

const saveUser = async () => {
  if (!userForm.username) {
    ElMessage.warning('请输入用户名')
    return
  }
  if (!editingUser.value && !userForm.password) {
    ElMessage.warning('请输入初始密码')
    return
  }

  saving.value = true
  try {
    if (editingUser.value) {
      await updateStudent(editingUser.value.id, userForm)
    } else {
      await createStudent(userForm)
    }
    ElMessage.success('保存成功')
    showDialog.value = false
    loadData()
  } catch (error) {
    ElMessage.error(error.message || '保存失败')
  } finally {
    saving.value = false
  }
}

const handleStatusChange = async (row) => {
  try {
    await updateStudentStatus(row.id, row.status)
    ElMessage.success('状态已更新')
  } catch (error) {
    row.status = row.status === 1 ? 0 : 1
    ElMessage.error(error.message || '更新状态失败')
  }
}

const changeRole = (row) => {
  roleForm.id = row.id
  roleForm.username = row.username
  roleForm.currentRole = row.role
  roleForm.newRole = row.role
  showRoleDialog.value = true
}

const saveRole = async () => {
  if (roleForm.newRole === roleForm.currentRole) {
    ElMessage.warning('角色未变更')
    return
  }

  savingRole.value = true
  try {
    await updateStudentRole(roleForm.id, roleForm.newRole)
    ElMessage.success('角色修改成功')
    showRoleDialog.value = false
    loadData()
  } catch (error) {
    ElMessage.error(error.message || '修改角色失败')
  } finally {
    savingRole.value = false
  }
}

const resetPwd = (row) => {
  ElMessageBox.prompt('请输入新密码', `重置 ${row.username} 的密码`, {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    inputType: 'password'
  }).then(async ({ value }) => {
    if (!value) {
      ElMessage.warning('请输入密码')
      return
    }
    try {
      await resetStudentPassword(row.id, value)
      ElMessage.success('密码已重置')
    } catch (error) {
      ElMessage.error(error.message || '重置密码失败')
    }
  }).catch(() => {})
}

const deleteUser = (row) => {
  ElMessageBox.confirm(`确定删除用户 ${row.username} 吗？`, '提示', { type: 'warning' }).then(async () => {
    try {
      await deleteStudent(row.id)
      ElMessage.success('删除成功')
      loadData()
    } catch (error) {
      ElMessage.error(error.message || '删除失败')
    }
  }).catch(() => {})
}

const viewDetail = (row) => {
  router.push(`/student/detail/${row.id}`)
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.page-container {
  padding: 20px;
}
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.page-header h2 {
  margin: 0;
}
.card {
  background: var(--bg-primary);
  border-radius: 8px;
  padding: 20px;
}
.search-bar {
  margin-bottom: 16px;
}
.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
