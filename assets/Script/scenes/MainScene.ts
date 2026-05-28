// MainScene.ts
// 游戏主场景：纯农场游戏界面
// 所有加载/登录逻辑已在 LoginScene 完成

const { ccclass, property } = cc._decorator;
import GameManager from "../managers/GameManager";
import CropPlot from "../components/CropPlot";
import { PLOT_CONFIG } from "../data/Config";

@ccclass
export default class MainScene extends cc.Component {

    // ═══════════════════════════════════════════════════════════
    //  游戏层节点
    // ═══════════════════════════════════════════════════════════

    @property(cc.Node)
    plotsContainer: cc.Node = null;   // 拖入 PlotsContainer（包含7个地块+RightTopLock）

    // ═══════════════════════════════════════════════════════════
    //  UI 层节点
    // ═══════════════════════════════════════════════════════════

    @property(cc.Node)
    topBarNode: cc.Node = null;

    @property(cc.Node)
    bottomBarNode: cc.Node = null;

    // ─── 面板节点 ──────────────────────────────────────────────

    @property(cc.Node)
    shopPanel: cc.Node = null;

    @property(cc.Node)
    toolPanel: cc.Node = null;

    @property(cc.Node)
    orderPanel: cc.Node = null;

    @property(cc.Node)
    collectionPanel: cc.Node = null;

    @property(cc.Node)
    warehousePanel: cc.Node = null;

    @property(cc.Node)
    diaryPanel: cc.Node = null;

    @property(cc.Node)
    plantSelectPanel: cc.Node = null;

    @property(cc.Node)
    unlockConfirmPanel: cc.Node = null;

    // ═══════════════════════════════════════════════════════════
    //  点击区域节点（养殖场、鱼塘、钻石、头像）
    // ═══════════════════════════════════════════════════════════

    @property(cc.Node)
    farmArea: cc.Node = null;    // 养殖场

    @property(cc.Node)
    pondArea: cc.Node = null;    // 鱼塘

    @property(cc.Node)
    diamondBtn: cc.Node = null;  // 右上角钻石

    @property(cc.Node)
    avatarBtn: cc.Node = null;   // 左上角头像

    // ═══════════════════════════════════════════════════════════
    //  内部状态
    // ═══════════════════════════════════════════════════════════

    private panels: cc.Node[] = [];
    private plotComponents: CropPlot[] = [];

    // ═══════════════════════════════════════════════════════════
    //  生命周期
    // ═══════════════════════════════════════════════════════════

    onLoad() {
        // 初始化面板数组
        this.panels = [
            this.shopPanel,
            this.toolPanel,
            this.orderPanel,
            this.collectionPanel,
            this.warehousePanel,
            this.diaryPanel,
        ];

        // 注册事件监听
        this.registerEvents();
    }

    start() {
        // 初始化农场
        this.initPlots();
        this.hideAllPanels();
    }

    onDestroy() {
        this.unregisterEvents();
    }

    // ═══════════════════════════════════════════════════════════
    //  事件注册/注销
    // ═══════════════════════════════════════════════════════════

    private registerEvents() {
        cc.systemEvent.on("ON_TAB_CLICK", this.onTabClick, this);
        cc.systemEvent.on("ON_PLOT_CLICK_EMPTY", this.onPlotClickEmpty, this);
        cc.systemEvent.on("ON_PLOT_CLICK_LOCKED", this.onPlotClickLocked, this);
        cc.systemEvent.on("ON_PLOT_UNLOCKED", this.onPlotUnlocked, this);
        cc.systemEvent.on("ON_CROP_PLANTED", this.onCropPlanted, this);
        cc.systemEvent.on("ON_CROP_HARVESTED", this.onCropHarvested, this);
        cc.systemEvent.on("ON_SEED_SELECTED", this.onSeedSelected, this);

        // 主页点击区域事件
        this.setupAreaClickEvents();
    }

    private unregisterEvents() {
        cc.systemEvent.off("ON_TAB_CLICK", this.onTabClick, this);
        cc.systemEvent.off("ON_PLOT_CLICK_EMPTY", this.onPlotClickEmpty, this);
        cc.systemEvent.off("ON_PLOT_CLICK_LOCKED", this.onPlotClickLocked, this);
        cc.systemEvent.off("ON_PLOT_UNLOCKED", this.onPlotUnlocked, this);
        cc.systemEvent.off("ON_CROP_PLANTED", this.onCropPlanted, this);
        cc.systemEvent.off("ON_CROP_HARVESTED", this.onCropHarvested, this);
        cc.systemEvent.off("ON_SEED_SELECTED", this.onSeedSelected, this);
    }

    // ═══════════════════════════════════════════════════════════
    //  点击区域事件处理
    // ═══════════════════════════════════════════════════════════

