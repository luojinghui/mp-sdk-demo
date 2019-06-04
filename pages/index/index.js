//index.js
//获取应用实例
import xylink from 'xylink-sdk/common/room.js';

const app = getApp()

Page({
  data: {
    meeting: {
      number: "",
      password: "",
      name: ""
    }    
  },
  onLoad() {
    // 默认sdk是线上环境，可不用设置sdk环境域名。
    // xylink.setDomain('wss://prdtxlive.xylink.com','https://prdtxlive.xylink.com');
  },
  // 执行初始化登录
  onLogin() {
    // 重要提示
    // 重要提示
    // 重要提示
    // params {string} token
    // cb {function} login回调函数
    // 此处第三方开发者需要自行与服务器交互，获取token，然后填写到login的第一个参数里面执行初始化登录
    // 可以将获取到的callNumber作为登录标示记录到本地，后续入会可不用再次执行xylink.login操作
    // 具体参见接口文档： https://opensdk.xylink.com/xylink/mp-sdk/wikis/server_api
    // 重要提示
    // 重要提示
    // 重要提示
    xylink.login("", this.onCallbackGetNumber);
  },
  // 执行初始化登录回调函数
  onCallbackGetNumber(res) {
    // 状态是200时，初始化登录成功
    console.log("cb login: ", res);
    if (res.code === 200) {
      const cn = res.data.callNumber;

      // 存入本地storage里面，作为登录标示。后续入会可不需再次登录，直接入会即可。
      wx.setStorageSync("callNumber", cn);
      this.callNumber = cn;

      wx.showToast({
        title: "初始化登录成功",
        icon: "success",
        duration: 2000,
        mask: true
      });
    } else {
      wx.showToast({
        title: "登录失败，请稍后重试",
        icon: "none",
        duration: 2000,
        mask: true
      });
    }
  },

  // 监听输入
  bindFromInput: function (e) {
    const type = e.target.id;
    const value = e.detail.value;

    this.setData({
      meeting: {
        ...this.data.meeting,
        [type]: value
      }
    });
  },

  // 加入会议
  onJoinMeeting: function () {
    // 没有callNumber，则需要进行login操作
    const callNumber = wx.getStorageSync("callNumber");

    // 如果本地没有callNumber字段，则认为没有登录操作。需要提示进行初始化登录
    if (!callNumber) {
      wx.showToast({
        title: "请先执行初始化登录",
        icon: "none",
        duration: 2000,
        mask: true
      });

      return;
    }

    const { name, password, number } = this.data.meeting;

    if (!number) {
      wx.showToast({
        title: "会议号不能为空", //提示的内容,
        icon: "none", //图标,
        duration: 2000, //延迟时间,
        mask: true //显示透明蒙层，防止触摸穿透
      });
      return;
    }

    // 跳到会议页面，开始进行入会
    wx.navigateTo({
      url: `/pages/meeting/index?name=${name}&password=${password}&number=${number}`
    });
  },  
})
