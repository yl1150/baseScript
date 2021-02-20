cc.Class({
    extends: cc.Component,

    properties: {
        tips: cc.String,
        kidSke:sp.Skeleton,
        playAni:'animation_2',
        stopAni:'animation_1'
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    init() {
        this.spine = this.getComponent(sp.Skeleton);
        cc.YL.emitter.on('stopTips', (e) => {
            this.kidSke && this.kidSke.setAnimation(0,this.stopAni,true);
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
            this.kidSke && this.kidSke.setAnimation(0,this.stopAni,true);
            this.spine.setAnimation(0, 'animation', true);
        });
        this.spine.setAnimation(0, 'animation2', true);
        cc.YL.timeOut(()=>{
            this.kidSke && this.kidSke.setAnimation(0,this.playAni,true);
        },200)
    },

    playTips(cb) {
        GD.sound.playTips(this.tips, () => {
            this.kidSke && this.kidSke.setAnimation(0,this.stopAni,true);
            this.spine.setAnimation(0, 'animation', true);
            cb && cb();
        });
        this.spine.setAnimation(0, 'animation2', true);
        cc.YL.timeOut(()=>{
            this.kidSke && this.kidSke.setAnimation(0,this.playAni,true);
        },200)
    },

    // update (dt) {},
});
