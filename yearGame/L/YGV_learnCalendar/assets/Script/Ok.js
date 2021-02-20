cc.Class({
    extends: cc.Component,

    properties: {},

    onLoad() {
        this.registerOkTouch();
    },

    onDestroy() {
        this.unregisterOkTouch();
    },

    start() { },

    setOkCallback(cb) {
        this.cb = cb;
    },

    setOkTouch(statusId = 1) {
        //0禁止触摸，1正常，2按下
        this.node._canTouch = statusId;
        var spt_normal = this.node.getChildByName('normal').getComponent(cc.Sprite).spriteFrame;
        var spt_pressed = this.node.getChildByName('pressed').getComponent(cc.Sprite).spriteFrame;
        if (statusId === 1) {
            //正常效果
            this.node.getComponent(cc.Sprite).spriteFrame = spt_normal;
            cc.origin.ShaderBase.setSpriteShader(this.node, cc.origin.ShaderBase.ShaderType.Default);
        } else if (statusId === 2) {
            //按下效果
            this.node.getComponent(cc.Sprite).spriteFrame = spt_pressed;
            cc.origin.ShaderBase.setSpriteShader(this.node, cc.origin.ShaderBase.ShaderType.Default);
        } else {
            //不可交互效果
            this.node.getComponent(cc.Sprite).spriteFrame = spt_normal;
            cc.origin.ShaderBase.setSpriteShader(this.node, cc.origin.ShaderBase.ShaderType.Gray);
        }
    },

    registerOkTouch() {
        this.node.on(cc.Node.EventType.TOUCH_START, function (event) {
            if (cc.origin.Note.touchTarget) return;
            cc.origin.Note.touchTarget = event.target;
            cc.origin.EventManager.emit(cc.origin.EventDefine.COMMON.FREEZE_TIME);
            cc.origin.AudioBase.play('click');
            //按下效果
            this.setOkTouch(2);
            //喇叭停止循环
            cc.origin.Note.trumpet.setLoopPlay(false);
        }, this)
        this.node.on(cc.Node.EventType.TOUCH_MOVE, function (event) { }, this)
        this.node.on(cc.Node.EventType.TOUCH_END, touchUp, this)
        this.node.on(cc.Node.EventType.TOUCH_CANCEL, touchUp, this)
        function touchUp(event) {
            if (!cc.origin.Note.touchTarget) return;
            cc.origin.EventManager.emit(cc.origin.EventDefine.COMMON.KINETIC_TIME);
            //正常效果
            this.setOkTouch(1);
            //
            if (this.cb) this.cb();
            //重置触摸对象
            cc.origin.Note.touchTarget = null;
        }
    },

    unregisterOkTouch() {
        this.node.off(cc.Node.EventType.TOUCH_START)
        this.node.off(cc.Node.EventType.TOUCH_MOVE)
        this.node.off(cc.Node.EventType.TOUCH_END)
        this.node.off(cc.Node.EventType.TOUCH_CANCEL)
    },
});