// EventBus.ts
// 全局事件总线：用于模块间解耦通信

const { ccclass, property } = cc._decorator;

@ccclass
export default class EventBus extends cc.Component {

    private static _instance: EventBus = null;
    public static get instance(): EventBus {
        return EventBus._instance;
    }

    private eventTarget: cc.EventTarget = new cc.EventTarget();

    onLoad() {
        if (EventBus._instance) {
            this.node.destroy();
            return;
        }
        EventBus._instance = this;
        cc.game.addPersistRootNode(this.node);
    }

    /** 监听事件 */
    public on(event: string, callback: Function, target?: any) {
        this.eventTarget.on(event, callback, target);
    }

    /** 取消监听 */
    public off(event: string, callback: Function, target?: any) {
        this.eventTarget.off(event, callback, target);
    }

    /** 触发事件 */
    public emit(event: string, ...args: any[]) {
        this.eventTarget.emit(event, ...args);
    }

    /** 监听一次 */
    public once(event: string, callback: Function, target?: any) {
        this.eventTarget.once(event, callback, target);
    }
}
