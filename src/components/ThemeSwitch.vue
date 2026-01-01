<template>
  <el-dropdown trigger="click" @command="handleCommand">
    <el-button circle class="theme-btn">
      <el-icon :size="18">
        <Sunny v-if="themeStore.currentMode === 'light'" />
        <Moon v-else-if="themeStore.currentMode === 'dark'" />
        <Monitor v-else />
      </el-icon>
    </el-button>
    <template #dropdown>
      <el-dropdown-menu class="theme-dropdown">
        <el-dropdown-item 
          command="light" 
          :class="{ active: themeStore.currentMode === 'light' }"
        >
          <el-icon><Sunny /></el-icon>
          <span>浅色模式</span>
          <el-icon v-if="themeStore.currentMode === 'light'" class="check-icon"><Check /></el-icon>
        </el-dropdown-item>
        <el-dropdown-item 
          command="dark"
          :class="{ active: themeStore.currentMode === 'dark' }"
        >
          <el-icon><Moon /></el-icon>
          <span>深色模式</span>
          <el-icon v-if="themeStore.currentMode === 'dark'" class="check-icon"><Check /></el-icon>
        </el-dropdown-item>
        <el-dropdown-item 
          command="system"
          :class="{ active: themeStore.currentMode === 'system' }"
        >
          <el-icon><Monitor /></el-icon>
          <span>跟随系统</span>
          <el-icon v-if="themeStore.currentMode === 'system'" class="check-icon"><Check /></el-icon>
        </el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<script setup>
import { useThemeStore } from '@/store/theme'
import { Sunny, Moon, Monitor, Check } from '@element-plus/icons-vue'

const themeStore = useThemeStore()

const handleCommand = (mode) => {
  themeStore.setTheme(mode)
}
</script>

<style lang="scss" scoped>
.theme-btn {
  transition: all 0.3s;
  
  &:hover {
    transform: rotate(15deg);
  }
}

:deep(.theme-dropdown) {
  .el-dropdown-menu__item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 16px;
    min-width: 140px;
    
    span {
      flex: 1;
    }
    
    &.active {
      color: var(--primary-color);
      background-color: var(--bg-secondary);
    }
    
    .check-icon {
      color: var(--primary-color);
    }
  }
}
</style>
