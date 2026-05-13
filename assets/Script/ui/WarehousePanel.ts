// WarehousePanel.ts
// 仓库面板：显示玩家拥有的物品

const { ccclass, property } = cc._decorator;
import BasePanel from "./BasePanel";
import GameManager from "../managers/GameManager";
import { getCropConfig } from "../data/Config";

@ccclass
export default class WarehousePanel extends BasePanel {

    @property(cc.Prefab)
    warehouseItemPrefab: cc.Prefab = null;

    @property(cc.Node)
    itemContainer: cc.Node = null;

    @property(cc.Label)
    emptyLabel: cc.Label = null;

    onEnable() {
        this.refreshUI();
        cc.systemEvent.on("ON_WAREHOUSE_CHANGED", this.refreshUI, this);
    }

    onDisable() {
        cc.systemEvent.off("ON_WAREHOUSE_CHANGED", this.refreshUI, this);
    }

    public refreshUI() {
        const gm = GameManager.instance;
        if (!gm) return;

        const warehouse = gm.playerData.warehouse;

        if (warehouse.length === 0) {
            if (this.emptyLabel) {
                this.emptyLabel.node.active = true;
                this.emptyLabel.string = "仓库空空如也\n快去种植作物吧！";
            }
            if (this.itemContainer) this.itemContainer.active = false;
            return;
        }

        if (this.emptyLabel) this.emptyLabel.node.active = false;
        if (this.itemContainer) {
            this.itemContainer.active = true;
            this.itemContainer.removeAllChildren();
        }

        if (!this.warehouseItemPrefab || !this.itemContainer) return;

        warehouse.forEach(item => {
            const node = cc.instantiate(this.warehouseItemPrefab);
            this.setupWarehouseItem(node, item);
            this.itemContainer.addChild(node);
        });
    }

    private setupWarehouseItem(item: cc.Node, warehouseItem: any) {
        const nameLabel = item.getChildByName("NameLabel")?.getComponent(cc.Label);
        const countLabel = item.getChildByName("CountLabel")?.getComponent(cc.Label);
        const iconSprite = item.getChildByName("Icon")?.getComponent(cc.Sprite);

        const config = getCropConfig(warehouseItem.itemId);
        const name = config ? config.name : "未知物品";
        const icon = config ? config.icon : "unknown";

        if (nameLabel) nameLabel.string = name;
        if (countLabel) countLabel.string = `x${warehouseItem.count}`;

        if (iconSprite) {
            cc.resources.load(`sprites/crops/${icon}`, cc.SpriteFrame, (err, sf: cc.SpriteFrame) => {
                if (!err) iconSprite.spriteFrame = sf;
            });
        }
    }
}
