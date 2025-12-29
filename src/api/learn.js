import request from '@/utils/request'

// ========== 课程相关 ==========
export function getCourseList(params) {
  return request({
    url: '/learn/course/list',
    method: 'get',
    params
  })
}

export function getCourseDetail(id) {
  return request({
    url: `/learn/course/${id}`,
    method: 'get'
  })
}

export function createCourse(data) {
  return request({
    url: '/learn/course',
    method: 'post',
    data
  })
}

export function updateCourse(id, data) {
  return request({
    url: `/learn/course/${id}`,
    method: 'put',
    data
  })
}

export function deleteCourse(id) {
  return request({
    url: `/learn/course/${id}`,
    method: 'delete'
  })
}

// ========== 章节相关 ==========
export function getChapterList(params) {
  return request({
    url: '/learn/chapter/list',
    method: 'get',
    params
  })
}

export function getChapterDetail(id) {
  return request({
    url: `/learn/chapter/${id}`,
    method: 'get'
  })
}

export function createChapter(data) {
  return request({
    url: '/learn/chapter',
    method: 'post',
    data
  })
}

export function updateChapter(id, data) {
  return request({
    url: `/learn/chapter/${id}`,
    method: 'put',
    data
  })
}

export function deleteChapter(id) {
  return request({
    url: `/learn/chapter/${id}`,
    method: 'delete'
  })
}

// ========== 学习进度 ==========
export function getProgress() {
  return request({
    url: '/learn/progress',
    method: 'get'
  })
}

export function completeChapter(chapterId) {
  return request({
    url: '/learn/progress/complete',
    method: 'post',
    data: { chapterId }
  })
}

// ========== 任务相关 ==========
export function getTaskList(chapterId) {
  return request({
    url: '/learn/task/list',
    method: 'get',
    params: { chapterId }
  })
}

export function completeTask(taskId) {
  return request({
    url: '/learn/task/complete',
    method: 'post',
    data: { taskId }
  })
}

// ========== 笔记相关 ==========
export function getNoteList(params) {
  return request({
    url: '/learn/note/list',
    method: 'get',
    params
  })
}

export function createNote(data) {
  return request({
    url: '/learn/note',
    method: 'post',
    data
  })
}

export function updateNote(id, data) {
  return request({
    url: `/learn/note/${id}`,
    method: 'put',
    data
  })
}

export function deleteNote(id) {
  return request({
    url: `/learn/note/${id}`,
    method: 'delete'
  })
}

// ========== 学习资料 ==========
export function getMaterialList(chapterId) {
  return request({
    url: '/learn/material/list',
    method: 'get',
    params: { chapterId }
  })
}

export function getMaterialDetail(id) {
  return request({
    url: `/learn/material/${id}`,
    method: 'get'
  })
}

export function createMaterial(data) {
  return request({
    url: '/learn/material',
    method: 'post',
    data
  })
}

export function updateMaterial(id, data) {
  return request({
    url: `/learn/material/${id}`,
    method: 'put',
    data
  })
}

export function deleteMaterial(id) {
  return request({
    url: `/learn/material/${id}`,
    method: 'delete'
  })
}
