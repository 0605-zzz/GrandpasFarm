const { ccclass, property } = cc._decorator;
import AchievementItem from "./AchievementItem";
import AchievementDetail from "./AchievementDetail";
import { ACHIEVEMENT_CONFIG, AchievementProgress } from "./AchievementData";

@ccclass
export default class IllustratedBook extends cc.Component {

    @property(cc.ScrollView)
    scrollView: cc.ScrollView = null;

    @property(cc.Node)
    contentNode: cc.Node = null;

    // 直接指定路径，不用动态查找
    @property(AchievementDetail)
    detailPanel: AchievementDetail = null;

    @property(cc.Node)
    detailNode: cc.Node = null;

    private _playerAchievements: Map<number, AchievementProgress> = new Map();

    onLoad() {
        this._playerAchievements.set(1001, { id: 1001, currentValue: 1, isUnlocked: true });
        this._playerAchievements.set(1002, { id: 1002, currentValue: 2, isUnlocked: false });

        const closeBtn = this.node.getChildByName('closeBtn');
        if (closeBtn) {
            closeBtn.on(cc.Node.EventType.TOUCH_END, this.close, this);
        }

        this.initList();
    }

    close() {
        this.node.active = false;
    }

    private initList() {
        if (!this.contentNode) return;

        const items = this.contentNode.getComponentsInChildren(AchievementItem);

        ACHIEVEMENT_CONFIG.forEach((config, index) => {
            const itemComp = items[index];
            if (!itemComp) return;

            let progress = this._playerAchievements.get(config.id);
            if (!progress) {
                progress = { id: config.id, currentValue: 0, isUnlocked: false };
            }

            itemComp.init(config, progress, this.onItemClick.bind(this));
        });
    }

    private onItemClick(config, progress) {
        if (this.scrollView) {
            this.scrollView.stopAutoScroll();
        }

        if (this.detailPanel) {
            this.detailPanel.show(config, progress);
        }
        if (this.detailNode) {
            this.detailNode.active = true;
        }
    }

    public closeDetail() {
        if (this.detailNode) {
            this.detailNode.active = false;
        }
    }
}