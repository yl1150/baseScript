cc.Class({
    extends: cc.Component,

    properties: {

    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    fit() {
        let originSize = cc.Size(1230, 566);
        let widget = this.getComponent(cc.Widget);
        if (this.node.height > originSize.height) {
            //拉伸了 
            this.node.height = originSize.height;
            widget.enabled = false;
        }
    },

    // update (dt) {},
});
