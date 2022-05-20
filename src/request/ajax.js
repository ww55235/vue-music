import axios from 'axios'
import { Toast } from 'vant'

import NProgress from 'nprogress'
// 配置禁用加载小圆环
NProgress.configure({ showSpinner: false })
const baseURL =
  process.env.NODE_ENV === 'production'
    ? 'http://47.112.208.33:3000'
    : 'http://192.168.1.105:3000/'

const http = axios.create({
  baseURL,
})
// 添加请求拦截器
http.interceptors.request.use(
  function (config) {
    NProgress.start()

    // 在发送请求之前做些什么
    Toast.loading({
      message: '加载中...',
      loadingType: 'spinner',
      forbidClick: true,
    })
    return config
  },
  function (error) {
    NProgress.done()
    Toast.clear()
    // 对请求错误做些什么
    return Promise.reject(error)
  }
)
// 添加响应拦截器
http.interceptors.response.use(
  function (response) {
    NProgress.done()
    // 对响应成功的数据做点什么
    Toast.clear()
    return response
  },
  function (error) {
    NProgress.done()
    Toast.clear()
    // 对响应错误做点什么
    return Promise.reject(error)
  }
)

export default http
