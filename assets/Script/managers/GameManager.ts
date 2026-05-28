// GameManager.ts
// 游戏核心管理器：统筹数据、存档、地块、经济系统

const { ccclass, property } = cc._decorator;
import {
    PlayerData, PlotData, WarehouseItem, OrderData, DiaryEntry,
    DEFAULT_PLAYER
} from "../data/GameDataTypes";
import { CROP_CONFIG, PLOT_CONFIG, expNeeded, getCropConfig } from "../data/Config";
import CloudSaveManager from "./CloudSaveManager";
import WXUtil from "../utils/WXUtil";

@ccclass
export default class GameManager extends cc.Component {

    private static _instance: GameManager = null;
    public static get instance(): GameManager {
        return GameManager._instance;
    }

    /** 玩家数据 */
    public playerData: PlayerData = { ...DEFAULT_PLAYER };
    /** 是否已登录 */
    public isLoggedIn: boolean = false;
    /** 自动存档计时器 */
    private autoSaveTimer: number = 0;

    onLoad() {
        if (GameManager._instance) {
            this.node.destroy();
            return;
        }
        GameManager._instance = this;
        cc.game.addPersistRootNode(this.node);
    }

    // ─── 初始化 ────────────────────────────────────────────────

    /** 初始化新玩家数据 */
    public initNewPlayer(uid: string, nickname: string, avatarUrl: string) {
        this.playerData = {
            ...DEFAULT_PLAYER,
            uid: uid,
            username: nickname,
            avatarUrl: avatarUrl,
            lastLoginTime: Date.now(),
            plots: this.initPlots(),
            warehouse: [],
            orders: [],
            achievements: [],
            diary: [],
        };
        this.isLoggedIn = true;
        this.saveLocal();
        cc.systemEvent.emit("ON_DATA_INIT");
    }

    /** 初始化地块数据 */
    private initPlots(): PlotData[] {
        return PLOT_CONFIG.map(cfg => ({
            id: cfg.id,
            isUnlocked: cfg.unlockLevel === 1 && cfg.unlockCost === 0,
            unlockLevel: cfg.unlockLevel,
            unlockCost: cfg.unlockCost,
            cropId: null,
            plantTime: 0,
            growthStage: 0,
        }));
    }

    /** 加载存档（先尝试云端，再回退本地） */
    public async loadSave(): Promise<boolean> {
        // 先尝试云端读档
        if (CloudSaveManager.instance) {
            const cloudData = await CloudSaveManager.instance.loadFromCloud();
            if (cloudData) {
                this.playerData = cloudData;
                this.processOfflineGrowth();
                this.isLoggedIn = true;
                cc.systemEvent.emit("ON_DATA_INIT");
                return true;
            }
        }
        // 回退本地存档
        const localData = WXUtil.getStorage<PlayerData>("playerData");
        if (localData) {
            this.playerData = localData;
            this.processOfflineGrowth();
            this.isLoggedIn = true;
            cc.systemEvent.emit("ON_DATA_INIT");
            return true;
        }
        return false;
    }

    /** 处理离线生长 */
    private processOfflineGrowth() {
        const now = Date.now();
        const offlineTime = (now - this.playerData.lastLoginTime) / 1000;
        if (offlineTime <= 0) return;

        cc.log(`离线时长: ${offlineTime}秒`);

        this.playerData.plots.forEach(plot => {
            if (plot.cropId !== null && plot.growthStage < 3) {
                const config = getCropConfig(plot.cropId);
                if (config) {
                    const totalGrowthTime = config.growTime;
                    const elapsedSincePlant = (now / 1000) - plot.plantTime;
                    const progress = Math.min(elapsedSincePlant / totalGrowthTime, 1);
                    plot.growthStage = Math.floor(progress * 3);
                    if (plot.growthStage > 3) plot.growthStage = 3;
                }
            }
        });

        this.playerData.lastLoginTime = now;
    }

    // ─── 存档 ──────────────────────────────────────────────────

    /** 保存到本地 */
    public saveLocal() {
        this.playerData.lastSaveTime = Date.now();
        WXUtil.setStorage("playerData", this.playerData);
    }

    /** 保存到云端 */
    public async saveCloud(): Promise<boolean> {
        if (CloudSaveManager.instance) {
            return await CloudSaveManager.instance.saveToCloud(this.playerData);
        }
        return false;
    }

    /** 立即存档（本地+云端） */
    public async saveNow() {
        this.saveLocal();
        await this.saveCloud();
    }

    // ─── 金币操作 ─────────────────────────────────────────────

    public addGold(amount: number) {
        this.playerData.gold += amount;
        this.saveLocal();
        cc.systemEvent.emit("ON_GOLD_CHANGED", this.playerData.gold);
    }

    public spendGold(amount: number): boolean {
        if (this.playerData.gold < amount) return false;
        this.playerData.gold -= amount;
        this.saveLocal();
        cc.systemEvent.emit("ON_GOLD_CHANGED", this.playerData.gold);
        return true;
    }

