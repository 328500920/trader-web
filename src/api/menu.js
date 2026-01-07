import request from '@/utils/request'

/**
 * 获取当前用户可见菜单
 */
export function getUserMenus() {
  return request({
    url: '/menu/user',
    method: 'get'
  })
}

/**
 * 获取所有菜单（管理用）
 */
export function getAllMenus() {
  return request({
    url: '/menu/list',
    method: 'get'
  })
}

/**
 * 更新菜单配置
 */
export function updateMenu(id, data) {
  return request({
    url: `/menu/${id}`,
    method: 'put',
    data
  })
}

/**
 * 批量更新菜单
 */
export function batchUpdateMenus(data) {
  return request({
    url: '/menu/batch',
    method: 'put',
    data
  })
}
