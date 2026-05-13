// WXUtil.ts
// 微信工具类：封装登录、用户信息、分享、订阅消息等微信API

const { ccclass, property } = cc._decorator;

@ccclass
export default class WXUtil {

    /** 是否运行在微信环境中 */
    public static get isWX(): boolean {
        return typeof wx !== "undefined";
    }

    /** 微信登录，获取 code */
    public static login(): Promise<string> {
        return new Promise((resolve, reject) => {
            if (!this.isWX) {
                resolve("");
                return;
            }
            wx.login({
                success: (res) => {
                    if (res.code) {
                        resolve(res.code);
                    } else {
                        reject(new Error("登录失败，无 code"));
                    }
                },
                fail: (err) => {
                    reject(err);
                }
            });
        });
    }

    /** 获取用户信息 */
    public static getUserInfo(): Promise<{ nickname: string; avatarUrl: string }> {
        return new Promise((resolve, reject) => {
            if (!this.isWX) {
                resolve({ nickname: "游客", avatarUrl: "" });
                return;
            }
            wx.getUserInfo({
                withCredentials: true,
                success: (res) => {
                    const userInfo = res.userInfo;
                    resolve({
                        nickname: userInfo.nickName,
                        avatarUrl: userInfo.avatarUrl
                    });
                },
                fail: (err) => {
                    reject(err);
                }
            });
        });
    }

    /** 显示微信好友排行榜（开放数据域） */
    public static showFriendRank() {
        if (!this.isWX) return;
        const openDataContext = wx.getOpenDataContext();
        openDataContext.postMessage({ type: "showFriendRank" });
    }

    /** 提交分数到好友排行 */
    public static submitScore(score: number) {
        if (!this.isWX) return;
        const openDataContext = wx.getOpenDataContext();
        openDataContext.postMessage({ type: "submitScore", score: score });
    }

    /** 分享 */
    public static share(title: string, imageUrl?: string) {
        if (!this.isWX) return;
        wx.shareAppMessage({
            title: title,
            imageUrl: imageUrl || "",
            query: `uid=${Date.now()}`
        });
    }

    /** 创建激励视频广告 */
    public static createRewardedVideoAd(adUnitId: string): any {
        if (!this.isWX) return null;
        return wx.createRewardedVideoAd({ adUnitId: adUnitId });
    }

    /** 创建banner广告 */
    public static createBannerAd(adUnitId: string): any {
        if (!this.isWX) return null;
        return wx.createBannerAd({
            adUnitId: adUnitId,
            style: { left: 0, top: 0, width: 300 }
        });
    }

    /** 获取系统信息（用于适配） */
    public static getSystemInfo(): any {
        if (!this.isWX) {
            return { screenWidth: 1080, screenHeight: 1920, pixelRatio: 2 };
        }
        return wx.getSystemInfoSync();
    }

    /** 设置本地存储 */
    public static setStorage(key: string, value: any): void {
        if (!this.isWX) {
            cc.sys.localStorage.setItem(key, JSON.stringify(value));
            return;
        }
        wx.setStorageSync(key, value);
    }

    /** 获取本地存储 */
    public static getStorage<T>(key: string): T | null {
        if (!this.isWX) {
            const raw = cc.sys.localStorage.getItem(key);
            return raw ? JSON.parse(raw) : null;
        }
        const raw = wx.getStorageSync(key);
        return raw ? raw : null;
    }

    /** 震动反馈 */
    public static vibrateShort() {
        if (this.isWX) {
            wx.vibrateShort({ type: "light" });
        }
    }

    /** 展示提示 */
    public static showToast(title: string, icon?: string) {
        if (!this.isWX) {
            cc.log(title);
            return;
        }
        wx.showToast({ title: title, icon: icon || "none" });
    }
}
