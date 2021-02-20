cc.Class({
    extends: cc.Component,

    properties: {
        touch_On_Tex: cc.SpriteFrame,
        touch_Off_Tex: cc.SpriteFrame
    },

    // LIFE-CYCLE CALLBACKS:

    init() {
        this.node.children.forEach((op) => {
            !this.isregisterTouch && cc.YL.tools.registerTouch(
                op,
                (e) => {
                    this.setTouch(e.target, true);
                },
                null,
                (e) => {
                    this.setTouch(e.target, false);
                    this.touchCB && this.touchCB(e.target);
                },
            );
            this.setTouch(op, false);
        });

        this.isregisterTouch = true;
    },

    //注册事件
    registerCallFunc(cb) {
        this.touchCB = cb;
    },

    setTouch(target, isShow) {
        target.getComponent(cc.Sprite).spriteFrame = isShow ? this.touch_On_Tex : this.touch_Off_Tex;
    },

    getTarget(name) {
        return this.node.getChildByName(name);
    },
});
