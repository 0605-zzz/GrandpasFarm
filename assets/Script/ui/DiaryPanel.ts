// DiaryPanel.ts
// 日记面板：显示玩家的日记记录

const { ccclass, property } = cc._decorator;
import BasePanel from "./BasePanel";
import GameManager from "../managers/GameManager";

@ccclass
export default class DiaryPanel extends BasePanel {

    @property(cc.Prefab)
    diaryItemPrefab: cc.Prefab = null;

    @property(cc.Node)
    itemContainer: cc.Node = null;

    @property(cc.Label)
    emptyLabel: cc.Label = null;

    onEnable() {
        this.refreshUI();
        cc.systemEvent.on("ON_DIARY_CHANGED", this.refreshUI, this);
    }

    onDisable() {
        cc.systemEvent.off("ON_DIARY_CHANGED", this.refreshUI, this);
    }

    public refreshUI() {
        const gm = GameManager.instance;
        if (!gm) return;

        const diary = gm.playerData.diary;

        if (diary.length === 0) {
            if (this.emptyLabel) {
                this.emptyLabel.node.active = true;
                this.emptyLabel.string = "日记本还是空的\n农场生活即将开始...";
            }
            if (this.itemContainer) this.itemContainer.active = false;
            return;
        }

        if (this.emptyLabel) this.emptyLabel.node.active = false;
        if (this.itemContainer) {
            this.itemContainer.active = true;
            this.itemContainer.removeAllChildren();
        }

        if (!this.diaryItemPrefab || !this.itemContainer) return;

        // 按时间倒序显示
        [...diary].reverse().forEach(entry => {
            const item = cc.instantiate(this.diaryItemPrefab);
            this.setupDiaryItem(item, entry);
            this.itemContainer.addChild(item);
        });
    }

    private setupDiaryItem(item: cc.Node, entry: any) {
        const titleLabel = item.getChildByName("TitleLabel")?.getComponent(cc.Label);
        const dateLabel = item.getChildByName("DateLabel")?.getComponent(cc.Label);
        const contentLabel = item.getChildByName("ContentLabel")?.getComponent(cc.Label);
        const newMark = item.getChildByName("NewMark");

        if (titleLabel) titleLabel.string = entry.title;
        if (dateLabel) dateLabel.string = entry.date;
        if (contentLabel) contentLabel.string = entry.content;
        if (newMark) newMark.active = !entry.isRead;
    }
}