    // ─── 钻石操作 ─────────────────────────────────────────────

    public addGem(amount: number) {
        this.playerData.gem += amount;
        this.saveLocal();
        cc.systemEvent.emit("ON_GEM_CHANGED", this.playerData.gem);
    }

    public spendGem(amount: number): boolean {
        if (this.playerData.gem < amount) return false;
        this.playerData.gem -= amount;
        this.saveLocal();
        cc.systemEvent.emit("ON_GEM_CHANGED", this.playerData.gem);
        return true;
    }

    // ─── 经验/等级 ────────────────────────────────────────────

    public addExp(amount: number) {
        this.playerData.exp += amount;
        const needed = expNeeded(this.playerData.level);
        
        let levelUp = false;
        while (this.playerData.exp >= needed) {
            this.playerData.exp -= needed;
            this.playerData.level++;
            levelUp = true;
            cc.systemEvent.emit("ON_LEVEL_UP", this.playerData.level);
        }
        
        this.saveLocal();
        cc.systemEvent.emit("ON_EXP_CHANGED", this.playerData.exp);
        
        // 升级后检查解锁
        if (levelUp) {
            this.checkUnlocks();
        }
    }

    // ─── 解锁检查 ─────────────────────────────────────────────

    /** 检查所有可解锁内容（升级后调用） */
    private checkUnlocks() {
        // 检查右上大锁
        this.checkRightTopUnlock();
        
        // 检查鱼塘锁
        this.checkFishPondUnlocks();
        
        // 检查小土地解锁
        this.playerData.plots.forEach(plot => {
            if (!plot.isUnlocked && this.playerData.level >= plot.unlockLevel) {
                cc.systemEvent.emit("ON_PLOT_CAN_UNLOCK", plot.id);
            }
        });
    }

    /** 检查右上大锁解锁 */
    private checkRightTopUnlock() {
        const rightTopLock = cc.find("Canvas/PlotsContainer/RightTopLock");
        if (!rightTopLock) return;
        
        const lockComp = rightTopLock.getComponent("RightTopLock");
        if (!lockComp) return;
        
        lockComp.checkUnlock(this.playerData.level);
    }

    /** 手动触发检查右上大锁（比如点击时） */
    public tryUnlockRightTop(): boolean {
        return this.checkRightTopUnlockByLevel(this.playerData.level);
    }

    /** 根据等级检查右上大锁 */
    private checkRightTopUnlockByLevel(level: number): boolean {
        const rightTopLock = cc.find("Canvas/PlotsContainer/RightTopLock");
        if (!rightTopLock) return false;
        
        const lockComp = rightTopLock.getComponent("RightTopLock");
        if (!lockComp) return false;
        
        return lockComp.checkUnlock(level);
    }

    /** 检查鱼塘锁解锁 */
    private checkFishPondUnlocks() {
        const fishPondContainer = cc.find("Canvas/FishPondContainer");
        if (!fishPondContainer) return;
        
        fishPondContainer.children.forEach(child => {
            const lockComp = child.getComponent("FishPondLock");
            if (lockComp) {
                lockComp.checkUnlock(this.playerData.level);
            }
        });
    }

    /** 手动触发检查鱼塘锁（比如点击时） */
    public tryUnlockFishPond(): boolean {
        return this.checkFishPondUnlocksByLevel(this.playerData.level);
    }

    /** 根据等级检查所有鱼塘锁 */
    private checkFishPondUnlocksByLevel(level: number): boolean {
        const fishPondContainer = cc.find("Canvas/FishPondContainer");
        if (!fishPondContainer) return false;

        let unlocked = false;
        fishPondContainer.children.forEach(child => {
            const lockComp = child.getComponent("FishPondLock");
            if (lockComp && lockComp.checkUnlock(level)) {
                unlocked = true;
            }
        });
        return unlocked;
    }

    // ─── 地块操作 ─────────────────────────────────────────────

    /** 解锁地块 */
    public unlockPlot(plotId: number): boolean {
        const plot = this.playerData.plots.find(p => p.id === plotId);
        if (!plot || plot.isUnlocked) return false;
        if (this.playerData.level < plot.unlockLevel) return false;
        if (!this.spendGold(plot.unlockCost)) return false;

        plot.isUnlocked = true;
        this.saveLocal();
        cc.systemEvent.emit("ON_PLOT_UNLOCKED", plotId);
        return true;
    }

    /** 种植作物 */
    public plantCrop(plotId: number, cropId: number): boolean {
        const plot = this.playerData.plots.find(p => p.id === plotId);
        if (!plot || !plot.isUnlocked || plot.cropId !== null) return false;

        const config = getCropConfig(cropId);
        if (!config) return false;
        if (this.playerData.level < config.unlockLevel) return false;
        if (!this.spendGold(config.seedPrice)) return false;

        plot.cropId = cropId;
        plot.plantTime = Date.now() / 1000;
        plot.growthStage = 0;
        this.saveLocal();
        cc.systemEvent.emit("ON_CROP_PLANTED", plotId, cropId);
        return true;
    }

