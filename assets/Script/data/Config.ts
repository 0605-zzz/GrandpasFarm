// Config.ts
// 游戏配置中心：作物、地块、经验公式等

import { CropConfig, PlotConfig } from "./GameDataTypes";

/** 作物配置表 */
export const CROP_CONFIG: { [key: number]: CropConfig } = {
    1: { id: 1, name: "小麦", growTime: 60, sellPrice: 8, seedPrice: 3, unlockLevel: 1, icon: "wheat", stages: 3 },
    2: { id: 2, name: "胡萝卜", growTime: 120, sellPrice: 15, seedPrice: 6, unlockLevel: 1, icon: "carrot", stages: 3 },
    3: { id: 3, name: "白菜", growTime: 180, sellPrice: 20, seedPrice: 8, unlockLevel: 2, icon: "cabbage", stages: 3 },
    4: { id: 4, name: "番茄", growTime: 300, sellPrice: 35, seedPrice: 15, unlockLevel: 3, icon: "tomato", stages: 3 },
    5: { id: 5, name: "玉米", growTime: 600, sellPrice: 60, seedPrice: 25, unlockLevel: 4, icon: "corn", stages: 3 },
    6: { id: 6, name: "南瓜", growTime: 900, sellPrice: 100, seedPrice: 40, unlockLevel: 5, icon: "pumpkin", stages: 3 },
};

/** 地块尺寸类型 */
export enum PlotSize {
    LONG = "long",   // 长条形（4格宽）
    SMALL = "small", // 小方形（1格）
}

/** 地块配置表 (1块长条 + 2块左下 + 2x2右下，共7块) */
export const PLOT_CONFIG: PlotConfig[] = [
    // 长土地（id=0，初始解锁）
    { id: 0, unlockLevel: 1, unlockCost: 0, position: { x: 0, y: 0 }, size: PlotSize.LONG },
    // 左下2块（id=1,2，未解锁）
    { id: 1, unlockLevel: 2, unlockCost: 200, position: { x: 0, y: 0 }, size: PlotSize.SMALL },
    { id: 2, unlockLevel: 3, unlockCost: 500, position: { x: 0, y: 0 }, size: PlotSize.SMALL },
    // 右下2x2（id=3,4,5,6，未解锁，按等级解锁）
    { id: 3, unlockLevel: 4, unlockCost: 1000, position: { x: 0, y: 0 }, size: PlotSize.SMALL },
    { id: 4, unlockLevel: 5, unlockCost: 2000, position: { x: 0, y: 0 }, size: PlotSize.SMALL },
    { id: 5, unlockLevel: 6, unlockCost: 3500, position: { x: 0, y: 0 }, size: PlotSize.SMALL },
    { id: 6, unlockLevel: 7, unlockCost: 5500, position: { x: 0, y: 0 }, size: PlotSize.SMALL },
];

/** 升级所需经验 */
export function expNeeded(level: number): number {
    return level * 100;
}

/** 获取作物配置 */
export function getCropConfig(cropId: number): CropConfig | null {
    return CROP_CONFIG[cropId] || null;
}

/** 获取所有已解锁作物 */
export function getUnlockedCrops(playerLevel: number): CropConfig[] {
    return Object.values(CROP_CONFIG).filter(c => c.unlockLevel <= playerLevel);
}

/** 获取地块配置 */
export function getPlotConfig(plotId: number): PlotConfig | null {
    return PLOT_CONFIG.find(p => p.id === plotId) || null;
}
