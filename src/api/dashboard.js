import request from '@/utils/request'

export function getStats() {
  return request({
    url: '/dashboard/stats',
    method: 'get'
  })
}

export function getRecentTrades() {
  return request({
    url: '/dashboard/recent-trades',
    method: 'get'
  })
}

export function getTasks() {
  return request({
    url: '/dashboard/tasks',
    method: 'get'
  })
}

export function getChartData(period) {
  return request({
    url: '/trade/summary/chart',
    method: 'get',
    params: { period }
  })
}
