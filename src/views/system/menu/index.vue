<template>
  <div class="menu-manage">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>菜单权限管理</span>
          <el-button type="primary" @click="handleSave" :loading="saving">
            保存配置
          </el-button>
        </div>
      </template>
      
      <el-table
        :data="menuList"
        row-key="id"
        :tree-props="{ children: 'children' }"
        v-loading="loading"
        default-expand-all
      >
        <el-table-column prop="menuName" label="菜单名称" min-width="180">
          <template #default="{ row }">
            <span :style="{ paddingLeft: row.parentId === 0 ? '0' : '20px' }">
              {{ row.menuName }}
            </span>
          </template>
        </el-table-column>
        
        <el-table-column prop="menuKey" label="菜单标识" width="150" />
        
        <el-table-column prop="path" label="路径" width="120" />
        
        <el-table-column label="显示" width="80" align="center">
          <template #default="{ row }">
            <el-switch
              v-model="row.visible"
              :active-value="1"
              :inactive-value="0"
              @change="markChanged(row)"
            />
          </template>
        </el-table-column>
        
        <el-table-column label="管理员" width="80" align="center">
          <template #default="{ row }">
            <el-checkbox
              v-model="row.roleAdmin"
              :true-label="1"
              :false-label="0"
              disabled
            />
          </template>
        </el-table-column>
        
        <el-table-column label="教师" width="80" align="center">
          <template #default="{ row }">
            <el-checkbox
              v-model="row.roleTeacher"
              :true-label="1"
              :false-label="0"
              @change="markChanged(row)"
            />
          </template>
        </el-table-column>
        
        <el-table-column label="学员" width="80" align="center">
          <template #default="{ row }">
            <el-checkbox
              v-model="row.roleStudent"
              :true-label="1"
              :false-label="0"
              @change="markChanged(row)"
            />
          </template>
        </el-table-column>
        
        <el-table-column prop="sortOrder" label="排序" width="80" align="center" />
      </el-table>
      
      <div class="tips">
        <p>说明：</p>
        <ul>
          <li>「显示」关闭后，所有角色都看不到该菜单</li>
          <li>管理员始终可以看到所有显示的菜单</li>
          <li>勾选「教师」或「学员」表示该角色可以看到此菜单</li>
          <li>父菜单隐藏后，其子菜单也会隐藏</li>
        </ul>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getAllMenus, batchUpdateMenus } from '@/api/menu'

const loading = ref(false)
const saving = ref(false)
const menuList = ref([])
const changedMenus = ref(new Set())

const loadMenus = async () => {
  loading.value = true
  try {
    const res = await getAllMenus()
    if (res.code === 200) {
      menuList.value = res.data || []
    }
  } catch (error) {
    ElMessage.error('加载菜单失败')
  } finally {
    loading.value = false
  }
}

const markChanged = (row) => {
  changedMenus.value.add(row.id)
}

const handleSave = async () => {
  if (changedMenus.value.size === 0) {
    ElMessage.info('没有修改')
    return
  }
  
  // 收集所有修改的菜单（包括子菜单）
  const collectChangedMenus = (menus) => {
    const result = []
    for (const menu of menus) {
      if (changedMenus.value.has(menu.id)) {
        result.push({
          id: menu.id,
          visible: menu.visible,
          roleAdmin: menu.roleAdmin,
          roleTeacher: menu.roleTeacher,
          roleStudent: menu.roleStudent
        })
      }
      if (menu.children && menu.children.length > 0) {
        result.push(...collectChangedMenus(menu.children))
      }
    }
    return result
  }
  
  const menusToUpdate = collectChangedMenus(menuList.value)
  
  saving.value = true
  try {
    const res = await batchUpdateMenus(menusToUpdate)
    if (res.code === 200) {
      ElMessage.success('保存成功，刷新页面后生效')
      changedMenus.value.clear()
    }
  } catch (error) {
    ElMessage.error('保存失败')
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  loadMenus()
})
</script>

<style scoped>
.menu-manage {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.tips {
  margin-top: 20px;
  padding: 16px;
  background: var(--el-fill-color-light);
  border-radius: 8px;
  font-size: 14px;
  color: var(--el-text-color-secondary);
}

.tips p {
  margin: 0 0 8px 0;
  font-weight: 500;
}

.tips ul {
  margin: 0;
  padding-left: 20px;
}

.tips li {
  margin: 4px 0;
}
</style>
