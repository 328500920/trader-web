<template>
  <el-button 
    :type="isFavorited ? 'warning' : 'default'"
    :text="text"
    :size="size"
    @click.stop="handleToggle"
    :loading="loading"
  >
    <el-icon>
      <StarFilled v-if="isFavorited" />
      <Star v-else />
    </el-icon>
    <span v-if="showText">{{ isFavorited ? '已收藏' : '收藏' }}</span>
  </el-button>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Star, StarFilled } from '@element-plus/icons-vue'
import { checkFavorite, toggleFavorite } from '@/api/learn'

const props = defineProps({
  targetType: {
    type: String,
    required: true // case, resource, topic, tool, quiz
  },
  targetId: {
    type: [Number, String],
    required: true
  },
  showText: {
    type: Boolean,
    default: true
  },
  text: {
    type: Boolean,
    default: false
  },
  size: {
    type: String,
    default: 'default'
  }
})

const emit = defineEmits(['change'])

const loading = ref(false)
const isFavorited = ref(false)

const checkStatus = async () => {
  try {
    const res = await checkFavorite({
      targetType: props.targetType,
      targetId: props.targetId
    })
    if (res.code === 200) {
      isFavorited.value = res.data
    }
  } catch (error) {
    console.error('检查收藏状态失败:', error)
  }
}

const handleToggle = async () => {
  loading.value = true
  try {
    const res = await toggleFavorite({
      targetType: props.targetType,
      targetId: props.targetId
    })
    if (res.code === 200) {
      isFavorited.value = res.data
      ElMessage.success(isFavorited.value ? '收藏成功' : '已取消收藏')
      emit('change', isFavorited.value)
    }
  } catch (error) {
    ElMessage.error('操作失败')
  } finally {
    loading.value = false
  }
}

watch(() => [props.targetType, props.targetId], () => {
  checkStatus()
})

onMounted(() => {
  checkStatus()
})
</script>
