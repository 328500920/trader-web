import { defineStore } from 'pinia'

export const useThemeStore = defineStore('theme', {
  state: () => ({
    themeMode: 'system', // light | dark | system
    actualTheme: 'light' // 实际应用的主题
  }),
  
  actions: {
    initTheme() {
      const savedMode = localStorage.getItem('themeMode')
      if (savedMode) {
        this.themeMode = savedMode
      }
      this.applyTheme()
      
      // 监听系统主题变化
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (this.themeMode === 'system') {
          this.actualTheme = e.matches ? 'dark' : 'light'
          document.documentElement.setAttribute('data-theme', this.actualTheme)
        }
      })
    },
    
    toggleTheme() {
      // 循环切换: light -> dark -> system -> light
      const modes = ['light', 'dark', 'system']
      const currentIndex = modes.indexOf(this.themeMode)
      this.themeMode = modes[(currentIndex + 1) % modes.length]
      this.applyTheme()
      localStorage.setItem('themeMode', this.themeMode)
    },
    
    setTheme(mode) {
      this.themeMode = mode
      this.applyTheme()
      localStorage.setItem('themeMode', this.themeMode)
    },
    
    applyTheme() {
      if (this.themeMode === 'system') {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        this.actualTheme = prefersDark ? 'dark' : 'light'
      } else {
        this.actualTheme = this.themeMode
      }
      document.documentElement.setAttribute('data-theme', this.actualTheme)
    }
  },
  
  getters: {
    isDark: (state) => state.actualTheme === 'dark',
    isSystem: (state) => state.themeMode === 'system',
    currentMode: (state) => state.themeMode,
    themeIcon: (state) => {
      if (state.themeMode === 'light') return 'Sunny'
      if (state.themeMode === 'dark') return 'Moon'
      return 'Monitor'
    },
    themeLabel: (state) => {
      if (state.themeMode === 'light') return '浅色模式'
      if (state.themeMode === 'dark') return '深色模式'
      return '跟随系统'
    }
  }
})
