//app.js
const DEBUG = true;
const FIVE_MINS = 300 * 1000;

App({
  onLaunch: function () {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        // env 参数说明：
        //   env 参数决定接下来小程序发起的云开发调用（wx.cloud.xxx）会默认请求到哪个云环境的资源
        //   此处请填入环境 ID, 环境 ID 可打开云控制台查看
        //   如不填则使用默认环境（第一个创建的环境）
        // env: 'my-env-id',
        traceUser: true,
      })
    }
    //获取设备相关数据
    this.getDeviceInfos()

    // 获取 openID
    this.getOpenId()

  },

  globalData: {
    userInfo: null,

    openid: '',

    //系统信息
    systemInfo: {},
    //设备类型 = devtools, ios, android, win10...
    platform: '',
    isMobieDevice: true,
    //1px像素值 对应 rpx
    pixelRatio1: 2,
    //胶囊信息
    menuInfo: {},
    //屏幕高度
    screenHeight: 2000,
    //顶部高度 = 状态栏高度 + 导航栏高度
    topHeight: 0,
    //状态栏高度
    statusHeight: 0,
    //导航栏高度
    naviHeight: 0,
    //底部安全高度
    bottomHeight: 0,
  },

  // 增加一层 log 判断，控制日志输出
  log(content) {
    if (DEBUG) console.log(content);
  },

  //获取设备相关数据
  getDeviceInfos() {
    var that = this;

    //获取设备信息
    let systemInfo = wx.getSystemInfoSync()
    that.globalData.systemInfo = systemInfo

    //获取设备类型
    let platform = systemInfo.platform
    that.globalData.platform = platform
    that.globalData.isMobieDevice = platform == "ios" || platform == "android" || platform == "devtools"

    //1rpx 像素值
    let pixelRatio1 = 750 / systemInfo.windowWidth;
    that.globalData.pixelRatio1 = pixelRatio1

    //胶囊信息
    let menu = wx.getMenuButtonBoundingClientRect()
    that.globalData.menuInfo = menu

    //状态栏高度
    let statusHeight = systemInfo.statusBarHeight
    that.globalData.statusHeight = statusHeight * pixelRatio1

    //导航栏高度
    let naviHeight = (menu.top - statusHeight) * 2 + menu.height
    that.globalData.naviHeight = naviHeight * pixelRatio1

    //顶部高度 = 状态栏高度 + 导航栏高度
    that.globalData.topHeight = (statusHeight + naviHeight) * pixelRatio1

    //屏幕高度
    let screenHeight = systemInfo.screenHeight
    that.globalData.screenHeight = screenHeight * pixelRatio1

    //底部高度 = 屏幕高度 - 安全区域bottom
    let bottomHeight = (screenHeight - systemInfo.safeArea.bottom) * pixelRatio1
    //如果没底部安全高度，留出一定空间作为下边距
    that.globalData.bottomHeight = bottomHeight <= 28 ? 28 : bottomHeight
  },

  // 获取 OpenId
  getOpenId() {
    let that = this

    // 从缓存中获取 openID
    var openId = wx.getStorageSync('openId');
    if (openId) {
      that.log("find openid available: " + openid);
      that.globalData.openid = openid;
    } else {

      // 本地没有 openID 需要先登陆拿到 code，去获取
      wx.login({
        success: function (res) {
          that.log("wx.login.res:");
          that.log(res);

          if (res.code) {
            that.log("get code:" + res.code);
            //从后台获取 OpenId
            that.getOpenIdByCode(res.code);
          } else {
            that.log("get code fail");
          }
        },
        fail: function (res) {
          that.log(res.errMsg);
        }
      });
    }
  },

  // 通过用户登录的 code 去后台请求获得 openId
  getOpenIdByCode(code) {
    return ''
  },

  showErrToast: function (msg) {
    wx.showToast({
      title: msg ? msg : "未知错误",
      icon: 'none',
      duration: 1300,
    })
  },

  showSuccessToast: function (msg) {
    wx.showToast({
      title: msg ? msg : "操作成功",
      icon: 'success',
      duration: 1000,
    })
  },

  showLoadingTips: function (msg) {
    wx.showLoading({
      title: msg ? msg : "加载中...",
    })
  },

})