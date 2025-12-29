import request from '@/utils/request'

// 获取币种列表
export function getCryptoList() {
  return request({
    url: '/crypto/list',
    method: 'get'
  })
}
