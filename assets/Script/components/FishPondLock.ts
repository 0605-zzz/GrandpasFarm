// FishPondLock.ts
// 鱼塘锁覆盖层组件：控制显示/隐藏、解锁等级提示

const { ccclass, property } = cc._decorator;

@ccclass
export default class FishPondLock extends cc.Component {

    @property(cc.Node)
    lockNode: cc.Node = null;

    @property(cc.Sprite)
    lockIcon: cc.Sprite = null;

    @property(cc.Label)
    unlockLevelLabel: cc.Label = null;

    @property({ type: cc.Integer, tooltip: "解锁等级" })
    unlockLevel: number = 3;

    @property({ type: cc.Vec2, tooltip: "默认位置（相对父节点）" })
    defaultPosition: cc.Vec2 = new cc.Vec2(0, 0);

    @property({ tooltip: "调试用：是否强制显示" })
    debugShow: boolean = true;

    onLoad() {
        // 自动设置位置
        this.node.setPosition(this.defaultPosition);

        // 设置解锁等级文字
        if (this.unlockLevelLabel) {
            this.unlockLevelLabel.string = `Lv.${this.unlockLevel}解锁`;
        }

        // 检查是否已解锁（Unlock Level = 0 时自动解锁）
        if (this.unlockLevel === 0) {
            this.unlock();
        }
    }

    // 直接显示
    public show() {
        this.node.active = true;
        if (this.lockNode) {
            this.lockNode.active = true;
            this.lockNode.scale = 1;
        }
    }

    // 直接隐藏
    public unlock() {
        this.node.active = false;
        if (this.lockNode) {
            this.lockNode.active = false;
        }
    }

    public checkUnlock(playerLevel: number): boolean {
        if (playerLevel >= this.unlockLevel) {
            this.unlock();
            return true;
        }
        return false;
    }

    private playShowAnim() {
        if (!this.lockNode) return;
        this.lockNode.scale = 0;
        cc.tween(this.lockNode)
            .to(0.3, { scale: 1 }, { easing: "backOut" })
            .start();
    }

    private playHideAnim(callback: Function) {
        if (!this.lockNode) {
            callback();
            return;
        }
        cc.tween(this.lockNode)
            .to(0.2, { scale: 0 })
            .call(() => callback())
            .start();
    }
}