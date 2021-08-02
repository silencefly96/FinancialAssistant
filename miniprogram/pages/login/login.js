// pages/login/login.js
const md5 = require('../../lib/md5.js')
const base64 = require('../../lib/base64.js')
const app = getApp()

Page({
    data: {
        //0 密码登录，1 验证码登录
        loginModel: 0,

        //自动登录
        autoLogin: true,
        //登录按钮禁用
        loginable: false,
        //等待验证码
        waitingCode: false,
        waiteTime: 0,
        interval: -1, //计时器
        //显示密码
        isDisplayPassword: false,
        //展示历史用户
        isShowUsers: false,

        //输入框
        username: "",
        password: "",
        phoneNumber: "",
        messageCode: "",

        //登录失败计数
        failCount: 0,

        historyUsers: [],
    },

    onLoad: function (options) {
        //读取历史用户数据
		this.loadUsers();
		
		//请求超时跳到登陆界面，携带 timeout 参数
        if(options.timeout) {
            app.showErrToast("操作超时，请重新登陆")
        }
    },

    onShow: function () {
        if (this.data.autoLogin && this.data.historyUsers.length > 0) {
            let lastIdx = this.data.historyUsers.length - 1
            this.setData({
                username: this.data.historyUsers[lastIdx].username,
                password: this.data.historyUsers[lastIdx].password
            })
            this.inputChange()
            //this.loginByAccount()
        }
    },

    inputChange() {
        let loginable = false
        //根据四个输入
        if (this.data.loginModel == 0) {
            loginable = !this.isEmpty(this.data.username) && !this.isEmpty(this.data.password)
        } else {
            loginable = !this.isEmpty(this.data.phoneNumber) && !this.isEmpty(this.data.messageCode)
        }
        this.setData({
            loginable: loginable
        })
	},
	
	isEmpty(obj) {
		if (typeof obj == "undefined" || obj == null || obj == "") {
			return true;
		} else {
			return false;
		}
	},

    //显示密码
    displayPassword(e) {
        app.log("displayPassword")
        this.setData({
            isDisplayPassword: !this.data.isDisplayPassword
        })
    },

    onSelectLoginType: function (event) {
        var index = event.currentTarget.dataset.index;
        this.setData({
            loginModel: index
        })

        //更新按钮判断逻辑
        this.inputChange()
    },

    //显示历史用户列表
    showHistoryUsers() {
        if (this.data.historyUsers.length > 0) {
            this.setData({
                isShowUsers: !this.data.isShowUsers
            });
        } else {
            app.showErrToast("暂无历史用户")
        }
    },

    loadUsers() {
        let users = wx.getStorageSync("historyUsers")
        if (users) {
            users.forEach(element => {
                //解密密码
                element.password = base64.decode(element.password)
            });
            //更新显示数据
            this.setData({
                historyUsers: users
            })
        }
    },

    saveUser(user) {
        let users = this.data.historyUsers;

        //如果已经存在删除再插入到最后
        let index = -1
        for (let i = 0; i < users.length; i++) {
            let temp = users[i]
            if (user.username == temp.username) {
                index = i
                break
            }
        }
        if (index >= 0) {
            users.splice(index, 1)
        }

        //最后一个表示最近登录
        users.push(user)

        //更新显示数据
        this.setData({
            historyUsers: users
        })
        //保存到本地
        this.saveUsers();
    },

    //深拷贝数组，修改密码保存
    saveUsers() {
        let users = this.data.historyUsers;
        let encryptUsers = []
        users.forEach(element => {
            encryptUsers.push({
                username: element.username,
                password: base64.encode(element.password)
            })
        });
        //储存到本地
        wx.setStorageSync("historyUsers", encryptUsers);
    },

    selectUser(e) {
        let idx = e.currentTarget.dataset.index;
        let user = this.data.historyUsers[idx];
        this.setData({
            username: user.username,
            password: user.password,
            isShowUsers: false
        });

        //更新登录按钮状态
        this.inputChange()
    },

    deleteUser(e) {
        let that = this

        let index = e.currentTarget.dataset.index
        let users = that.data.historyUsers
        let name = users[index].username

        wx.showModal({
            content: '确认删除' + name + '？',
            success: function (res) {
                if (res.confirm) {

                    //从数组中删除，改变数组大小
                    users.splice(index, 1)
                    //更新显示数据
                    that.setData({
                        historyUsers: users,
                        isShowUsers: !that.data.isShowUsers
                    });
                    //保存到本地
                    that.saveUsers();
                } else if (res.cancel) {
                    //do nothing;
                }
            }
        })
    },

    loginByAccount(e) {
        app.log("login:username=" + this.data.username + ",password=" + this.data.password);

        //数据
        var data = {};
        data.username = this.data.username;
        data.password = md5.hexMD5(this.data.password);
        this.login(data)
    },

    loginByMobie(e) {
        app.log("loginByMobie:phoneNumber=" + this.data.phoneNumber + ",messageCode=" + this.data.messageCode);

        //数据
        var data = {};
        data.mobile = this.data.phoneNumber;
        data.code = this.data.messageCode;
        this.login(data)
    },

    login(data) {
        var that = this;

        //增加数据
        data.openId = app.globalData.openid;
        data.typeId = 5;

        wx.showLoading({
            title: '登录中...',
        })

        app.func.login(data, function (res) {
            app.log("response(wechat/login):");
            app.log(res);

            wx.hideLoading();
            if (res.obj && res.flag == 0) {
                that.onLoginSuccess(res.obj, that.data.username, that.data.password)
            } else {
                // 错误次数
                that.data.failCount++;
                app.showErrToast(res.msg);

                // app.log('debug login：' + that.data.failCount);
                // that.onLoginSuccess({
                //     user: {
                //         roleType: "assessor"
                //     }
                // }, that.data.username, that.data.password)
            }
        });
    },

    onLoginSuccess(res, user, password) {
        app.globalData.session = res
        //保存用户
        if(this.data.loginModel==0) {
            this.saveUser({
                username: user,
                password: password
            })
        }

        //关闭短信倒计时
        if (this.data.interval > 0) {
            this.clearMessage()
        }

        //跳转页面 1委托单位，2评估机构，3监管机构
        let roleType = res.roleType == 1 ? "agency" : "assessor"
        wx.redirectTo({
            url: '../../index/index?roleType=' + roleType
        })
    },

    sendMessage() {
        if(this.data.waitingCode) {
            return
        }

        if(this.data.phoneNumber=='') {
            app.showErrToast('请先填写手机号')
            return
        }

        wx.showLoading({
          title: '正在发送短信',
        })
        let that = this
        app.func.callApiLogin('user/getVerificationCode', {
            mobile: this.data.phoneNumber,
            codeType: 5,
        }, function callback(res) {
            app.log('response(user/getVerificationCode)')
            app.log(res)

            wx.hideLoading()
            if (res.flag != undefined && res.flag == 0) {
                wx.showToast({
                    title: '发送短信成功',
                })
                that.setData({
                    waitingCode: true,
                    waiteTime: 60,
                    interval: setInterval(function (res) {
                        if (that.data.waiteTime > 0) {
                            that.setData({
                                waiteTime: --that.data.waiteTime
                            })
                        } else {
                            that.setData({
                                waitingCode: false,
                                waiteTime: 0
                            })
                        }
                    }, 1000)
                })
            } else {
                if(res.msg != undefined) {
                    app.showErrToast(res.msg)
                }else {
                    app.showErrToast('发送短信失败')
                }
            }
        })
    },

    clearMessage() {
        clearInterval(this.data.interval)
        this.setData({
            waitingCode: false,
            waiteTime: 0,
            interval: -1
        })
    },

    register(e) {
        wx.navigateTo({
            url: "/pages/common/login/register/register"
        });
    },

    forgetPassword(e) {
        wx.navigateTo({
            url: "/pages/common/login/password/password?type=1"
        });
    },

    wechatLogin(e) {
        app.showErrToast("功能开发中")
    }
})