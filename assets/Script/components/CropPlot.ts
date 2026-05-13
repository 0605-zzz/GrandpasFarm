// CropPlot.ts
// 单块农田地块组件：管理显示状态、生长进度、交互

const { ccclass, property } = cc._decorator;
import GameManager from "../managers/GameManager";
import { getCropConfig } from "../data/Config";

/** 地块显示状态 */
export enum PlotState {
    LOCKED   = -1,
    EMPTY    = 0,
    PLANTED  = 1,
    READY    = 2,
}

@ccclass
export default class CropPlot extends cc.Component {

    @property(cc.Node)
    lockNode: cc.Node = null;

    @property(cc.Node)
    lockIcon: cc.Node = null;

    @property(cc.Node)
    cropNode: cc.Node = null;

    @property(cc.Sprite)
    cropSprite: cc.Sprite = null;

    @property(cc.Node)
    harvestBubble: cc.Node = null;

    @property(cc.ProgressBar)
    growProgressBar: cc.ProgressBar = null;

    @property(cc.Label)
    timerLabel: cc.Label = null;

    @property(cc.Label)
    unlockLevelLabel: cc.Label = null;

    @property(cc.Node)
    soilNode: cc.Node = null;

    /** 地块ID */
    public plotId: number = -1;
    /** 当前状态 */
    private state: PlotState = PlotState.EMPTY;

    onLoad() {
        this.node.on(cc.Node.EventType.TOUCH_END, this.onTouched, this);
    }

    onDestroy() {
        this.node.off(cc.Node.EventType.TOUCH_END, this.onTouched, this);
    }

    /** 初始化地块 */
    public init(plotId: number) {
        this.plotId = plotId;
        this.refreshFromData();
    }

    update(dt: number) {
        if (this.state === PlotState.PLANTED) {
            this.updateGrowthDisplay();
        }
    }

    // ─── 数据同步 ──────────────────────────────────────────────

    /** 从GameManager同步数据刷新显示 */
    public refreshFromData() {
        const gm = GameManager.instance;
        if (!gm) return;
        const plotData = gm.playerData.plots.find(p => p.id === this.plotId);
        if (!plotData) return;

        if (!plotData.isUnlocked) {
            this.state = PlotState.LOCKED;
        } else if (plotData.cropId === null) {
            this.state = PlotState.EMPTY;
        } else {
            const stage = gm.getGrowthStage(this.plotId);
            if (stage >= 3) {
                this.state = PlotState.READY;
            } else {
                this.state = PlotState.PLANTED;
            }
        }

        this.refreshView();
    }

    // ─── 生长显示更新 ──────────────────────────────────────────

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

        // 更新作物图片阶段
        if (this.cropSprite) {
            const stage = gm.getGrowthStage(this.plotId);
            this.updateCropSprite(stage);
        }

        // 检查是否成熟
        if (progress >= 1) {
            this.state = PlotState.READY;
            this.refreshView();
        }
    }

    // ─── 视图刷新 ──────────────────────────────────────────────

    private refreshView() {
        const gm = GameManager.instance;
        const plotData = gm ? gm.playerData.plots.find(p => p.id === this.plotId) : null;

        // 锁节点
        if (this.lockNode) {
            this.lockNode.active = this.state === PlotState.LOCKED;
        }
        if (this.lockIcon) {
            this.lockIcon.active = this.state === PlotState.LOCKED;
        }

        // 解锁等级提示
        if (this.unlockLevelLabel && plotData) {
            this.unlockLevelLabel.node.active = this.state === PlotState.LOCKED;
            if (this.state === PlotState.LOCKED) {
                this.unlockLevelLabel.string = `Lv.${plotData.unlockLevel}解锁`;
            }
        }

        // 作物节点
        if (this.cropNode) {
            this.cropNode.active = (
                this.state === PlotState.PLANTED ||
                this.state === PlotState.READY
            );
        }

        // 收获气泡
        if (this.harvestBubble) {
            const wasActive = this.harvestBubble.active;
            this.harvestBubble.active = this.state === PlotState.READY;
            if (this.state === PlotState.READY && !wasActive) {
                this.playBubbleAnim();
            }
        }

        // 进度条
        if (this.growProgressBar) {
            this.growProgressBar.node.active = this.state === PlotState.PLANTED;
        }

        // 倒计时
        if (this.timerLabel) {
            this.timerLabel.node.active = this.state === PlotState.PLANTED;
        }

        // 土壤状态
        if (this.soilNode) {
            this.soilNode.active = this.state !== PlotState.LOCKED;
        }

        // 设置作物图片
        if (this.cropSprite && plotData && plotData.cropId !== null) {
            const stage = gm ? gm.getGrowthStage(this.plotId) : 0;
            this.updateCropSprite(stage);
        }
    }

    /** 更新作物图片（根据阶段） */
    private updateCropSprite(stage: number) {
        const gm = GameManager.instance;
        const plotData = gm ? gm.playerData.plots.find(p => p.id === this.plotId) : null;
        if (!plotData || plotData.cropId === null) return;

        const config = getCropConfig(plotData.cropId);
        if (!config) return;

        // 动态加载作物图片
        const spriteName = `${config.icon}_stage${stage}`;
        cc.resources.load(`sprites/crops/${spriteName}`, cc.SpriteFrame, (err, spriteFrame: cc.SpriteFrame) => {
            if (err) {
                // 如果分阶段图片不存在，尝试加载通用图片
                cc.resources.load(`sprites/crops/${config.icon}`, cc.SpriteFrame, (err2, sf: cc.SpriteFrame) => {
                    if (!err2 && this.cropSprite) {
                        this.cropSprite.spriteFrame = sf;
                    }
                });
                return;
            }
            if (this.cropSprite) {
                this.cropSprite.spriteFrame = spriteFrame;
            }
        });
    }

    /** 气泡弹出动画 */
    private playBubbleAnim() {
        if (!this.harvestBubble) return;
        this.harvestBubble.scale = 0;
        cc.tween(this.harvestBubble)
            .to(0.2, { scale: 1.1 }, { easing: "backOut" })
            .to(0.1, { scale: 1.0 })
            .start();
    }

    // ─── 触摸事件 ──────────────────────────────────────────────

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
                    // 播放收获特效
                    this.playHarvestEffect();
                }
                break;
            case PlotState.LOCKED:
                cc.systemEvent.emit("ON_PLOT_CLICK_LOCKED", this.plotId);
                break;
        }
    }

    /** 播放收获特效 */
    private playHarvestEffect() {
        // 简单的缩放弹跳
        cc.tween(this.node)
            .to(0.1, { scale: 1.1 })
            .to(0.1, { scale: 1.0 })
            .start();
    }

    // ─── 工具方法 ──────────────────────────────────────────────

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