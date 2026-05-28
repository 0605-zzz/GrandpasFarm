const { ccclass, property } = cc._decorator;
import { AchievementConfig, AchievementProgress } from "./AchievementData";

@ccclass
export default class AchievementItem extends cc.Component {

    @property(cc.Sprite)
    iconSprite: cc.Sprite = null;

    @property(cc.Node)
    lockMask: cc.Node = null;

    private _config: AchievementConfig = null;
    private _progress: AchievementProgress = null;
    private _callback: Function = null;

    public init(config: AchievementConfig, progress: AchievementProgress, callback: Function) {
        this._config = config;
        this._progress = progress;
        this._callback = callback;

        this.loadIcon(config);
        this.updateUnlockState(progress.isUnlocked);
    }

    private loadIcon(config: AchievementConfig) {
        if (!this.iconSprite) return;

        cc.resources.load(config.iconPath, cc.SpriteFrame, (err, sf) => {
            if (!err && this.iconSprite) {
                this.iconSprite.spriteFrame = sf;
                // 图标加载完成后再次应用变灰
                this.updateUnlockState(this._progress ? this._progress.isUnlocked : false);
            } else if (err) {
                console.error("加载成就图标失败:", config.iconPath, err);
            }
        });
    }

    private updateUnlockState(unlocked: boolean) {
        // 图标变灰
        if (this.iconSprite) {
            if (unlocked) {
                this.iconSprite.setState(cc.Sprite.State.NORMAL);
                this.iconSprite.node.color = cc.Color.WHITE;
            } else {
                this.iconSprite.setState(cc.Sprite.State.GRAY);
                this.iconSprite.node.color = new cc.Color(67, 64, 69);
            }
        }

        // lockMask 显示/隐藏
        if (this.lockMask) {
            this.lockMask.active = !unlocked;
        }

        // 整体透明度
        this.node.opacity = unlocked ? 255 : 200;
    }

    onLoad() {
        this.node.on(cc.Node.EventType.TOUCH_END, this.onClick, this);
    }

    onDestroy() {
        this.node.off(cc.Node.EventType.TOUCH_END, this.onClick, this);
    }

    private onClick() {
        if (this._callback) {
            this._callback(this._config, this._progress);
        }
    }
}