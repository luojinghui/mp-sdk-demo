/**
 * Meeting page demo
 * 
 * @authors Luo-jinghui (luojinghui424@gmail.com)
 * @date  2019-06-01 23:04:27
 */

import xylink from 'xylink-sdk/common/room.js';
import { FailEnumMap, STR_CALL_FAIL_UNKNOW_REASON } from './enum.js';

const defaultAvatar = 'https://devcdn.xylink.com/miniProgram/photo_default.png';

// 定义custom模版匹配数据
// dmeo演示的是画廊模式布局，即对称模版布局
// 如果要支持大屏，可以自行扩展模版
const positionMap = [
	{
		// 2人，self代表自己的位置，other代表其他人位置
		self: [ 10, 0, 90, 50 ],
		other: [
			{
				position: [ 10, 50, 90, 50 ]
			}
		]
	},
	{
		// 3人
		self: [ 10, 0, 45, 50 ],
		other: [
			{
				position: [ 55, 25, 45, 50 ]
			},
			{
				position: [ 10, 50, 45, 50 ]
			}
		]
	},
	{
		// 4人
		self: [ 10, 0, 45, 50 ],
		other: [
			{
				position: [ 55, 0, 45, 50 ]
			},
			{
				position: [ 55, 50, 45, 50 ]
			},
			{
				position: [ 10, 50, 45, 50 ]
			}
		]
	}
	// ...更多可以自行扩充
];

