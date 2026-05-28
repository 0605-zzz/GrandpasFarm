// CropPlot.ts
// 单块农田地块组件：气泡显示作物图标，土地上不显示大作物图

const { ccclass, property } = cc._decorator;
import GameManager from "../managers/GameManager";
import { getCropConfig } from "../data/Config";

/** 地块类型 */
export enum PlotType {
    LONG = 0,   // 长条土地：始终解锁
    SMALL = 1,  // 小土地：可锁定
}

/** 地块显示状态 */
export enum PlotState {
    LOCKED   = -1,
    EMPTY    = 0,
    PLANTED  = 1,
    READY    = 2,
}

@ccclass
export default class CropPlot extends cc.Component {

    // ─── 地块类型 ──────────────────────────────

    @property({ type: cc.Enum(PlotType), tooltip: "地块类型：0=长条, 1=小土地" })
    plotType: PlotType = PlotType.SMALL;

    // ─── 子节点引用 ──────────────────────────────

    @property(cc.Node)
    soilNode: cc.Node = null;           // 土地图片节点（小土地用）

    @property(cc.Sprite)
    soilSprite: cc.Sprite = null;       // 土地Sprite

    @property(cc.Node)
    cropNode: cc.Node = null;           // 作物容器节点（只包含气泡）

    @property(cc.Node)
    harvestBubble: cc.Node = null;      // 收获/种植气泡节点

    @property(cc.Sprite)
    bubbleCropIcon: cc.Sprite = null;   // 气泡里的作物小图标

    @property(cc.ProgressBar)
    growProgressBar: cc.ProgressBar = null;

    @property(cc.Label)
    timerLabel: cc.Label = null;

    @property(cc.Node)
    lockNode: cc.Node = null;

    @property(cc.Node)
    lockIcon: cc.Node = null;

    @property(cc.Label)
    unlockLevelLabel: cc.Label = null;

    // ─── 配置属性 ──────────────────────────────

    @property({ type: cc.Integer, tooltip: "地块唯一ID" })
    plotId: number = -1;

    @property({ type: cc.Integer, tooltip: "解锁等级" })
    unlockLevel: number = 1;

    @property({ type: cc.Vec2, tooltip: "默认位置（相对父节点）" })
    defaultPosition: cc.Vec2 = new cc.Vec2(0, 0);

    @property({ type: cc.Integer, tooltip: "调试用：-1=锁定, 0=空地, 1=种植, 2=成熟" })
    debugState: number = -99;

    // ─── 内部状态 ──────────────────────────────

    private state: PlotState = PlotState.EMPTY;
    private currentCropId: number = null;  // 当前种植的作物ID

    // ─── 生命周期 ──────────────────────────────

    onLoad() {
        this.node.setPosition(this.defaultPosition);
        this.node.on(cc.Node.EventType.TOUCH_END, this.onTouched, this);
        this.refreshView();
    }

    onDestroy() {
        this.node.off(cc.Node.EventType.TOUCH_END, this.onTouched, this);
    }

    /** 初始化地块（供 MainScene 调用） */
    public init(plotId: number, unlockLevel?: number) {
        this.plotId = plotId;
        if (unlockLevel !== undefined) {
            this.unlockLevel = unlockLevel;
        }
        this.refreshFromData();
    }

    update(dt: number) {
        if (this.debugState !== -99) {
            const targetState = this.debugState as PlotState;
            if (this.state !== targetState) {
                this.state = targetState;
                this.refreshView();
            }
            return;
        }

        if (this.state === PlotState.PLANTED) {
            this.updateGrowthDisplay();
        }
    }

    // ─── 数据同步 ──────────────────────────────

    public refreshFromData() {
        const gm = GameManager.instance;
        if (!gm) {
            if (this.plotType === PlotType.LONG) {
                this.state = PlotState.EMPTY;
            } else {
                this.state = this.unlockLevel === 0 ? PlotState.EMPTY : PlotState.LOCKED;
            }
            this.refreshView();
            return;
        }

        const plotData = gm.playerData.plots.find(p => p.id === this.plotId);
        if (!plotData) return;

        if (!plotData.isUnlocked) {
            this.state = PlotState.LOCKED;
        } else if (plotData.cropId === null) {
            this.state = PlotState.EMPTY;
        } else {
            this.currentCropId = plotData.cropId;
            const stage = gm.getGrowthStage(this.plotId);
            this.state = stage >= 3 ? PlotState.READY : PlotState.PLANTED;
        }

        this.refreshView();
    }

    // ─── 生长显示更新 ──────────────────────────

