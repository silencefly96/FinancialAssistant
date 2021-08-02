// pages/common/sample/sample.js
var app = getApp()

Component({

	//样式隔离
	options: {
		styleIsolation: 'apply-shared'
	},

	//传入属性
	properties: {
		show: {
			type: Boolean,
			value: false,
			observer: function (newVal, oldVal) {
				// 属性值变化时执行
				this.data.contractId = newVal
				this.getData(newVal)
			}
		},
	},

	//自身数据
	data: {

	},

	//生命周期
	lifetimes: {

		//创建
		attached: function () {

		},
	},

	//自身方法
	methods: {

		//Fake下拉函数
		onPullDownRefresh() {

		},


	}
})