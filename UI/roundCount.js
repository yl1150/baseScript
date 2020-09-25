cc.Class({
    extends: cc.Component,

    properties: {
        roundID:0,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        GD.roundID = this.roundID;
    },

    onEnable () {
        GD.roundID = this.roundID;
    },

    // update (dt) {},
});
