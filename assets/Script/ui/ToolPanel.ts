const { ccclass, property } = cc._decorator;

@ccclass
export default class ToolPanel extends cc.Component {
    
    @property(cc.Node)
    toolContainer: cc.Node = null;

    private _showY: number = -590;
    private _hideY: number = -1500;
    private _duration: number = 0.3;
    private _isOpen: boolean = false;

    onLoad() {
        this.node.y = this._hideY;
    }

    public show() {
        this.node.active = true;
        this._isOpen = true;
        
        this.scheduleOnce(() => {
            const canvas = cc.find('Canvas');
            if (canvas) {
                canvas.on(cc.Node.EventType.TOUCH_END, this.onOutsideClick, this);
            }
        }, 0.1);
        
        cc.tween(this.node)
            .to(this._duration, { y: this._showY }, { easing: 'cubicOut' })
            .start();
    }

    public hide() {
        if (!this._isOpen) return;
        this._isOpen = false;
        
        const canvas = cc.find('Canvas');
        if (canvas) {
            canvas.off(cc.Node.EventType.TOUCH_END, this.onOutsideClick, this);
        }
        
        cc.tween(this.node)
            .to(this._duration, { y: this._hideY }, { easing: 'cubicIn' })
            .call(() => {
                this.node.active = false;
            })
            .start();
    }

    private onOutsideClick(event: cc.Event.EventTouch) {
        if (!this._isOpen) return;
        
        const touchPos = event.getLocation();
        const localPos = this.node.convertToNodeSpaceAR(cc.v3(touchPos.x, touchPos.y, 0));
        
        const halfW = this.node.width / 2;
        const halfH = this.node.height / 2;
        
        const isOutside = localPos.x < -halfW || localPos.x > halfW || 
                          localPos.y < -halfH || localPos.y > halfH;
        
        if (isOutside) {
            this.hide();
        }
    }
}