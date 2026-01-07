import request from '@/utils/request'

// ========== 学员接口 ==========

// 获取视频列表
export function getVideoList(params) {
  return request({
    url: '/learn/video/list',
    method: 'get',
    params
  })
}

// 获取视频详情
export function getVideoDetail(id) {
  return request({
    url: `/learn/video/${id}`,
    method: 'get'
  })
}

// 获取所有分类
export function getVideoCategories() {
  return request({
    url: '/learn/video/categories',
    method: 'get'
  })
}

// 更新观看进度
export function updateVideoProgress(id, data) {
  return request({
    url: `/learn/video/${id}/progress`,
    method: 'post',
    data
  })
}

// 获取用户观看统计
export function getVideoStats() {
  return request({
    url: '/learn/video/stats',
    method: 'get'
  })
}

// ========== 管理员接口 ==========

// 管理员获取视频列表
export function getAdminVideoList(params) {
  return request({
    url: '/learn/video/admin/list',
    method: 'get',
    params
  })
}

// 创建视频
export function createVideo(data) {
  return request({
    url: '/learn/video',
    method: 'post',
    data
  })
}

// 更新视频
export function updateVideo(id, data) {
  return request({
    url: `/learn/video/${id}`,
    method: 'put',
    data
  })
}

// 删除视频
export function deleteVideo(id) {
  return request({
    url: `/learn/video/${id}`,
    method: 'delete'
  })
}

// 上传视频文件
export function uploadVideoFile(file, onProgress) {
  const formData = new FormData()
  formData.append('file', file)
  
  return request({
    url: '/learn/video/upload/video',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    timeout: 600000, // 10分钟超时
    onUploadProgress: onProgress
  })
}

// 上传封面
export function uploadVideoCover(file) {
  const formData = new FormData()
  formData.append('file', file)
  
  return request({
    url: '/learn/video/upload/cover',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}
