// BottomBar.ts
// 底部导航栏：商店、工具、订单、图鉴、仓库、日记

const { ccclass, property } = cc._decorator;

/** 导航按钮类型 */
export enum TabType {
    SHOP      = 0,
    TOOL      = 1,
    ORDER     = 2,
    COLLECTION = 3,
    WAREHOUSE = 4,
    DIARY     = 5,
}

@ccclass
export default class BottomBar extends cc.Component {

    @property([cc.Node])
    tabButtons: cc.Node[] = [];

    @property([cc.Node])
    redDots: cc.Node[] = [];

    @property([cc.Label])
    tabLabels: cc.Label[] = [];

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

    private onTabClick(index: number) {
        this.currentTab = index as TabType;
        this.updateTabHighlight();
        cc.systemEvent.emit("ON_TAB_CLICK", index);
    }

    private updateTabHighlight() {
        this.tabButtons.forEach((btn, index) => {
            if (!btn) return;
            const isSelected = index === this.currentTab;
            const scale = isSelected ? 1.15 : 1.0;
            cc.tween(btn)
                .to(0.1, { scale: scale })
                .start();

            // 更新标签颜色
            if (this.tabLabels[index]) {
                this.tabLabels[index].node.color = isSelected ? cc.Color.YELLOW : cc.Color.WHITE;
            }
        });
    }

    public setRedDot(tab: TabType, visible: boolean) {
        const dot = this.redDots[tab];
        if (dot) dot.active = visible;
    }

    public setAllRedDots(states: boolean[]) {
        states.forEach((state, index) => {
            this.setRedDot(index as TabType, state);
        });
    }
}
