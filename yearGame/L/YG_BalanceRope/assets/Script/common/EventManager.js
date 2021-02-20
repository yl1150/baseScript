/**
 * 事件管理器
 */
const kEventDefine = cc.Enum({
    /**
     * 游戏开始
     */
    GAME_START: "gameStart",

    /**
     * 游戏结束
     */
    GAME_OVER: "gameOver",

    /**
     * 冻结时间（不可操作）
     */
    FREEZE_TIME: "freezeTime",

    /**
     * 活跃时间（可操作）
     */
    KINETIC_TIME: "kineticTime",

    /**
     * 本轮结束
     */
    FINISH_ROUND: "finishRound",

    /**
     * 视频准备好了
     */
    VIDEO_READY: 'videoReady',

    /**
     * 视频播放结束
     */
    VIDEO_END: 'videoEnd',
})

var EventManager = {
    /**
     * 事件类型
     */
    EventType: kEventDefine,

    /**
     * 事件对象，全局并且唯一
     */
    _eventTarget: null,

    /**
     * 创建事件对象单例
     */
    create() {
        if (!this._eventTarget) {
            this._eventTarget = new cc.EventTarget();
        }
        return this._eventTarget;
    },

    /**
     * 注册事件
     * @param {String} name 
     * @param {Function} callback 
     * @param {*} target 
     */
    on(name, callback, target) {
        this._eventTarget.on(name, callback, target);
    },

    /**
     * 注册事件，被触发后删除自身
     * @param {String} name 
     * @param {Function} callback 
     * @param {*} target 
     */
    once(name, callback, target) {
        this._eventTarget.once(name, callback, target);
    },

    /**
     * 注销事件
     * @param {String} name 
     * @param {Function} callback 
     * @param {*} target 
     */
    off(name, callback, target) {
        this._eventTarget.off(name, callback, target);
    },

    /**
     * 发射事件
     * @param {String} name 
     * @param {*} data 
     */
    emit(name, data) {
        this._eventTarget.emit(name, data);
    },
};
//创建事件对象
EventManager.create();

export default EventManager;