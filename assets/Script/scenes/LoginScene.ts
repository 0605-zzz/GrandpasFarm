// LoginScene.ts 最终稳定版
const { ccclass, property } = cc._decorator;
import GameManager from "../managers/GameManager";
import CloudSaveManager from "../managers/CloudSaveManager";
import WXUtil from "../utils/WXUtil";

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
        this.startLoading();
    }

    private async startLoading() {
        // 0-50% 平滑加载
        await this.simulateResourceLoading();
        
        // 50-70% 平滑加载
        await this.smoothProgress(0.5, 0.7, 800);
        
        // 70-100% 平滑加载
        await this.smoothProgress(0.7, 1.0, 1200);

        this.onLoadComplete();
    }

    // 0-50% 平滑
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

    // 通用：从 start 平滑走到 end
    private smoothProgress(start: number, end: number, durationMs: number): Promise<void> {
        return new Promise(resolve => {
            const total = end - start;
            const step = 0.01;
            const speed = durationMs / (total / step);
            let current = start;

            const interval = setInterval(() => {
                current += step;
                this.updateProgress(current);
                if (current >= end) {
                    clearInterval(interval);
                    resolve();
                }
            }, speed);
        });
    }

    private async wxLogin() { } // 已移除逻辑，不影响进度

    private async loadGameData() { } // 已移除逻辑，不影响进度

    private updateProgress(progress: number) {
        const clamped = Math.min(Math.max(progress, 0), 1);
        if (this.progressBar) this.progressBar.progress = clamped;
        if (this.progressLabel) this.progressLabel.string = `${Math.floor(clamped * 100)}%`;
    }

    private onLoadComplete() {
        this.loadDone = true;
    }

    public onEnterBtnClick() {
        if (!this.loadDone) return;
        cc.director.loadScene("MainScene");
    }

    private enterMainScene() {
        cc.director.loadScene("MainScene");
    }
}