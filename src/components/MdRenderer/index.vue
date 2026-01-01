<template>
  <div class="md-renderer">
    <!-- 渲染解析后的内容块 -->
    <template v-for="(block, index) in parsedBlocks" :key="index">
      <!-- K线图表块 -->
      <MdCandlestick 
        v-if="block.type === 'candlestick'"
        :patternId="block.patternId"
        :height="block.height || 300"
        :showVolume="block.showVolume || false"
        :showTooltip="block.showTooltip !== false"
      />
      <!-- 普通Markdown块 -->
      <MdPreview 
        v-else
        :modelValue="block.content"
        :theme="theme"
        previewTheme="github"
        class="md-content-block"
      />
    </template>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { MdPreview } from 'md-editor-v3'
import 'md-editor-v3/lib/preview.css'
import MdCandlestick from '@/components/CandlestickChart/MdCandlestick.vue'

const props = defineProps({
  content: { type: String, default: '' },
  theme: { type: String, default: 'light' }
})

/**
 * 解析Markdown内容，提取K线图表块
 * 支持语法：
 * :::candlestick pattern_id:::
 * 或
 * :::candlestick
 * { "pattern": "pattern_id", "height": 350, "showVolume": true }
 * :::
 */
const parsedBlocks = computed(() => {
  const content = props.content || ''
  const blocks = []
  
  // 匹配 :::candlestick 语法
  // 模式1: :::candlestick pattern_id:::
  // 模式2: :::candlestick\n{json}\n:::
  const regex = /:::candlestick\s*(\w+)?(?:\s*:::|[\r\n]+([\s\S]*?):::)/g
  
  let lastIndex = 0
  let match
  
  while ((match = regex.exec(content)) !== null) {
    // 添加匹配前的普通内容
    if (match.index > lastIndex) {
      const mdContent = content.slice(lastIndex, match.index).trim()
      if (mdContent) {
        blocks.push({ type: 'markdown', content: mdContent })
      }
    }
    
    // 解析K线图表配置
    const patternId = match[1]
    const jsonConfig = match[2]
    
    if (patternId) {
      // 简单语法: :::candlestick hammer:::
      blocks.push({ type: 'candlestick', patternId })
    } else if (jsonConfig) {
      // JSON配置语法
      try {
        const config = JSON.parse(jsonConfig.trim())
        blocks.push({
          type: 'candlestick',
          patternId: config.pattern,
          height: config.height,
          showVolume: config.showVolume,
          showTooltip: config.showTooltip
        })
      } catch (e) {
        // JSON解析失败，作为普通文本处理
        blocks.push({ type: 'markdown', content: match[0] })
      }
    }
    
    lastIndex = match.index + match[0].length
  }
  
  // 添加剩余内容
  if (lastIndex < content.length) {
    const mdContent = content.slice(lastIndex).trim()
    if (mdContent) {
      blocks.push({ type: 'markdown', content: mdContent })
    }
  }
  
  // 如果没有任何K线图表，返回原始内容
  if (blocks.length === 0 && content.trim()) {
    blocks.push({ type: 'markdown', content })
  }
  
  return blocks
})
</script>

<style lang="scss" scoped>
.md-renderer {
  .md-content-block {
    :deep(h2), :deep(h3), :deep(h4) {
      margin-top: 24px;
      margin-bottom: 12px;
    }
    
    :deep(p) {
      line-height: 1.8;
      margin-bottom: 16px;
    }
    
    :deep(ul), :deep(ol) {
      padding-left: 20px;
      margin-bottom: 16px;
      
      li {
        line-height: 1.8;
        margin-bottom: 8px;
      }
    }
  }
}
</style>
