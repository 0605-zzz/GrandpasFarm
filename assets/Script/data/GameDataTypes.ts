// GameDataTypes.ts
// 全局数据类型定义

/** 玩家数据 */
export interface PlayerData {
    uid: string;
    username: string;
    avatarUrl: string;
    level: number;
    exp: number;
    gold: number;
    gem: number;
    shell: number;
    plots: PlotData[];
    warehouse: WarehouseItem[];
    orders: OrderData[];
    achievements: string[];
    diary: DiaryEntry[];
    lastLoginTime: number;
    lastSaveTime: number;
}

/** 地块数据 */
export interface PlotData {
    id: number;
    isUnlocked: boolean;
    unlockLevel: number;
    unlockCost: number;
    cropId: number | null;
    plantTime: number;
    growthStage: number;
}

/** 仓库物品 */
export interface WarehouseItem {
    itemId: number;
    count: number;
    type: 'crop' | 'product' | 'material';
}

/** 订单数据 */
export interface OrderData {
    id: string;
    items: { itemId: number; count: number }[];
    rewardGold: number;
    rewardExp: number;
    deadline: number;
    isCompleted: boolean;
}

/** 日记条目 */
export interface DiaryEntry {
    id: string;
    title: string;
    content: string;
    date: string;
    isRead: boolean;
}

/** 成就/图鉴项 */
export interface AchievementData {
    id: string;
    name: string;
    description: string;
    icon: string;
    unlockCondition: string;
}

/** 作物配置 */
export interface CropConfig {
    id: number;
    name: string;
    growTime: number;
    sellPrice: number;
    seedPrice: number;
    unlockLevel: number;
    icon: string;
    stages: number;
}

/** 地块配置 */
export interface PlotConfig {
    id: number;
    unlockLevel: number;
    unlockCost: number;
    position: { x: number; y: number };
    size?: string; // "long" | "small"
}

/** 默认玩家数据 */
export const DEFAULT_PLAYER: PlayerData = {
    uid: "",
    username: "用户名",
    avatarUrl: "",
    level: 1,
    exp: 0,
    gold: 500,
    gem: 100,
    shell: 0,
    plots: [],
    warehouse: [],
    orders: [],
    achievements: [],
    diary: [],
    lastLoginTime: 0,
    lastSaveTime: 0,
};
