<template>
  <div class="skeleton-card" :class="[`type-${type}`]">
    <!-- 列表卡片骨架 -->
    <template v-if="type === 'list'">
      <div class="skeleton-header">
        <div class="skeleton-badge"></div>
        <div class="skeleton-meta">
          <div class="skeleton-line short"></div>
        </div>
      </div>
      <div class="skeleton-title"></div>
      <div class="skeleton-content">
        <div class="skeleton-line"></div>
        <div class="skeleton-line medium"></div>
      </div>
      <div class="skeleton-footer">
        <div class="skeleton-line tiny"></div>
        <div class="skeleton-btn"></div>
      </div>
    </template>
    
    <!-- 网格卡片骨架 -->
    <template v-else-if="type === 'grid'">
      <div class="skeleton-cover"></div>
      <div class="skeleton-body">
        <div class="skeleton-tags">
          <div class="skeleton-tag"></div>
          <div class="skeleton-tag"></div>
        </div>
        <div class="skeleton-title"></div>
        <div class="skeleton-line"></div>
        <div class="skeleton-line medium"></div>
      </div>
    </template>
    
    <!-- 统计卡片骨架 -->
    <template v-else-if="type === 'stat'">
      <div class="skeleton-icon"></div>
      <div class="skeleton-stat-info">
        <div class="skeleton-value"></div>
        <div class="skeleton-label"></div>
      </div>
    </template>
    
    <!-- 默认卡片骨架 -->
    <template v-else>
      <div class="skeleton-line"></div>
      <div class="skeleton-line medium"></div>
      <div class="skeleton-line short"></div>
    </template>
  </div>
</template>

<script setup>
defineProps({
  type: {
    type: String,
    default: 'default', // default | list | grid | stat
    validator: (val) => ['default', 'list', 'grid', 'stat'].includes(val)
  }
})
</script>

<style lang="scss" scoped>
@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

.skeleton-card {
  background: var(--bg-primary);
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 2px 12px var(--shadow-color);
}

// 骨架元素基础样式
.skeleton-line,
.skeleton-badge,
.skeleton-title,
.skeleton-cover,
.skeleton-icon,
.skeleton-value,
.skeleton-label,
.skeleton-tag,
.skeleton-btn {
  background: linear-gradient(
    90deg,
    var(--bg-secondary) 25%,
    var(--border-light) 50%,
    var(--bg-secondary) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 4px;
}

.skeleton-line {
  height: 16px;
  margin-bottom: 12px;
  
  &.short { width: 40%; }
  &.medium { width: 70%; }
  &.tiny { width: 25%; height: 12px; }
  
  &:last-child { margin-bottom: 0; }
}

.skeleton-title {
  height: 20px;
  width: 80%;
  margin-bottom: 16px;
}

// 列表卡片
.type-list {
  border-left: 4px solid var(--border-light);
  
  .skeleton-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
  }
  
  .skeleton-badge {
    width: 70px;
    height: 24px;
    border-radius: 12px;
  }
  
  .skeleton-meta .skeleton-line {
    width: 100px;
    height: 14px;
    margin: 0;
  }
  
  .skeleton-content {
    margin-bottom: 16px;
  }
  
  .skeleton-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 12px;
    border-top: 1px solid var(--border-light);
  }
  
  .skeleton-btn {
    width: 80px;
    height: 28px;
    border-radius: 4px;
  }
}

// 网格卡片
.type-grid {
  padding: 0;
  overflow: hidden;
  
  .skeleton-cover {
    height: 160px;
    border-radius: 0;
  }
  
  .skeleton-body {
    padding: 20px;
  }
  
  .skeleton-tags {
    display: flex;
    gap: 8px;
    margin-bottom: 12px;
  }
  
  .skeleton-tag {
    width: 60px;
    height: 22px;
    border-radius: 4px;
  }
}

// 统计卡片
.type-stat {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  
  .skeleton-icon {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    flex-shrink: 0;
  }
  
  .skeleton-stat-info {
    flex: 1;
  }
  
  .skeleton-value {
    width: 60px;
    height: 28px;
    margin-bottom: 6px;
  }
  
  .skeleton-label {
    width: 50px;
    height: 14px;
  }
}
</style>
