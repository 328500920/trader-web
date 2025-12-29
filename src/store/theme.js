import { defineStore } from 'pinia'

export const useThemeStore = defineStore('theme', {
  state: () => ({
    theme: 'light' // light | dark
  }),
  
  actions: {
    initTheme() {
      const savedTheme = localStorage.getItem('theme')
      if (savedTheme) {
        this.theme = savedTheme
      } else {
        // 检测系统主题偏好
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        this.theme = prefersDark ? 'dark' : 'light'
      }
      this.applyTheme()
    },
    
    toggleTheme() {
      this.theme = this.theme === 'light' ? 'dark' : 'light'
      this.applyTheme()
      localStorage.setItem('theme', this.theme)
    },
    
    setTheme(theme) {
      this.theme = theme
      this.applyTheme()
      localStorage.setItem('theme', this.theme)
    },
    
    applyTheme() {
      document.documentElement.setAttribute('data-theme', this.theme)
    }
  },
  
  getters: {
    isDark: (state) => state.theme === 'dark'
  }
})
