import request from '@/utils/request'

// 获取模型列表
export function getModelList() {
  return request({
    url: '/ai/model/list',
    method: 'get'
  })
}

// 获取当前启用的模型
export function getActiveModel() {
  return request({
    url: '/ai/model/active',
    method: 'get'
  })
}

// 创建模型
export function createModel(data) {
  return request({
    url: '/ai/model',
    method: 'post',
    data
  })
}

// 更新模型
export function updateModel(id, data) {
  return request({
    url: `/ai/model/${id}`,
    method: 'put',
    data
  })
}

// 启用模型
export function activateModel(id) {
  return request({
    url: `/ai/model/${id}/activate`,
    method: 'put'
  })
}

// 删除模型
export function deleteModel(id) {
  return request({
    url: `/ai/model/${id}`,
    method: 'delete'
  })
}
