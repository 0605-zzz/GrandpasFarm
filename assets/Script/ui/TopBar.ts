// TopBar.ts
// 顶部信息栏：头像、用户名、等级、金币、钻石

const { ccclass, property } = cc._decorator;
import GameManager from "../managers/GameManager";

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

    @property(cc.Node)
    expBar: cc.Node = null;

    @property(cc.Label)
    expLabel: cc.Label = null;

    onLoad() {
        this.refreshUI();
        cc.systemEvent.on("ON_GOLD_CHANGED", this.onGoldChanged, this);
        cc.systemEvent.on("ON_GEM_CHANGED", this.onGemChanged, this);
        cc.systemEvent.on("ON_EXP_CHANGED", this.onExpChanged, this);
        cc.systemEvent.on("ON_LEVEL_UP", this.onLevelUp, this);
        cc.systemEvent.on("ON_DATA_INIT", this.refreshUI, this);
    }

    onDestroy() {
        cc.systemEvent.off("ON_GOLD_CHANGED", this.onGoldChanged, this);
        cc.systemEvent.off("ON_GEM_CHANGED", this.onGemChanged, this);
        cc.systemEvent.off("ON_EXP_CHANGED", this.onExpChanged, this);
        cc.systemEvent.off("ON_LEVEL_UP", this.onLevelUp, this);
        cc.systemEvent.off("ON_DATA_INIT", this.refreshUI, this);
    }

    /** 刷新整个UI */
    public refreshUI() {
        const gm = GameManager.instance;
        if (!gm) return;
        const data = gm.playerData;

        if (this.usernameLabel) this.usernameLabel.string = data.username;
        if (this.levelLabel) this.levelLabel.string = `Lv.${data.level}`;
        if (this.goldLabel) this.goldLabel.string = this.formatNumber(data.gold);
        if (this.gemLabel) this.gemLabel.string = this.formatNumber(data.gem);

        // 经验条
        if (this.expBar) {
            const needed = data.level * 100;
            const progress = data.exp / needed;
            this.expBar.getComponent(cc.ProgressBar).progress = progress;
        }
        if (this.expLabel) {
            const needed = data.level * 100;
            this.expLabel.string = `${data.exp}/${needed}`;
        }

        // 加载头像
        if (this.avatarSprite && data.avatarUrl) {
            cc.assetManager.loadRemote(data.avatarUrl, (err, texture: cc.Texture2D) => {
                if (!err && this.avatarSprite) {
                    const spriteFrame = new cc.SpriteFrame(texture);
                    this.avatarSprite.spriteFrame = spriteFrame;
                }
            });
        }
    }

    private onGoldChanged(gold: number) {
        if (this.goldLabel) {
            this.goldLabel.string = this.formatNumber(gold);
        }
    }

    private onGemChanged(gem: number) {
        if (this.gemLabel) {
            this.gemLabel.string = this.formatNumber(gem);
        }
    }

    private onExpChanged(exp: number) {
        const gm = GameManager.instance;
        if (!gm) return;
        const needed = gm.playerData.level * 100;
        if (this.expBar) {
            this.expBar.getComponent(cc.ProgressBar).progress = exp / needed;
        }
        if (this.expLabel) {
            this.expLabel.string = `${exp}/${needed}`;
        }
    }

    private onLevelUp(level: number) {
        if (this.levelLabel) {
            this.levelLabel.string = `Lv.${level}`;
        }
        // 播放升级特效
        cc.log(`恭喜升级到 Lv.${level}!`);
    }

    private formatNumber(num: number): string {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + "M";
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + "k";
        }
        return num.toString();
    }
}
