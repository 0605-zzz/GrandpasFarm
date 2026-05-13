// ShopPanel.ts
// 商店面板：购买种子

const { ccclass, property } = cc._decorator;
import BasePanel from "./BasePanel";
import GameManager from "../managers/GameManager";
import { getUnlockedCrops, getCropConfig } from "../data/Config";

@ccclass
export default class ShopPanel extends BasePanel {

    @property(cc.Prefab)
    shopItemPrefab: cc.Prefab = null;

    @property(cc.Node)
    itemContainer: cc.Node = null;

    @property(cc.Label)
    goldLabel: cc.Label = null;

    onLoad() {
        super.onLoad();
        cc.systemEvent.on("ON_GOLD_CHANGED", this.onGoldChanged, this);
    }

    onDestroy() {
        super.onDestroy();
        cc.systemEvent.off("ON_GOLD_CHANGED", this.onGoldChanged, this);
    }

    onEnable() {
        this.refreshUI();
    }

    private onGoldChanged(gold: number) {
        if (this.goldLabel) {
            this.goldLabel.string = gold.toString();
        }
    }

    public refreshUI() {
        const gm = GameManager.instance;
        if (!gm) return;

        if (this.goldLabel) {
            this.goldLabel.string = gm.playerData.gold.toString();
        }

        if (!this.itemContainer || !this.shopItemPrefab) return;

        // 清空容器
        this.itemContainer.removeAllChildren();

        // 获取已解锁作物
        const crops = getUnlockedCrops(gm.playerData.level);
        crops.forEach(crop => {
            const item = cc.instantiate(this.shopItemPrefab);
            this.setupShopItem(item, crop);
            this.itemContainer.addChild(item);
        });
    }

    private setupShopItem(item: cc.Node, crop: any) {
        const nameLabel = item.getChildByName("NameLabel")?.getComponent(cc.Label);
        const priceLabel = item.getChildByName("PriceLabel")?.getComponent(cc.Label);
        const iconSprite = item.getChildByName("Icon")?.getComponent(cc.Sprite);
        const buyBtn = item.getChildByName("BuyBtn")?.getComponent(cc.Button);

        if (nameLabel) nameLabel.string = crop.name;
        if (priceLabel) priceLabel.string = `${crop.seedPrice}金币`;

        // 加载图标
        if (iconSprite) {
            cc.resources.load(`sprites/crops/${crop.icon}`, cc.SpriteFrame, (err, sf: cc.SpriteFrame) => {
                if (!err) iconSprite.spriteFrame = sf;
            });
        }

        // 购买按钮
        if (buyBtn) {
            buyBtn.node.on(cc.Node.EventType.TOUCH_END, () => {
                this.onBuySeed(crop.id);
            }, this);
        }
    }

    private onBuySeed(cropId: number) {
        const gm = GameManager.instance;
        if (!gm) return;

        const config = getCropConfig(cropId);
        if (!config) return;

        // 这里简化处理：直接选择种子去种植
        // 实际应该打开地块选择或放入背包
        cc.systemEvent.emit("ON_SEED_SELECTED", cropId);
        this.close();
    }
}
