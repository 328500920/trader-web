<template>
  <div class="page-container">
    <div class="page-header">
      <div class="header-left">
        <el-button text @click="router.back()">
          <el-icon><ArrowLeft /></el-icon>返回
        </el-button>
        <h2>{{ isEdit ? '编辑交易' : '新建交易' }}</h2>
      </div>
    </div>
    
    <el-form 
      ref="formRef"
      :model="form" 
      :rules="rules"
      label-width="100px"
      class="trade-form"
    >
      <!-- 基本信息 -->
      <div class="card form-section">
        <h3>基本信息</h3>
        <el-row :gutter="20">
          <el-col :xs="24" :sm="12" :md="8">
            <el-form-item label="交易日期" prop="tradeDate">
              <el-date-picker v-model="form.tradeDate" type="date" placeholder="选择日期" style="width: 100%;" />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12" :md="8">
            <el-form-item label="交易品种" prop="symbol">
              <CryptoSelect v-model="form.symbol" />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12" :md="8">
            <el-form-item label="交易方向" prop="direction">
              <el-radio-group v-model="form.direction">
                <el-radio-button :label="1">做多</el-radio-button>
                <el-radio-button :label="2">做空</el-radio-button>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12" :md="8">
            <el-form-item label="使用策略" prop="strategy">
              <el-select v-model="form.strategy" placeholder="请选择" style="width: 100%;">
                <el-option label="趋势跟随" value="趋势跟随" />
                <el-option label="情绪反转" value="情绪反转" />
                <el-option label="突破策略" value="突破策略" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
      </div>
      
      <!-- 入场信息 -->
      <div class="card form-section">
        <h3>入场信息</h3>
        <el-row :gutter="20">
          <el-col :xs="24" :sm="12" :md="8">
            <el-form-item label="入场价格" prop="entryPrice">
              <el-input-number v-model="form.entryPrice" :precision="2" :min="0" style="width: 100%;" />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12" :md="8">
            <el-form-item label="入场时间">
              <el-date-picker v-model="form.entryTime" type="datetime" placeholder="选择时间" style="width: 100%;" />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12" :md="8">
            <el-form-item label="仓位大小">
              <el-input-number v-model="form.positionSize" :precision="2" :min="0" style="width: 100%;" />
              <span class="unit">USDT</span>
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12" :md="8">
            <el-form-item label="止损价">
              <el-input-number v-model="form.stopLoss" :precision="2" :min="0" style="width: 100%;" />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12" :md="8">
            <el-form-item label="止盈价">
              <el-input-number v-model="form.takeProfit" :precision="2" :min="0" style="width: 100%;" />
            </el-form-item>
          </el-col>
          <el-col :xs="24">
            <el-form-item label="入场理由">
              <el-input v-model="form.entryReason" type="textarea" :rows="3" placeholder="描述你的入场理由..." />
            </el-form-item>
          </el-col>
        </el-row>
      </div>
      
      <!-- 分析记录 -->
      <div class="card form-section">
        <h3>交易前分析</h3>
        <el-row :gutter="20">
          <el-col :xs="24" :md="12">
            <el-form-item label="宏观分析">
              <el-input v-model="form.macroAnalysis" type="textarea" :rows="2" placeholder="宏观环境分析..." />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :md="12">
            <el-form-item label="链上分析">
              <el-input v-model="form.chainAnalysis" type="textarea" :rows="2" placeholder="链上数据分析..." />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :md="12">
            <el-form-item label="情绪分析">
              <el-input v-model="form.sentimentAnalysis" type="textarea" :rows="2" placeholder="市场情绪分析..." />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :md="12">
            <el-form-item label="技术分析">
              <el-input v-model="form.technicalAnalysis" type="textarea" :rows="2" placeholder="技术面分析..." />
            </el-form-item>
          </el-col>
        </el-row>
      </div>
      
      <!-- 截图上传 -->
      <div class="card form-section">
        <h3>交易截图</h3>
        <el-upload
          v-model:file-list="fileList"
          action="/api/file/upload/image"
          list-type="picture-card"
          :on-preview="handlePreview"
          :on-remove="handleRemove"
          :headers="uploadHeaders"
        >
          <el-icon><Plus /></el-icon>
        </el-upload>
        <el-dialog v-model="previewVisible">
          <img :src="previewUrl" style="width: 100%;" />
        </el-dialog>
      </div>
      
      <!-- 出场信息（编辑时显示） -->
      <div v-if="isEdit" class="card form-section">
        <h3>出场信息</h3>
        <el-row :gutter="20">
          <el-col :xs="24" :sm="12" :md="8">
            <el-form-item label="出场价格">
              <el-input-number v-model="form.exitPrice" :precision="2" :min="0" style="width: 100%;" />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12" :md="8">
            <el-form-item label="出场时间">
              <el-date-picker v-model="form.exitTime" type="datetime" placeholder="选择时间" style="width: 100%;" />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12" :md="8">
            <el-form-item label="出场原因">
              <el-select v-model="form.exitReason" placeholder="请选择" style="width: 100%;">
                <el-option label="止盈" value="止盈" />
                <el-option label="止损" value="止损" />
                <el-option label="手动平仓" value="手动" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
      </div>
      
      <!-- 复盘（编辑时显示） -->
      <div v-if="isEdit" class="card form-section">
        <h3>交易复盘</h3>
        <el-row :gutter="20">
          <el-col :xs="24">
            <el-form-item label="复盘总结">
              <el-input v-model="form.review" type="textarea" :rows="4" placeholder="这笔交易做对了什么？做错了什么？下次如何改进？" />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12">
            <el-form-item label="情绪评分">
              <el-rate v-model="form.emotionScore" :max="10" show-score />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12">
            <el-form-item label="遵守纪律">
              <el-switch v-model="form.disciplineFollowed" active-text="是" inactive-text="否" />
            </el-form-item>
          </el-col>
        </el-row>
      </div>
      
      <!-- 提交按钮 -->
      <div class="form-actions">
        <el-button @click="router.back()">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmit">
          {{ isEdit ? '保存修改' : '创建交易' }}
        </el-button>
      </div>
    </el-form>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/store'
