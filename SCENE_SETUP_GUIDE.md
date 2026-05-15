# 爷爷的农场 - Cocos Creator 场景搭建指南

## 一、项目设置

### 1. 设计分辨率
- 打开 **项目设置 -> 项目数据**
- 设计分辨率: **750 x 1334** (iPhone标准)
- 适配模式: **FIXED_WIDTH** 或 **FIXED_HEIGHT**

### 2. 微信小游戏配置
- 打开 **项目 -> 构建发布**
- 选择 **微信小游戏**
- 填写你的 AppID (在 `settings/builder.json` 中修改 `wechatgame.appid`)

---

## 二、场景搭建步骤

### Scene 1: LoginScene (开始界面)

#### 节点结构
```
Canvas (Canvas组件, 设计分辨率750x1334)
├── bg (Sprite) - 背景图 "image/主界面.png"
├── titleNode (Node)
│   └── titleLabel (Label) - "爷爷的农场" 
│       - 字体: 艺术字/像素风字体
│       - 大小: 80
│       - 颜色: #8B4513 (棕色)
├── tipsLabel (Label) - "Tips:\n本游戏适合所有年龄段玩家"
│   - 位置: 右上角
│   - 大小: 24
│   - 颜色: #FFFFFF
└── enterBtn (Button)
    ├── bg (Sprite) - 按钮背景
    └── label (Label) - "进入农场"
```

#### 挂载脚本
- `Canvas` 节点挂载 `LoginScene.ts`
- 将 `enterBtn` 拖入脚本的 `enterBtn` 属性
- 将 `titleNode` 拖入脚本的 `titleNode` 属性

---

### Scene 2: LoadingScene (加载界面)

#### 节点结构
```
Canvas
├── bg (Sprite) - 背景图
├── tipsLabel (Label) - 随机提示文字
│   - 位置: (0, 400)
├── progressBar (ProgressBar)
│   ├── bar (Sprite) - 进度条背景
│   └── fill (Sprite) - 进度条填充
├── progressLabel (Label) - "0%"
│   - 位置: (0, -300)
└── enterBtn (Button) - "进入农场"
    - 初始状态: 隐藏 (active = false)
```

#### 挂载脚本
- `Canvas` 节点挂载 `LoadingScene.ts`
- 将对应节点拖入脚本属性

---

### Scene 3: FarmScene (农场主场景) ⭐重点

#### 节点结构
```
Canvas
├── Camera
├── bg (Sprite) - 农场背景地图
│   - 包含: 草地、道路、水池、房屋、树木等
├── plotContainer (Node) - 地块容器
│   └── [地块预制体将在这里动态生成]
├── buildings (Node) - 建筑层
│   ├── kitchen (Sprite) - 厨房
│   ├── warehouse (Sprite) - 仓库建筑
│   └── ...
├── animals (Node) - 动物层
│   ├── dog (Sprite + 动画)
│   ├── cat (Sprite + 动画)
│   └── ...
├── npc (Node) - NPC层
│   └── grandpa (Sprite + 动画) - 爷爷
├── UI (Node) - UI层
│   ├── topBar (Node) - 挂载 TopBar.ts
│   │   ├── avatar (Sprite) - 头像
│   │   ├── usernameLabel (Label)
│   │   ├── levelLabel (Label)
│   │   ├── expBar (ProgressBar)
│   │   ├── goldLabel (Label)
│   │   └── gemLabel (Label)
│   ├── bottomBar (Node) - 挂载 BottomBar.ts
│   │   ├── tabButtons[] (Node[6]) - 6个按钮
│   │   │   ├── shopBtn
│   │   │   ├── toolBtn
│   │   │   ├── orderBtn
│   │   │   ├── collectionBtn
│   │   │   ├── warehouseBtn
│   │   │   └── diaryBtn
│   │   └── redDots[] (Node[6]) - 6个红点
│   ├── panels (Node) - 面板容器
│   │   ├── shopPanel (Node) - 挂载 ShopPanel.ts + BasePanel.ts
│   │   ├── toolPanel (Node) - 挂载 ToolPanel.ts + BasePanel.ts
│   │   ├── orderPanel (Node) - 挂载 OrderPanel.ts + BasePanel.ts
│   │   ├── collectionPanel (Node) - 挂载 CollectionPanel.ts + BasePanel.ts
│   │   ├── warehousePanel (Node) - 挂载 WarehousePanel.ts + BasePanel.ts
│   │   └── diaryPanel (Node) - 挂载 DiaryPanel.ts + BasePanel.ts
│   ├── plantSelectPanel (Node) - 挂载 PlantSelectPanel.ts + BasePanel.ts
│   └── unlockConfirmPanel (Node) - 挂载 UnlockConfirmPanel.ts + BasePanel.ts
```

#### FarmScene.ts 属性绑定
将以下节点/预制体拖入 FarmScene 脚本:

| 属性名 | 节点/预制体 |
|--------|-----------|
| plotPrefab | 地块预制体 |
| plotContainer | plotContainer 节点 |
| topBarNode | topBar 节点 |
| bottomBarNode | bottomBar 节点 |
| shopPanel | shopPanel 节点 |
| toolPanel | toolPanel 节点 |
| orderPanel | orderPanel 节点 |
| collectionPanel | collectionPanel 节点 |
| warehousePanel | warehousePanel 节点 |
| diaryPanel | diaryPanel 节点 |
| plantSelectPanel | plantSelectPanel 节点 |
| unlockConfirmPanel | unlockConfirmPanel 节点 |

---

## 三、预制体 (Prefab) 制作

### 1. Plot 预制体 (地块)

