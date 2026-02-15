# 🎮 植物猎人 - 交互式网页开发 Cursor Prompt

## 项目概述
我需要开发一个基于图片的交互式网页游戏《植物猎人》，这是一个儿童友好型公园的游戏化设计展示。

---

## 📁 项目结构

```
plant-hunter/
├── index.html
├── css/
│   └── style.css
├── js/
│   ├── main.js
│   ├── navigation.js
│   └── audio.js
└── assets/
    ├── images/
    │   ├── 01-cover.png
    │   ├── 02-nav-main.png
    │   ├── 03-background-info.png
    │   ├── 04-map-detail.png
    │   ├── 05-forest-intro.png
    │   ├── 05-forest-detail.png
    │   ├── 06-grass-intro.png
    │   ├── 06-grass-detail.png
    │   ├── 07-water-intro.png
    │   ├── 07-water-detail.png
    │   ├── 08-sand-intro.png
    │   ├── 08-sand-detail.png
    │   └── 09-shop-system.png
    └── audio/
        └── (待添加音频文件)
```

---

## 🎯 核心功能需求

### 1. 页面系统
创建一个单页应用（SPA），使用13张图片作为主要内容页面：

**页面列表及作用：**
- `01-cover.png` - 封面页（游戏入口）
- `02-nav-main.png` - 主导航页（核心枢纽）
- `03-background-info.png` - 背景资料页
- `04-map-detail.png` - 地图详情页
- `05-forest-intro.png` - 森之境介绍
- `05-forest-detail.png` - 森之境详情
- `06-grass-intro.png` - 草之境介绍
- `06-grass-detail.png` - 草之境详情
- `07-water-intro.png` - 水之境介绍
- `07-water-detail.png` - 水之境详情
- `08-sand-intro.png` - 沙之境介绍
- `08-sand-detail.png` - 沙之境详情
- `09-shop-system.png` - 积分商城页

### 2. 导航流程

#### 主流程：
```
01-cover → 02-nav-main （主导航枢纽）
                ↓
        ┌───────┼───────┬───────┐
        ↓       ↓       ↓       ↓
      背景    地图    场景    商城
       03      04    05-08     09
```

#### 详细导航逻辑：

**从主导航（02-nav-main）可以进入：**
1. 背景资料（03-background-info）→ 返回02
2. 游戏地图（04-map-detail）→ 返回02，或点击地图区域跳转到对应场景intro
3. 游戏场景（四大场景）：
   - 森之境：05-forest-intro ↔ 05-forest-detail
   - 草之境：06-grass-intro ↔ 06-grass-detail
   - 水之境：07-water-intro ↔ 07-water-detail
   - 沙之境：08-sand-intro ↔ 08-sand-detail
4. 积分商城（09-shop-system）→ 返回02

**场景页面内部导航：**
- intro页面：可以"查看详情"进入detail页面，或返回主导航
- detail页面：可以返回intro，返回主导航，或进入下一场景
- 场景顺序：森林 → 草原 → 水域 → 沙漠

### 3. 交互热区配置

请在图片上添加可点击的热区（hotspot），具体位置需要根据实际图片调整：

#### 01-cover.png（封面页）
```javascript
{
  startButton: {
    position: "center-bottom", // 估计位置，需要根据实际图片调整
    action: () => navigateTo('02-nav-main'),
    hover: true  // 鼠标悬停效果
  }
}
```

#### 02-nav-main.png（主导航页）
```javascript
{
  buttons: {
    background: {
      position: "top-left",
      action: () => navigateTo('03-background-info')
    },
    map: {
      position: "top-center-left",
      action: () => navigateTo('04-map-detail')
    },
    scenes: {
      position: "top-center-right",
      action: () => showSceneMenu()  // 显示四大场景选择菜单
    },
    shop: {
      position: "top-right",
      action: () => navigateTo('09-shop-system')
    }
  }
}
```

#### 04-map-detail.png（地图详情页）
```javascript
{
  mapAreas: [
    { region: "forest", action: () => navigateTo('05-forest-intro') },
    { region: "grass", action: () => navigateTo('06-grass-intro') },
    { region: "water", action: () => navigateTo('07-water-intro') },
    { region: "sand", action: () => navigateTo('08-sand-intro') }
  ],
  backButton: {
    position: "top-left",
    action: () => navigateTo('02-nav-main')
  }
}
```

#### 场景intro页面（05/06/07/08-intro.png）
```javascript
{
  detailButton: {
    position: "center-right",
    action: () => navigateTo('[current-scene]-detail')
  },
  backButton: {
    position: "top-left",
    action: () => navigateTo('02-nav-main')
  },
  nextButton: {
    position: "bottom-right",
    action: () => navigateToNextScene('intro')
  }
}
```

