// pages/index/index.js
const app = getApp();

Page({
  data: {
    // 游戏状态
    gameStarted: false,
    gamePaused: false,
    gameOver: false,
    // 分数信息
    score: 0,
    level: 1,
    lines: 0,
    // 游戏地图（20行10列）
    gameMap: [],
    // 当前方块信息
    currentTetromino: null,
    // 下一个方块预览
    nextTetromino: null,
    // 游戏配置
    gameConfig: {
      // 已修复的分辨率适配配置
      useFixedLayout: false,
      useResponsiveLayout: true,
      autoScale: true,
      // 游戏速度（毫秒）
      speed: 1000,
      // 触摸灵敏度（像素）
      touchSensitivity: 15
    },
    // 屏幕适配信息
    screenInfo: {
      width: 375,
      height: 667,
      gridSize: 30,
      gameAreaWidth: 300,
      gameAreaHeight: 600,
      gameAreaX: 37.5
    },
    // 触摸状态
    touch: {
      startX: 0,
      startY: 0,
      moved: false
    },
    // 方块形状定义
    tetrominoes: [
      // I型
      [[0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0], [0, 0, 0, 0]],
      // J型
      [[1, 0, 0], [1, 1, 1], [0, 0, 0]],
      // L型
      [[0, 0, 1], [1, 1, 1], [0, 0, 0]],
      // O型
      [[1, 1], [1, 1]],
      // S型
      [[0, 1, 1], [1, 1, 0], [0, 0, 0]],
      // T型
      [[0, 1, 0], [1, 1, 1], [0, 0, 0]],
      // Z型
      [[1, 1, 0], [0, 1, 1], [0, 0, 0]]
    ],
    // 方块颜色
    colors: [
      '#00FFFF', // I型 - 青色
      '#0000FF', // J型 - 蓝色
      '#FF7F00', // L型 - 橙色
      '#FFFF00', // O型 - 黄色
      '#00FF00', // S型 - 绿色
      '#800080', // T型 - 紫色
      '#FF0000'  // Z型 - 红色
    ]
  },

  onLoad: function() {
    console.log('页面加载');
    
    // 获取系统信息，用于适配不同屏幕
    const systemInfo = wx.getSystemInfoSync();
    this.setData({
      'screenInfo.width': systemInfo.windowWidth,
      'screenInfo.height': systemInfo.windowHeight
    });
    
    // 根据屏幕尺寸调整游戏配置
    this.adjustGameConfigByScreen();
    
    // 初始化游戏地图
    this.initGameMap();
    
    // 生成第一个方块
    this.generateNewTetromino();
    
    // 生成下一个方块预览
    this.generateNextTetromino();
    
    console.log('游戏初始化完成，屏幕尺寸:', this.data.screenInfo.width, 'x', this.data.screenInfo.height);
  },

  onShow: function() {
    console.log('页面显示');
  },

  onReady: function() {
    console.log('页面初次渲染完成');
  },

  // 根据屏幕尺寸调整游戏配置
  adjustGameConfigByScreen: function() {
    const screenWidth = this.data.screenInfo.width;
    
    // 计算合适的网格大小，确保游戏区域能在屏幕上完整显示
    // 修复分辨率适配问题，使其在不同宽度的设备上都能正常显示
    const maxGridSize = Math.floor(screenWidth * 0.22); // 确保游戏区域不会太宽
    const minGridSize = 20; // 最小网格大小
    
    // 根据屏幕宽度动态调整网格大小
    const gridSize = Math.min(maxGridSize, Math.max(minGridSize, Math.floor(screenWidth / 15)));
    
    // 游戏区域尺寸（10列，20行）
    const gameAreaWidth = gridSize * 10;
    const gameAreaHeight = gridSize * 20;
    
    // 游戏区域位置（居中显示）
    const gameAreaX = (screenWidth - gameAreaWidth) / 2;
    
    this.setData({
      'screenInfo.gridSize': gridSize,
      'screenInfo.gameAreaWidth': gameAreaWidth,
      'screenInfo.gameAreaHeight': gameAreaHeight,
      'screenInfo.gameAreaX': gameAreaX
    });
    
    console.log('游戏配置调整完成，网格大小:', gridSize, '游戏区域尺寸:', gameAreaWidth, 'x', gameAreaHeight);
  },

  // 初始化游戏地图
  initGameMap: function() {
    const gameMap = [];
    for (let y = 0; y < 20; y++) {
      gameMap[y] = [];
      for (let x = 0; x < 10; x++) {
        gameMap[y][x] = 0;
      }
    }
    
    this.setData({
      gameMap: gameMap
    });
  },

  // 生成新方块
  generateNewTetromino: function() {
    let currentTetromino;
    
    if (this.data.nextTetromino) {
      // 使用预先生成的下一个方块
      currentTetromino = {
        shape: this.data.nextTetromino.shape,
        color: this.data.nextTetromino.color,
        x: 3, // 初始X位置（居中）
        y: 0, // 初始Y位置（顶部）
        rotation: 0 // 初始旋转状态
      };
      // 生成新的下一个方块
      this.generateNextTetromino();
    } else {
      // 随机生成一个新方块
      const randomIndex = Math.floor(Math.random() * 7);
      currentTetromino = {
        shape: this.data.tetrominoes[randomIndex],
        color: this.data.colors[randomIndex],
        x: 3, // 初始X位置（居中）
        y: 0, // 初始Y位置（顶部）
        rotation: 0 // 初始旋转状态
      };
    }
    
    this.setData({
      currentTetromino: currentTetromino
    });
    
    // 检查游戏是否结束（新方块无法放入）
    if (this.checkCollision(currentTetromino, 0, 0)) {
      this.gameOver();
    }
  },

  // 生成下一个方块预览
  generateNextTetromino: function() {
    const randomIndex = Math.floor(Math.random() * 7);
    const nextTetromino = {
      shape: this.data.tetrominoes[randomIndex],
      color: this.data.colors[randomIndex]
    };
    
    this.setData({
      nextTetromino: nextTetromino
    });
  },

  // 开始游戏
  startGame: function() {
    if (this.data.gameStarted) return;
    
    console.log('开始游戏');
    
    // 重置游戏状态
    this.initGameMap();
    
    this.setData({
      gameStarted: true,
      gamePaused: false,
      gameOver: false,
      score: 0,
      level: 1,
      lines: 0
    });
    
    // 生成新方块
    this.generateNewTetromino();
    this.generateNextTetromino();
    
    // 开始游戏循环
    this.startGameLoop();
  },

  // 暂停/继续游戏
  pauseGame: function() {
    if (!this.data.gameStarted || this.data.gameOver) return;
    
    if (this.data.gamePaused) {
      // 继续游戏
      console.log('继续游戏');
      this.setData({
        gamePaused: false
      });
      this.startGameLoop();
    } else {
      // 暂停游戏
      console.log('暂停游戏');
      this.setData({
        gamePaused: true
      });
      this.stopGameLoop();
    }
  },

  // 游戏结束
  gameOver: function() {
    console.log('游戏结束');
    
    this.setData({
      gameOver: true,
      gameStarted: false
    });
    
    this.stopGameLoop();
  },

  // 重新开始游戏
  restartGame: function() {
    console.log('重新开始游戏');
    this.startGame();
  },

  // 开始游戏循环
  startGameLoop: function() {
    const speed = this.calculateGameSpeed();
    
    if (this.gameLoopTimer) {
      clearInterval(this.gameLoopTimer);
    }
    
    this.gameLoopTimer = setInterval(() => {
      this.gameLoop();
    }, speed);
  },

  // 停止游戏循环
  stopGameLoop: function() {
    if (this.gameLoopTimer) {
      clearInterval(this.gameLoopTimer);
      this.gameLoopTimer = null;
    }
  },

  // 计算游戏速度
  calculateGameSpeed: function() {
    // 根据等级调整速度，等级越高速度越快
    return Math.max(200, 1000 - (this.data.level - 1) * 100);
  },

  // 游戏主循环
  gameLoop: function() {
    if (!this.data.gameStarted || this.data.gamePaused || this.data.gameOver) {
      return;
    }
    
    // 尝试向下移动方块
    if (!this.moveTetromino(0, 1)) {
      // 如果不能向下移动，固定方块
      this.fixTetromino();
    }
  },

  // 移动方块
  moveTetromino: function(dx, dy) {
    if (!this.data.currentTetromino) return false;
    
    // 检查移动后是否碰撞
    if (!this.checkCollision(this.data.currentTetromino, dx, dy)) {
      // 更新方块位置
      this.setData({
        'currentTetromino.x': this.data.currentTetromino.x + dx,
        'currentTetromino.y': this.data.currentTetromino.y + dy
      });
      
      // 下移加分
      if (dy > 0) {
        this.updateScore(1);
      }
      
      return true;
    }
    
    return false;
  },

  // 旋转方块
  rotateTetromino: function() {
    if (!this.data.currentTetromino || !this.data.gameStarted || this.data.gamePaused || this.data.gameOver) {
      return;
    }
    
    const tetromino = this.data.currentTetromino;
    const size = tetromino.shape.length;
    
    // 创建旋转后的新形状
    const newShape = [];
    for (let i = 0; i < size; i++) {
      newShape[i] = [];
      for (let j = 0; j < size; j++) {
        newShape[i][j] = tetromino.shape[size - j - 1][i];
      }
    }
    
    // 保存当前形状用于回退
    const oldShape = tetromino.shape;
    const oldRotation = tetromino.rotation;
    
    // 尝试设置新形状
    this.setData({
      'currentTetromino.shape': newShape,
      'currentTetromino.rotation': (tetromino.rotation + 1) % 4
    });
    
    // 检查旋转后是否碰撞
    if (this.checkCollision(this.data.currentTetromino, 0, 0)) {
      // 尝试调整位置
      if (!this.checkCollision(this.data.currentTetromino, -1, 0) && this.data.currentTetromino.x > 0) {
        this.setData({
          'currentTetromino.x': this.data.currentTetromino.x - 1
        });
      } else if (!this.checkCollision(this.data.currentTetromino, 1, 0) && this.data.currentTetromino.x + size < 10) {
        this.setData({
          'currentTetromino.x': this.data.currentTetromino.x + 1
        });
      } else if (!this.checkCollision(this.data.currentTetromino, 0, -1)) {
        this.setData({
          'currentTetromino.y': this.data.currentTetromino.y - 1
        });
      } else {
        // 如果无法调整，回退旋转
        this.setData({
          'currentTetromino.shape': oldShape,
          'currentTetromino.rotation': oldRotation
        });
      }
    }
  },

  // 检查碰撞
  checkCollision: function(tetromino, dx, dy) {
    const shape = tetromino.shape;
    const x = tetromino.x + dx;
    const y = tetromino.y + dy;
    
    for (let i = 0; i < shape.length; i++) {
      for (let j = 0; j < shape[i].length; j++) {
        if (shape[i][j]) {
          const mapX = x + j;
          const mapY = y + i;
          
          // 检查是否超出边界或与已有方块碰撞
          if (
            mapX < 0 || // 左边界
            mapX >= 10 || // 右边界
            mapY >= 20 || // 下边界
            (mapY >= 0 && this.data.gameMap[mapY][mapX]) // 与已有方块碰撞
          ) {
            return true;
          }
        }
      }
    }
    
    return false;
  },

  // 将当前方块固定到地图上
  fixTetromino: function() {
    if (!this.data.currentTetromino) return;
    
    const shape = this.data.currentTetromino.shape;
    const x = this.data.currentTetromino.x;
    const y = this.data.currentTetromino.y;
    const color = this.data.currentTetromino.color;
    
    // 复制游戏地图
    const gameMap = JSON.parse(JSON.stringify(this.data.gameMap));
    
    // 将方块固定到地图上
    for (let i = 0; i < shape.length; i++) {
      for (let j = 0; j < shape[i].length; j++) {
        if (shape[i][j]) {
          const mapY = y + i;
          const mapX = x + j;
          
          if (mapY >= 0) {
            gameMap[mapY][mapX] = color;
          }
        }
      }
    }
    
    // 更新游戏地图
    this.setData({
      gameMap: gameMap
    });
    
    // 检查并消除完整的行
    this.checkLines();
    
    // 生成新方块
    this.generateNewTetromino();
  },

  // 检查并消除完整的行
  checkLines: function() {
    const gameMap = JSON.parse(JSON.stringify(this.data.gameMap));
    let linesCleared = 0;
    
    // 从底部向上检查每一行
    for (let y = 19; y >= 0; y--) {
      let isFull = true;
      
      for (let x = 0; x < 10; x++) {
        if (!gameMap[y][x]) {
          isFull = false;
          break;
        }
      }
      
      if (isFull) {
        // 消除当前行
        gameMap.splice(y, 1);
        // 在顶部添加一个空行
        gameMap.unshift(new Array(10).fill(0));
        // 因为删除了一行，所以y需要加1以检查下一行
        y++;
        // 增加消除的行数
        linesCleared++;
      }
    }
    
    // 更新游戏地图
    this.setData({
      gameMap: gameMap
    });
    
    // 计算新增的总消除行数
    const newLines = this.data.lines + linesCleared;
    
    // 根据消除的行数增加分数
    let scoreToAdd = 0;
    switch (linesCleared) {
      case 1:
        scoreToAdd = 100;
        break;
      case 2:
        scoreToAdd = 300;
        break;
      case 3:
        scoreToAdd = 600;
        break;
      case 4:
        scoreToAdd = 1000;
        break;
    }
    
    // 更新分数和行数
    this.setData({
      lines: newLines,
      score: this.data.score + scoreToAdd
    });
    
    // 根据消除的总行数调整等级
    this.updateLevel(newLines);
  },

  // 更新等级
  updateLevel: function(totalLines) {
    const newLevel = Math.floor(totalLines / 10) + 1;
    
    if (newLevel > this.data.level) {
      this.setData({
        level: newLevel
      });
      
      // 如果游戏正在进行中，更新游戏速度
      if (this.data.gameStarted && !this.data.gamePaused && !this.data.gameOver) {
        this.stopGameLoop();
        this.startGameLoop();
      }
    }
  },

  // 更新分数
  updateScore: function(points) {
    this.setData({
      score: this.data.score + points
    });
  },

  // 触摸开始事件
  onTouchStart: function(e) {
    const touch = e.touches[0];
    this.setData({
      'touch.startX': touch.clientX,
      'touch.startY': touch.clientY,
      'touch.moved': false
    });
  },

  // 触摸移动事件
  onTouchMove: function(e) {
    if (!this.data.gameStarted || this.data.gamePaused || this.data.gameOver) {
      return;
    }
    
    const touch = e.touches[0];
    const startX = this.data.touch.startX;
    const startY = this.data.touch.startY;
    const dx = touch.clientX - startX;
    const dy = touch.clientY - startY;
    
    // 判断是否有明显移动
    if (Math.abs(dx) > this.data.gameConfig.touchSensitivity || 
        Math.abs(dy) > this.data.gameConfig.touchSensitivity) {
      this.setData({
        'touch.moved': true
      });
    }
    
    // 修复触摸移动灵敏度问题
    if (Math.abs(dx) > this.data.gameConfig.touchSensitivity) {
      // 左右移动
      if (dx > 0) {
        this.moveTetromino(1, 0);
      } else {
        this.moveTetromino(-1, 0);
      }
      this.setData({
        'touch.startX': touch.clientX
      });
    } else if (Math.abs(dy) > this.data.gameConfig.touchSensitivity) {
      // 下移
      if (dy > 0) {
        this.moveTetromino(0, 1);
      }
      this.setData({
        'touch.startY': touch.clientY
      });
    }
  },

  // 触摸结束事件
  onTouchEnd: function() {
    // 如果没有明显移动，视为点击
    if (!this.data.touch.moved) {
      if (!this.data.gameStarted || this.data.gameOver) {
        // 非游戏中点击开始游戏
        this.startGame();
      } else if (this.data.gamePaused) {
        // 暂停状态下点击继续游戏
        this.pauseGame();
      } else {
        // 游戏中点击旋转方块
        this.rotateTetromino();
      }
    }
  },

  // 按钮点击事件
  onButtonTap: function(e) {
    const buttonId = e.currentTarget.dataset.id;
    
    switch (buttonId) {
      case 'start':
        this.startGame();
        break;
      case 'pause':
        this.pauseGame();
        break;
      case 'restart':
        this.restartGame();
        break;
      case 'left':
        this.moveTetromino(-1, 0);
        break;
      case 'right':
        this.moveTetromino(1, 0);
        break;
      case 'down':
        this.moveTetromino(0, 1);
        break;
      case 'rotate':
        this.rotateTetromino();
        break;
    }
  },

  onUnload: function() {
    // 页面卸载时清理定时器
    this.stopGameLoop();
  }
});