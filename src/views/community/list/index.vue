<template>
  <div class="page-container">
    <div class="page-header">
      <h2>社区</h2>
      <el-button type="primary" @click="router.push('/community/create')">
        <el-icon><EditPen /></el-icon>发布帖子
      </el-button>
    </div>
    
    <div class="filter-tabs">
      <el-radio-group v-model="category" @change="loadPosts">
        <el-radio-button label="">全部</el-radio-button>
        <el-radio-button label="学习心得">学习心得</el-radio-button>
        <el-radio-button label="交易分享">交易分享</el-radio-button>
        <el-radio-button label="问答">问答</el-radio-button>
      </el-radio-group>
    </div>
    
    <div class="post-list">
      <div 
        v-for="post in posts" 
        :key="post.id" 
        class="post-card card"
        @click="router.push(`/community/post/${post.id}`)"
      >
        <div class="post-header">
          <el-avatar :size="40">{{ post.author.charAt(0) }}</el-avatar>
          <div class="post-meta">
            <span class="author">{{ post.author }}</span>
            <span class="time">{{ post.createTime }}</span>
          </div>
          <el-tag size="small">{{ post.category }}</el-tag>
        </div>
        <h3 class="post-title">{{ post.title }}</h3>
        <p class="post-summary">{{ post.summary }}</p>
        <div class="post-stats">
          <span><el-icon><View /></el-icon>{{ post.viewCount }}</span>
          <span><el-icon><ChatDotRound /></el-icon>{{ post.commentCount }}</span>
          <span><el-icon><Star /></el-icon>{{ post.likeCount }}</span>
        </div>
      </div>
      <el-empty v-if="posts.length === 0" description="暂无帖子" />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const category = ref('')

const posts = ref([
  { id: 1, title: '分享我的MACD背离交易心得', summary: '最近用MACD背离策略做了几笔交易，总结一下经验...', author: '交易小白', category: '交易分享', createTime: '2小时前', viewCount: 128, commentCount: 12, likeCount: 25 },
  { id: 2, title: '新手如何建立交易纪律？', summary: '刚开始交易总是控制不住自己，请问大家是怎么建立纪律的？', author: '求知者', category: '问答', createTime: '5小时前', viewCount: 89, commentCount: 8, likeCount: 15 },
  { id: 3, title: '第一阶段学习完成，分享一些感悟', summary: '花了两个月完成了基础构建期的学习，收获很大...', author: '稳健派', category: '学习心得', createTime: '1天前', viewCount: 256, commentCount: 20, likeCount: 45 }
])

const loadPosts = () => {
  // TODO: 根据分类加载帖子
}
</script>

<style lang="scss" scoped>
.filter-tabs {
  margin-bottom: 20px;
}

.post-list {
  display: grid;
  gap: 16px;
}

.post-card {
  cursor: pointer;
  transition: all 0.3s;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px var(--shadow-color);
  }
}

.post-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  
  .post-meta {
    flex: 1;
    
    .author {
      display: block;
      font-weight: 500;
    }
    
    .time {
      font-size: 12px;
      color: var(--text-secondary);
    }
  }
}

.post-title {
  font-size: 18px;
  margin-bottom: 8px;
}

.post-summary {
  color: var(--text-secondary);
  line-height: 1.6;
  margin-bottom: 12px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.post-stats {
  display: flex;
  gap: 20px;
  color: var(--text-secondary);
  font-size: 14px;
  
  span {
    display: flex;
    align-items: center;
    gap: 4px;
  }
}
</style>
