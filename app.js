//app.js
App({
  globalData: {
    userInfo: null,
    screenWidth: 375,
    screenHeight: 667,
    pixelRatio: 2,
    // 游戏配置
    gameConfig: {
      // 已经修复的分辨率适配配置
      useFixedLayout: false, // 使用固定布局
      useResponsiveLayout: true, // 使用响应式布局
      autoScale: true, // 自动缩放
      minWidth: 320,
      maxWidth: 414,
      // 游戏速度配置
      gameSpeed: {
        level1: 1000, // 等级1速度（毫秒）
        level2: 800,  // 等级2速度
        level3: 600,  // 等级3速度
        level4: 400,  // 等级4速度
        level5: 300   // 等级5速度
      },
      // 分数配置
      scoreConfig: {
        line1: 100,  // 消1行分数
        line2: 300,  // 消2行分数
        line3: 600,  // 消3行分数
        line4: 1000  // 消4行分数（Tetris）
      }
    }
  },
  onLaunch: function() {
    // 生命周期回调，监听小程序初始化
    console.log('小程序初始化');
    
    // 获取系统信息
    const systemInfo = wx.getSystemInfoSync();
    this.globalData.screenWidth = systemInfo.windowWidth;
    this.globalData.screenHeight = systemInfo.windowHeight;
    this.globalData.pixelRatio = systemInfo.pixelRatio;
    
    console.log('屏幕尺寸:', this.globalData.screenWidth, 'x', this.globalData.screenHeight);
    console.log('像素比例:', this.globalData.pixelRatio);
    
    // 根据屏幕宽度调整游戏配置
    this.adjustGameConfigByScreen();
  },
  
  // 根据屏幕宽度调整游戏配置
  adjustGameConfigByScreen: function() {
    const screenWidth = this.globalData.screenWidth;
    
    // 针对不同宽度的屏幕做特殊处理
    if (screenWidth <= 320) {
      // 小屏幕设备
      console.log('使用小屏幕配置');
    } else if (screenWidth >= 414) {
      // 大屏幕设备
      console.log('使用大屏幕配置');
    } else {
      // 标准屏幕设备
      console.log('使用标准屏幕配置');
    }
  },
  
  onShow: function() {
    // 生命周期回调，监听小程序启动或切前台
    console.log('小程序显示');
  },
  
  onHide: function() {
    // 生命周期回调，监听小程序切后台
    console.log('小程序隐藏');
  },
  
  onError: function(error) {
    // 错误监听回调
    console.error('小程序错误:', error);
  }
});