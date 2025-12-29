import request from '@/utils/request'

// ========== 检查清单 ==========
export function getChecklistList() {
  return request({
    url: '/tool/checklist/list',
    method: 'get'
  })
}

export function getChecklistDetail(id) {
  return request({
    url: `/tool/checklist/${id}`,
    method: 'get'
  })
}

export function createChecklist(data) {
  return request({
    url: '/tool/checklist',
    method: 'post',
    data
  })
}

// ========== 常用链接 ==========
export function getLinkList() {
  return request({
    url: '/tool/link/list',
    method: 'get'
  })
}

export function createLink(data) {
  return request({
    url: '/tool/link',
    method: 'post',
    data
  })
}

export function deleteLink(id) {
  return request({
    url: `/tool/link/${id}`,
    method: 'delete'
  })
}

// ========== 每日分析 ==========
export function getAnalysisList(params) {
  return request({
    url: '/tool/analysis/list',
    method: 'get',
    params
  })
}

export function getAnalysisByDate(date) {
  return request({
    url: `/tool/analysis/${date}`,
    method: 'get'
  })
}

export function saveAnalysis(data) {
  return request({
    url: '/tool/analysis',
    method: 'post',
    data
  })
}
