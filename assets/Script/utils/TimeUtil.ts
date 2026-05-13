// TimeUtil.ts
// 时间工具类

export default class TimeUtil {

    /** 格式化秒数为可读时间 */
    public static formatTime(seconds: number): string {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = Math.floor(seconds % 60);
        if (h > 0) return `${h}:${this.pad(m)}:${this.pad(s)}`;
        return `${this.pad(m)}:${this.pad(s)}`;
    }

    /** 格式化秒数为中文时间 */
    public static formatTimeCN(seconds: number): string {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        if (h > 0 && m > 0) return `${h}小时${m}分钟`;
        if (h > 0) return `${h}小时`;
        if (m > 0) return `${m}分钟`;
        return `${seconds}秒`;
    }

    /** 获取当前时间戳（秒） */
    public static now(): number {
        return Math.floor(Date.now() / 1000);
    }

    /** 获取当前时间戳（毫秒） */
    public static nowMs(): number {
        return Date.now();
    }

    /** 获取今天的日期字符串 YYYY-MM-DD */
    public static today(): string {
        const d = new Date();
        return `${d.getFullYear()}-${this.pad(d.getMonth() + 1)}-${this.pad(d.getDate())}`;
    }

    private static pad(n: number): string {
        return n < 10 ? "0" + n : n.toString();
    }
}
