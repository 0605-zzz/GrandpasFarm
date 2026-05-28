const { ccclass, property } = cc._decorator;
import { AchievementConfig, AchievementProgress, AchievementType } from "./AchievementData";

@ccclass
export default class AchievementDetail extends cc.Component {

    @property(cc.Sprite)
    bigIcon: cc.Sprite = null;              // 大图展示

    @property(cc.Label)
    titleLabel: cc.Label = null;            // 标题

    @property(cc.Label)
    descLabel: cc.Label = null;             // 详细描述

    @property(cc.ProgressBar)
    progressBar: cc.ProgressBar = null;     // 进度条

    @property(cc.Label)
    progressText: cc.Label = null;          // 进度文字（如：已签到 2/7 天）

    @property(cc.Node)
    progressSection: cc.Node = null;        // 进度区域父节点（一次性成就可隐藏）

    @property(cc.Label)
    statusLabel: cc.Label = null;           // 状态标签（未解锁/已解锁）

    @property(cc.Button)
    closeBtn: cc.Button = null;

    // AchievementDetail.ts
    onLoad() {
        this.node.active = false;
        this.closeBtn.node.on('click', this.hide, this);

        // 阻止所有触摸事件穿透
        this.node.on(cc.Node.EventType.TOUCH_START, (e) => e.stopPropagation(), this);
        this.node.on(cc.Node.EventType.TOUCH_MOVE, (e) => e.stopPropagation(), this);
        this.node.on(cc.Node.EventType.TOUCH_END, (e) => e.stopPropagation(), this);
        
    }

    /**
     * 显示成就详情
     */
    show(config: AchievementConfig, progress: AchievementProgress) {
        this.node.active = true;

        // 基础信息
        this.titleLabel.string = config.name;
        this.descLabel.string = config.description;

        // 加载大图（和列表用同一张图，或单独配大图路径）
        this.loadBigIcon(config.iconPath);

        // 状态
        this.statusLabel.string = progress.isUnlocked ? "【已解锁】" : "【未解锁】";
        this.statusLabel.node.color = progress.isUnlocked ? cc.Color.GREEN : cc.Color.RED;

        // 进度区域处理
        this.updateProgressSection(config, progress);
    }

    private loadBigIcon(path: string) {
        cc.resources.load(path, cc.SpriteFrame, (err, spriteFrame: cc.SpriteFrame) => {
            if (!err) this.bigIcon.spriteFrame = spriteFrame;
        });
    }

    private updateProgressSection(config: AchievementConfig, progress: AchievementProgress) {
        // 一次性成就不显示进度条
        if (config.type === AchievementType.ONCE) {
            this.progressSection.active = false;
            return;
        }

        this.progressSection.active = true;

        const current = progress.currentValue;
        const target = config.targetValue;
        const ratio = Math.min(current / target, 1);

        // 更新进度条
        this.progressBar.progress = ratio;

        // 更新文字（根据类型显示不同文案）
        let unit = "";
        if (config.type === AchievementType.CONTINUOUS) unit = "天";
        if (config.type === AchievementType.CUMULATIVE) unit = "个";

        if (progress.isUnlocked) {
            this.progressText.string = `已完成！(${target}/${target}${unit})`;
        } else {
            this.progressText.string = `当前进度：${current}/${target}${unit}，还差 ${target - current}${unit}`;
        }
    }

    hide() {
        this.node.active = false;
    }
}