// 成就类型枚举
export enum AchievementType {
    ONCE = 1,       // 一次性成就
    CONTINUOUS = 2, // 连续性成就
    CUMULATIVE = 3  // 累积性成就
}

// 单个成就配置
export interface AchievementConfig {
    id: number;
    name: string;
    description: string;
    iconPath: string;
    type: AchievementType;
    targetValue: number;
}

// 玩家成就进度数据
export interface AchievementProgress {
    id: number;
    currentValue: number;
    isUnlocked: boolean;
    unlockTime?: number;
}

// 成就配置表
export const ACHIEVEMENT_CONFIG: AchievementConfig[] = [
    // 1. 第一株嫩芽
    {
        id: 1001,
        name: "第一株嫩芽",
        description: "种下第一颗作物",
        iconPath: "fram_image/trophy/Home_1",
        type: AchievementType.ONCE,
        targetValue: 1
    },
    // 2. 第一桶金
    {
        id: 1002,
        name: "第一桶金",
        description: "第一次通过售卖获得金币",
        iconPath: "fram_image/trophy/Home_2",
        type: AchievementType.ONCE,
        targetValue: 1
    },
    // 3. 鸡蛋能手
    {
        id: 1003,
        name: "鸡蛋能手",
        description: "收集50颗鸡蛋",
        iconPath: "fram_image/trophy/Home_3",
        type: AchievementType.CUMULATIVE,
        targetValue: 50
    },
    // 4. 连续登录
    {
        id: 1004,
        name: "连续登录",
        description: "连续7天登录",
        iconPath: "fram_image/trophy/Home_4",
        type: AchievementType.CONTINUOUS,
        targetValue: 7
    },
    // 5. 牛羊成群
    {
        id: 1005,
        name: "牛羊成群",
        description: "同时拥有20只牛和20只羊",
        iconPath: "fram_image/trophy/Home_5",
        type: AchievementType.ONCE,
        targetValue: 40  // 20只牛+20只羊=40
    },
    // 6. 甜蜜者
    {
        id: 1006,
        name: "甜蜜者",
        description: "收集10罐蜂蜜",
        iconPath: "fram_image/trophy/Home_6",
        type: AchievementType.CUMULATIVE,
        targetValue: 10
    },
    // 7. 海鲜大亨
    {
        id: 1007,
        name: "海鲜大亨",
        description: "通过海鲜收获5000金币",
        iconPath: "fram_image/trophy/Home_7",
        type: AchievementType.CUMULATIVE,
        targetValue: 5000
    },
    // 8. 深海赠礼
    {
        id: 1008,
        name: "深海赠礼",
        description: "收获第一颗珍珠",
        iconPath: "fram_image/trophy/Home_8",
        type: AchievementType.ONCE,
        targetValue: 1
    },
    // 9. 动物之友
    {
        id: 1009,
        name: "动物之友",
        description: "连续7天不售卖农副产品",
        iconPath: "fram_image/trophy/Home_9",
        type: AchievementType.CONTINUOUS,
        targetValue: 7
    },
    // 10. 种子收藏家
    {
        id: 1010,
        name: "种子收藏家",
        description: "解锁所有的植物",
        iconPath: "fram_image/trophy/Home_10",
        type: AchievementType.CUMULATIVE,
        targetValue: 11  // 11个作物种子
    },
    // 11. 牧场物语
    {
        id: 1011,
        name: "牧场物语",
        description: "解锁所有的动物",
        iconPath: "fram_image/trophy/Home_11",
        type: AchievementType.CUMULATIVE,
        targetValue: 11  // 11个动物
    },
    // 12. 节俭专家
    {
        id: 1012,
        name: "节俭专家",
        description: "连续7天金币不减少",
        iconPath: "fram_image/trophy/Home_12",
        type: AchievementType.CONTINUOUS,
        targetValue: 7
    },
    // 13. 神奇农夫
    {
        id: 1013,
        name: "神奇农夫",
        description: "前12个图鉴都点亮",
        iconPath: "fram_image/trophy/Home_13",
        type: AchievementType.ONCE,
        targetValue: 1
    },
];
