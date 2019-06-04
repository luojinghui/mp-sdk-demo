# 小鱼易连-小程序SDK Demo演示

### 文档
在这里查阅sdk文档：[文档](https://opensdk.xylink.com/xylink/mp-sdk/wikis/home)

### 准备工作
1. 获取token，参见[文档](https://opensdk.xylink.com/xylink/mp-sdk/wikis/server_api)
2. 将获取到的token在`/pages/index/index.js`中进行配置。
3. 因为运行小程序，需要小程序所对应的appid进行一定的配置，具体的配置参考下面的连接：[运行环境配置](https://opensdk.xylink.com/xylink/mp-sdk/wikis/mp_api#%E4%BD%BF%E7%94%A8%E9%99%90%E5%88%B6)

### 运行
1. 通过git clone此项目或者下载zip包到本地';
2. `yarn`或者`npm install`;
3. 用微信开发者工具打开此项目，并配置appid;
3. 在工具中配置使用npm模块,执行：工具->构建npm;
4. 执行编译并预览;
5. 初始进到页面，需要配置好token，点击初始化登录操作;
6. 填写会议号并进行入会;

### Note
1. 使用Node >= 8.10版本;
2. 使用yarn安装依赖;
3. 微信开发者工具不支持推拉流，请使用真机调试音视频;
4. 此Demo使用于auto入会模式，如需要使用custom自定义模式，需要自定义配置。