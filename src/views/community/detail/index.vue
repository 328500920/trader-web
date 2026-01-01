<template>
  <div class="page-container">
    <el-button text @click="router.back()" style="margin-bottom: 16px;">
      <el-icon><ArrowLeft /></el-icon>返回
    </el-button>
    
    <div class="card post-detail">
      <div class="post-header">
        <el-avatar :size="48">{{ post.author.charAt(0) }}</el-avatar>
        <div class="post-meta">
          <span class="author">{{ post.author }}</span>
          <span class="time">{{ post.createTime }}</span>
        </div>
        <el-tag>{{ post.category }}</el-tag>
      </div>
      
      <h1>{{ post.title }}</h1>
      
      <MdRenderer :content="post.content" :theme="themeStore.isDark ? 'dark' : 'light'" />
      
      <div class="post-actions">
        <el-button :type="post.liked ? 'primary' : 'default'" @click="toggleLike">
          <el-icon><Star /></el-icon>{{ post.likeCount }}
        </el-button>
      </div>
    </div>
    
    <div class="card comments-section">
      <h3>评论 ({{ comments.length }})</h3>
      
      <div class="comment-input">
        <el-input v-model="commentContent" type="textarea" :rows="3" placeholder="发表评论..." />
        <el-button type="primary" @click="submitComment">发表</el-button>
      </div>
      
      <div class="comment-list">
        <div v-for="comment in comments" :key="comment.id" class="comment-item">
          <el-avatar :size="36">{{ comment.author.charAt(0) }}</el-avatar>
          <div class="comment-content">
            <div class="comment-header">
              <span class="author">{{ comment.author }}</span>
              <span class="time">{{ comment.createTime }}</span>
            </div>
            <p>{{ comment.content }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import MdRenderer from '@/components/MdRenderer/index.vue'
import { useThemeStore } from '@/store'
import { ElMessage } from 'element-plus'

const router = useRouter()
const route = useRoute()
const themeStore = useThemeStore()

const commentContent = ref('')

const post = ref({
  id: 1,
  title: '分享我的MACD背离交易心得',
  author: '交易小白',
  category: '交易分享',
  createTime: '2024-12-14 10:30',
  likeCount: 25,
  liked: false,
  content: `
## 背景

最近学习了MACD背离策略，实盘操作了几笔，分享一下心得。

## 什么是背离

简单说就是价格和MACD指标走势不一致：
- **顶背离**：价格创新高，MACD没创新高
- **底背离**：价格创新低，MACD没创新低

## 我的实战经验

1. 日线级别的背离更可靠
2. 要等确认信号再入场
3. 止损一定要设好

希望对大家有帮助！
`
})

const comments = ref([
  { id: 1, author: '稳健派', content: '写得很好，背离确实是很有效的信号', createTime: '1小时前' },
  { id: 2, author: '求知者', content: '请问背离出现后一般等多久入场？', createTime: '30分钟前' }
])

const toggleLike = () => {
  post.value.liked = !post.value.liked
  post.value.likeCount += post.value.liked ? 1 : -1
}

const submitComment = () => {
  if (!commentContent.value.trim()) {
    ElMessage.warning('请输入评论内容')
    return
  }
  comments.value.push({
    id: Date.now(),
    author: '我',
    content: commentContent.value,
    createTime: '刚刚'
  })
  commentContent.value = ''
  ElMessage.success('评论成功')
}
</script>

<style lang="scss" scoped>
.post-detail {
  margin-bottom: 20px;
  
  .post-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 20px;
    
    .post-meta {
      flex: 1;
      .author { display: block; font-weight: 500; }
      .time { font-size: 12px; color: var(--text-secondary); }
    }
  }
  
  h1 {
    font-size: 24px;
    margin-bottom: 20px;
  }
  
  .post-actions {
    margin-top: 20px;
    padding-top: 20px;
    border-top: 1px solid var(--border-light);
  }
}

.comments-section {
  h3 { margin-bottom: 20px; }
  
  .comment-input {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-bottom: 24px;
    
    .el-button { align-self: flex-end; }
  }
}

.comment-item {
  display: flex;
  gap: 12px;
  padding: 16px 0;
  border-bottom: 1px solid var(--border-light);
  
  .comment-content {
    flex: 1;
    
    .comment-header {
      margin-bottom: 8px;
      .author { font-weight: 500; margin-right: 12px; }
      .time { font-size: 12px; color: var(--text-secondary); }
    }
    
    p { line-height: 1.6; }
  }
}
</style>
