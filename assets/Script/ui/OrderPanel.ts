// OrderPanel.ts
// 订单面板：显示当前订单列表

const { ccclass, property } = cc._decorator;
import BasePanel from "./BasePanel";
import GameManager from "../managers/GameManager";
import { getCropConfig } from "../data/Config";

@ccclass
export default class OrderPanel extends BasePanel {

    @property(cc.Prefab)
    orderItemPrefab: cc.Prefab = null;

    @property(cc.Node)
    orderContainer: cc.Node = null;

    @property(cc.Label)
    emptyLabel: cc.Label = null;

    onEnable() {
        this.refreshUI();
        cc.systemEvent.on("ON_ORDER_CHANGED", this.refreshUI, this);
        cc.systemEvent.on("ON_WAREHOUSE_CHANGED", this.refreshUI, this);
    }

    onDisable() {
        cc.systemEvent.off("ON_ORDER_CHANGED", this.refreshUI, this);
        cc.systemEvent.off("ON_WAREHOUSE_CHANGED", this.refreshUI, this);
    }

    public refreshUI() {
        const gm = GameManager.instance;
        if (!gm) return;

        const orders = gm.playerData.orders;

        if (orders.length === 0) {
            if (this.emptyLabel) {
                this.emptyLabel.node.active = true;
                this.emptyLabel.string = "暂无订单\n请耐心等待...";
            }
            if (this.orderContainer) this.orderContainer.active = false;
            return;
        }

        if (this.emptyLabel) this.emptyLabel.node.active = false;
        if (this.orderContainer) {
            this.orderContainer.active = true;
            this.orderContainer.removeAllChildren();
        }

        if (!this.orderItemPrefab || !this.orderContainer) return;

        orders.forEach(order => {
            const item = cc.instantiate(this.orderItemPrefab);
            this.setupOrderItem(item, order);
            this.orderContainer.addChild(item);
        });
    }

    private setupOrderItem(item: cc.Node, order: any) {
        const descLabel = item.getChildByName("DescLabel")?.getComponent(cc.Label);
        const rewardLabel = item.getChildByName("RewardLabel")?.getComponent(cc.Label);
        const submitBtn = item.getChildByName("SubmitBtn")?.getComponent(cc.Button);
        const completedMark = item.getChildByName("CompletedMark");

        // 构建需求描述
        const reqTexts = order.items.map((req: any) => {
            const config = getCropConfig(req.itemId);
            return `${config ? config.name : "未知"}x${req.count}`;
        });

        if (descLabel) descLabel.string = `需求: ${reqTexts.join(", ")}`;
        if (rewardLabel) rewardLabel.string = `奖励: ${order.rewardGold}金币 ${order.rewardExp}经验`;

        // 检查是否可完成
        const gm = GameManager.instance;
        let canComplete = true;
        for (const req of order.items) {
            const whItem = gm.getWarehouseItem(req.itemId);
            if (!whItem || whItem.count < req.count) {
                canComplete = false;
                break;
            }
        }

        if (submitBtn) {
            submitBtn.node.active = !order.isCompleted;
            submitBtn.interactable = canComplete;
            submitBtn.node.on(cc.Node.EventType.TOUCH_END, () => {
                gm.completeOrder(order.id);
            }, this);
        }

        if (completedMark) {
            completedMark.active = order.isCompleted;
        }
    }
}
