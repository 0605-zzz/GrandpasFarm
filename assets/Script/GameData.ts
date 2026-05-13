// GameData.ts
// 全局数据管理器，挂在常驻节点上，负责存读档和全局状态

const { ccclass, property } = cc._decorator;

/** 玩家数据结构 */
export interface PlayerData {
    username: string;
    level: number;
    exp: number;
    gold: number;
    gem: number;
    shell: number;
    /** 土地解锁状态，true表示已解锁 */
    plotsUnlocked: boolean[];
    /** 养殖场是否解锁 */
    farmUnlocked: boolean;
    /** 鱼塘是否解锁 */
    pondUnlocked: boolean;
}

/** 默认玩家数据 */
const DEFAULT_PLAYER: PlayerData = {
    username: "用户名",
    level: 1,
    exp: 0,
    gold: 0,
    gem: 0,
    shell: 0,
    plotsUnlocked: [true, false, false, false, false, false, false, false], // 默认只解锁第一块土地
    farmUnlocked: false,  // 养殖场初始锁定
    pondUnlocked: false,  // 鱼塘初始锁定
};

/** 解锁所需等级配置 */
export const UNLOCK_REQUIREMENTS = {
    PLOT_2: 2,   // 第2块土地需要2级
    PLOT_3: 3,
    PLOT_4: 4,
    PLOT_5: 5,
    PLOT_6: 6,
    PLOT_7: 7,
    PLOT_8: 8,
    FARM: 5,     // 养殖场需要5级
    POND: 8,     // 鱼塘需要8级
};

@ccclass
export default class GameData extends cc.Component {

    private static _instance: GameData = null;

    /** 单例访问 */
    public static get instance(): GameData {
        return GameData._instance;
    }

    /** 玩家数据 */
    public playerData: PlayerData = { ...DEFAULT_PLAYER };

    onLoad() {
        if (GameData._instance) {
            this.node.destroy();
            return;
        }
        GameData._instance = this;
        cc.game.addPersistRootNode(this.node);
        this.loadData();
    }

    // ─── 存档 ────────────────────────────────────────────────

    /** 读取本地存档 */
    public loadData() {
        try {
            const raw = cc.sys.localStorage.getItem("playerData");
            if (raw) {
                this.playerData = JSON.parse(raw);
            }
        } catch (e) {
            cc.warn("读取存档失败:", e);
        }
    }

    /** 保存到本地存档 */
    public saveData() {
        try {
            cc.sys.localStorage.setItem("playerData", JSON.stringify(this.playerData));
        } catch (e) {
            cc.warn("保存存档失败:", e);
        }
    }

    // ─── 金币操作 ─────────────────────────────────────────────

    public addGold(amount: number) {
        this.playerData.gold += amount;
        this.saveData();
        cc.systemEvent.emit("ON_GOLD_CHANGED", this.playerData.gold);
    }

    public spendGold(amount: number): boolean {
        if (this.playerData.gold < amount) return false;
        this.playerData.gold -= amount;
        this.saveData();
        cc.systemEvent.emit("ON_GOLD_CHANGED", this.playerData.gold);
        return true;
    }

    // ─── 经验/等级 ────────────────────────────────────────────

    public addExp(amount: number) {
        this.playerData.exp += amount;
        const needed = this.expNeeded(this.playerData.level);
        if (this.playerData.exp >= needed) {
            this.playerData.exp -= needed;
            this.playerData.level++;
            cc.systemEvent.emit("ON_LEVEL_UP", this.playerData.level);
        }
        this.saveData();
        cc.systemEvent.emit("ON_EXP_CHANGED", this.playerData.exp);
    }

    /** 升级所需经验（简单线性公式，可自行调整） */
    private expNeeded(level: number): number {
        return level * 100;
    }
}