#### 场景detail页面（05/06/07/08-detail.png）
```javascript
{
  backToIntro: {
    position: "top-left",
    action: () => navigateTo('[current-scene]-intro')
  },
  backToMain: {
    position: "bottom-left",
    action: () => navigateTo('02-nav-main')
  },
  nextScene: {
    position: "bottom-right",
    action: () => navigateToNextScene('intro')
  }
}
```

#### 其他页面（03, 09）
```javascript
{
  backButton: {
    position: "top-left",
    action: () => navigateTo('02-nav-main')
  }
}
```

### 4. UI控制元素

在页面顶部创建一个固定的导航栏：

```html
<div class="nav-bar">
  <button class="btn-back">← 返回</button>
  <button class="btn-home">🏠 主页</button>
  <button class="btn-menu">≡</button>
  <button class="btn-audio">🔊</button>
</div>
```

功能说明：
- **返回按钮**：返回上一页
- **主页按钮**：直接返回02-nav-main
- **菜单按钮**：显示快捷导航菜单（包含四大场景、地图、背景、商城）
- **音频按钮**：切换背景音乐开/关

### 5. 动画效果

#### 页面切换动画：
```javascript
transitions: {
  forward: "slideLeft",      // 向前进入下一页
  backward: "slideRight",    // 返回上一页
  fade: "fadeInOut",        // 淡入淡出（默认）
  zoom: "zoomIn"            // 场景进入时放大
}
```

#### 按钮交互动画：
- 鼠标悬停：轻微放大（scale 1.05）+ 阴影
- 点击：缩小效果（scale 0.95）
- 切换时：0.3秒过渡

### 6. 音频系统（预留接口）

```javascript
audioManager: {
  background: {
    file: 'assets/audio/bg-music.mp3',
    loop: true,
    volume: 0.3
  },
  sceneAmbient: {
    forest: 'assets/audio/forest-ambient.mp3',
    grass: 'assets/audio/grass-ambient.mp3',
    water: 'assets/audio/water-ambient.mp3',
    sand: 'assets/audio/sand-ambient.mp3'
  },
  sfx: {
    click: 'assets/audio/sfx-click.mp3',
    hover: 'assets/audio/sfx-hover.mp3'
  }
}
```

功能：
- 背景音乐循环播放
- 进入不同场景时切换环境音效
- 按钮点击音效
- 音量控制和静音功能

### 7. 响应式设计

```css
/* 桌面端 */
@media (min-width: 1200px) {
  .page-image {
    max-width: 1920px;
    height: auto;
  }
}

/* 平板端 */
@media (max-width: 1199px) and (min-width: 768px) {
  .page-image {
    width: 100%;
    height: auto;
  }
}

/* 移动端 */
@media (max-width: 767px) {
  .page-image {
    width: 100%;
    height: auto;
  }
  .nav-bar {
    font-size: 14px;
  }
  .hotspot {
    min-width: 44px;
    min-height: 44px;  // 适合触摸的最小尺寸
  }
}
```

### 8. 状态管理

需要记录并保存的状态：
```javascript
gameState: {
  currentPage: '01-cover',
  pageHistory: [],              // 页面访问历史
  visitedPages: [],             // 已访问页面列表
  completedScenes: [],          // 已完成场景列表
  audioEnabled: true,
  volume: 0.5,
  lastVisitTime: null
}
```

使用localStorage实现进度保存：
```javascript
// 保存进度
localStorage.setItem('plantHunterState', JSON.stringify(gameState));

// 读取进度
const savedState = JSON.parse(localStorage.getItem('plantHunterState'));
```

---

## 🛠️ 技术要求

### HTML结构：
```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>植物猎人 - The Plant Hunter</title>
    <link rel="stylesheet" href="css/style.css">
</head>
<body>
    <!-- 导航栏 -->
    <nav class="nav-bar"></nav>
    
    <!-- 主内容区 -->
    <main class="page-container">
        <div class="page-content" id="pageContent"></div>
    </main>
    
    <!-- 加载动画 -->
    <div class="loader" id="loader"></div>
    
    <!-- 场景选择菜单 -->
    <div class="scene-menu" id="sceneMenu"></div>
    
    <script src="js/navigation.js"></script>
    <script src="js/audio.js"></script>
    <script src="js/main.js"></script>
</body>
</html>
```

### CSS要求：
- 使用CSS Grid或Flexbox布局
- 添加平滑过渡动画
- 实现响应式设计
- 使用CSS变量管理主题色
- 添加加载状态和骨架屏

### JavaScript要求：
- 使用ES6+语法
- 模块化代码结构
- 实现页面预加载
- 添加错误处理
- 注释清晰

---

## 🎨 设计规范

### 颜色方案：
```css
:root {
  --primary-color: #F5C842;      /* 主题黄色 */
  --secondary-color: #67C23A;    /* 绿色 */
  --background-color: #F5F7FA;   /* 背景色 */
  --text-color: #333333;         /* 文字色 */
  --overlay-bg: rgba(0,0,0,0.7); /* 遮罩背景 */
}
```

