# Plant Hunter

《植物猎人（Plant Hunter）》是一个面向儿童友好公园场景的 AI 互动科普游戏原型。  
项目通过网页 Demo 呈现世界观、生态分区、场景切换与热区交互，并为后续完整玩法实现提供交互基础。

## 项目概览

- 项目名称：Plant Hunter / 植物猎人
- 形态：Web 端交互式 Demo
- 目标人群：儿童与亲子用户
- 核心方向：AI + 植物科普 + 公园探索 + 游戏化关卡
- 仓库地址：`https://github.com/suy123xb/Plant-Hunter`

## 核心玩法设计（Concept）

### 1. 四大生态区 + 专属 AI 植物精灵
公园被划分为四类生态区，每个生态区对应不同植物群落与生态特征，并配备专属 AI 植物精灵作为引导角色。  
用户将在不同生态区中体验差异化的植物认知与探索任务。

### 2. 拍照打卡式关卡机制（植物知识问答）
每个生态区由一系列拍照打卡关卡构成。  
在关卡中，AI 植物精灵会描述目标植物的关键特征（形态、颜色、生长环境等），用户需要在真实或模拟场景中寻找该植物并拍照上传。  
系统完成识别核对后，判定关卡是否通过。

### 3. 逐关解锁进程
关卡采用线性解锁机制：上一关通过后，下一关才会开放。  
每个生态区规划约 20 种植物类型，形成从入门到进阶的持续探索路径，兼顾趣味性与学习深度。

## 当前 Demo 已实现能力

- 多页面场景切换与历史回退
- 热区点击交互（含可视化调试）
- 热区坐标持久化与模板导出
- 局部热区文案显示（白色文字）
- 音频系统：
1. 全局 BGM 循环播放
2. AI 欢迎语/引导语/介绍语按页面触发
3. AI 语音播放时自动压低 BGM，结束后恢复
4. 热区点击音效
5. 左侧音量滑杆（支持实时调节与本地记忆）

## 当前 Demo 与完整玩法的关系

当前仓库中的网页 Demo 主要展示：

- 生态区与场景结构
- 场景切换与热区交互
- 基础导航与调试能力

说明：上述“AI 识别、拍照上传、关卡判定与逐关解锁”等完整玩法为产品核心设计，尚未在当前 Demo 中完整实现。

## 本地运行

本项目为纯前端静态资源，可直接使用静态服务器运行，例如：

```bash
# 任选其一
python -m http.server 8080
# 或
npx serve .
```

浏览器访问 `http://localhost:8080`（或对应端口）即可。

## 页面结构

- `01-cover`：封面页（欢迎语）
- `02-nav-main`：主导航页
- `03-background-info`：背景资料页（AI 简介）
- `04-map-detail`：地图页（AI 引导词）
- `05-forest-intro` / `05-forest-detail`：林之境
- `06-grass-intro` / `06-grass-detail`：草之境
- `07-water-intro` / `07-water-detail`：水之境
- `08-sand-intro` / `08-sand-detail`：沙之境
- `09-shop-system`：积分商城

## 音频资源与触发规则

- 全局 BGM：`assets/audio/游戏整体BGM（全局播放）.mp3`
- 点击音效：`assets/audio/按钮（热区点击音效）.mp3`
- 页面语音：
1. `01-cover` -> `主页面打开时（AI欢迎语）.wav`
2. `03-background-info` -> `背景资料页(AI简单介绍语).wav`
3. `04-map-detail` -> `游戏地图页（AI引导词）.mp3`
4. `05-forest-intro` -> `林之境介绍页（AI引导语）.mp3`
5. `06-grass-intro` -> `草之境介绍页（AI引导语）.wav`
6. `07-water-intro` -> `水之境介绍页（AI引导语）.mp3`
7. `08-sand-intro` -> `沙之境介绍页（AI引导语）.wav`

## 热区配置说明

- 热区默认配置文件：`hotspot-overrides.template.js`
- 调试保存优先级：`localStorage` > 模板文件 > `js/main.js` 内置坐标
- 建议发布前操作：
1. 在调试模式完成热区校准
2. 导出模板并覆盖 `hotspot-overrides.template.js`
3. 清空 `localStorage` 后复测，确保线上效果与代码一致

## GitHub Pages 部署

推荐使用仓库根目录直接部署（无需构建）：
当前仓库不包含自动部署工作流，请在 GitHub 页面中手动配置。

1. 打开仓库 `Settings` -> `Pages`
2. `Source` 选择 `Deploy from a branch`
3. `Branch` 选择 `master`，目录选择 `/ (root)`，保存
4. 等待 1-3 分钟后可通过以下地址访问：
`https://suy123xb.github.io/Plant-Hunter/`

说明：若默认分支切换为 `main`，请在 Pages 中同步改为 `main`。

## License

仅用于学习、演示与原型验证。若用于公开商用，请补充正式授权与许可证。
