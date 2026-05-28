const { ccclass, property } = cc._decorator;

@ccclass
export default class MainUI extends cc.Component {
    
    @property(cc.Node)
    shopPanel: cc.Node = null;

    @property(cc.Button)
    shopBtn: cc.Button = null;

    @property(cc.Node)
    toolPanel: cc.Node = null;

    @property(cc.Button)
    toolBtn: cc.Button = null;

    onLoad() {
        if (this.shopBtn) {
            this.shopBtn.node.on('click', this.onShopBtnClick, this);
        }

        if (this.toolBtn) {
            this.toolBtn.node.on('click', this.onToolBtnClick, this);
        }
    }

    onDestroy() {
        if (this.shopBtn) {
            this.shopBtn.node.off('click', this.onShopBtnClick, this);
        }
        if (this.toolBtn) {
            this.toolBtn.node.off('click', this.onToolBtnClick, this);
        }
    }

    private onShopBtnClick() {
        if (this.toolPanel) this.toolPanel.active = false;
        
        if (this.shopPanel) {
            this.shopPanel.active = true;
        }
    }

    private onToolBtnClick() {
        if (this.shopPanel) this.shopPanel.active = false;

        const toolComp = this.toolPanel?.getComponent('ToolPanel');
        if (toolComp) {
            toolComp.show();
        }
    }
}