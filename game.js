// 全局变量
global = {
  ctx: null, // Canvas上下文
  screenWidth: 0, // 屏幕宽度
  screenHeight: 0, // 屏幕高度
  gridSize: 0, // 网格大小
  gameAreaWidth: 0, // 游戏区域宽度
  gameAreaHeight: 0, // 游戏区域高度
  gameAreaX: 0, // 游戏区域X坐标
  gameAreaY: 0, // 游戏区域Y坐标
  gameStarted: false, // 游戏是否开始
  score: 0, // 分数
  level: 1, // 等级
  lines: 0, // 消除的行数
  speed: 1000, // 下落速度（毫秒）
  timer: null, // 定时器
  map: [], // 游戏地图
  currentTetromino: null, // 当前方块
  nextTetromino: null, // 下一个方块
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
  ],
  // 按键状态
  keys: {
    left: false,
    right: false,
    down: false,
    rotate: false
  },
  // 触摸状态
  touch: {
    startX: 0,
    startY: 0,
    endX: 0,
    endY: 0,
    moved: false
  }
};

// 初始化游戏
function initGame() {
  const query = wx.createSelectorQuery();
  query.select('#gameCanvas')
    .fields({
      node: true,
      size: true
    })
    .exec((res) => {
      const canvas = res[0].node;
      const ctx = canvas.getContext('2d');
      
      // 获取屏幕尺寸
      const systemInfo = wx.getSystemInfoSync();
      global.screenWidth = systemInfo.windowWidth;
      global.screenHeight = systemInfo.windowHeight;
      
      // 设置Canvas尺寸，根据屏幕宽度计算合适的尺寸
      // 修复分辨率适配问题
      const dpr = wx.getSystemInfoSync().pixelRatio;
      canvas.width = global.screenWidth * dpr;
      canvas.height = global.screenHeight * dpr;
      ctx.scale(dpr, dpr);
      
      global.ctx = ctx;
      
      // 计算游戏区域尺寸，确保在不同屏幕上适配良好
      calculateGameAreaSize();
      
      // 初始化游戏地图
      initMap();
      
      // 生成第一个方块
      generateNewTetromino();
      
      // 生成下一个方块
      generateNextTetromino();
      
      // 开始游戏循环
      gameLoop();
      
      // 绑定触摸事件
      bindTouchEvents(canvas);
    });
}

// 计算游戏区域尺寸
function calculateGameAreaSize() {
  // 基于屏幕宽度计算网格大小，确保游戏区域能在屏幕上完整显示
  // 修复分辨率适配问题，使其在不同宽度的设备上都能正常显示
  const maxGridSize = Math.floor(global.screenWidth * 0.22); // 确保游戏区域不会太宽
  const minGridSize = 20; // 最小网格大小
  
  // 根据屏幕宽度动态调整网格大小
  global.gridSize = Math.min(maxGridSize, Math.max(minGridSize, Math.floor(global.screenWidth / 15)));
  
  // 游戏区域尺寸（10列，20行）
  global.gameAreaWidth = global.gridSize * 10;
  global.gameAreaHeight = global.gridSize * 20;
  
  // 游戏区域位置（居中显示）
  global.gameAreaX = (global.screenWidth - global.gameAreaWidth) / 2;
  // 游戏区域Y坐标，为分数和下一个方块预留空间
  global.gameAreaY = 100;
}

// 初始化游戏地图
function initMap() {
  global.map = [];
  for (let y = 0; y < 20; y++) {
    global.map[y] = [];
    for (let x = 0; x < 10; x++) {
      global.map[y][x] = 0;
    }
  }
}

// 生成新方块
function generateNewTetromino() {
  if (global.nextTetromino) {
    // 使用预先生成的下一个方块
    global.currentTetromino = {
      shape: global.nextTetromino.shape,
      color: global.nextTetromino.color,
      x: 3, // 初始X位置（居中）
      y: 0, // 初始Y位置（顶部）
      rotation: 0 // 初始旋转状态
    };
    // 生成新的下一个方块
    generateNextTetromino();
  } else {
    // 随机生成一个新方块
    const randomIndex = Math.floor(Math.random() * 7);
    global.currentTetromino = {
      shape: global.tetrominoes[randomIndex],
      color: global.colors[randomIndex],
      x: 3, // 初始X位置（居中）
      y: 0, // 初始Y位置（顶部）
      rotation: 0 // 初始旋转状态
    };
  }
  
  // 检查游戏是否结束（新方块无法放入）
  if (checkCollision(global.currentTetromino, 0, 0)) {
    gameOver();
  }
}

// 生成下一个方块
function generateNextTetromino() {
  const randomIndex = Math.floor(Math.random() * 7);
  global.nextTetromino = {
    shape: global.tetrominoes[randomIndex],
    color: global.colors[randomIndex]
  };
}

