//选择选项对应的脚本 
cc.Class({
    extends: cc.Component,

    properties: {
        tips: {
            displayName: '问题语音',
            type: cc.AudioClip,
            default: null
        },
    },

    // LIFE-CYCLE CALLBACKS:

    init() {
        let handSke = this.node.getChildByName('hand').getComponent(sp.Skeleton);
        let riliSke = this.node.getChildByName('rili').getComponent(sp.Skeleton);
        let touch = this.node.getChildByName('touch');


        handSke.setAnimation(0, 'newAnimation_1', true);
        riliSke.setAnimation(0, 'blue_1', true);
        riliSke.setSkin('a');
        cc.YL.unLockTouch();
        let startPoint = null;

        cc.YL.tools.registerTouch(
            touch,
            (e) => {
                startPoint = e.getLocation();
            },
            (e) => {

            },
            (e) => {
                let endPoint = e.getLocation();
                if (cc.YL.tools.getDisTance(startPoint, endPoint) > 100) {
                    //封面翻页到1月
                    cc.YL.lockTouch();
                    riliSke.setAnimation(0, 'blue_2', false);
                    handSke.node.active = false;
                    cc.YL.timeOut(() => {
                        this.showFinishLayer();
                    }, 1000)
                }
            },
        )

        cc.YL.addClock(this.tips);
        GD.sound.setShowTips(this.tips, true);
        cc.YL.unLockTouch();
    },

    showFinishLayer() {
        //此环节完成 注销所有事件
        //this.node.destroy();
        let touch = this.node.getChildByName('touch');
        touch.active = false;
        cc.YL.tools.unRegisterTouch(touch);
        cc.YL.emitter.emit('continueGame');
    },
});