```
Plot (Node) - 挂载 CropPlot.ts
├── soil (Sprite) - 土壤图片
│   - 状态: 空地块/已种植土壤
├── lockNode (Node)
│   ├── lockIcon (Sprite) - 锁图标
│   └── unlockLevelLabel (Label) - "Lv.2解锁"
├── cropNode (Node)
│   └── cropSprite (Sprite) - 作物图片
├── harvestBubble (Node)
│   └── bubbleSprite (Sprite) - 气泡图标
├── growProgressBar (ProgressBar)
│   └── fill (Sprite)
└── timerLabel (Label) - 倒计时 "02:30"
```

**CropPlot.ts 属性绑定:**
- lockNode -> lockNode
- lockIcon -> lockNode/lockIcon
- cropNode -> cropNode
- cropSprite -> cropNode/cropSprite
- harvestBubble -> harvestBubble
- growProgressBar -> growProgressBar
- timerLabel -> timerLabel
- unlockLevelLabel -> lockNode/unlockLevelLabel
- soilNode -> soil

### 2. ShopItem 预制体 (商店物品)

```
ShopItem (Node)
├── icon (Sprite) - 作物图标
├── nameLabel (Label) - 作物名称
├── priceLabel (Label) - "3金币"
└── buyBtn (Button) - "购买"
```

### 3. SeedItem 预制体 (种子选择)

```
SeedItem (Node)
├── icon (Sprite)
├── nameLabel (Label)
├── timeLabel (Label) - "生长: 1分钟"
├── priceLabel (Label) - "3金币"
└── selectBtn (Button) - "选择"
```

### 4. OrderItem 预制体 (订单)

```
OrderItem (Node)
├── descLabel (Label) - "需求: 小麦x3, 胡萝卜x2"
├── rewardLabel (Label) - "奖励: 100金币 20经验"
├── submitBtn (Button) - "提交"
└── completedMark (Node) - 完成标记
```

### 5. AchievementItem 预制体 (成就)

```
AchievementItem (Node)
├── icon (Sprite)
├── nameLabel (Label)
├── descLabel (Label)
└── lockMask (Node) - 未解锁遮罩
```

### 6. WarehouseItem 预制体 (仓库物品)

```
WarehouseItem (Node)
├── icon (Sprite)
├── nameLabel (Label)
└── countLabel (Label) - "x5"
```

### 7. DiaryItem 预制体 (日记)

```
DiaryItem (Node)
├── titleLabel (Label)
├── dateLabel (Label)
├── contentLabel (Label)
└── newMark (Node) - 新标记
```

---

## 四、常驻节点设置

在 **LoadingScene** 中创建以下常驻节点 (Persistent Node):

```
GameManager (Node) - 挂载 GameManager.ts
CloudSaveManager (Node) - 挂载 CloudSaveManager.ts
AudioManager (Node) - 挂载 AudioManager.ts
EventBus (Node) - 挂载 EventBus.ts
```

这些节点在 LoadingScene 的 `onLoad` 中通过 `cc.game.addPersistRootNode()` 设置为常驻。

---

## 五、资源目录结构

```
assets/
├── resources/
│   ├── prefabs/
│   │   ├── Plot.prefab
│   │   ├── ShopItem.prefab
│   │   ├── SeedItem.prefab
│   │   ├── OrderItem.prefab
│   │   ├── AchievementItem.prefab
│   │   ├── WarehouseItem.prefab
│   │   └── DiaryItem.prefab
│   └── sprites/
│       ├── crops/
│       │   ├── wheat.png
│       │   ├── wheat_stage0.png
│       │   ├── wheat_stage1.png
│       │   ├── wheat_stage2.png
│       │   ├── wheat_stage3.png
│       │   ├── carrot.png
│       │   └── ...
│       ├── plots/
│       │   ├── soil_empty.png
│       │   └── soil_planted.png
│       ├── ui/
│       │   ├── lock.png
│       │   ├── bubble.png
│       │   ├── coin.png
│       │   ├── gem.png
│       │   └── ...
│       └── achievements/
│           ├── ach_plant.png
│           └── ...
```

---

## 六、关键配置修改

### 1. 微信云开发环境ID
修改 `CloudSaveManager.ts`:
```typescript
wx.cloud.init({
    env: "your-cloud-env-id", // <-- 替换为你的云环境ID
    traceUser: true,
});
```

### 2. 微信小游戏 AppID
修改 `settings/builder.json`:
```json
"wechatgame": {
    "appid": "wx YOUR_APPID_HERE"
}
```

### 3. 作物配置
修改 `assets/data/crops.json` 或 `assets/Script/data/Config.ts`

### 4. 地块配置
修改 `assets/Script/data/Config.ts` 中的 `PLOT_CONFIG`

---

## 七、微信云开发数据库设置

### 创建集合
在云开发控制台数据库中创建:
- `players` - 玩家数据集合

### 集合权限
设置为 **所有用户可读，仅创建者可写** 或根据需求调整。

### 数据结构
```json
{
  "_openid": "用户openid",
  "playerData": {
    "uid": "",
    "username": "",
    "level": 1,
    "gold": 500,
    ...
  }
}
```

---

## 八、测试流程

1. **编辑器测试**: 直接在 Cocos Creator 中运行，测试基本功能
2. **微信开发者工具**: 构建发布后导入测试
3. **真机测试**: 预览二维码在真机上测试

---

## 九、常见问题

### Q: 地块不显示?
A: 检查 `plotPrefab` 是否正确绑定，`plotContainer` 是否设置。

### Q: 云存档失败?
A: 确认已开通微信云开发，替换正确的环境ID。

### Q: 作物图片加载失败?
A: 确认资源放在 `assets/resources/sprites/crops/` 目录下。

### Q: 微信API报错?
A: 非微信环境（编辑器/浏览器）会自动降级，不影响测试。
