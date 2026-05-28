// RightTopLock.ts
// 右上大锁覆盖层组件：控制显示/隐藏、解锁等级提示

const { ccclass, property } = cc._decorator;

@ccclass
export default class RightTopLock extends cc.Component {

    // ─── 子节点引用（编辑器拖入） ──────────────────────────────

    @property(cc.Node)
    lockNode: cc.Node = null;           // 锁节点容器

    @property(cc.Sprite)
    lockIcon: cc.Sprite = null;         // 大锁图片

    @property(cc.Label)
    unlockLevelLabel: cc.Label = null;  // 解锁等级文字

    // ─── 配置属性（编辑器设置） ──────────────────────────────

    @property({ type: cc.Integer, tooltip: "解锁等级" })
    unlockLevel: number = 5;

    @property({ type: cc.Vec2, tooltip: "默认位置（相对父节点）" })
    defaultPosition: cc.Vec2 = new cc.Vec2(0, 0);

    @property({ tooltip: "调试用：是否强制显示" })
    debugShow: boolean = true;

    // ─── 生命周期 ──────────────────────────────────────────────

    onLoad() {
        // 自动设置位置
        this.node.setPosition(this.defaultPosition);

        // 设置解锁等级文字
        if (this.unlockLevelLabel) {
            this.unlockLevelLabel.string = `Lv.${this.unlockLevel}解锁`;
        }

        if (this.unlockLevel === 0) {
            this.unlock();
        }
    }

    // ─── 公开接口 ──────────────────────────────────────────────

    // 直接显示，不要动画
    public show() {
        this.node.active = true;
        if (this.lockNode) {
            this.lockNode.active = true;
            this.lockNode.scale = 1;  // 直接设为1，不要从0缩过来
        }
    }

    // 直接隐藏，不要动画
    public unlock() {
        this.node.active = false;
        if (this.lockNode) {
            this.lockNode.active = false;
        }
    }

    /** 检查是否达到解锁等级 */
    public checkUnlock(playerLevel: number): boolean {
        if (playerLevel >= this.unlockLevel) {
            this.unlock();
            return true;
        }
        return false;
    }

    // ─── 动画 ──────────────────────────────────────────────

    /** 显示动画 */
    private playShowAnim() {
        if (!this.lockNode) return;
        this.lockNode.scale = 0;
        cc.tween(this.lockNode)
            .to(0.3, { scale: 1 }, { easing: "backOut" })
            .start();
    }

    /** 隐藏动画 */
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