// 旋转方块
function rotateTetromino() {
  if (!global.currentTetromino) return;
  
  const tetromino = global.currentTetromino;
  const newShape = [];
  const size = tetromino.shape.length;
  
  // 初始化新形状
  for (let i = 0; i < size; i++) {
    newShape[i] = [];
    for (let j = 0; j < size; j++) {
      newShape[i][j] = tetromino.shape[size - j - 1][i];
    }
  }
  
  // 保存当前形状用于回退
  const oldShape = tetromino.shape;
  tetromino.shape = newShape;
  tetromino.rotation = (tetromino.rotation + 1) % 4;
  
  // 检查旋转后是否碰撞
  if (checkCollision(tetromino, 0, 0)) {
    // 如果碰撞，尝试调整位置
    if (!checkCollision(tetromino, -1, 0) && tetromino.x > 0) {
      tetromino.x--;
    } else if (!checkCollision(tetromino, 1, 0) && tetromino.x + size < 10) {
      tetromino.x++;
    } else if (!checkCollision(tetromino, 0, -1)) {
      tetromino.y--;
    } else {
      // 如果无法调整，回退旋转
      tetromino.shape = oldShape;
      tetromino.rotation = (tetromino.rotation - 1 + 4) % 4;
    }
  }
}

// 移动方块
function moveTetromino(dx, dy) {
  if (!global.currentTetromino) return;
  
  // 检查移动后是否碰撞
  if (!checkCollision(global.currentTetromino, dx, dy)) {
    global.currentTetromino.x += dx;
    global.currentTetromino.y += dy;
    return true;
  }
  
  return false;
}

// 检查碰撞
function checkCollision(tetromino, dx, dy) {
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
          (mapY >= 0 && global.map[mapY][mapX]) // 与已有方块碰撞
        ) {
          return true;
        }
      }
    }
  }
  
  return false;
}

// 将当前方块固定到地图上
function fixTetromino() {
  const shape = global.currentTetromino.shape;
  const x = global.currentTetromino.x;
  const y = global.currentTetromino.y;
  
  for (let i = 0; i < shape.length; i++) {
    for (let j = 0; j < shape[i].length; j++) {
      if (shape[i][j]) {
        const mapY = y + i;
        const mapX = x + j;
        
        if (mapY >= 0) {
          global.map[mapY][mapX] = global.currentTetromino.color;
        }
      }
    }
  }
  
  // 检查是否有完整的行可以消除
  checkLines();
  
  // 生成新方块
  generateNewTetromino();
}

// 检查并消除完整的行
function checkLines() {
  let linesCleared = 0;
  
  for (let y = 19; y >= 0; y--) {
    let isFull = true;
    
    for (let x = 0; x < 10; x++) {
      if (!global.map[y][x]) {
        isFull = false;
        break;
      }
    }
    
    if (isFull) {
      // 消除当前行
      global.map.splice(y, 1);
      // 在顶部添加一个空行
      global.map.unshift(new Array(10).fill(0));
      // 因为删除了一行，所以y需要加1以检查下一行
      y++;
      // 增加消除的行数
      linesCleared++;
      // 增加总消除行数
      global.lines++;
    }
  }
  
  // 根据消除的行数增加分数
  switch (linesCleared) {
    case 1:
      global.score += 100;
      break;
    case 2:
      global.score += 300;
      break;
    case 3:
      global.score += 600;
      break;
    case 4:
      global.score += 1000;
      break;
  }
  
  // 根据消除的总行数调整等级和速度
  updateLevel();
}

// 更新等级和速度
function updateLevel() {
  const newLevel = Math.floor(global.lines / 10) + 1;
  
  if (newLevel > global.level) {
    global.level = newLevel;
    // 根据等级调整速度，等级越高速度越快
    global.speed = Math.max(200, 1000 - (global.level - 1) * 100);
    
    // 清除旧的定时器，设置新的定时器
    if (global.timer) {
      clearInterval(global.timer);
      global.timer = setInterval(gameLoop, global.speed);
    }
  }
}

// 游戏主循环
function gameLoop() {
  if (!global.gameStarted) {
    drawStartScreen();
    return;
  }
  
  // 尝试向下移动方块
  if (!moveTetromino(0, 1)) {
    // 如果不能向下移动，固定方块
    fixTetromino();
  }
  
  // 绘制游戏画面
  drawGameScreen();
}

// 开始游戏
function startGame() {
  if (global.gameStarted) return;
  
  global.gameStarted = true;
  global.score = 0;
  global.level = 1;
  global.lines = 0;
  global.speed = 1000;
  
  // 初始化游戏地图
  initMap();
  
  // 生成新方块
  generateNewTetromino();
  generateNextTetromino();
  
  // 开始游戏循环定时器
  global.timer = setInterval(gameLoop, global.speed);
  
  // 立即绘制一帧
  drawGameScreen();
}