Page({
	data: {
		muted: false,
		devicePosition: 'front',
		meetingLoading: true,
		camera: true,
		onHold: false, // 是否通话等待
		avatar: defaultAvatar, // 用户头像

		// auto模式（自动支持主会场，语音激励，onHold，收远端共享Content内容）
		template: {
			layout: 'auto',
			mode: '4-1'
		}

		// custom模式，不用配置mode模式（需自行定义页面布局）
		// 在onLoad声明函数内，更新会中初始画面
		// template: {
		// 	layout: 'custom',
		// 	detail: []
		// }
	},

	onLoad(option) {
		console.log('demo page onload: ', option);

		this.callNumber = wx.getStorageSync('callNumber');
		this.pageParams = option;

		if (this.data.template.layout === 'custom') {
			// 初始页面加载时，获取本地Local数据，做首屏展示
			this.setData({
				template: {
					layout: 'custom',
					detail: [
						{
							position: [ 10, 0, 90, 100 ],
							callNumber: this.callNumber,
							name: this.pageParams.name || '',
							quality: 'normal',
							isContent: false
						}
					]
				}
			});
		}
	},

	onUnload() {
		clearTimeout(this.timmer);
	},

	// 会议页面准备阶段的生命周期函数
	onReady() {
		const { number, password, name } = this.pageParams;
		// 缓存sdk <xylink-sdk/>组件节点context，为后续调用组件内部方法用
		this.xylinkRoom = this.selectComponent('#xylink');
		// 可选执行，设置是否进行内部事件的console和写入logger文件中，用于分析问题使用，默认都不开启
		this.xylinkRoom.setDebug(true, true);

		// 发起呼叫，内部执行验证会议号等验证
		xylink.makeCall(number, password, name, this.onGetCallStatus);
	},

	// mackCall事件回调，通知是否可以进行入会操作。
	onGetCallStatus(response) {
		// 响应makeCall状态，如果为200， 可以进行隐藏呼叫loading页面，执行start方法通知组件内部进行一系列操作
		// 比如连接socket，开启内部room事件向外发送
		const { code, message } = response;
		if (code === 200) {
			// 隐藏loading
			this.setData({
				meetingLoading: false
			});
			// 通知内部事件开始做入会准备，连接ws，启动roomEvent
			this.xylinkRoom.start();
		} else {
			xylink.showToast(message);
		}
	},

	onSwitchPosition() {
		const position = this.xylinkRoom.switchCamera();

		this.setData({
			devicePosition: position
		});
	},

	onChangeMuted() {
		this.setData({
			muted: !this.data.muted
		});
	},

	onSwitchCamera() {
		this.setData({
			camera: !this.data.camera
		});
	},

	onStopMeeting() {
		wx.navigateBack({
			delta: 1
		});
	},

	onRoomEvent(ms) {
		const { type, detail, message } = ms.detail;

		switch (type) {
			case 'callStatus':
				if (detail === 'connected') {
					// 入会成功
				}

				if (detail === 'disconnected') {
					this.disConnectMeeting(message);
				}

				break;
			case 'roomExit':
				console.log('demo get room exit message: ', message);

				break;
			case 'roomChange':
				console.log('demo get live-pusher status change message: ', detail);
				break;
			case 'onHold':
				console.log('demo get onHold mesage: ', detail);
				this.setData({
					onHold: detail
				});

				break;
			case 'roster':
				// 如果是custom模式，需要自行处理roster list数据，此数据是参会者list数据
				// 重要：
				// roster item包含参会者状态，基本信息，语音激励状态，分享content状态
				console.log('demo get roster message: ', detail);

				if (this.data.template.layout !== 'custom') {
					return;
				}

				// 处理custom模式自定义布局
				const newDetails = [];
				// 获取roster数据
				const roster = detail.rosterV;
				// 获取第一个roster中的callNumber数据，用来判断是否只有自己
				const fristCallNumber = roster[0] ? roster[0].callNumber : 0;
				// 是否只有自己（roster可能会存在自己的数据）
				const isMyself = (roster.length === 1 && fristCallNumber === this.callNumber) || roster.length === 0;

				// 会中只有自己
				if (isMyself) {
					// 如果是自己，并且会中只有自己，则将自己满屏展示
					// 更新template数据
					this.setData({
						template: {
							layout: 'custom',
							detail: [
								{
									position: [ 10, 0, 90, 100 ],
									callNumber: this.callNumber,
									name: this.pageParams.name || '',
									quality: 'normal',
									isContent: false
								}
							]
						}
					});
				} else {
					// 入会存在其他人
					const len = roster.length - 1;
					const selfDetailObj = {
						position: positionMap[len].self,
						callNumber: this.callNumber,
						name: this.pageParams.name,
						quality: 'normal',
						isContent: false
					};

					roster.forEach((item, index) => {
						newDetails.push({
							position: positionMap[len].other[index].position,
							callNumber: item.callNumber,
							name: item.displayName || '',
							// 如果roster item中的isContent为true，代表是Content内容，需要将质量设置为hd（720p）分辨率
							quality: item.isContent ? 'hd' : 'normal',
							isContent: item.isContent
						});
					});

					// 将自己的画面放到左边第一个位置，并置于detail的首位，方便查找数据和匹配模版数据
					newDetails.unshift(selfDetailObj);

					// 更新template数据
					this.setData({
						template: Object.assign({}, this.data.template, {
							detail: newDetails
						})
					});
				}

				break;
			case 'event':
				// 内部每一项layout的点击事件
				// 如果存在roster item数据，则通过：message.target.item获取到当前点击的屏幕所对应的roster数据
				console.log('detail: ', message.target);

				break;
			default: {
				console.log('demo get other message: ', ms.detail);
			}
		}
	},

	// 接收到disconnect消息，挂断会议
	disConnectMeeting(Obj) {
		let detail = FailEnumMap[Obj.detail];
		detail = detail ? detail : STR_CALL_FAIL_UNKNOW_REASON;

		wx.showToast({
			title: '12312',
			icon: 'none',
			duration: 3000,
			mask: true,
			success() {
				setTimeout(() => {
					wx.navigateBack({
						delta: 1
					});
				}, 3000);
			}
		});
	},

	jump() {
		wx.navigateTo({
			url: `/pages/test/index`
		});
	}
});