import { getTradeDetail, createTrade, updateTrade } from '@/api/trade'
import CryptoSelect from '@/components/CryptoSelect.vue'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const formRef = ref()
const submitting = ref(false)
const fileList = ref([])
const previewVisible = ref(false)
const previewUrl = ref('')

const isEdit = computed(() => !!route.params.id)

const uploadHeaders = computed(() => ({
  Authorization: `Bearer ${userStore.token}`
}))

const form = reactive({
  tradeDate: new Date(),
  symbol: '',
  direction: 1,
  strategy: '',
  entryPrice: null,
  entryTime: null,
  positionSize: null,
  stopLoss: null,
  takeProfit: null,
  entryReason: '',
  macroAnalysis: '',
  chainAnalysis: '',
  sentimentAnalysis: '',
  technicalAnalysis: '',
  exitPrice: null,
  exitTime: null,
  exitReason: '',
  review: '',
  emotionScore: 5,
  disciplineFollowed: true
})

const rules = {
  tradeDate: [{ required: true, message: '请选择交易日期', trigger: 'change' }],
  symbol: [{ required: true, message: '请选择交易品种', trigger: 'change' }],
  direction: [{ required: true, message: '请选择交易方向', trigger: 'change' }],
  entryPrice: [{ required: true, message: '请输入入场价格', trigger: 'blur' }]
}

const handlePreview = (file) => {
  previewUrl.value = file.url
  previewVisible.value = true
}

const handleRemove = (file) => {
  // 图片删除逻辑
}

const loadTrade = async () => {
  try {
    const res = await getTradeDetail(route.params.id)
    if (res.code === 200 && res.data) {
      Object.assign(form, res.data)
      if (res.data.images) {
        fileList.value = res.data.images.map(img => ({
          name: img.id,
          url: img.imageUrl
        }))
      }
    }
  } catch (error) {
    ElMessage.error('加载交易数据失败')
  }
}

const handleSubmit = async () => {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return
  
  submitting.value = true
  try {
    if (isEdit.value) {
      await updateTrade(route.params.id, form)
    } else {
      await createTrade(form)
    }
    ElMessage.success(isEdit.value ? '修改成功' : '创建成功')
    router.push('/trade/list')
  } catch (error) {
    ElMessage.error('保存失败')
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  if (isEdit.value) {
    loadTrade()
  }
})
</script>

<style lang="scss" scoped>
.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.trade-form {
  max-width: 1200px;
}

.form-section {
  margin-bottom: 20px;
  
  h3 {
    font-size: 16px;
    margin-bottom: 20px;
    padding-bottom: 12px;
    border-bottom: 1px solid var(--border-light);
  }
}

.unit {
  margin-left: 8px;
  color: var(--text-secondary);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px;
  background-color: var(--bg-primary);
  border-radius: 8px;
}
</style>