// 暂停游戏
function pauseGame() {
  if (!global.gameStarted) return;
  
  global.gameStarted = false;
  
  // 清除定时器
  if (global.timer) {
    clearInterval(global.timer);
    global.timer = null;
  }
  
  // 绘制暂停画面
  drawPauseScreen();
}

// 游戏结束
function gameOver() {
  global.gameStarted = false;
  
  // 清除定时器
  if (global.timer) {
    clearInterval(global.timer);
    global.timer = null;
  }
  
  // 绘制游戏结束画面
  drawGameOverScreen();
}

// 绘制开始画面
function drawStartScreen() {
  const ctx = global.ctx;
  
  // 清空画布
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, global.screenWidth, global.screenHeight);
  
  // 绘制标题
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 40px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('俄罗斯方块', global.screenWidth / 2, global.screenHeight / 2 - 50);
  
  // 绘制开始按钮提示
  ctx.font = '24px Arial';
  ctx.fillText('点击屏幕开始游戏', global.screenWidth / 2, global.screenHeight / 2 + 50);
}

// 绘制暂停画面
function drawPauseScreen() {
  const ctx = global.ctx;
  
  // 先绘制游戏画面
  drawGameScreen();
  
  // 绘制半透明遮罩
  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
  ctx.fillRect(0, 0, global.screenWidth, global.screenHeight);
  
  // 绘制暂停文字
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 40px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('游戏暂停', global.screenWidth / 2, global.screenHeight / 2);
  
  // 绘制继续提示
  ctx.font = '24px Arial';
  ctx.fillText('点击屏幕继续', global.screenWidth / 2, global.screenHeight / 2 + 50);
}

// 绘制游戏结束画面
function drawGameOverScreen() {
  const ctx = global.ctx;
  
  // 先绘制游戏画面
  drawGameScreen();
  
  // 绘制半透明遮罩
  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
  ctx.fillRect(0, 0, global.screenWidth, global.screenHeight);
  
  // 绘制游戏结束文字
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 40px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('游戏结束', global.screenWidth / 2, global.screenHeight / 2 - 50);
  
  // 绘制最终分数
  ctx.font = '24px Arial';
  ctx.fillText('最终分数: ' + global.score, global.screenWidth / 2, global.screenHeight / 2);
  
  // 绘制重新开始提示
  ctx.fillText('点击屏幕重新开始', global.screenWidth / 2, global.screenHeight / 2 + 50);
}

// 绘制游戏画面
function drawGameScreen() {
  const ctx = global.ctx;
  
  // 清空画布
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, global.screenWidth, global.screenHeight);
  
  // 绘制游戏区域边框
  ctx.strokeStyle = '#555555';
  ctx.lineWidth = 2;
  ctx.strokeRect(
    global.gameAreaX - 2,
    global.gameAreaY - 2,
    global.gameAreaWidth + 4,
    global.gameAreaHeight + 4
  );
  
  // 绘制游戏网格
  drawGrid();
  
  // 绘制已固定的方块
  drawMap();
  
  // 绘制当前方块
  if (global.currentTetromino) {
    drawTetromino(global.currentTetromino);
  }
  
  // 绘制下一个方块预览
  if (global.nextTetromino) {
    drawNextTetromino();
  }
  
  // 绘制分数和等级
  drawScoreAndLevel();
}

// 绘制游戏网格
function drawGrid() {
  const ctx = global.ctx;
  ctx.strokeStyle = '#333333';
  ctx.lineWidth = 0.5;
  
  // 绘制垂直线
  for (let x = 0; x <= 10; x++) {
    ctx.beginPath();
    ctx.moveTo(
      global.gameAreaX + x * global.gridSize,
      global.gameAreaY
    );
    ctx.lineTo(
      global.gameAreaX + x * global.gridSize,
      global.gameAreaY + global.gameAreaHeight
    );
    ctx.stroke();
  }
  
  // 绘制水平线
  for (let y = 0; y <= 20; y++) {
    ctx.beginPath();
    ctx.moveTo(
      global.gameAreaX,
      global.gameAreaY + y * global.gridSize
    );
    ctx.lineTo(
      global.gameAreaX + global.gameAreaWidth,
      global.gameAreaY + y * global.gridSize
    );
    ctx.stroke();
  }
}

// 绘制已固定的方块
function drawMap() {
  const ctx = global.ctx;
  
  for (let y = 0; y < 20; y++) {
    for (let x = 0; x < 10; x++) {
      if (global.map[y][x]) {
        drawBlock(
          x, 
          y, 
          global.map[y][x]
        );
      }
    }
  }
}

