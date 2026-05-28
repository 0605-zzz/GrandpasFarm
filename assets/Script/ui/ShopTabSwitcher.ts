const { ccclass, property } = cc._decorator;

@ccclass
export default class ShopTabSwitcher extends cc.Component {
    // ========== 商店内容区 ==========
    @property(cc.Node)
    seedShop: cc.Node = null;      // 种子商店内容区

    @property(cc.Node)
    animalShop: cc.Node = null;    // 动物商店内容区

    // ========== Tab 按钮 ==========
    @property(cc.Button)
    seedTabBtn: cc.Button = null;   // 种子商店Tab按钮

    @property(cc.Button)
    animalTabBtn: cc.Button = null; // 动物商店Tab按钮

    // ========== 返回按钮 ==========
    @property(cc.Button)
    backBtn: cc.Button = null;      // 返回/关闭按钮

    // ========== Tab 图片切换（可选） ==========
    @property(cc.Sprite)
    seedTabSprite: cc.Sprite = null;

    @property(cc.Sprite)
    animalTabSprite: cc.Sprite = null;

    @property(cc.SpriteFrame)
    seedSelectedSF: cc.SpriteFrame = null;   // 种子商店选中态

    @property(cc.SpriteFrame)
    seedNormalSF: cc.SpriteFrame = null;     // 种子商店未选中态

    @property(cc.SpriteFrame)
    animalSelectedSF: cc.SpriteFrame = null;   // 动物商店选中态

    @property(cc.SpriteFrame)
    animalNormalSF: cc.SpriteFrame = null;     // 动物商店未选中态

    // ========== 生命周期 ==========
    onLoad() {
        // 绑定Tab按钮点击
        if (this.seedTabBtn) {
            this.seedTabBtn.node.on('click', this.onSeedTabClick, this);
        }
        if (this.animalTabBtn) {
            this.animalTabBtn.node.on('click', this.onAnimalTabClick, this);
        }
        
        // 绑定返回按钮点击
        if (this.backBtn) {
            this.backBtn.node.on('click', this.onBackClick, this);
        }
    }

    onDestroy() {
        if (this.seedTabBtn) {
            this.seedTabBtn.node.off('click', this.onSeedTabClick, this);
        }
        if (this.animalTabBtn) {
            this.animalTabBtn.node.off('click', this.onAnimalTabClick, this);
        }
        if (this.backBtn) {
            this.backBtn.node.off('click', this.onBackClick, this);
        }
    }

    // ========== Tab 切换 ==========
    onSeedTabClick() {
        if (this.seedShop) this.seedShop.active = true;
        if (this.animalShop) this.animalShop.active = false;
        this.updateTabSprite('seed');
    }

    onAnimalTabClick() {
        if (this.seedShop) this.seedShop.active = false;
        if (this.animalShop) this.animalShop.active = true;
        this.updateTabSprite('animal');
    }

    // ========== Tab 图片状态更新 ==========
    updateTabSprite(activeTab: string) {
        if (!this.seedTabSprite || !this.animalTabSprite) return;
        
        if (activeTab === 'seed') {
            if (this.seedSelectedSF) this.seedTabSprite.spriteFrame = this.seedSelectedSF;
            if (this.animalNormalSF) this.animalTabSprite.spriteFrame = this.animalNormalSF;
        } else {
            if (this.seedNormalSF) this.seedTabSprite.spriteFrame = this.seedNormalSF;
            if (this.animalSelectedSF) this.animalTabSprite.spriteFrame = this.animalSelectedSF;
        }
    }

    // ========== 关闭面板 ==========
    public onBackClick() {
        this.node.active = false;
    }
}