cc.Class({
    extends: cc.Component,
    properties: {
        key: cc.String,
        normalLbColor: cc.Color,
        touchOnLbColor: cc.Color,
        setColor: true,
        label: cc.Node,
        touchFrame:cc.SpriteFrame
    },

    onLoad() {
    },

    init(cb) {
        let norFrame = this.getComponent(cc.Sprite).spriteFrame;
        cc.YL.tools.registerTouch(
            this.node,
            (e) => {
                GD.sound.playSound('click');
                if (!this._canHandle) {
                    return;
                }
                this.getComponent(cc.Sprite).spriteFrame = this.touchFrame;
                this.setColor && (this.label.color = this.touchOnLbColor)
            },
            null,
            (e) => {
                if (!this._canHandle) {
                    return;
                }
                this.getComponent(cc.Sprite).spriteFrame = norFrame;
                this.setColor && (this.label.color = this.normalLbColor)
                this._touchCB && this._touchCB(this);
            },
        )
        this._touchCB = cb;
        this._canHandle = true;
        this._btn = this.getComponent(cc.Button);
    },

    setBtn(isShow) {
        this._canHandle = isShow;
        cc.YL.tools.setSpriteShader(isShow ? 'normal' : 'gray', this.node)
        //this._btn.interactable = isShow;
    },

    touchStart() {

    },

    touchEnd() {

    },

    getCanHandle() {
        return this._canHandle;
    },

    getKeys() {
        return this.key;
    },
});
