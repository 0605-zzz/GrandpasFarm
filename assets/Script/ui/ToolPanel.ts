// ToolPanel.ts
// 工具面板：显示玩家拥有的工具（铲子、水壶等）

const { ccclass, property } = cc._decorator;
import BasePanel from "./BasePanel";

@ccclass
export default class ToolPanel extends BasePanel {

    @property(cc.Label)
    emptyLabel: cc.Label = null;

    onEnable() {
        this.refreshUI();
    }

    public refreshUI() {
        // 工具系统初始为空
        if (this.emptyLabel) {
            this.emptyLabel.node.active = true;
            this.emptyLabel.string = "暂无工具\n快去商店购买吧！";
        }
    }
}