### 字体：
```css
font-family: 'Microsoft YaHei', 'PingFang SC', 'Helvetica Neue', sans-serif;
```

### 按钮样式：
```css
.button {
  background: white;
  border: 2px solid var(--primary-color);
  border-radius: 50px;
  padding: 12px 30px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.button:hover {
  background: var(--primary-color);
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(245, 200, 66, 0.3);
}
```

---

## 🔧 关键功能实现示例

### 页面导航函数：
```javascript
function navigateTo(pageId, animation = 'fade') {
  // 1. 保存当前页面到历史
  gameState.pageHistory.push(gameState.currentPage);
  
  // 2. 更新状态
  gameState.currentPage = pageId;
  if (!gameState.visitedPages.includes(pageId)) {
    gameState.visitedPages.push(pageId);
  }
  
  // 3. 执行页面切换动画
  transitionPage(pageId, animation);
  
  // 4. 更新导航栏状态
  updateNavBar();
  
  // 5. 切换场景音效（如果是场景页面）
  if (pageId.includes('forest') || pageId.includes('grass') || 
      pageId.includes('water') || pageId.includes('sand')) {
    switchSceneAudio(pageId);
  }
  
  // 6. 保存状态
  saveGameState();
}
```

### 热区点击检测：
```javascript
function setupHotspots(pageId) {
  const hotspots = hotspotsConfig[pageId];
  
  hotspots.forEach(spot => {
    const hotspotElement = createHotspot(spot);
    hotspotElement.addEventListener('click', (e) => {
      e.preventDefault();
      spot.action();
      playSFX('click');
    });
    
    document.getElementById('pageContent').appendChild(hotspotElement);
  });
}

function createHotspot(config) {
  const div = document.createElement('div');
  div.className = 'hotspot';
  div.style.position = 'absolute';
  div.style.left = config.position.x + '%';
  div.style.top = config.position.y + '%';
  div.style.width = config.size.width + '%';
  div.style.height = config.size.height + '%';
  return div;
}
```

### 图片预加载：
```javascript
function preloadImages(imageList) {
  return Promise.all(
    imageList.map(src => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
      });
    })
  );
}

// 预加载所有图片
const allImages = [
  'assets/images/01-cover.png',
  'assets/images/02-nav-main.png',
  // ... 其他图片
];

preloadImages(allImages).then(() => {
  console.log('所有图片加载完成');
  hideLoader();
  startGame();
});
```

---

## 📋 开发步骤建议

### Phase 1: 基础框架（第1-2天）
1. ✅ 创建HTML基础结构
2. ✅ 实现页面切换系统
3. ✅ 添加导航栏
4. ✅ 配置图片路径

### Phase 2: 核心交互（第3-4天）
5. ✅ 实现热区点击系统
6. ✅ 添加页面转场动画
7. ✅ 实现返回功能
8. ✅ 完成场景切换逻辑

### Phase 3: 音频功能（第5天）
9. ✅ 集成音频播放器
10. ✅ 实现背景音乐
11. ✅ 添加场景音效切换
12. ✅ 添加音量控制

### Phase 4: 优化完善（第6-7天）
13. ✅ 响应式适配
14. ✅ 性能优化
15. ✅ 添加加载动画
16. ✅ 实现进度保存

### Phase 5: 测试部署（第8天）
17. ✅ 全面测试
18. ✅ 修复bug
19. ✅ 优化图片大小
20. ✅ 部署到GitHub Pages

---

## ⚠️ 重要注意事项

1. **热区位置**：由于我无法看到实际图片内容，所有热区位置都需要你根据实际图片手动调整坐标

2. **图片优化**：确保所有图片：
   - 尺寸统一（建议1920×1080）
   - 格式为PNG或JPEG
   - 文件大小<1MB（使用TinyPNG压缩）

3. **浏览器兼容**：
   - 支持Chrome、Firefox、Safari、Edge最新版本
   - 移动端支持iOS Safari、Android Chrome

4. **性能优化**：
   - 使用图片懒加载
   - 预加载下一页图片
   - 使用CSS动画代替JavaScript动画

5. **无障碍访问**：
   - 添加键盘导航支持
   - 添加alt文本
   - 支持屏幕阅读器

---

## 🚀 快速开始命令

请帮我创建以下文件并实现上述所有功能：

1. **index.html** - 主HTML文件
2. **css/style.css** - 样式文件
3. **js/main.js** - 主逻辑文件
4. **js/navigation.js** - 导航系统
5. **js/audio.js** - 音频管理（预留接口）

要求：
- 代码结构清晰，注释完整
- 实现所有核心功能
- 响应式设计
- 性能优化
- 易于维护和扩展

请开始编码！
