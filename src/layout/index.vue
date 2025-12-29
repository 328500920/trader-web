<template>
  <div class="layout-container">
    <!-- 交易员提醒悬浮窗 -->
    <TraderReminder />
    
    <!-- 顶部导航 -->
    <header class="layout-header">
      <div class="header-left">
        <div class="logo" @click="router.push('/')">
          <el-icon size="24"><TrendCharts /></el-icon>
          <span class="logo-text hide-on-mobile">交易员成长平台</span>
        </div>
        <el-icon 
          class="menu-toggle hide-on-mobile" 
          @click="toggleSidebar"
        >
          <Fold v-if="!isCollapse" />
          <Expand v-else />
        </el-icon>
      </div>
      
      <nav class="header-nav hide-on-mobile">
        <router-link 
          v-for="item in mainMenus" 
          :key="item.path"
          :to="item.path"
          class="nav-item"
          :class="{ active: isActiveMenu(item.path) }"
        >
          <el-icon><component :is="item.meta.icon" /></el-icon>
          <span>{{ item.meta.title }}</span>
        </router-link>
      </nav>
      
      <div class="header-right">
        <!-- 主题切换 -->
        <el-tooltip :content="themeStore.isDark ? '切换浅色' : '切换深色'">
          <el-button circle @click="themeStore.toggleTheme">
            <el-icon>
              <Sunny v-if="themeStore.isDark" />
              <Moon v-else />
            </el-icon>
          </el-button>
        </el-tooltip>
        
        <!-- 用户下拉菜单 -->
        <el-dropdown trigger="click" @command="handleCommand">
          <div class="user-info">
            <el-avatar :size="32" :src="userStore.userInfo?.avatar">
              {{ userStore.nickname?.charAt(0) }}
            </el-avatar>
            <span class="username hide-on-mobile">{{ userStore.nickname }}</span>
          </div>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="profile">
                <el-icon><User /></el-icon>个人中心
              </el-dropdown-item>
              <el-dropdown-item divided command="logout">
                <el-icon><SwitchButton /></el-icon>退出登录
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </header>
    
    <!-- 主内容区 -->
    <div class="layout-main">
      <!-- 侧边栏（桌面端） -->
      <aside 
        class="layout-sidebar hide-on-mobile" 
        :class="{ collapsed: isCollapse }"
        v-if="currentSubMenus.length > 0"
      >
        <el-menu
          :default-active="route.path"
          :collapse="isCollapse"
          router
        >
          <el-menu-item 
            v-for="item in currentSubMenus" 
            :key="item.path"
            :index="item.path"
            v-show="!item.meta?.hidden"
          >
            <el-icon v-if="item.meta?.icon"><component :is="item.meta.icon" /></el-icon>
            <template #title>{{ item.meta?.title }}</template>
          </el-menu-item>
        </el-menu>
      </aside>
      
      <!-- 内容区 -->
      <main class="layout-content" :class="{ 'no-sidebar': currentSubMenus.length === 0 }">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>
    </div>
    
    <!-- 底部Tab导航（移动端） -->
    <nav class="mobile-tabbar show-on-mobile">
      <router-link 
        v-for="item in mobileMenus" 
        :key="item.path"
        :to="item.path"
        class="tab-item"
        :class="{ active: isActiveMenu(item.path) }"
      >
        <el-icon><component :is="item.meta.icon" /></el-icon>
        <span>{{ item.meta.title }}</span>
      </router-link>
    </nav>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useThemeStore, useUserStore } from '@/store'
import { ElMessageBox } from 'element-plus'
import TraderReminder from '@/components/TraderReminder.vue'

const route = useRoute()
const router = useRouter()
const themeStore = useThemeStore()
const userStore = useUserStore()

const isCollapse = ref(false)

