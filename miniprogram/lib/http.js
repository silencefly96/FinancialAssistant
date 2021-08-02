// http.js
const base64 = require('base64.js')

const DEBUG = true;
const BASE_UTL = 'XXXX.XXX.XX.X'

//控制日志打印
function log(content) {
  if (DEBUG) console.log(content);
}

function request(info) {
  //路径
  let url = info.url
  //数据
  let data = info.data
  //结束回调（函数）
  let complete = info.complete
  //成功回调（函数）
  let success = info.success
  //失败回调（函数）
  let fail = info.fail

  // 限定必填 url data success
  if (!(url && data && (success || complete))) {
    wx.showToast({
      title: "请求参数异常",
    })
    return
  }

  //请求日志
  log('request:(' + url + '):')
  log(data)

  wx.request({
    url: BASE_UTL + url,
    data: base64.encode(JSON.stringify(data)),
    method: 'POST',
    header: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    success: function (res) {
      return success && typeof success == "function" && success(res);
    },
    fail: function (res) {
      return fail && typeof fail == "function" && fail(res);
    },
    complete: function (res) {
      //回复日志
      log('response(' + url + '):')
      log(res)

      return complete && typeof complete == "function" && complete(false)
    },
  })
}

// 上传文件到服务器 
function uploadFile(info) {
  //路径
  let url = info.url
  //完整路径，可能上传位置和 BASE_UTL 不一样
  let fullUrl = info.fullUrl
  //数据
  let data = info.data
  //文件位置
  let tempFilePaths = info.tempFilePaths
  //文件类型
  let fileType = info.fileType

  //结束回调（函数）
  let complete = info.complete
  //成功回调（函数）
  let success = info.success
  //失败回调（函数）
  let fail = info.fail

  // 限定必填 url data success
  if (!((url || fullUrl) && tempFilePaths && (success || complete))) {
    wx.showToast({
      title: "请求参数异常",
    })
    return
  }

  wx.uploadFile({
    url: fullUrl ? fullUrl : BASE_UTL + url,
    data: data ? base64.encode(JSON.stringify(data)) : null,
    filePath: tempFilePaths,
    name: fileType,
    formData: params,
    header: {
      'Cookie': wx.getStorageSync("cookie")
    },
    success: function (res) {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        return success && typeof success == "function" && success(res);
      } else {
        return fail && typeof fail == "function" && fail(res);
      }
    },
    fail: function (res) {
      return fail && typeof fail == "function" && fail(res);
    },
    complete: function (res) {
      //回复日志
      log('response(' + url + '):')
      log(res)

      return complete && typeof complete == "function" && complete(false)
    },
  })
}

module.exports = {
  request: request,
  uploadFile: uploadFile,
}