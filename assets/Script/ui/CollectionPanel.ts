// CollectionPanel.ts
// 图鉴/成就面板：显示玩家已解锁的成就

const { ccclass, property } = cc._decorator;
import BasePanel from "./BasePanel";
import GameManager from "../managers/GameManager";

@ccclass
export default class CollectionPanel extends BasePanel {

    @property(cc.Prefab)
    achievementItemPrefab: cc.Prefab = null;

    @property(cc.Node)
    itemContainer: cc.Node = null;

    @property(cc.Label)
    emptyLabel: cc.Label = null;

    @property(cc.Label)
    progressLabel: cc.Label = null;

    /** 成就配置表 */
    private achievementConfigs = [
        { id: "first_plant", name: "初次种植", description: "完成第一次种植", icon: "ach_plant" },
        { id: "first_harvest", name: "初次收获", description: "完成第一次收获", icon: "ach_harvest" },
        { id: "rich_farmer", name: "小富农", description: "累计获得1000金币", icon: "ach_rich" },
        { id: "level_5", name: "农场新手", description: "等级达到5级", icon: "ach_level" },
        { id: "level_10", name: "农场达人", description: "等级达到10级", icon: "ach_level" },
    ];

    onEnable() {
        this.refreshUI();
        cc.systemEvent.on("ON_ACHIEVEMENT_UNLOCKED", this.refreshUI, this);
    }

    onDisable() {
        cc.systemEvent.off("ON_ACHIEVEMENT_UNLOCKED", this.refreshUI, this);
    }

    public refreshUI() {
        const gm = GameManager.instance;
        if (!gm) return;

        const unlocked = gm.playerData.achievements;
        const total = this.achievementConfigs.length;

        if (this.progressLabel) {
            this.progressLabel.string = `进度: ${unlocked.length}/${total}`;
        }

        if (unlocked.length === 0) {
            if (this.emptyLabel) {
                this.emptyLabel.node.active = true;
                this.emptyLabel.string = "暂无成就\n快去游戏中解锁吧！";
            }
            if (this.itemContainer) this.itemContainer.active = false;
            return;
        }

        if (this.emptyLabel) this.emptyLabel.node.active = false;
        if (this.itemContainer) {
            this.itemContainer.active = true;
            this.itemContainer.removeAllChildren();
        }

        if (!this.achievementItemPrefab || !this.itemContainer) return;

        // 显示已解锁的成就
        this.achievementConfigs.forEach(config => {
            const isUnlocked = unlocked.includes(config.id);
            const item = cc.instantiate(this.achievementItemPrefab);
            this.setupAchievementItem(item, config, isUnlocked);
            this.itemContainer.addChild(item);
        });
    }

    private setupAchievementItem(item: cc.Node, config: any, isUnlocked: boolean) {
        const nameLabel = item.getChildByName("NameLabel")?.getComponent(cc.Label);
        const descLabel = item.getChildByName("DescLabel")?.getComponent(cc.Label);
        const iconSprite = item.getChildByName("Icon")?.getComponent(cc.Sprite);
        const lockMask = item.getChildByName("LockMask");

        if (nameLabel) nameLabel.string = config.name;
        if (descLabel) descLabel.string = config.description;

        if (iconSprite) {
            cc.resources.load(`sprites/achievements/${config.icon}`, cc.SpriteFrame, (err, sf: cc.SpriteFrame) => {
                if (!err) iconSprite.spriteFrame = sf;
            });
        }

        if (lockMask) {
            lockMask.active = !isUnlocked;
        }

        // 未解锁的变灰
        if (!isUnlocked) {
            item.opacity = 128;
        } else {
            item.opacity = 255;
        }
    }
}
