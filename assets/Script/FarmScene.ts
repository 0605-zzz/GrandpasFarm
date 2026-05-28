// FarmScene.ts
// 农场主场景控制器：初始化各系统、处理全局事件

const { ccclass, property } = cc._decorator;
import GameData from "./GameData";
import TopBar from "./ui/TopBar";
import BottomBar, { TabType } from "./ui/BottomBar";

@ccclass
export default class FarmScene extends cc.Component {

    // ─── 子系统引用（编辑器拖入） ──────────────────────────────

    @property(TopBar)
    topBar: TopBar = null;

    @property(BottomBar)
    bottomBar: BottomBar = null;

    // ─── 面板节点（编辑器拖入） ────────────────────────────────

    @property(cc.Node)
    shopPanel: cc.Node = null;

    @property(cc.Node)
    toolPanel: cc.Node = null;

    @property(cc.Node)
    orderPanel: cc.Node = null;

    @property(cc.Node)
    albumPanel: cc.Node = null;

    @property(cc.Node)
    warehousePanel: cc.Node = null;

    @property(cc.Node)
    diaryPanel: cc.Node = null;

    /** 所有面板，顺序与 TabType 枚举一致 */
    private panels: cc.Node[] = [];

    onLoad() {
        this.panels = [
            this.shopPanel,
            this.toolPanel,
            this.orderPanel,
            this.albumPanel,
            this.warehousePanel,
            this.diaryPanel,
        ];

        // 监听底部导航点击
        cc.systemEvent.on("ON_TAB_CLICK", this.onTabClick, this);

        // 监听地块事件
        cc.systemEvent.on("ON_PLOT_CLICK_EMPTY", this.onPlotClickEmpty, this);
        cc.systemEvent.on("ON_CROP_HARVESTED", this.onCropHarvested, this);
        cc.systemEvent.on("ON_PLOT_CLICK_LOCKED", this.onPlotClickLocked, this);
    }

    onDestroy() {
        cc.systemEvent.off("ON_TAB_CLICK", this.onTabClick, this);
        cc.systemEvent.off("ON_PLOT_CLICK_EMPTY", this.onPlotClickEmpty, this);
        cc.systemEvent.off("ON_CROP_HARVESTED", this.onCropHarvested, this);
        cc.systemEvent.off("ON_PLOT_CLICK_LOCKED", this.onPlotClickLocked, this);
    }

    start() {
        // 初始化时关闭所有面板
        this.hideAllPanels();

        // 刷新顶部栏
        if (this.topBar) this.topBar.refreshUI();

        // 初始化红点（示例：商店和订单有新内容）
        if (this.bottomBar) {
            this.bottomBar.setAllRedDots([true, false, true, false, false, false]);
        }
    }

    // ─── 底部导航 ──────────────────────────────────────────────

    private onTabClick(tabIndex: number) {
        this.hideAllPanels();
        const panel = this.panels[tabIndex];
        if (panel) {
            panel.active = true;
            this.playPanelOpenAnim(panel);
        }
    }

    private hideAllPanels() {
        this.panels.forEach(p => {
            if (p) p.active = false;
        });
    }

    /** 面板弹出动画 */
    private playPanelOpenAnim(panel: cc.Node) {
        panel.y = -200;
        cc.tween(panel)
            .to(0.25, { y: 0 }, { easing: "backOut" })
            .start();
    }

    // ─── 地块事件 ──────────────────────────────────────────────

    private onPlotClickEmpty(plot: any) {
        // TODO: 打开背包/种子选择面板
        cc.log("点击了空地块，打开种子选择");
    }

    private onCropHarvested(cropId: number) {
        // 收获后给经验和金币
        const data = GameData.instance;
        data.addGold(10);
        data.addExp(5);
        cc.log(`收获了作物 id=${cropId}，获得金币10，经验5`);
    }

    private onPlotClickLocked(plot: any) {
        // TODO: 显示解锁提示弹窗
        cc.log("点击了锁定地块，显示解锁条件");
    }
}
