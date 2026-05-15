// BottomBar.ts
// 底部导航栏：商店、工具、订单、图鉴、仓库、日记

const { ccclass, property } = cc._decorator;

/** 导航按钮配置 */
export enum TabType {
    SHOP      = 0,
    TOOL      = 1,
    ORDER     = 2,
    ALBUM     = 3,
    WAREHOUSE = 4,
    DIARY     = 5,
}

@ccclass
export default class BottomBar extends cc.Component {

    /** 6个导航按钮节点，在编辑器中按顺序拖入 */
    @property([cc.Node])
    tabButtons: cc.Node[] = [];

    /** 红点节点，与tabButtons一一对应 */
    @property([cc.Node])
    redDots: cc.Node[] = [];

    /** 当前选中的tab */
    private currentTab: TabType = TabType.SHOP;

    onLoad() {
        this.setupButtons();
    }

    private setupButtons() {
        this.tabButtons.forEach((btn, index) => {
            if (!btn) return;
            btn.on(cc.Node.EventType.TOUCH_END, () => {
                this.onTabClick(index);
            }, this);
        });
    }

    /** 点击导航按钮 */
    private onTabClick(index: number) {
        this.currentTab = index as TabType;
        this.updateTabHighlight();

        // 发送事件，让对应面板响应
        cc.systemEvent.emit("ON_TAB_CLICK", index);

        // 播放点击音效（如有）
        // AudioManager.instance.playClick();
    }

    /** 更新选中高亮状态 */
    private updateTabHighlight() {
        this.tabButtons.forEach((btn, index) => {
            if (!btn) return;
            // 选中的按钮放大一点
            const scale = index === this.currentTab ? 1.15 : 1.0;
            cc.tween(btn)
                .to(0.1, { scale: scale })
                .start();
        });
    }

    /** 设置红点显示/隐藏 */
    public setRedDot(tab: TabType, visible: boolean) {
        const dot = this.redDots[tab];
        if (dot) dot.active = visible;
    }

    /** 设置所有红点状态（传入布尔数组） */
    public setAllRedDots(states: boolean[]) {
        states.forEach((state, index) => {
            this.setRedDot(index as TabType, state);
        });
    }
}
