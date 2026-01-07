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
        <!-- 全局搜索 -->
        <GlobalSearch />
        
        <!-- 主题切换 -->
        <ThemeSwitch />
        
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
        v-if="currentSidebarMenus.length > 0"
      >
        <div class="sidebar-menu">
          <template v-for="group in currentSidebarMenus" :key="group.menuKey">
            <!-- 有子菜单的分组 -->
            <div v-if="group.children && group.children.length > 0" class="menu-group">
              <div 
                class="menu-group-header" 
                v-if="!isCollapse"
                @click="toggleGroup(group.menuKey)"
              >
                <el-icon v-if="group.icon" class="group-icon"><component :is="group.icon" /></el-icon>
                <span class="group-title">{{ group.menuName }}</span>
                <el-icon class="group-arrow" :class="{ expanded: expandedGroups.includes(group.menuKey) }">
                  <ArrowRight />
                </el-icon>
              </div>
              
              <div class="menu-items" v-show="isCollapse || expandedGroups.includes(group.menuKey)">
                <router-link
                  v-for="item in group.children" 
                  :key="item.menuKey"
                  :to="getMenuPath(item)"
                  class="menu-item"
                  :class="{ active: isMenuActive(item) }"
                >
                  <div class="item-indicator"></div>
                  <el-icon v-if="item.icon" class="item-icon"><component :is="item.icon" /></el-icon>
                  <span class="item-title" v-if="!isCollapse">{{ item.menuName }}</span>
                </router-link>
              </div>
            </div>
            
            <!-- 无子菜单的直接菜单项 -->
            <div v-else class="menu-items no-group">
              <router-link
                :to="getMenuPath(group)"
                class="menu-item"
                :class="{ active: isMenuActive(group) }"
              >
                <div class="item-indicator"></div>
                <el-icon v-if="group.icon" class="item-icon"><component :is="group.icon" /></el-icon>
                <span class="item-title" v-if="!isCollapse">{{ group.menuName }}</span>
              </router-link>
            </div>
          </template>
        </div>
      </aside>
      
      <!-- 内容区 -->
      <main class="layout-content" :class="{ 'no-sidebar': currentSidebarMenus.length === 0 }">
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
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/store'
import { ElMessageBox } from 'element-plus'
import { ArrowRight } from '@element-plus/icons-vue'
import TraderReminder from '@/components/TraderReminder.vue'
import ThemeSwitch from '@/components/ThemeSwitch.vue'
import GlobalSearch from '@/components/GlobalSearch.vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const isCollapse = ref(false)
const expandedGroups = ref([]) // 展开的分组

// 主菜单（根据后端菜单数据）
const mainMenus = computed(() => {
  // 优先使用后端返回的菜单数据
  if (userStore.menus && userStore.menus.length > 0) {
    return userStore.menus.map(menu => ({
      path: menu.path,
      name: menu.menuKey,
      meta: {
        title: menu.menuName,
        icon: menu.icon
      },
      children: menu.children || []
    }))
  }
  
  // 降级：使用前端路由配置（兼容旧逻辑）
  const routes = router.options.routes.find(r => r.path === '/')?.children || []
  const userRole = userStore.role || 'student'
  
  return routes
    .filter(r => {
      // 隐藏的菜单不显示
      if (!r.meta || r.meta.hidden) return false
      // 如果没有设置 roles，所有人可见
      if (!r.meta.roles) return true
      // 检查用户角色是否在允许列表中
      return r.meta.roles.includes(userRole)
    })
    .map(r => ({
      ...r,
      path: r.path.startsWith('/') ? r.path : `/${r.path}`
    }))
})

// 移动端菜单
const mobileMenus = computed(() => {
  return mainMenus.value.slice(0, 5)
})

// 当前一级菜单路径
const currentTopPath = computed(() => {
  const pathParts = route.path.split('/').filter(Boolean)
  return pathParts.length > 0 ? '/' + pathParts[0] : ''
})

