import request from '@/utils/request'

// 用户列表（不包含管理员）
export function getStudentList(params) {
  return request({
    url: '/student/list',
    method: 'get',
    params
  })
}

// 新增用户（只能是教师或学员）
export function createStudent(data) {
  return request({
    url: '/student',
    method: 'post',
    data
  })
}

// 更新用户
export function updateStudent(id, data) {
  return request({
    url: `/student/${id}`,
    method: 'put',
    data
  })
}

// 删除用户
export function deleteStudent(id) {
  return request({
    url: `/student/${id}`,
    method: 'delete'
  })
}

// 修改用户状态
export function updateStudentStatus(id, status) {
  return request({
    url: `/student/${id}/status`,
    method: 'put',
    params: { status }
  })
}

// 重置密码
export function resetStudentPassword(id, password) {
  return request({
    url: `/student/${id}/password`,
    method: 'put',
    data: { password }
  })
}

// 修改角色
export function updateStudentRole(id, role) {
  return request({
    url: `/student/${id}/role`,
    method: 'put',
    params: { role }
  })
}

// 学员详情
export function getStudentById(id) {
  return request({
    url: `/student/${id}`,
    method: 'get'
  })
}

// 学员学习进度
export function getStudentProgress(id) {
  return request({
    url: `/student/${id}/progress`,
    method: 'get'
  })
}

// 学员交易统计
export function getStudentTradeStats(id) {
  return request({
    url: `/student/${id}/trade-stats`,
    method: 'get'
  })
}

// 学员交易日志
export function getStudentTradeLogs(id, params) {
  return request({
    url: `/student/${id}/trade`,
    method: 'get',
    params
  })
}

// 学员打卡记录
export function getStudentCheckins(id, params) {
  return request({
    url: `/student/${id}/checkin`,
    method: 'get',
    params
  })
}
