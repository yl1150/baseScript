cc.Class({
    extends: cc.Component,

    properties: {
        tips: cc.String,
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    init() {
        this.spine = this.node.getChildByName('yin').getComponent(sp.Skeleton);
        cc.YL.emitter.on('stopTips', (e) => {
            this.spine.setAnimation(0, 'animation', true);
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

    unregisterEvent(){
        cc.YL.emitter.off('stopTips');
    },

    showTips() {
        GD.sound.playTips(this.tips, () => {
            this.spine.setAnimation(0, 'animation', true);
        });
        this.spine.setAnimation(0, 'animation2', true);
    },

    playTips(cb) {
        GD.sound.playTips(this.tips, () => {
            this.spine.setAnimation(0, 'animation', true);
            cb && cb();
        });
        this.spine.setAnimation(0, 'animation2', true);
    },

    // update (dt) {},
});
