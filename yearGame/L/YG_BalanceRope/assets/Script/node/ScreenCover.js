cc.Class({
    extends: cc.Component,

    properties: {},

    onLoad() {
        this.cover = this.node.getChildByName("cover");
        this.cover.active = false;
        cc.origin.Note.screenCover = this.cover;
    },

    start() {
        //处理事件
        this.handleEvent();
    },

    update(dt) {
        var isPlayingTrumpet = false;
        if (cc.origin.Note.trumpet) isPlayingTrumpet = cc.origin.Note.trumpet.isPlaying;
        if (this.cover.active || isPlayingTrumpet) {
            cc.origin.Note.t_leisure = 0;
        } else {
            cc.origin.Note.t_leisure += dt;
        }
    },

    handleEvent() {
        cc.origin.EventManager.on(cc.origin.EventDefine.COMMON.FREEZE_TIME, function () {
            //屏幕不可操作
            cc.origin.Note.screenCover.active = true;
        }, this);
        cc.origin.EventManager.on(cc.origin.EventDefine.COMMON.KINETIC_TIME, function () {
            //屏幕可以操作
            cc.origin.Note.screenCover.active = false;
        }, this);
    },
});