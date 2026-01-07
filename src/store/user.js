import { defineStore } from 'pinia'
import { login, logout, getUserInfo } from '@/api/auth'
import { getUserMenus } from '@/api/menu'
import router from '@/router'

export const useUserStore = defineStore('user', {
  state: () => ({
    token: localStorage.getItem('token') || '',
    userInfo: null,
    role: '', // 单一角色: admin/teacher/student
    roles: [], // 兼容数组形式
    menus: [], // 用户可见菜单
    menuKeys: [] // 用户可见菜单key列表（用于权限校验）
  }),
  
  actions: {
    // 登录
    async login(loginForm) {
      try {
        const res = await login(loginForm)
        this.token = res.data.token
        localStorage.setItem('token', this.token)
        return res
      } catch (error) {
        throw error
      }
    },
    
    // 获取用户信息
    async getUserInfo() {
      try {
        const res = await getUserInfo()
        this.userInfo = res.data
        // 设置角色
        this.role = res.data.role || 'student'
        this.roles = [this.role]
        return res
      } catch (error) {
        throw error
      }
    },
    
    // 加载用户菜单
    async loadMenus() {
      try {
        console.log('开始加载菜单...')
        const res = await getUserMenus()
        console.log('菜单接口返回:', res)
        if (res.code === 200) {
          this.menus = res.data || []
          // 提取所有菜单key（包括子菜单）
          this.menuKeys = this.extractMenuKeys(this.menus)
          console.log('菜单加载成功, menuKeys:', this.menuKeys)
        }
      } catch (error) {
        console.error('加载菜单失败', error)
        this.menus = []
        this.menuKeys = []
      }
    },
    
    // 递归提取菜单key
    extractMenuKeys(menus) {
      const keys = []
      const extract = (list) => {
        for (const menu of list) {
          keys.push(menu.menuKey)
          if (menu.children && menu.children.length > 0) {
            extract(menu.children)
          }
        }
      }
      extract(menus)
      return keys
    },
    
    // 退出登录
    async logout() {
      try {
        await logout()
      } catch (error) {
        console.error('Logout error:', error)
      } finally {
        this.resetState()
        router.push('/login')
      }
    },
    
    // 重置状态
    resetState() {
      this.token = ''
      this.userInfo = null
      this.role = ''
      this.roles = []
      this.menus = []
      this.menuKeys = []
      localStorage.removeItem('token')
    }
  },
  
  getters: {
    isLoggedIn: (state) => !!state.token,
    isAdmin: (state) => state.role === 'admin',
    isTeacher: (state) => state.role === 'teacher',
    isStudent: (state) => state.role === 'student',
    nickname: (state) => state.userInfo?.nickname || state.userInfo?.username || ''
  }
})