// 当前侧边栏菜单（支持三级结构）
const currentSidebarMenus = computed(() => {
  if (!currentTopPath.value) return []
  
  // 从后端菜单数据获取
  if (userStore.menus && userStore.menus.length > 0) {
    const currentMenu = userStore.menus.find(m => m.path === currentTopPath.value)
    return currentMenu?.children || []
  }
  
  // 降级：使用前端路由配置
  const layoutRoutes = router.options.routes.find(r => r.path === '/')?.children || []
  const currentMenu = layoutRoutes.find(r => {
    const menuPath = r.path.startsWith('/') ? r.path : `/${r.path}`
    return menuPath === currentTopPath.value
  })
  
  if (currentMenu?.children) {
    return currentMenu.children.map(child => ({
      menuKey: child.name,
      menuName: child.meta?.title,
      path: child.path,
      icon: child.meta?.icon,
      children: []
    }))
  }
  return []
})

// 获取菜单完整路径
const getMenuPath = (menu) => {
  if (!menu.path) return currentTopPath.value
  if (menu.path.startsWith('/')) return menu.path
  return `${currentTopPath.value}/${menu.path}`
}

// 判断菜单是否激活
const isMenuActive = (menu) => {
  const menuPath = getMenuPath(menu)
  return route.path === menuPath || route.path.startsWith(menuPath + '/')
}

// 切换分组展开/收起
const toggleGroup = (groupKey) => {
  const index = expandedGroups.value.indexOf(groupKey)
  if (index > -1) {
    expandedGroups.value.splice(index, 1)
  } else {
    expandedGroups.value.push(groupKey)
  }
}

// 自动展开当前激活菜单所在的分组
watch(() => route.path, () => {
  if (userStore.menus && userStore.menus.length > 0) {
    const currentMenu = userStore.menus.find(m => m.path === currentTopPath.value)
    if (currentMenu?.children) {
      for (const group of currentMenu.children) {
        if (group.children && group.children.length > 0) {
          for (const item of group.children) {
            if (isMenuActive(item) && !expandedGroups.value.includes(group.menuKey)) {
              expandedGroups.value.push(group.menuKey)
              break
            }
          }
        }
      }
    }
  }
}, { immediate: true })

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
    
    .menu-item {
      justify-content: center;
      padding: 12px;
      
      .item-indicator {
        display: none;
      }
      
      .item-icon {
        margin: 0;
      }
    }
  }
  
  .sidebar-menu {
    padding: 12px 0;
  }
  
  // 菜单分组
  .menu-group {
    margin-bottom: 8px;
    
    &.first-group {
      .menu-group-header {
        margin-top: 0;
      }
    }
  }
  
  // 分组标题
  .menu-group-header {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px 16px;
    margin-top: 4px;
    cursor: pointer;
    border-radius: 8px;
    transition: all 0.2s;
    
    &:hover {
      background-color: var(--bg-secondary);
    }
    
    .group-icon {
      font-size: 16px;
      color: var(--primary-color);
    }
    
    .group-title {
      flex: 1;
      font-size: 14px;
      font-weight: 600;
      color: var(--text-primary);
    }
    
    .group-arrow {
      font-size: 12px;
      color: var(--text-secondary);
      transition: transform 0.3s;
      
      &.expanded {
        transform: rotate(90deg);
      }
    }
  }
  
  // 菜单项容器
  .menu-items {
    padding: 2px 8px 2px 24px;
    
    &.no-group {
      padding: 8px;
    }
  }
  
  // 菜单项
  .menu-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 12px 10px 16px;
    margin: 2px 0;
    border-radius: 8px;
    color: var(--text-primary);
    text-decoration: none;
    transition: all 0.2s ease;
    position: relative;
    
    .item-indicator {
      width: 3px;
      height: 0;
      border-radius: 2px;
      background: var(--primary-color);
      transition: height 0.2s ease;
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
    }
    
    .item-icon {
      font-size: 16px;
      color: var(--text-secondary);
      transition: color 0.2s;
      flex-shrink: 0;
    }
    
    .item-title {
      font-size: 14px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    
    &:hover {
      background-color: var(--bg-secondary);
      
      .item-icon {
        color: var(--primary-color);
      }
    }
    
    &.active {
      background: linear-gradient(90deg, rgba(64, 158, 255, 0.15), rgba(64, 158, 255, 0.05));
      color: var(--primary-color);
      
      .item-indicator {
        height: 16px;
      }
      
      .item-icon {
        color: var(--primary-color);
      }
      
      .item-title {
        font-weight: 500;
      }
    }
  }
  
  .menu-divider {
    margin: 8px 12px;
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
