cc.Class({
    extends: cc.Component,

    properties: {
        roundID:0,
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start () {
        GD.roundID = this.roundID;
    },

    // update (dt) {},
});