    private updateGrowthDisplay() {
        const gm = GameManager.instance;
        if (!gm) return;

        const progress = gm.getGrowthProgress(this.plotId);
        const plotData = gm.playerData.plots.find(p => p.id === this.plotId);
        if (!plotData || plotData.cropId === null) return;

        const config = getCropConfig(plotData.cropId);
        if (!config) return;

        if (this.growProgressBar) {
            this.growProgressBar.progress = progress;
        }

        if (this.timerLabel) {
            const elapsed = (Date.now() / 1000) - plotData.plantTime;
            const remaining = Math.max(config.growTime - elapsed, 0);
            this.timerLabel.string = this.formatTime(remaining);
        }

        if (progress >= 1) {
            this.state = PlotState.READY;
            this.refreshView();
        }
    }

    // ─── 视图刷新 ──────────────────────────────

    private refreshView() {
        const gm = GameManager.instance;
        const plotData = gm ? gm.playerData.plots.find(p => p.id === this.plotId) : null;
        const isLocked = this.state === PlotState.LOCKED;
        const isLong = this.plotType === PlotType.LONG;
        const isPlantedOrReady = this.state === PlotState.PLANTED || this.state === PlotState.READY;

        // 长条土地
        if (isLong) {
            if (this.lockNode) this.lockNode.active = false;
            if (this.soilNode) this.soilNode.active = false;
        } 
        // 小土地
        else {
            if (this.soilNode) {
                this.soilNode.active = !isLocked;
            }
            if (this.lockNode) {
                this.lockNode.active = isLocked;
            }
            if (this.lockIcon) {
                this.lockIcon.active = isLocked;
            }
            if (this.unlockLevelLabel) {
                this.unlockLevelLabel.node.active = isLocked;
                if (isLocked) {
                    this.unlockLevelLabel.string = `Lv.${this.unlockLevel}解锁`;
                }
            }
        }

        // 作物节点（气泡容器）：种植中或成熟显示
        if (this.cropNode) {
            this.cropNode.active = isPlantedOrReady;
        }

        // 收获气泡
        if (this.harvestBubble) {
            const wasActive = this.harvestBubble.active;
            this.harvestBubble.active = isPlantedOrReady;
            
            if (isPlantedOrReady && !wasActive) {
                // 设置气泡里的作物图标
                const cropId = plotData ? plotData.cropId : this.currentCropId;
                if (cropId !== null) {
                    this.setBubbleIcon(cropId);
                }
                this.playBubbleAnim();
            }
        }

        // 进度条和倒计时
        if (this.growProgressBar) {
            this.growProgressBar.node.active = this.state === PlotState.PLANTED;
        }
        if (this.timerLabel) {
            this.timerLabel.node.active = this.state === PlotState.PLANTED;
        }
    }

    // ─── 气泡图标设置 ──────────────────────────

    private setBubbleIcon(cropId: number) {
        if (!this.bubbleCropIcon) return;
        
        const config = getCropConfig(cropId);
        if (!config) return;
        
        cc.resources.load(`sprites/crops/${config.icon}`, cc.SpriteFrame, (err, sf) => {
            if (!err && this.bubbleCropIcon) {
                this.bubbleCropIcon.spriteFrame = sf;
            }
        });
    }

    // ─── 动画 ──────────────────────────

    private playBubbleAnim() {
        if (!this.harvestBubble) return;
        this.harvestBubble.scale = 0;
        cc.tween(this.harvestBubble)
            .to(0.2, { scale: 1.1 }, { easing: "backOut" })
            .to(0.1, { scale: 1.0 })
            .start();
    }

    // ─── 触摸事件 ──────────────────────────

    private onTouched() {
        const gm = GameManager.instance;
        if (!gm) return;

        switch (this.state) {
            case PlotState.EMPTY:
                cc.systemEvent.emit("ON_PLOT_CLICK_EMPTY", this.plotId);
                break;
            case PlotState.READY:
                const result = gm.harvestCrop(this.plotId);
                if (result) {
                    this.refreshFromData();
                    this.playHarvestEffect();
                }
                break;
            case PlotState.LOCKED:
                cc.systemEvent.emit("ON_PLOT_CLICK_LOCKED", this.plotId);
                break;
        }
    }

    private playHarvestEffect() {
        cc.tween(this.node)
            .to(0.1, { scale: 1.1 })
            .to(0.1, { scale: 1.0 })
            .start();
    }

    // ─── 工具方法 ──────────────────────────

    private formatTime(seconds: number): string {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = Math.floor(seconds % 60);
        if (h > 0) return `${h}:${this.pad(m)}:${this.pad(s)}`;
        return `${this.pad(m)}:${this.pad(s)}`;
    }

    private pad(n: number): string {
        return n < 10 ? "0" + n : n.toString();
    }
}