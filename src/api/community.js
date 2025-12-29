import request from '@/utils/request'

// ========== 帖子相关 ==========
export function getPostList(params) {
  return request({
    url: '/community/post/list',
    method: 'get',
    params
  })
}

export function getPostDetail(id) {
  return request({
    url: `/community/post/${id}`,
    method: 'get'
  })
}

export function createPost(data) {
  return request({
    url: '/community/post',
    method: 'post',
    data
  })
}

export function updatePost(id, data) {
  return request({
    url: `/community/post/${id}`,
    method: 'put',
    data
  })
}

export function deletePost(id) {
  return request({
    url: `/community/post/${id}`,
    method: 'delete'
  })
}

export function likePost(id) {
  return request({
    url: `/community/post/${id}/like`,
    method: 'post'
  })
}

// ========== 评论相关 ==========
export function getCommentList(postId, params) {
  return request({
    url: '/community/comment/list',
    method: 'get',
    params: { postId, ...params }
  })
}

export function createComment(data) {
  return request({
    url: '/community/comment',
    method: 'post',
    data
  })
}

export function deleteComment(id) {
  return request({
    url: `/community/comment/${id}`,
    method: 'delete'
  })
}

export function likeComment(id) {
  return request({
    url: `/community/comment/${id}/like`,
    method: 'post'
  })
}
