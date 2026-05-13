// PlantSelectPanel.ts
// 种子选择面板：点击空地后弹出选择种子

const { ccclass, property } = cc._decorator;
import BasePanel from "./BasePanel";
import GameManager from "../managers/GameManager";
import { getUnlockedCrops, getCropConfig } from "../data/Config";

@ccclass
export default class PlantSelectPanel extends BasePanel {

    @property(cc.Prefab)
    seedItemPrefab: cc.Prefab = null;

    @property(cc.Node)
    itemContainer: cc.Node = null;

    @property(cc.Label)
    plotInfoLabel: cc.Label = null;

    /** 当前选中的地块ID */
    private currentPlotId: number = -1;

    onEnable() {
        this.refreshUI();
    }

    /** 显示种子选择 */
    public showForPlot(plotId: number) {
        this.currentPlotId = plotId;
        this.refreshUI();
        this.open();
    }

    public refreshUI() {
        const gm = GameManager.instance;
        if (!gm) return;

        if (this.plotInfoLabel) {
            this.plotInfoLabel.string = `选择要种植的种子`;
        }

        if (!this.itemContainer || !this.seedItemPrefab) return;
        this.itemContainer.removeAllChildren();

        const crops = getUnlockedCrops(gm.playerData.level);
        crops.forEach(crop => {
            const item = cc.instantiate(this.seedItemPrefab);
            this.setupSeedItem(item, crop);
            this.itemContainer.addChild(item);
        });
    }

    private setupSeedItem(item: cc.Node, crop: any) {
        const nameLabel = item.getChildByName("NameLabel")?.getComponent(cc.Label);
        const timeLabel = item.getChildByName("TimeLabel")?.getComponent(cc.Label);
        const priceLabel = item.getChildByName("PriceLabel")?.getComponent(cc.Label);
        const iconSprite = item.getChildByName("Icon")?.getComponent(cc.Sprite);
        const selectBtn = item.getChildByName("SelectBtn")?.getComponent(cc.Button);

        if (nameLabel) nameLabel.string = crop.name;
        if (timeLabel) timeLabel.string = `生长: ${this.formatTime(crop.growTime)}`;
        if (priceLabel) priceLabel.string = `${crop.seedPrice}金币`;

        if (iconSprite) {
            cc.resources.load(`sprites/crops/${crop.icon}`, cc.SpriteFrame, (err, sf: cc.SpriteFrame) => {
                if (!err) iconSprite.spriteFrame = sf;
            });
        }

        if (selectBtn) {
            selectBtn.node.on(cc.Node.EventType.TOUCH_END, () => {
                this.onSelectSeed(crop.id);
            }, this);
        }
    }

    private onSelectSeed(cropId: number) {
        const gm = GameManager.instance;
        if (!gm) return;

        const success = gm.plantCrop(this.currentPlotId, cropId);
        if (success) {
            cc.systemEvent.emit("ON_CROP_PLANTED", this.currentPlotId, cropId);
            this.close();
        } else {
            // 提示金币不足或其他原因
            cc.log("种植失败");
        }
    }

    private formatTime(seconds: number): string {
        const m = Math.floor(seconds / 60);
        if (m < 60) return `${m}分钟`;
        const h = Math.floor(m / 60);
        return `${h}小时`;
    }
}
