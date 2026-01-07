<template>
  <div class="page-container">
    <div class="page-header">
      <h2>🤖 AI模型管理</h2>
      <el-button type="primary" @click="openCreateDialog">
        <el-icon><Plus /></el-icon>新增模型
      </el-button>
    </div>
    
    <el-alert type="info" :closable="false" style="margin-bottom: 16px">
      💡 同一时间只能启用一个模型，启用新模型会自动禁用其他模型
    </el-alert>
    
    <el-card>
      <el-table :data="modelList" v-loading="loading">
        <el-table-column prop="name" label="模型名称" width="120" />
        <el-table-column prop="provider" label="提供商" width="100">
          <template #default="{ row }">
            <el-tag>{{ row.provider }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="model" label="模型标识" width="150" />
        <el-table-column prop="apiUrl" label="API地址" min-width="200" show-overflow-tooltip />
        <el-table-column prop="apiKey" label="API Key" width="150">
          <template #default="{ row }">
            <span class="api-key">{{ row.apiKey || '未配置' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.isActive ? 'success' : 'info'">
              {{ row.isActive ? '已启用' : '未启用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button text type="primary" size="small" @click="editModel(row)">编辑</el-button>
            <el-button 
              v-if="!row.isActive" 
              text type="success" 
              size="small" 
              @click="handleActivate(row)"
            >启用</el-button>
            <el-button 
              v-if="!row.isActive"
              text type="danger" 
              size="small" 
              @click="handleDelete(row)"
            >删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    
    <!-- 编辑弹窗 -->
    <el-dialog 
      v-model="showDialog" 
      :title="editingModel ? '编辑模型' : '新增模型'"
      width="500px"
    >
      <el-form :model="modelForm" label-width="100px" :rules="rules" ref="formRef">
        <el-form-item label="模型名称" prop="name">
          <el-input v-model="modelForm.name" placeholder="如：DeepSeek" />
        </el-form-item>
        
        <el-form-item label="提供商" prop="provider">
          <el-select v-model="modelForm.provider" placeholder="选择提供商" style="width: 100%">
            <el-option label="DeepSeek" value="deepseek" />
            <el-option label="通义千问" value="qwen" />
            <el-option label="OpenAI" value="openai" />
            <el-option label="其他" value="other" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="模型标识" prop="model">
          <el-input v-model="modelForm.model" placeholder="如：deepseek-chat" />
        </el-form-item>
        
        <el-form-item label="API地址" prop="apiUrl">
          <el-input v-model="modelForm.apiUrl" placeholder="https://api.deepseek.com/v1/chat/completions" />
        </el-form-item>
        
        <el-form-item label="API Key" prop="apiKey">
          <el-input 
            v-model="modelForm.apiKey" 
            type="password" 
            show-password
            placeholder="输入API Key"
          />
        </el-form-item>
        
        <el-form-item label="最大Token">
          <el-input-number v-model="modelForm.maxTokens" :min="1000" :max="32000" />
        </el-form-item>
        
        <el-form-item label="温度参数">
          <el-slider v-model="modelForm.temperature" :min="0" :max="2" :step="0.1" show-input />
        </el-form-item>
        
        <el-form-item label="备注">
          <el-input v-model="modelForm.remark" type="textarea" :rows="2" />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="showDialog = false">取消</el-button>
        <el-button type="primary" @click="saveModel" :loading="saving">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getModelList, createModel, updateModel, activateModel, deleteModel } from '@/api/ai'

const loading = ref(false)
const saving = ref(false)
const showDialog = ref(false)
const editingModel = ref(null)
const modelList = ref([])
const formRef = ref(null)

const modelForm = reactive({
  name: '',
  provider: '',
  model: '',
  apiUrl: '',
  apiKey: '',
  maxTokens: 4096,
  temperature: 0.7,
  remark: ''
})

const rules = {
  name: [{ required: true, message: '请输入模型名称', trigger: 'blur' }],
  provider: [{ required: true, message: '请选择提供商', trigger: 'change' }],
  model: [{ required: true, message: '请输入模型标识', trigger: 'blur' }],
  apiUrl: [{ required: true, message: '请输入API地址', trigger: 'blur' }]
}

const loadModels = async () => {
  loading.value = true
  try {
    const res = await getModelList()
    if (res.code === 200) {
      modelList.value = res.data || []
    }
  } catch (error) {
    ElMessage.error('加载模型列表失败')
  } finally {
    loading.value = false
  }
}

const openCreateDialog = () => {
  editingModel.value = null
  Object.assign(modelForm, {
    name: '',
    provider: '',
    model: '',
    apiUrl: '',
    apiKey: '',
    maxTokens: 4096,
    temperature: 0.7,
    remark: ''
  })
  showDialog.value = true
}

const editModel = (row) => {
  editingModel.value = row
  Object.assign(modelForm, {
    name: row.name,
    provider: row.provider,
    model: row.model,
    apiUrl: row.apiUrl,
    apiKey: '', // 不回显API Key
    maxTokens: row.maxTokens,
    temperature: row.temperature,
    remark: row.remark
  })
  showDialog.value = true
}

const saveModel = async () => {
  try {
    await formRef.value.validate()
  } catch {
    return
  }
  
  saving.value = true
  try {
    const data = { ...modelForm }
    // 如果API Key为空且是编辑模式，不更新API Key
    if (!data.apiKey && editingModel.value) {
      delete data.apiKey
    }
    
    if (editingModel.value) {
      await updateModel(editingModel.value.id, data)
    } else {
      await createModel(data)
    }
    ElMessage.success('保存成功')
    showDialog.value = false
    loadModels()
  } catch (error) {
    ElMessage.error(error.message || '保存失败')
  } finally {
    saving.value = false
  }
}

const handleActivate = async (row) => {
  try {
    await ElMessageBox.confirm(`确定启用 ${row.name} 模型吗？`, '提示')
    await activateModel(row.id)
    ElMessage.success('启用成功')
    loadModels()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('启用失败')
    }
  }
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(`确定删除 ${row.name} 模型吗？`, '警告', { type: 'warning' })
    await deleteModel(row.id)
    ElMessage.success('删除成功')
    loadModels()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '删除失败')
    }
  }
}

onMounted(() => {
  loadModels()
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

.api-key {
  font-family: monospace;
  font-size: 12px;
  color: var(--text-secondary);
}
</style>
