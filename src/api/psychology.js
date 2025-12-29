import request from '@/utils/request'

// ========== 每日打卡 ==========
export function saveDaily(data) {
  return request({
    url: '/psychology/daily',
    method: 'post',
    data
  })
}

export function getDailyByDate(date) {
  return request({
    url: `/psychology/daily/${date}`,
    method: 'get'
  })
}

export function getDailyList(startDate, endDate) {
  return request({
    url: '/psychology/daily',
    method: 'get',
    params: { startDate, endDate }
  })
}

// ========== 交易情绪 ==========
export function saveTrade(data) {
  return request({
    url: '/psychology/trade',
    method: 'post',
    data
  })
}

export function getTradeList(startDate, endDate) {
  return request({
    url: '/psychology/trade',
    method: 'get',
    params: { startDate, endDate }
  })
}

// ========== 日历数据 ==========
export function getCalendarData(year, month) {
  return request({
    url: '/psychology/calendar',
    method: 'get',
    params: { year, month }
  })
}

export function getMonthOverview(year, month) {
  return request({
    url: '/psychology/overview',
    method: 'get',
    params: { year, month }
  })
}

// ========== 情绪分析 ==========
export function getAnalysis(period = 'month') {
  return request({
    url: '/psychology/analysis',
    method: 'get',
    params: { period }
  })
}
