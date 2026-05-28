// LoginScene.ts 完美版：自动加载进度条 → 显示按钮 → 点击缩放 → 进入游戏
const { ccclass, property } = cc._decorator;

@ccclass
export default class LoginScene extends cc.Component {

    @property(cc.ProgressBar)
    progressBar: cc.ProgressBar = null;

    @property(cc.Label)
    progressLabel: cc.Label = null;

    @property(cc.Node)
    enterBtnNode: cc.Node = null;

    private loadDone: boolean = false;

    onLoad() {
        if (this.progressBar) this.progressBar.progress = 0;
        if (this.progressLabel) this.progressLabel.string = "0%";
        
        // 一开始隐藏按钮
        if (this.enterBtnNode) this.enterBtnNode.active = false;

        this.startLoading();
    }

    private async startLoading() {
        await this.simulateResourceLoading();
        await this.smoothProgress(0.5, 0.7, 800);
        await this.smoothProgress(0.7, 1.0, 1200);
        this.onLoadComplete();
    }

    private simulateResourceLoading(): Promise<void> {
        return new Promise(resolve => {
            let progress = 0;
            const interval = setInterval(() => {
                progress += 0.02;
                this.updateProgress(progress * 0.5);
                if (progress >= 1) {
                    clearInterval(interval);
                    resolve();
                }
            }, 30);
        });
    }

    private smoothProgress(start: number, end: number, durationMs: number): Promise<void> {
        return new Promise(resolve => {
            const total = end - start;
            if (total <= 0) {
                this.updateProgress(end);
                resolve();
                return;
            }
            const step = 0.01;
            const stepCount = total / step;
            const speed = Math.max(durationMs / stepCount, 16);
            let current = start;

            const interval = setInterval(() => {
                current += step;
                if (current >= end) {
                    current = end;
                    clearInterval(interval);
                    resolve();
                }
                this.updateProgress(current);
            }, speed);
        });
    }

    private updateProgress(progress: number) {
        const clamped = Math.min(Math.max(progress, 0), 1);
        if (this.progressBar) this.progressBar.progress = clamped;
        if (this.progressLabel) this.progressLabel.string = `${Math.floor(clamped * 100)}%`;
    }

    private onLoadComplete() {
        this.loadDone = true;
        if (this.enterBtnNode) {
            this.enterBtnNode.active = true;
            this.showEnterBtnAnimation(); // 按钮弹出动画
        }
    }

    // 按钮出现动画
    private showEnterBtnAnimation() {
        this.enterBtnNode.scale = 0;
        cc.tween(this.enterBtnNode)
            .to(0.3, { scale: 1.1 }, { easing: "backOut" })
            .to(0.1, { scale: 1 })
            .start();
    }

    // ==============================================
    // ✨ 这里就是你要的：点击按钮时轻微缩放效果
    // ==============================================
    public onEnterBtnClick() {
        if (!this.loadDone) return;

        // 点击时：先缩小 → 再恢复 → 再进入游戏
        cc.tween(this.enterBtnNode)
            .to(0.1, { scale: 0.9 })  // 轻微缩小
            .to(0.1, { scale: 1 })    // 恢复原样
            .call(() => {
                // 动画结束后再跳场景
                cc.director.loadScene("MainScene");
            })
            .start();
    }
}