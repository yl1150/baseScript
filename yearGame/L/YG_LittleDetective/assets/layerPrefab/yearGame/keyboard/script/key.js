cc.Class({
    extends: cc.Component,
    properties: {
        key:cc.String,
        normalLbColor:cc.Color,
        touchOnLbColor:cc.Color,
        setColor:true
    },

    onLoad(){
        /* let label = this.node.getChildByName('lb').getComponent(cc.Label);
        label.string = this.key; */
    },

    init(cb) {
        cc.YL.tools.registerTouch(
            this.node,
            (e) => {
                GD.sound.playSound('click');
                if(!this._canHandle){
                    return;
                }
                this.setColor && (this.label.node.color = this.touchOnLbColor)
            },
            null,
            (e) => {
                if(!this._canHandle){
                    return;
                }
                this.setColor && (this.label.node.color = this.normalLbColor)
                this._touchCB && this._touchCB(this);
            },
        )
        this._touchCB = cb;
        this._canHandle = true;
        this._btn = this.getComponent(cc.Button);
        let lb = this.node.getChildByName('lb');
        lb && (this.label = lb.getComponent(cc.Label));
    },

    setBtn(isShow){
        this._canHandle = isShow;
        this._btn.interactable = isShow;
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