// 绘制当前方块
function drawTetromino(tetromino) {
  const shape = tetromino.shape;
  const x = tetromino.x;
  const y = tetromino.y;
  
  for (let i = 0; i < shape.length; i++) {
    for (let j = 0; j < shape[i].length; j++) {
      if (shape[i][j]) {
        drawBlock(x + j, y + i, tetromino.color);
      }
    }
  }
}

// 绘制下一个方块预览
function drawNextTetromino() {
  const ctx = global.ctx;
  const shape = global.nextTetromino.shape;
  
  // 计算预览区域位置
  const previewX = global.gameAreaX + global.gameAreaWidth + 20;
  const previewY = global.gameAreaY + 50;
  
  // 绘制标题
  ctx.fillStyle = '#ffffff';
  ctx.font = '16px Arial';
  ctx.textAlign = 'left';
  ctx.fillText('下一个:', previewX, previewY - 20);
  
  // 绘制预览方块
  const previewGridSize = global.gridSize * 0.7; // 预览方块大小为游戏方块的70%
  const offsetX = previewX + (previewGridSize * 4 - shape.length * previewGridSize) / 2;
  const offsetY = previewY;
  
  ctx.strokeStyle = '#555555';
  ctx.lineWidth = 1;
  ctx.strokeRect(
    previewX - 5,
    previewY - 5,
    previewGridSize * 4 + 10,
    previewGridSize * 4 + 10
  );
  
  for (let i = 0; i < shape.length; i++) {
    for (let j = 0; j < shape[i].length; j++) {
      if (shape[i][j]) {
        ctx.fillStyle = global.nextTetromino.color;
        ctx.fillRect(
          offsetX + j * previewGridSize,
          offsetY + i * previewGridSize,
          previewGridSize - 1,
          previewGridSize - 1
        );
        
        // 绘制方块边框
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 0.5;
        ctx.strokeRect(
          offsetX + j * previewGridSize,
          offsetY + i * previewGridSize,
          previewGridSize - 1,
          previewGridSize - 1
        );
      }
    }
  }
}

// 绘制分数和等级
function drawScoreAndLevel() {
  const ctx = global.ctx;
  
  // 绘制分数
  ctx.fillStyle = '#ffffff';
  ctx.font = '20px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('分数: ' + global.score, global.screenWidth / 2, 50);
  
  // 绘制等级
  ctx.font = '16px Arial';
  ctx.fillText('等级: ' + global.level, global.screenWidth / 2, 80);
  
  // 绘制消除的行数
  ctx.fillText('行数: ' + global.lines, global.screenWidth / 2, 110);
}

// 绘制单个方块
function drawBlock(x, y, color) {
  const ctx = global.ctx;
  
  // 计算方块的实际位置
  const blockX = global.gameAreaX + x * global.gridSize;
  const blockY = global.gameAreaY + y * global.gridSize;
  
  // 绘制方块
  ctx.fillStyle = color;
  ctx.fillRect(
    blockX + 1,
    blockY + 1,
    global.gridSize - 2,
    global.gridSize - 2
  );
  
  // 绘制方块边框
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 0.5;
  ctx.strokeRect(
    blockX + 1,
    blockY + 1,
    global.gridSize - 2,
    global.gridSize - 2
  );
}

// 绑定触摸事件
function bindTouchEvents(canvas) {
  // 触摸开始
  canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    global.touch.startX = touch.clientX;
    global.touch.startY = touch.clientY;
    global.touch.moved = false;
  });
  
  // 触摸移动
  canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    const dx = touch.clientX - global.touch.startX;
    const dy = touch.clientY - global.touch.startY;
    
    // 判断是否有明显移动
    if (Math.abs(dx) > 10 || Math.abs(dy) > 10) {
      global.touch.moved = true;
    }
    
    // 修复触摸移动灵敏度问题
    if (Math.abs(dx) > 15) {
      // 左右移动
      if (dx > 0) {
        moveTetromino(1, 0);
      } else {
        moveTetromino(-1, 0);
      }
      global.touch.startX = touch.clientX;
      drawGameScreen();
    } else if (Math.abs(dy) > 15) {
      // 下移
      if (dy > 0) {
        if (moveTetromino(0, 1)) {
          // 下移一格加分
          global.score += 1;
        }
      }
      global.touch.startY = touch.clientY;
      drawGameScreen();
    }
  });
  
  // 触摸结束
  canvas.addEventListener('touchend', (e) => {
    e.preventDefault();
    const touch = e.changedTouches[0];
    global.touch.endX = touch.clientX;
    global.touch.endY = touch.clientY;
    
    // 如果没有明显移动，视为点击
    if (!global.touch.moved) {
      if (global.gameStarted) {
        // 游戏中点击旋转方块
        rotateTetromino();
        drawGameScreen();
      } else {
        // 非游戏中点击开始游戏
        startGame();
      }
    }
  });
}

// 导出游戏初始化函数，供小程序页面调用
export default {
  initGame
};