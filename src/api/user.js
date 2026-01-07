import request from '@/utils/request'

// 用户列表
export function getUserList(params) {
  return request({
    url: '/user/list',
    method: 'get',
    params
  })
}

// 创建用户
export function createUser(data) {
  return request({
    url: '/user',
    method: 'post',
    data
  })
}

// 更新用户
export function updateUser(id, data) {
  return request({
    url: `/user/${id}`,
    method: 'put',
    data
  })
}

// 删除用户
export function deleteUserApi(id) {
  return request({
    url: `/user/${id}`,
    method: 'delete'
  })
}

// 更新用户状态
export function updateUserStatus(id, status) {
  return request({
    url: `/user/${id}/status`,
    method: 'put',
    data: { status }
  })
}

// 重置用户密码
export function resetUserPassword(id, password) {
  return request({
    url: `/user/${id}/reset-password`,
    method: 'put',
    data: { password }
  })
}

// 修改用户角色
export function updateUserRole(id, role) {
  return request({
    url: `/user/${id}/role`,
    method: 'put',
    data: { role }
  })
}

// 更新个人资料
export function updateProfile(data) {
  return request({
    url: '/user/profile',
    method: 'put',
    data
  })
}

// 修改密码
export function changePassword(data) {
  return request({
    url: '/user/password',
    method: 'put',
    data
  })
}
