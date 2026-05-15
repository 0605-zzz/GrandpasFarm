// CropPlot.ts
// 单块农田地块：管理作物状态、生长计时、收获气泡

const { ccclass, property } = cc._decorator;

/** 地块状态 */
export enum PlotState {
    LOCKED    = -1,  // 未解锁
    EMPTY     = 0,   // 空地
    PLANTED   = 1,   // 已种植（生长中）
    READY     = 2,   // 可收获
    WITHERED  = 3,   // 枯萎
}

/** 作物数据（对应 crops.json 中的一条） */
export interface CropConfig {
    id: number;
    name: string;
    growTime: number;   // 生长时间（秒）
    sellPrice: number;
    seedPrice: number;
    unlockLevel: number;
}

@ccclass
export default class CropPlot extends cc.Component {

    // ─── 子节点引用（编辑器拖入） ──────────────────────────────

    @property(cc.Node)
    lockNode: cc.Node = null;           // 锁图标节点

    @property(cc.Node)
    cropNode: cc.Node = null;           // 作物图片节点

    @property(cc.Node)
    harvestBubble: cc.Node = null;      // 收获气泡节点

    @property(cc.ProgressBar)
    growProgressBar: cc.ProgressBar = null; // 生长进度条

    @property(cc.Label)
    timerLabel: cc.Label = null;        // 倒计时文字

    // ─── 内部状态 ──────────────────────────────────────────────

    private state: PlotState = PlotState.EMPTY;
    private cropConfig: CropConfig = null;
    private plantTime: number = 0;      // 种植时的时间戳（秒）
    private growTime: number = 0;       // 总生长时间（秒）

    onLoad() {
        this.node.on(cc.Node.EventType.TOUCH_END, this.onTouched, this);
        this.refreshView();
    }

    update(dt: number) {
        if (this.state === PlotState.PLANTED) {
            this.updateGrowth();
        }
    }

    // ─── 公开接口 ──────────────────────────────────────────────

    /** 初始化为锁定状态 */
    public setLocked() {
        this.state = PlotState.LOCKED;
        this.refreshView();
    }

    /** 解锁地块 */
    public unlock() {
        if (this.state === PlotState.LOCKED) {
            this.state = PlotState.EMPTY;
            this.refreshView();
        }
    }

    /** 种植作物 */
    public plant(config: CropConfig) {
        if (this.state !== PlotState.EMPTY) return;
        this.cropConfig = config;
        this.plantTime = Date.now() / 1000;
        this.growTime = config.growTime;
        this.state = PlotState.PLANTED;
        this.refreshView();
    }

    /** 收获作物，返回收获的作物id */
    public harvest(): number {
        if (this.state !== PlotState.READY) return -1;
        const id = this.cropConfig.id;
        this.cropConfig = null;
        this.state = PlotState.EMPTY;
        this.refreshView();
        return id;
    }

    /** 获取当前状态 */
    public getState(): PlotState {
        return this.state;
    }

    // ─── 生长逻辑 ──────────────────────────────────────────────

    private updateGrowth() {
        const elapsed = Date.now() / 1000 - this.plantTime;
        const progress = Math.min(elapsed / this.growTime, 1);

        if (this.growProgressBar) {
            this.growProgressBar.progress = progress;
        }

        // 更新倒计时
        if (this.timerLabel) {
            const remaining = Math.max(this.growTime - elapsed, 0);
            this.timerLabel.string = this.formatTime(remaining);
        }

        // 生长完成
        if (progress >= 1 && this.state === PlotState.PLANTED) {
            this.state = PlotState.READY;
            this.refreshView();
        }
    }

    // ─── 视图刷新 ──────────────────────────────────────────────

    private refreshView() {
        // 锁节点
        if (this.lockNode) {
            this.lockNode.active = this.state === PlotState.LOCKED;
        }

        // 作物节点
        if (this.cropNode) {
            this.cropNode.active = (
                this.state === PlotState.PLANTED ||
                this.state === PlotState.READY ||
                this.state === PlotState.WITHERED
            );
        }

        // 收获气泡
        if (this.harvestBubble) {
            this.harvestBubble.active = this.state === PlotState.READY;
            if (this.state === PlotState.READY) {
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
        switch (this.state) {
            case PlotState.EMPTY:
                // 打开背包选种子
                cc.systemEvent.emit("ON_PLOT_CLICK_EMPTY", this);
                break;
            case PlotState.READY:
                // 直接收获
                const cropId = this.harvest();
                cc.systemEvent.emit("ON_CROP_HARVESTED", cropId);
                break;
            case PlotState.LOCKED:
                // 提示解锁条件
                cc.systemEvent.emit("ON_PLOT_CLICK_LOCKED", this);
                break;
        }
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
