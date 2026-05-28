const { ccclass, property } = cc._decorator;

@ccclass
export default class DragTool extends cc.Component {
    
    @property(cc.Node)
    dragIcon: cc.Node = null;

    @property(cc.Camera)
    gameCamera: cc.Camera = null;

    private _isDragging: boolean = false;
    private _selectedToolId: number = -1;
    private _gameLayer: cc.Node = null;

    onLoad() {
        if (this.dragIcon) {
            this.dragIcon.active = false;
        }
        
        this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
    }

    onDestroy() {
        this.node.off(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.off(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.off(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
    }

    public startDrag(toolId: number, iconPath: string) {
        this._isDragging = true;
        this._selectedToolId = toolId;
        
        if (this.dragIcon) {
            this.dragIcon.active = true;
            this.dragIcon.opacity = 200;
            
            // 根据工具ID设置不同颜色
            const colors = [
                new cc.Color(255, 100, 100),   // 红色 - 锄头
                new cc.Color(100, 100, 255),   // 蓝色 - 水壶
                new cc.Color(100, 255, 100),   // 绿色 - 镰刀
            ];
            this.dragIcon.color = colors[(toolId - 1) % colors.length];
        }
    }

    private onTouchStart(event: cc.Event.EventTouch) {
        if (!this._isDragging) return;
        this.updateDragPosition(event.getLocation());
    }

    private onTouchMove(event: cc.Event.EventTouch) {
        if (!this._isDragging) return;
        this.updateDragPosition(event.getLocation());
    }

    private onTouchEnd(event: cc.Event.EventTouch) {
        if (!this._isDragging) return;
        
        const worldPos = this.getWorldPos(event.getLocation());
        const target = this.checkTarget(worldPos);
        
        if (target) {
            this.useTool(target);
        } else {
            this.cancelDrag();
        }
    }

    private updateDragPosition(screenPos: cc.Vec2) {
        if (!this.dragIcon) return;
        
        const worldPos = this.getWorldPos(screenPos);
        const localPos = this.dragIcon.parent.convertToNodeSpaceAR(worldPos);
        this.dragIcon.setPosition(localPos);
    }

    private getWorldPos(screenPos: cc.Vec2): cc.Vec3 {
        if (!this.gameCamera) {
            const canvas = cc.find('Canvas');
            if (canvas) {
                return canvas.convertToNodeSpaceAR(cc.v3(screenPos.x, screenPos.y, 0));
            }
            return cc.v3(screenPos.x, screenPos.y, 0);
        }
        
        return this.gameCamera.getScreenToWorldPoint(cc.v2(screenPos.x, screenPos.y));
    }

    private checkTarget(worldPos: cc.Vec3): cc.Node | null {
        if (!this._gameLayer) {
            this._gameLayer = this.node.getChildByName('gameLayer');
        }
        
        const plots = this._gameLayer ? this._gameLayer.children : [];
        
        for (let i = 0; i < plots.length; i++) {
            const plot = plots[i];
            
            const plotPos = plot.convertToWorldSpaceAR(cc.Vec3.ZERO);
            const plotSize = plot.getContentSize();
            const halfW = plotSize.width / 2;
            const halfH = plotSize.height / 2;
            
            const isInside = worldPos.x >= plotPos.x - halfW && 
                             worldPos.x <= plotPos.x + halfW &&
                             worldPos.y >= plotPos.y - halfH && 
                             worldPos.y <= plotPos.y + halfH;
            
            if (isInside) {
                const plotData = plot.getComponent('Plot');
                if (plotData && plotData.canPlow) {
                    return plot;
                }
            }
        }
        
        return null;
    }

    private useTool(target: cc.Node) {
        cc.systemEvent.emit('ON_TOOL_USED', {
            toolId: this._selectedToolId,
            target: target
        });
        
        this.endDrag();
    }

    private cancelDrag() {
        this.endDrag();
    }

    private endDrag() {
        this._isDragging = false;
        this._selectedToolId = -1;
        
        if (this.dragIcon) {
            this.dragIcon.active = false;
        }
    }
}