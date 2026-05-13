// UnlockConfirmPanel.ts
// 地块解锁确认面板

const { ccclass, property } = cc._decorator;
import BasePanel from "./BasePanel";
import GameManager from "../managers/GameManager";
import { getPlotConfig } from "../data/Config";

@ccclass
export default class UnlockConfirmPanel extends BasePanel {

    @property(cc.Label)
    titleLabel: cc.Label = null;

    @property(cc.Label)
    descLabel: cc.Label = null;

    @property(cc.Label)
    costLabel: cc.Label = null;

    @property(cc.Button)
    confirmBtn: cc.Button = null;

    @property(cc.Button)
    cancelBtn: cc.Button = null;

    /** 当前要解锁的地块ID */
    private currentPlotId: number = -1;

    onLoad() {
        super.onLoad();
        if (this.confirmBtn) {
            this.confirmBtn.node.on(cc.Node.EventType.TOUCH_END, this.onConfirm, this);
        }
        if (this.cancelBtn) {
            this.cancelBtn.node.on(cc.Node.EventType.TOUCH_END, this.close, this);
        }
    }

    onDestroy() {
        if (this.confirmBtn) {
            this.confirmBtn.node.off(cc.Node.EventType.TOUCH_END, this.onConfirm, this);
        }
        if (this.cancelBtn) {
            this.cancelBtn.node.off(cc.Node.EventType.TOUCH_END, this.close, this);
        }
        super.onDestroy();
    }

    /** 显示解锁确认 */
    public showUnlock(plotId: number) {
        this.currentPlotId = plotId;
        const gm = GameManager.instance;
        if (!gm) return;

        const plotData = gm.playerData.plots.find(p => p.id === plotId);
        if (!plotData) return;

        if (this.titleLabel) {
            this.titleLabel.string = "解锁地块";
        }

        if (this.descLabel) {
            this.descLabel.string = `需要等级: Lv.${plotData.unlockLevel}`;
        }

        if (this.costLabel) {
            this.costLabel.string = `消耗: ${plotData.unlockCost}金币`;
        }

        // 检查是否满足条件
        const canUnlock = gm.playerData.level >= plotData.unlockLevel && gm.playerData.gold >= plotData.unlockCost;
        if (this.confirmBtn) {
            this.confirmBtn.interactable = canUnlock;
        }

        this.open();
    }

    private onConfirm() {
        const gm = GameManager.instance;
        if (!gm) return;

        const success = gm.unlockPlot(this.currentPlotId);
        if (success) {
            cc.systemEvent.emit("ON_PLOT_UNLOCKED", this.currentPlotId);
            this.close();
        }
    }
}
