cc.Class({
    extends: cc.Component,
    properties: {
        key:cc.String,
        touchOnTex:cc.SpriteFrame,
        touchOffTex:cc.SpriteFrame,
    },

    onLoad(){
    },

    init(cb) {
        cc.YL.tools.registerTouch(
            this.node,
            (e) => {
                GD.sound.playSound('click');
                this.setBtn(true);
            },
            null,
            (e) => {
                this.setBtn(false);
                this._touchCB && this._touchCB(this);
            },
        )
        this._touchCB = cb;
    },

    setBtn(isShow){
        this.getComponent(cc.Sprite).spriteFrame = isShow?this.touchOnTex:this.touchOffTex;
    },

    touchStart() {
  
    },

    touchEnd() {
       
    },

    getCanHandle(){
        return this._canHandle;
    },

    getKeys(){
        return this.key;
    },
});
