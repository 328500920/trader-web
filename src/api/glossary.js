import request from '@/utils/request'

// 获取分类列表
export function getCategoryList() {
  return request({
    url: '/glossary/category',
    method: 'get'
  })
}

// 获取术语列表
export function getTermList(params) {
  return request({
    url: '/glossary/term',
    method: 'get',
    params
  })
}

// 获取术语详情
export function getTermById(id) {
  return request({
    url: `/glossary/term/${id}`,
    method: 'get'
  })
}

// 搜索术语
export function searchTerms(keyword) {
  return request({
    url: '/glossary/search',
    method: 'get',
    params: { keyword }
  })
}

// 获取热门术语
export function getHotTerms(limit = 10) {
  return request({
    url: '/glossary/hot',
    method: 'get',
    params: { limit }
  })
}

// 切换收藏状态
export function toggleFavorite(termId) {
  return request({
    url: `/glossary/favorite/${termId}`,
    method: 'post'
  })
}

// 获取收藏列表
export function getFavorites() {
  return request({
    url: '/glossary/favorite',
    method: 'get'
  })
}

// 获取浏览历史
export function getHistory(limit = 10) {
  return request({
    url: '/glossary/history',
    method: 'get',
    params: { limit }
  })
}
