import request from '@/utils/request'

// ========== 交易日志 ==========
export function getTradeList(params) {
  return request({
    url: '/trade/list',
    method: 'get',
    params
  })
}

export function getTradeDetail(id) {
  return request({
    url: `/trade/${id}`,
    method: 'get'
  })
}

export function createTrade(data) {
  return request({
    url: '/trade',
    method: 'post',
    data
  })
}

export function updateTrade(id, data) {
  return request({
    url: `/trade/${id}`,
    method: 'put',
    data
  })
}

export function deleteTrade(id) {
  return request({
    url: `/trade/${id}`,
    method: 'delete'
  })
}

export function closeTrade(id, data) {
  return request({
    url: `/trade/${id}/close`,
    method: 'put',
    data
  })
}

// ========== 交易截图 ==========
export function uploadTradeImage(tradeId, formData) {
  return request({
    url: `/trade/${tradeId}/image`,
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

export function deleteTradeImage(imageId) {
  return request({
    url: `/trade/image/${imageId}`,
    method: 'delete'
  })
}

// ========== 绩效统计 ==========
export function getTradeSummary(params) {
  return request({
    url: '/trade/summary',
    method: 'get',
    params
  })
}

export function getTradeChart(params) {
  return request({
    url: '/trade/summary/chart',
    method: 'get',
    params
  })
}

export function getStrategyStats(params) {
  return request({
    url: '/trade/summary/strategy',
    method: 'get',
    params
  })
}

export function getSymbolStats(params) {
  return request({
    url: '/trade/summary/symbol',
    method: 'get',
    params
  })
}

// ========== 交易计划 ==========
export function getPlanList(params) {
  return request({
    url: '/trade/plan',
    method: 'get',
    params
  })
}

export function getPlanDetail(id) {
  return request({
    url: `/trade/plan/${id}`,
    method: 'get'
  })
}

export function createPlan(data) {
  return request({
    url: '/trade/plan',
    method: 'post',
    data
  })
}

export function updatePlan(id, data) {
  return request({
    url: `/trade/plan/${id}`,
    method: 'put',
    data
  })
}

export function deletePlan(id) {
  return request({
    url: `/trade/plan/${id}`,
    method: 'delete'
  })
}

export function executePlan(id, tradeLogId) {
  return request({
    url: `/trade/plan/${id}/execute`,
    method: 'put',
    params: { tradeLogId }
  })
}

export function cancelPlan(id) {
  return request({
    url: `/trade/plan/${id}/cancel`,
    method: 'put'
  })
}

export function getPlanStats() {
  return request({
    url: '/trade/plan/stats',
    method: 'get'
  })
}

// ========== 成交记录（Binance导入） ==========
export function getRecordList(params) {
  return request({
    url: '/trade/record/list',
    method: 'get',
    params
  })
}

export function getRecordDetail(id) {
  return request({
    url: `/trade/record/${id}`,
    method: 'get'
  })
}

export function deleteRecord(id) {
  return request({
    url: `/trade/record/${id}`,
    method: 'delete'
  })
}

export function importRecords(formData) {
  return request({
    url: '/trade/record/import',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

export function getRecordStatistics(params) {
  return request({
    url: '/trade/record/statistics',
    method: 'get',
    params
  })
}


// ========== 仓位历史（Binance导入） ==========
export function getPositionList(params) {
  return request({
    url: '/trade/position/list',
    method: 'get',
    params
  })
}

export function getPositionDetail(id) {
  return request({
    url: `/trade/position/${id}`,
    method: 'get'
  })
}

export function deletePosition(id) {
  return request({
    url: `/trade/position/${id}`,
    method: 'delete'
  })
}

export function importPositions(formData) {
  return request({
    url: '/trade/position/import',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

export function getPositionStatistics(params) {
  return request({
    url: '/trade/position/statistics',
    method: 'get',
    params
  })
}

export function generateTradeLog(positionId) {
  return request({
    url: `/trade/position/${positionId}/generate-log`,
    method: 'post'
  })
}