// 主菜单
const mainMenus = computed(() => {
  const routes = router.options.routes.find(r => r.path === '/')?.children || []
  return routes.filter(r => r.meta && !r.meta.hidden && !r.meta.roles).map(r => ({
    ...r,
    path: r.path.startsWith('/') ? r.path : `/${r.path}`
  }))
})

// 移动端菜单
const mobileMenus = computed(() => {
  return mainMenus.value.slice(0, 5)
})

// 当前子菜单
const currentSubMenus = computed(() => {
  const pathParts = route.path.split('/').filter(Boolean)
  if (pathParts.length === 0) return []
  
  const currentPath = '/' + pathParts[0]
  const layoutRoutes = router.options.routes.find(r => r.path === '/')?.children || []
  const currentMenu = layoutRoutes.find(r => {
    const menuPath = r.path.startsWith('/') ? r.path : `/${r.path}`
    return menuPath === currentPath
  })
  
  if (currentMenu?.children) {
    return currentMenu.children.map(child => ({
      ...child,
      path: `${currentPath}/${child.path}`
    }))
  }
  return []
})

const toggleSidebar = () => {
  isCollapse.value = !isCollapse.value
}

const isActiveMenu = (path) => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return route.path === normalizedPath || route.path.startsWith(normalizedPath + '/')
}

const handleCommand = (command) => {
  if (command === 'profile') {
    router.push('/profile')
  } else if (command === 'logout') {
    ElMessageBox.confirm('确定要退出登录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      userStore.logout()
    })
  }
}
</script>

<style lang="scss" scoped>
.layout-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.layout-header {
  height: var(--header-height);
  background-color: var(--bg-primary);
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 20px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  color: var(--primary-color);
  
  .logo-text {
    font-size: 18px;
    font-weight: 600;
  }
}

.menu-toggle {
  cursor: pointer;
  font-size: 20px;
  color: var(--text-secondary);
  
  &:hover {
    color: var(--primary-color);
  }
}

.header-nav {
  display: flex;
  gap: 8px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px 16px;
  border-radius: 6px;
  color: var(--text-secondary);
  transition: all 0.3s;
  
  &:hover, &.active {
    color: var(--primary-color);
    background-color: var(--bg-secondary);
  }
}

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  
  .username {
    color: var(--text-primary);
  }
}

.layout-main {
  display: flex;
  margin-top: var(--header-height);
  min-height: calc(100vh - var(--header-height));
}

.layout-sidebar {
  width: var(--sidebar-width);
  background-color: var(--bg-primary);
  border-right: 1px solid var(--border-color);
  transition: width 0.3s;
  position: fixed;
  top: var(--header-height);
  bottom: 0;
  left: 0;
  overflow-y: auto;
  
  &.collapsed {
    width: 64px;
  }
  
  .el-menu {
    border-right: none;
  }
}

.layout-content {
  flex: 1;
  margin-left: var(--sidebar-width);
  padding: 20px;
  background-color: var(--bg-secondary);
  transition: margin-left 0.3s;
  
  &.no-sidebar {
    margin-left: 0;
  }
}

.layout-sidebar.collapsed + .layout-content {
  margin-left: 64px;
}

// 移动端底部导航
.mobile-tabbar {
  display: none;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 60px;
  background-color: var(--bg-primary);
  border-top: 1px solid var(--border-color);
  justify-content: space-around;
  align-items: center;
  z-index: 100;
}

.tab-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  color: var(--text-secondary);
  font-size: 12px;
  
  .el-icon {
    font-size: 20px;
  }
  
  &.active {
    color: var(--primary-color);
  }
}

// 页面切换动画
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

// 移动端适配
@media (max-width: 768px) {
  .hide-on-mobile {
    display: none !important;
  }
  
  .show-on-mobile {
    display: flex !important;
  }
  
  .layout-content {
    margin-left: 0 !important;
    padding: 15px;
    padding-bottom: 80px;
  }
  
  .header-nav {
    display: none;
  }
}

@media (min-width: 769px) {
  .show-on-mobile {
    display: none !important;
  }
}
</style>
