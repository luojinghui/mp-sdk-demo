//index.js
//获取应用实例
import xylink from 'xylink-sdk/common/room.js';

Page({
	data: {},
	onLoad(option) {
		// 默认sdk是线上环境，可不用设置sdk环境域名。
		// xylink.setDomain('wss://prdtxlive.xylink.com','https://prdtxlive.xylink.com');
		xylink.login('4390bf17d41242b9ab2e3966a5b8bc7a', this.onCallbackGetNumber);
	},
	onCallbackGetNumber() {
		console.log('request lll');
	},
	// 会议页面准备阶段的生命周期函数
	onReady() {
		xylink.login('4390bf17d41242b9ab2e3966a5b8bc7a', this.onCallbackGetNumber);
	}
});
