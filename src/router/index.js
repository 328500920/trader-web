import { createRouter, createWebHistory } from 'vue-router'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import { useUserStore } from '@/store/user'

NProgress.configure({ showSpinner: false })

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/index.vue'),
    meta: { title: '登录', noAuth: true }
  },
  {
    path: '/',
    component: () => import('@/layout/index.vue'),
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/index.vue'),
        meta: { title: '首页', icon: 'HomeFilled' }
      },
      // 学习中心
      {
        path: 'learn',
        name: 'Learn',
        redirect: '/learn/course',
        meta: { title: '学习中心', icon: 'Reading' },
        children: [
          {
            path: 'course',
            name: 'CourseList',
            component: () => import('@/views/learn/course/index.vue'),
            meta: { title: '课程列表' }
          },
          {
            path: 'course/:id',
            name: 'CourseDetail',
            component: () => import('@/views/learn/course/detail.vue'),
            meta: { title: '课程详情', hidden: true }
          },
          {
            path: 'chapter/:id',
            name: 'ChapterDetail',
            component: () => import('@/views/learn/chapter/detail.vue'),
            meta: { title: '章节学习', hidden: true }
          },
          {
            path: 'case',
            name: 'CaseList',
            component: () => import('@/views/learn/case/index.vue'),
            meta: { title: '实战案例' }
          },
          {
            path: 'case/:id',
            name: 'CaseDetail',
            component: () => import('@/views/learn/case/detail.vue'),
            meta: { title: '案例详情', hidden: true }
          },
          {
            path: 'resource',
            name: 'ResourceList',
            component: () => import('@/views/learn/resource/index.vue'),
            meta: { title: '学习资源' }
          },
          {
            path: 'topic',
            name: 'TopicList',
            component: () => import('@/views/learn/topic/index.vue'),
            meta: { title: '专题学习' }
          },
          {
            path: 'topic/:id',
            name: 'TopicDetail',
            component: () => import('@/views/learn/topic/detail.vue'),
            meta: { title: '专题详情', hidden: true }
          },
          {
            path: 'quiz',
            name: 'QuizList',
            component: () => import('@/views/learn/quiz/index.vue'),
            meta: { title: '章节测验' }
          },
          {
            path: 'quiz/:chapterId',
            name: 'QuizTest',
            component: () => import('@/views/learn/quiz/test.vue'),
            meta: { title: '测验答题', hidden: true }
          },
          {
            path: 'tool-guide',
            name: 'ToolGuideList',
            component: () => import('@/views/learn/tool-guide/index.vue'),
            meta: { title: '工具指南' }
          },
          {
            path: 'tool-guide/:id',
            name: 'ToolGuideDetail',
            component: () => import('@/views/learn/tool-guide/detail.vue'),
            meta: { title: '工具详情', hidden: true }
          },
          {
            path: 'progress',
            name: 'Progress',
            component: () => import('@/views/learn/progress/index.vue'),
            meta: { title: '学习进度' }
          },
          {
            path: 'note',
            name: 'NoteList',
            component: () => import('@/views/learn/note/index.vue'),
            meta: { title: '我的笔记' }
          },
          {
            path: 'wrong-book',
            name: 'WrongBook',
            component: () => import('@/views/learn/wrong-book/index.vue'),
            meta: { title: '错题本' }
          },
          {
            path: 'favorite',
            name: 'Favorite',
            component: () => import('@/views/learn/favorite/index.vue'),
            meta: { title: '我的收藏' }
          },
          {
            path: 'patterns',
            name: 'Patterns',
            component: () => import('@/views/learn/patterns/index.vue'),
            meta: { title: 'K线形态图鉴' }
          }
        ]
      },
      // 交易日志
      {
        path: 'trade',
        name: 'Trade',
        redirect: '/trade/list',
        meta: { title: '交易日志', icon: 'TrendCharts' },
        children: [
          {
            path: 'list',
            name: 'TradeList',
            component: () => import('@/views/trade/list/index.vue'),
            meta: { title: '交易记录' }
          },
          {
            path: 'plan',
            name: 'TradePlan',
            component: () => import('@/views/trade/plan/index.vue'),
            meta: { title: '交易计划' }
          },
          {
            path: 'create',
            name: 'TradeCreate',
            component: () => import('@/views/trade/form/index.vue'),
            meta: { title: '新建交易', hidden: true }
          },
          {
            path: 'edit/:id',
            name: 'TradeEdit',
            component: () => import('@/views/trade/form/index.vue'),
            meta: { title: '编辑交易', hidden: true }
          },
          {
            path: 'detail/:id',
            name: 'TradeDetail',
            component: () => import('@/views/trade/detail/index.vue'),
            meta: { title: '交易详情', hidden: true }
          },
          {
            path: 'analysis',
            name: 'TradeAnalysis',
            component: () => import('@/views/trade/analysis/index.vue'),
            meta: { title: '绩效分析' }
          }
        ]
      },
      // 社区
      {
        path: 'community',
        name: 'Community',
        redirect: '/community/list',
        meta: { title: '社区', icon: 'ChatDotRound' },
        children: [
          {
            path: 'list',
            name: 'PostList',
            component: () => import('@/views/community/list/index.vue'),
            meta: { title: '帖子列表' }
          },
          {
            path: 'post/:id',
            name: 'PostDetail',
            component: () => import('@/views/community/detail/index.vue'),
            meta: { title: '帖子详情', hidden: true }
          },
          {
            path: 'create',
            name: 'PostCreate',
            component: () => import('@/views/community/form/index.vue'),
            meta: { title: '发布帖子', hidden: true }
          }
        ]
      },
      // 心理日记
      {
        path: 'psychology',
        name: 'Psychology',
        redirect: '/psychology/index',
        meta: { title: '心理日记', icon: 'Memo' },
        children: [
          {
            path: 'index',
            name: 'PsychologyIndex',
            component: () => import('@/views/psychology/index.vue'),
            meta: { title: '情绪打卡' }
          },
          {
            path: 'analysis',
            name: 'PsychologyAnalysis',
            component: () => import('@/views/psychology/analysis.vue'),
            meta: { title: '情绪分析' }
          }
        ]
      },
      // 术语词典
      {
        path: 'glossary',
        name: 'Glossary',
        redirect: '/glossary/index',
        meta: { title: '术语词典', icon: 'Reading' },
        children: [
          {
            path: 'index',
            name: 'GlossaryIndex',
            component: () => import('@/views/glossary/index.vue'),
            meta: { title: '术语首页' }
          },
          {
            path: 'category/:id',
            name: 'GlossaryCategory',
            component: () => import('@/views/glossary/category.vue'),
            meta: { title: '分类列表', hidden: true }
          },
          {
            path: 'term/:id',
            name: 'GlossaryDetail',
            component: () => import('@/views/glossary/detail.vue'),
            meta: { title: '术语详情', hidden: true }
          }
        ]
      },
      // 工具箱
      {
        path: 'tool',
        name: 'Tool',
        redirect: '/tool/checklist',
        meta: { title: '工具箱', icon: 'SetUp' },
        children: [
          {
            path: 'checklist',
            name: 'Checklist',
            component: () => import('@/views/tool/checklist/index.vue'),
            meta: { title: '检查清单' }
          },
          {
            path: 'analysis',
            name: 'DailyAnalysis',
            component: () => import('@/views/tool/analysis/index.vue'),
            meta: { title: '每日分析' }
          },
          {
            path: 'link',
            name: 'LinkList',
            component: () => import('@/views/tool/link/index.vue'),
            meta: { title: '常用链接' }
          },
          {
            path: 'calculator',
            name: 'Calculator',
            component: () => import('@/views/tool/calculator/index.vue'),
            meta: { title: '计算器' }
          }
        ]
      },
      // 个人中心
      {
        path: 'profile',
        name: 'Profile',
        component: () => import('@/views/profile/index.vue'),
        meta: { title: '个人中心', icon: 'User', hidden: true }
      },
      // 系统管理
      {
        path: 'system',
        name: 'System',
        redirect: '/system/user',
        meta: { title: '系统管理', icon: 'Setting', roles: ['admin'] },
        children: [
          {
            path: 'user',
            name: 'UserManage',
            component: () => import('@/views/system/user/index.vue'),
            meta: { title: '用户管理' }
          },
          {
            path: 'course',
            name: 'CourseManage',
            component: () => import('@/views/system/course/index.vue'),
            meta: { title: '课程管理' }
          }
        ]
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/error/404.vue'),
    meta: { title: '404', noAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach(async (to, from, next) => {
  NProgress.start()
  document.title = `${to.meta.title || ''} - 交易员成长平台`
  
  const userStore = useUserStore()
  
  // 不需要登录的页面
  if (to.meta.noAuth) {
    next()
    return
  }
  
  // 未登录
  if (!userStore.token) {
    next(`/login?redirect=${to.path}`)
    return
  }
  
  // 已登录但没有用户信息，获取用户信息
  if (!userStore.userInfo) {
    try {
      await userStore.getUserInfo()
    } catch (error) {
      userStore.resetState()
      next(`/login?redirect=${to.path}`)
      return
    }
  }
  
  // 检查角色权限
  if (to.meta.roles && !to.meta.roles.some(role => userStore.roles.includes(role))) {
    next('/dashboard')
    return
  }
  
  next()
})

router.afterEach(() => {
  NProgress.done()
})

export default router
