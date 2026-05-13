// CloudSaveManager.ts
// 微信云存档管理器：封装云数据库读写

const { ccclass, property } = cc._decorator;
import { PlayerData } from "../data/GameDataTypes";
import WXUtil from "../utils/WXUtil";

@ccclass
export default class CloudSaveManager extends cc.Component {

    private static _instance: CloudSaveManager = null;
    public static get instance(): CloudSaveManager {
        return CloudSaveManager._instance;
    }

    /** 云数据库引用 */
    private db: any = null;
    /** 当前用户openid */
    private openid: string = "";
    /** 是否初始化完成 */
    private isReady: boolean = false;

    onLoad() {
        if (CloudSaveManager._instance) {
            this.node.destroy();
            return;
        }
        CloudSaveManager._instance = this;
        cc.game.addPersistRootNode(this.node);
        this.init();
    }

    /** 初始化云开发 */
    private init() {
        if (!WXUtil.isWX) {
            cc.warn("非微信环境，云存档不可用");
            return;
        }
        wx.cloud.init({
            env: "your-cloud-env-id", // 替换为你的云环境ID
            traceUser: true,
        });
        this.db = wx.cloud.database();
        this.isReady = true;
    }

    /** 设置用户openid */
    public setOpenid(openid: string) {
        this.openid = openid;
    }

    /** 保存存档到云端 */
    public async saveToCloud(data: PlayerData): Promise<boolean> {
        if (!this.isReady || !this.openid) {
            cc.warn("云开发未初始化，无法存档");
            return false;
        }
        try {
            const collection = this.db.collection("players");
            const res = await collection.where({ _openid: this.openid }).get();
            data.lastSaveTime = Date.now();
            if (res.data && res.data.length > 0) {
                // 更新已有记录
                await collection.doc(res.data[0]._id).update({
                    data: { playerData: data }
                });
            } else {
                // 新建记录
                await collection.add({
                    data: { playerData: data }
                });
            }
            cc.log("云存档成功");
            return true;
        } catch (e) {
            cc.error("云存档失败:", e);
            return false;
        }
    }

    /** 从云端读取存档 */
    public async loadFromCloud(): Promise<PlayerData | null> {
        if (!this.isReady || !this.openid) {
            cc.warn("云开发未初始化，无法读档");
            return null;
        }
        try {
            const collection = this.db.collection("players");
            const res = await collection.where({ _openid: this.openid }).get();
            if (res.data && res.data.length > 0) {
                const playerData = res.data[0].playerData as PlayerData;
                cc.log("云读档成功");
                return playerData;
            }
            cc.log("云端无存档");
            return null;
        } catch (e) {
            cc.error("云读档失败:", e);
            return null;
        }
    }

    /** 获取排行榜数据 */
    public async getLeaderboard(): Promise<any[]> {
        if (!this.isReady) return [];
        try {
            const collection = this.db.collection("players");
            const res = await collection
                .orderBy("playerData.level", "desc")
                .limit(50)
                .get();
            return res.data.map((doc: any) => ({
                nickname: doc.playerData.nickname,
                level: doc.playerData.level,
                avatarUrl: doc.playerData.avatarUrl,
            }));
        } catch (e) {
            cc.error("获取排行榜失败:", e);
            return [];
        }
    }
}