    /** 设置点击区域事件 */
    private setupAreaClickEvents() {
        // 养殖场点击
        if (this.farmArea) {
            this.farmArea.on(cc.Node.EventType.TOUCH_END, this.onFarmClick, this);
        }
        // 鱼塘点击
        if (this.pondArea) {
            this.pondArea.on(cc.Node.EventType.TOUCH_END, this.onPondClick, this);
        }
        // 钻石点击
        if (this.diamondBtn) {
            this.diamondBtn.on(cc.Node.EventType.TOUCH_END, this.onDiamondClick, this);
        }
        // 头像点击
        if (this.avatarBtn) {
            this.avatarBtn.on(cc.Node.EventType.TOUCH_END, this.onAvatarClick, this);
        }
    }

    /** 养殖场点击 */
    private onFarmClick() {
        const gm = GameManager.instance;
        if (!gm) return;

        // TODO: 后续添加养殖场解锁逻辑
        // 目前默认解锁
        cc.log("打开养殖场");
        // TODO: 打开养殖场面板
    }

    /** 鱼塘点击 */
    private onPondClick() {
        const gm = GameManager.instance;
        if (!gm) return;

        // TODO: 后续添加鱼塘解锁逻辑
        // 目前默认解锁
        cc.log("打开鱼塘");
        // TODO: 打开鱼塘面板
    }

    /** 钻石点击 */
    private onDiamondClick() {
        cc.log("打开钻石商店");
        // TODO: 打开钻石购买面板
    }

    /** 头像点击 */
    private onAvatarClick() {
        cc.log("打开用户信息面板");
        // TODO: 打开用户信息/设置面板
    }

    // ═══════════════════════════════════════════════════════════
    //  地块初始化 —— 适配手动摆放的节点（PlotaContainer 下）
    // ═══════════════════════════════════════════════════════════

    private initPlots() {
        const gm = GameManager.instance;
        if (!gm) return;

        this.plotComponents = [];

        if (!this.plotsContainer) {
            cc.error("PlotsContainer 未设置，请在编辑器中拖入");
            return;
        }

        // 遍历 PlotsContainer 下的所有子节点
        this.plotsContainer.children.forEach(child => {
            // 跳过 RightTopLock（它不是地块）
            if (child.name === "RightTopLock") return;

            const plotComp = child.getComponent(CropPlot);
            if (plotComp) {
                // 如果编辑器里 plotId 没设置（默认-1），用配置初始化
                const cfg = PLOT_CONFIG.find(c => c.id === plotComp.plotId);
                if (cfg && plotComp.plotId === -1) {
                    plotComp.init(cfg.id, cfg.unlockLevel);
                }
                this.plotComponents.push(plotComp);
            }
        });

        cc.log(`地块初始化完成，共 ${this.plotComponents.length} 个地块`);
    }

    // ═══════════════════════════════════════════════════════════
    //  面板管理
    // ═══════════════════════════════════════════════════════════

    private onTabClick(tabIndex: number) {
        this.hideAllPanels();
        const panel = this.panels[tabIndex];
        if (panel) {
            panel.active = true;
            const basePanel = panel.getComponent("BasePanel");
            if (basePanel && basePanel.open) {
                basePanel.open();
            }
        }
    }

    private hideAllPanels() {
        this.panels.forEach(p => {
            if (p) p.active = false;
        });
        if (this.plantSelectPanel) this.plantSelectPanel.active = false;
        if (this.unlockConfirmPanel) this.unlockConfirmPanel.active = false;
    }

    // ═══════════════════════════════════════════════════════════
    //  地块事件处理
    // ═══════════════════════════════════════════════════════════

    private onPlotClickEmpty(plotId: number) {
        cc.log(`点击空地: ${plotId}`);
        if (this.plantSelectPanel) {
            const panel = this.plantSelectPanel.getComponent("PlantSelectPanel");
            if (panel && panel.showForPlot) {
                panel.showForPlot(plotId);
            } else {
                this.plantSelectPanel.active = true;
            }
        }
    }

    private onPlotClickLocked(plotId: number) {
        cc.log(`点击锁定地块: ${plotId}`);
        if (this.unlockConfirmPanel) {
            const panel = this.unlockConfirmPanel.getComponent("UnlockConfirmPanel");
            if (panel && panel.showUnlock) {
                panel.showUnlock(plotId);
            } else {
                this.unlockConfirmPanel.active = true;
            }
        }
    }

    private onPlotUnlocked(plotId: number) {
        cc.log(`地块解锁: ${plotId}`);
        const plotComp = this.plotComponents.find(p => p.plotId === plotId);
        if (plotComp) {
            plotComp.refreshFromData();
        }
    }

    private onCropPlanted(plotId: number, cropId: number) {
        cc.log(`种植作物: plot=${plotId}, crop=${cropId}`);
        const plotComp = this.plotComponents.find(p => p.plotId === plotId);
        if (plotComp) {
            plotComp.refreshFromData();
        }
    }

    private onCropHarvested(plotId: number, cropId: number, gold: number, exp: number) {
        cc.log(`收获作物: plot=${plotId}, crop=${cropId}, gold=${gold}, exp=${exp}`);
        const plotComp = this.plotComponents.find(p => p.plotId === plotId);
        if (plotComp) {
            plotComp.refreshFromData();
        }
    }

    private onSeedSelected(cropId: number) {
        cc.log(`选择种子: ${cropId}`);
    }
}