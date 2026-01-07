import request from '@/utils/request'

// 预览待分析数据
export function previewData(startDate, endDate) {
  return request({
    url: '/trade/xray/preview',
    method: 'get',
    params: { startDate, endDate }
  })
}

// 执行AI分析
export function analyzeData(startDate, endDate) {
  return request({
    url: '/trade/xray/analyze',
    method: 'post',
    params: { startDate, endDate },
    timeout: 120000 // 2分钟超时
  })
}

// 获取历史报告列表
export function getReportList(params) {
  return request({
    url: '/trade/xray/reports',
    method: 'get',
    params
  })
}

// 获取报告详情
export function getReportDetail(id) {
  return request({
    url: `/trade/xray/report/${id}`,
    method: 'get'
  })
}

// 获取今日配额
export function getQuota() {
  return request({
    url: '/trade/xray/quota',
    method: 'get'
  })
}