    /** 收获作物 */
    public harvestCrop(plotId: number): { cropId: number; gold: number; exp: number } | null {
        const plot = this.playerData.plots.find(p => p.id === plotId);
        if (!plot || plot.cropId === null || plot.growthStage < 3) return null;

        const config = getCropConfig(plot.cropId);
        if (!config) return null;

        const cropId = plot.cropId;
        const gold = config.sellPrice;
        const exp = Math.floor(config.growTime / 60);

        // 添加仓库
        this.addToWarehouse(cropId, 1, "crop");

        // 清空地块
        plot.cropId = null;
        plot.plantTime = 0;
        plot.growthStage = 0;

        this.addGold(gold);
        this.addExp(exp);
        this.saveLocal();
        cc.systemEvent.emit("ON_CROP_HARVESTED", plotId, cropId, gold, exp);
        return { cropId, gold, exp };
    }

    /** 获取地块当前生长进度 (0-1) */
    public getGrowthProgress(plotId: number): number {
        const plot = this.playerData.plots.find(p => p.id === plotId);
        if (!plot || plot.cropId === null) return 0;
        const config = getCropConfig(plot.cropId);
        if (!config) return 0;
        const elapsed = (Date.now() / 1000) - plot.plantTime;
        return Math.min(elapsed / config.growTime, 1);
    }

    /** 获取地块当前生长阶段 (0-3) */
    public getGrowthStage(plotId: number): number {
        const plot = this.playerData.plots.find(p => p.id === plotId);
        if (!plot || plot.cropId === null) return 0;
        const config = getCropConfig(plot.cropId);
        if (!config) return 0;
        const elapsed = (Date.now() / 1000) - plot.plantTime;
        const progress = Math.min(elapsed / config.growTime, 1);
        return Math.floor(progress * 3);
    }

    // ─── 仓库操作 ─────────────────────────────────────────────

    public addToWarehouse(itemId: number, count: number, type: "crop" | "product" | "material") {
        const item = this.playerData.warehouse.find(w => w.itemId === itemId);
        if (item) {
            item.count += count;
        } else {
            this.playerData.warehouse.push({ itemId, count, type });
        }
        this.saveLocal();
        cc.systemEvent.emit("ON_WAREHOUSE_CHANGED");
    }

    public removeFromWarehouse(itemId: number, count: number): boolean {
        const item = this.playerData.warehouse.find(w => w.itemId === itemId);
        if (!item || item.count < count) return false;
        item.count -= count;
        if (item.count <= 0) {
            this.playerData.warehouse = this.playerData.warehouse.filter(w => w.itemId !== itemId);
        }
        this.saveLocal();
        cc.systemEvent.emit("ON_WAREHOUSE_CHANGED");
        return true;
    }

    public getWarehouseItem(itemId: number): WarehouseItem | null {
        return this.playerData.warehouse.find(w => w.itemId === itemId) || null;
    }

    // ─── 订单系统 ─────────────────────────────────────────────

    public addOrder(order: OrderData) {
        this.playerData.orders.push(order);
        this.saveLocal();
        cc.systemEvent.emit("ON_ORDER_CHANGED");
    }

    public completeOrder(orderId: string): boolean {
        const order = this.playerData.orders.find(o => o.id === orderId);
        if (!order || order.isCompleted) return false;

        // 检查仓库是否足够
        for (const req of order.items) {
            const item = this.getWarehouseItem(req.itemId);
            if (!item || item.count < req.count) return false;
        }

        // 扣除仓库物品
        for (const req of order.items) {
            this.removeFromWarehouse(req.itemId, req.count);
        }

        order.isCompleted = true;
        this.addGold(order.rewardGold);
        this.addExp(order.rewardExp);
        this.saveLocal();
        cc.systemEvent.emit("ON_ORDER_COMPLETED", orderId);
        return true;
    }

    // ─── 图鉴/成就 ────────────────────────────────────────────

    public unlockAchievement(achievementId: string): boolean {
        if (this.playerData.achievements.includes(achievementId)) return false;
        this.playerData.achievements.push(achievementId);
        this.saveLocal();
        cc.systemEvent.emit("ON_ACHIEVEMENT_UNLOCKED", achievementId);
        return true;
    }

    public hasAchievement(achievementId: string): boolean {
        return this.playerData.achievements.includes(achievementId);
    }

    // ─── 日记 ─────────────────────────────────────────────────

    public addDiary(entry: DiaryEntry) {
        this.playerData.diary.push(entry);
        this.saveLocal();
        cc.systemEvent.emit("ON_DIARY_CHANGED");
    }

    // ─── 自动存档 ─────────────────────────────────────────────

    update(dt: number) {
        this.autoSaveTimer += dt;
        if (this.autoSaveTimer >= 30) {
            this.autoSaveTimer = 0;
            this.saveNow();
        }
    }
}