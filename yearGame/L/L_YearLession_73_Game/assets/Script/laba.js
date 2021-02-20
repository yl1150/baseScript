cc.Class({
    extends: cc.Component,

    properties: {
        tips: cc.String,
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start() {
        this.spine = this.getComponent(sp.Skeleton);
        cc.YL.emitter.on('stopTips', (e) => {
            this.spine.setAnimation(0, 'animation2', true);
        })
        cc.YL.tools.registerTouch(
            this.node,
            (e) => {

            },
            null,
            (e) => {
                this.showTips();
            },
        )
    },

    onDestroy(){
        cc.YL.emitter.off('stopTips');
    },

    showTips() {
        GD.sound.playTips(this.tips, () => {
            this.spine.setAnimation(0, 'animation2', true);
        });
        this.spine.setAnimation(0, 'animation', true);
    },

    playTips(cb) {
        GD.sound.playTips(this.tips, () => {
            this.spine.setAnimation(0, 'animation2', true);
            cb && cb();
        });
        this.spine.setAnimation(0, 'animation', true);
    },

    // update (dt) {},
});
