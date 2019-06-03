/**
 * Meeting page demo
 * @authors Luo-jinghui (luojinghui424@gmail.com)
 * @date  2019-06-01 23:04:27
 */

import xylink from 'xylink-sdk/common/room.js';
import { FailEnumMap, STR_CALL_FAIL_UNKNOW_REASON } from "./enum.js";

const defaultAvatar = "https://devcdn.xylink.com/miniProgram/photo_default.png";

Page({
  data: {
    muted: false,
    devicePosition: "front",
    meetingLoading: true,
    camera: true,
    onHold: false, // 是否通话等待
    avatar: defaultAvatar, // 用户头像
    template: {
      layout: "auto",
      mode: "4-1",
      detail: []
    }
  },

  onLoad(option) {
    this.pageParams = option;
  },

  // 会议页面准备阶段的生命周期函数
  onReady() {
    const { number, password, name } = this.pageParams;
    // 缓存sdk <xylink-sdk/>组件节点context，为后续调用组件内部方法用
    this.xylinkRoom = this.selectComponent("#xylink");
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
      case "callStatus":
        if (detail === "connected") {
          // 入会成功
        }

        if (detail === "disconnected") {
          this.disConnectMeeting(message);
        }

        break;
      case "roomExit":
        console.log('退出房间: ', message);

        break;
      case "roomChange":
        console.log('live-pusher status change message: ', detail);
        break;
      case "onHold":
        console.log("onHold------", detail);
        this.setData({
          onHold: detail
        });

        break;
      case "roster":
        console.log("roster------", detail);

        break;
      default: {
        console.log("没有匹配到ws消息", ms.detail);
      }
    }
  },

  // 接收到disconnect消息，挂断会议
  disConnectMeeting(Obj) {
    let detail = FailEnumMap[Obj.detail];
    detail = detail ? detail : STR_CALL_FAIL_UNKNOW_REASON;

    wx.showToast({
      title: "12312",
      icon: "none",
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
  }
});
