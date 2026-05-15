// TopBar.ts
// 顶部信息栏：头像、用户名、等级、金币、钻石

const { ccclass, property } = cc._decorator;
import GameData from "./GameData";

@ccclass
export default class TopBar extends cc.Component {

    @property(cc.Label)
    usernameLabel: cc.Label = null;

    @property(cc.Label)
    levelLabel: cc.Label = null;

    @property(cc.Label)
    goldLabel: cc.Label = null;

    @property(cc.Label)
    gemLabel: cc.Label = null;

    @property(cc.Sprite)
    avatarSprite: cc.Sprite = null;

    onLoad() {
        this.refreshUI();
        
        // 监听数据变化
        cc.systemEvent.on("ON_GOLD_CHANGED", this.onGoldChanged, this);
        cc.systemEvent.on("ON_LEVEL_UP", this.onLevelUp, this);
    }

    onDestroy() {
        cc.systemEvent.off("ON_GOLD_CHANGED", this.onGoldChanged, this);
        cc.systemEvent.off("ON_LEVEL_UP", this.onLevelUp, this);
    }

    /** 刷新整个UI */
    public refreshUI() {
        const data = GameData.instance.playerData;
        if (this.usernameLabel) this.usernameLabel.string = data.username;
        if (this.levelLabel) this.levelLabel.string = `Lv.${data.level}`;
        if (this.goldLabel) this.goldLabel.string = this.formatNumber(data.gold);
        if (this.gemLabel) this.gemLabel.string = this.formatNumber(data.gem);
    }

    /** 金币变化回调 */
    private onGoldChanged(gold: number) {
        if (this.goldLabel) {
            this.goldLabel.string = this.formatNumber(gold);
        }
    }

    /** 等级提升回调 */
    private onLevelUp(level: number) {
        if (this.levelLabel) {
            this.levelLabel.string = `Lv.${level}`;
        }
    }

    /** 数字格式化（如 300000 -> 300k） */
    private formatNumber(num: number): string {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + "M";
        } else if (num >= 1000) {
            return (num / 1000).toFixed(0) + "k";
        }
        return num.toString();
    }
}
