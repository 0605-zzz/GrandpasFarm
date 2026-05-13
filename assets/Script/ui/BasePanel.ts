// BasePanel.ts
// 面板基类：提供打开/关闭动画、遮罩、通用逻辑

const { ccclass, property } = cc._decorator;

@ccclass
export default class BasePanel extends cc.Component {

    @property(cc.Node)
    maskNode: cc.Node = null;

    @property(cc.Node)
    contentNode: cc.Node = null;

    @property
    closeOnMaskClick: boolean = true;

    onLoad() {
        if (this.maskNode && this.closeOnMaskClick) {
            this.maskNode.on(cc.Node.EventType.TOUCH_END, this.close, this);
        }
    }

    onDestroy() {
        if (this.maskNode && this.closeOnMaskClick) {
            this.maskNode.off(cc.Node.EventType.TOUCH_END, this.close, this);
        }
    }

    /** 打开面板 */
    public open() {
        this.node.active = true;
        if (this.contentNode) {
            this.contentNode.scale = 0;
            cc.tween(this.contentNode)
                .to(0.25, { scale: 1 }, { easing: "backOut" })
                .start();
        }
        if (this.maskNode) {
            this.maskNode.opacity = 0;
            cc.tween(this.maskNode)
                .to(0.2, { opacity: 150 })
                .start();
        }
    }

    /** 关闭面板 */
    public close() {
        if (this.contentNode) {
            cc.tween(this.contentNode)
                .to(0.15, { scale: 0 }, { easing: "backIn" })
                .call(() => {
                    this.node.active = false;
                })
                .start();
        } else {
            this.node.active = false;
        }
    }
}
