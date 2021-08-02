// index.js
var app = getApp()
var bottomHeight = (app.globalData.systemInfo.screenHeight - app.globalData.systemInfo.safeArea.bottom) * app.globalData.pixelRatio1

Page({

    data: {
        //状态栏高度
        statusHeight: app.globalData.statusHeight,
        //导航栏高度
        naviHeight: app.globalData.naviHeight,
        //顶部高度 = 状态栏高度 + 导航栏高度
        topHeight: app.globalData.topHeight,
        //底部安全高度，这里需要使用原值
        bottomHeight: bottomHeight,
        //中间内容容器高度 = 屏幕高度 - 底部安全高度 - 底部导航栏高度
        containerHeight: app.globalData.screenHeight - bottomHeight - 104,

        isStatusBar: true,
        currentPageIndex: 0,
        roleType: "",
        title: '',
        tabBar: [],

        bossTabBar: [{
                "iconClass": "iconfont iconshouye",
                "text": "首页",
                "uptoStatus": true
            },
            {
                "iconClass": "iconfont iconxiangmuguanli",
                "text": "项目",
                "uptoStatus": false
            },
            {
                "iconClass": "iconfont iconchart-pie",
                "text": "统计",
                "uptoStatus": false
            },
            {
                "iconClass": "iconfont iconwode",
                "text": "我的",
                "uptoStatus": false
            }
        ],

        wokerTabBar: [{
                "iconClass": "iconfont iconshouye",
                "text": "首页",
                "uptoStatus": true
            },
            {
                "iconClass": "iconfont iconxiangmuguanli",
                "text": "项目",
                "uptoStatus": false
            },
            {
                "iconClass": "iconfont iconwode",
                "text": "我的",
                "uptoStatus": false
            }
        ]
    },

    onLoad: function (options) {
        let tabBar = this.data.tabBar
        if (options.roleType == 'boss') {
            tabBar = this.data.bossTabBar
        } else {
            tabBar = this.data.wokerTabBar
        }

        this.setData({
            tabBar: tabBar,
            roleType: options.roleType,
        })
    },

    onPullDownRefresh() {
        this.selectComponent("#id" + this.data.currentPageIndex).onPullDownRefresh()
	},

    onSelectTap(event) {
        let index = event.currentTarget.dataset.index;
        let isStatusBar = this.data.tabBar[index].uptoStatus;

        //中间页面高度 = 屏幕高度 - 底部安全高度 - 底部导航高度 - 顶部高度
        let containerHeight = app.globalData.screenHeight - bottomHeight - 104
        if (!isStatusBar) {
            containerHeight = containerHeight - this.data.topHeight
        }
        this.setData({
            title: this.data.tabBar[index].text,
            currentPageIndex: index,
            isStatusBar: isStatusBar,
            containerHeight: containerHeight
        })
    },
})