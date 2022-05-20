import axios from 'axios'
import { Toast } from 'vant'

import NProgress from 'nprogress'
// 配置禁用加载小圆环
NProgress.configure({ showSpinner: false })
//将BASE_IP修改成你购买的服务器对应的公网IP地址
const BASE_IP = 'http://47.112.208.33'
// 如果你想通过手机访问 请把 192.168.1.105 修改成你的内网IP 注意手机和电脑连接同一个wifi
// 打开docs 面板 执行 ipconfig命令 复制IPV4地址替换掉即可
const baseURL =
  process.env.NODE_ENV === 'production'
    ? `${BASE_IP}:3000`
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
