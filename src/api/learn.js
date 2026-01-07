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

// 管理员获取所有课程（包括草稿）
export function getAllCourses() {
  return request({
    url: '/learn/course/all',
    method: 'get'
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

export function getNote(params) {
  return request({
    url: '/learn/note/get',
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

export function saveNote(data) {
  return request({
    url: '/learn/note/save',
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

export function getNoteStats() {
  return request({
    url: '/learn/note/stats',
    method: 'get'
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

// ========== 实战案例 ==========
export function getCaseListByChapter(chapterId) {
  return request({
    url: `/learn/case/chapter/${chapterId}`,
    method: 'get'
  })
}

export function getCaseList(params) {
  return request({
    url: '/learn/case/list',
    method: 'get',
    params
  })
}

export function getCaseDetail(id) {
  return request({
    url: `/learn/case/${id}`,
    method: 'get'
  })
}

export function searchCases(params) {
  return request({
    url: '/learn/case/search',
    method: 'get',
    params
  })
}

export function getCaseSymbols() {
  return request({
    url: '/learn/case/symbols',
    method: 'get'
  })
}

export function getCaseStats() {
  return request({
    url: '/learn/case/stats',
    method: 'get'
  })
}

// 管理员接口
export function getAdminCaseList(params) {
  return request({
    url: '/learn/case/admin/list',
    method: 'get',
    params
  })
}

export function createCase(data) {
  return request({
    url: '/learn/case',
    method: 'post',
    data
  })
}

export function updateCase(id, data) {
  return request({
    url: `/learn/case/${id}`,
    method: 'put',
    data
  })
}

export function deleteCase(id) {
  return request({
    url: `/learn/case/${id}`,
    method: 'delete'
  })
}

// ========== 外部资源 ==========
export function getResourceListByChapter(chapterId) {
  return request({
    url: `/learn/resource/chapter/${chapterId}`,
    method: 'get'
  })
}

export function getResourceList(params) {
  return request({
    url: '/learn/resource/list',
    method: 'get',
    params
  })
}

export function getResourceDetail(id) {
  return request({
    url: `/learn/resource/${id}`,
    method: 'get'
  })
}

export function searchResources(params) {
  return request({
    url: '/learn/resource/search',
    method: 'get',
    params
  })
}

export function getResourcePlatforms() {
  return request({
    url: '/learn/resource/platforms',
    method: 'get'
  })
}

export function getResourceStats() {
  return request({
    url: '/learn/resource/stats',
    method: 'get'
  })
}

// 管理员接口
export function getAdminResourceList(params) {
  return request({
    url: '/learn/resource/admin/list',
    method: 'get',
    params
  })
}

export function createResource(data) {
  return request({
    url: '/learn/resource',
    method: 'post',
    data
  })
}

export function updateResource(id, data) {
  return request({
    url: `/learn/resource/${id}`,
    method: 'put',
    data
  })
}

export function deleteResource(id) {
  return request({
    url: `/learn/resource/${id}`,
    method: 'delete'
  })
}

// ========== 专题内容 ==========
export function getTopicListAll(params) {
  return request({
    url: '/learn/topic/all',
    method: 'get',
    params
  })
}

export function getTopicList(params) {
  return request({
    url: '/learn/topic/list',
    method: 'get',
    params
  })
}

export function getTopicDetail(id) {
  return request({
    url: `/learn/topic/${id}`,
    method: 'get'
  })
}

export function searchTopics(params) {
  return request({
    url: '/learn/topic/search',
    method: 'get',
    params
  })
}

export function getTopicsByWeek(weekNumber) {
  return request({
    url: `/learn/topic/week/${weekNumber}`,
    method: 'get'
  })
}

export function getTopicStats() {
  return request({
    url: '/learn/topic/stats',
    method: 'get'
  })
}

// 管理员接口
export function getAdminTopicList(params) {
  return request({
    url: '/learn/topic/admin/list',
    method: 'get',
    params
  })
}

export function createTopic(data) {
  return request({
    url: '/learn/topic',
    method: 'post',
    data
  })
}

export function updateTopic(id, data) {
  return request({
    url: `/learn/topic/${id}`,
    method: 'put',
    data
  })
}

export function deleteTopic(id) {
  return request({
    url: `/learn/topic/${id}`,
    method: 'delete'
  })
}

// ========== 测验题库 ==========
export function getQuizForTest(chapterId) {
  return request({
    url: `/learn/quiz/chapter/${chapterId}`,
    method: 'get'
  })
}

export function getQuizListByChapter(chapterId) {
  return request({
    url: `/learn/quiz/chapter/${chapterId}/all`,
    method: 'get'
  })
}

export function getQuizDetail(id) {
  return request({
    url: `/learn/quiz/${id}`,
    method: 'get'
  })
}

export function submitQuiz(data) {
  return request({
    url: '/learn/quiz/submit',
    method: 'post',
    data
  })
}

export function getQuizRecords(params) {
  return request({
    url: '/learn/quiz/record/list',
    method: 'get',
    params
  })
}

export function getBestQuizRecord(chapterId) {
  return request({
    url: `/learn/quiz/record/best/${chapterId}`,
    method: 'get'
  })
}

export function getChapterQuizStats(chapterId) {
  return request({
    url: `/learn/quiz/stats/${chapterId}`,
    method: 'get'
  })
}

export function getQuizStats() {
  return request({
    url: '/learn/quiz/stats',
    method: 'get'
  })
}

// 管理员接口
export function getAdminQuizList(params) {
  return request({
    url: '/learn/quiz/admin/list',
    method: 'get',
    params
  })
}

export function createQuiz(data) {
  return request({
    url: '/learn/quiz',
    method: 'post',
    data
  })
}

export function updateQuiz(id, data) {
  return request({
    url: `/learn/quiz/${id}`,
    method: 'put',
    data
  })
}

export function deleteQuiz(id) {
  return request({
    url: `/learn/quiz/${id}`,
    method: 'delete'
  })
}

// ========== 工具指南 ==========
export function getToolGuideListAll(params) {
  return request({
    url: '/learn/tool-guide/all',
    method: 'get',
    params
  })
}

export function getToolGuideList(params) {
  return request({
    url: '/learn/tool-guide/list',
    method: 'get',
    params
  })
}

export function getToolGuideDetail(id) {
  return request({
    url: `/learn/tool-guide/${id}`,
    method: 'get'
  })
}

export function searchToolGuides(params) {
  return request({
    url: '/learn/tool-guide/search',
    method: 'get',
    params
  })
}

export function getToolGuideStats() {
  return request({
    url: '/learn/tool-guide/stats',
    method: 'get'
  })
}

// 管理员接口
export function getAdminToolGuideList(params) {
  return request({
    url: '/learn/tool-guide/admin/list',
    method: 'get',
    params
  })
}

export function createToolGuide(data) {
  return request({
    url: '/learn/tool-guide',
    method: 'post',
    data
  })
}

export function updateToolGuide(id, data) {
  return request({
    url: `/learn/tool-guide/${id}`,
    method: 'put',
    data
  })
}

export function deleteToolGuide(id) {
  return request({
    url: `/learn/tool-guide/${id}`,
    method: 'delete'
  })
}


// ========== 全局搜索 ==========
export function globalSearch(params) {
  return request({
    url: '/search/global',
    method: 'get',
    params
  })
}

// ========== 学习打卡 ==========
export function getCheckinCalendar(params) {
  return request({
    url: '/learn/checkin/calendar',
    method: 'get',
    params
  })
}

export function getCheckinHeatmap(params) {
  return request({
    url: '/learn/checkin/heatmap',
    method: 'get',
    params
  })
}

export function getCheckinStreak(params) {
  return request({
    url: '/learn/checkin/streak',
    method: 'get',
    params
  })
}

export function checkinToday(params) {
  return request({
    url: '/learn/checkin/today',
    method: 'post',
    params
  })
}

export function updateCheckinData(params) {
  return request({
    url: '/learn/checkin/update',
    method: 'post',
    params
  })
}

// ========== 错题本 ==========
export function getWrongQuestionList(params) {
  return request({
    url: '/learn/wrong-question/list',
    method: 'get',
    params
  })
}

export function getWrongQuestionStats(params) {
  return request({
    url: '/learn/wrong-question/stats',
    method: 'get',
    params
  })
}

export function addWrongQuestion(params) {
  return request({
    url: '/learn/wrong-question/add',
    method: 'post',
    params
  })
}

export function markQuestionMastered(params) {
  return request({
    url: '/learn/wrong-question/master',
    method: 'post',
    params
  })
}

export function unmarkQuestionMastered(params) {
  return request({
    url: '/learn/wrong-question/unmaster',
    method: 'post',
    params
  })
}

export function removeWrongQuestion(params) {
  return request({
    url: '/learn/wrong-question/remove',
    method: 'delete',
    params
  })
}

// ========== 用户收藏 ==========
export function getFavoriteList(params) {
  return request({
    url: '/user/favorite/list',
    method: 'get',
    params
  })
}

export function getFavoriteStats(params) {
  return request({
    url: '/user/favorite/stats',
    method: 'get',
    params
  })
}

export function addFavorite(params) {
  return request({
    url: '/user/favorite/add',
    method: 'post',
    params
  })
}

export function removeFavorite(params) {
  return request({
    url: '/user/favorite/remove',
    method: 'post',
    params
  })
}

export function checkFavorite(params) {
  return request({
    url: '/user/favorite/check',
    method: 'get',
    params
  })
}

export function toggleFavorite(params) {
  return request({
    url: '/user/favorite/toggle',
    method: 'post',
    params
  })
}
