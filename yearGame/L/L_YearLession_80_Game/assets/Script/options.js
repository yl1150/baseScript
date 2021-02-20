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
                },
                null,
                (e) => {
                    this.setTouch(e.target, !e.target.isSelected);
                    this.touchCB && this.touchCB(e.target);
                },
            );
            this.setTouch(op, false);
        });

        this.isregisterTouch = true;
    },

    showAnswer(answer){
        let arr = this.node.children;
        for(let i in answer){
            this.setTouch(arr[i], answer[i]);
        }
    },

    clear(){
        this.node.children.forEach((op) => {
            this.setTouch(op, false);
        });
    },

    //注册事件
    registerCallFunc(cb) {
        this.touchCB = cb;
    },

    setTouch(target, isShow) {
        target.isSelected = isShow;
        target.getComponent(cc.Sprite).spriteFrame = isShow ? this.touch_On_Tex : this.touch_Off_Tex;
    },

    getTarget(name) {
        return this.node.getChildByName(name);
    },
});
