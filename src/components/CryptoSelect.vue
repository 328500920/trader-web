<template>
  <el-select
    :model-value="modelValue"
    @update:model-value="handleChange"
    :placeholder="placeholder"
    :clearable="clearable"
    :disabled="disabled"
    filterable
    :style="{ width: width }"
  >
    <el-option
      v-for="crypto in cryptoList"
      :key="crypto.code"
      :label="`${crypto.code}/USDT`"
      :value="`${crypto.code}/USDT`"
    >
      <span class="crypto-option">
        <span class="crypto-code">{{ crypto.code }}</span>
        <span class="crypto-name">{{ crypto.nameCn || crypto.name }}</span>
      </span>
    </el-option>
  </el-select>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getCryptoList } from '@/api/crypto'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: '请选择币种'
  },
  clearable: {
    type: Boolean,
    default: true
  },
  disabled: {
    type: Boolean,
    default: false
  },
  width: {
    type: String,
    default: '100%'
  }
})

const emit = defineEmits(['update:modelValue', 'change'])

const cryptoList = ref([])

const handleChange = (value) => {
  emit('update:modelValue', value)
  emit('change', value)
}

const loadCryptoList = async () => {
  try {
    const res = await getCryptoList()
    if (res.code === 200) {
      cryptoList.value = res.data || []
    }
  } catch (error) {
    console.error('加载币种列表失败:', error)
  }
}

onMounted(() => {
  loadCryptoList()
})
</script>

<style scoped>
.crypto-option {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.crypto-code {
  font-weight: 600;
}

.crypto-name {
  font-size: 12px;
  color: #999;
}
</style>
