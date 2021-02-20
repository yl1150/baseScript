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
        let riliSke = this.node.getChildByName('rili').getComponent(sp.Skeleton);
        /* riliSke.setSkin('1yue');
        riliSke.setAnimation(0, 'blue_1', true); */

        this._isAllFinish = false;
        this._errorCount = 0;

        let layer = this.node.getChildByName('layer2');
        layer.active = true;
        this._boxs = layer.getChildByName('boxs');
        this._options = layer.getChildByName('options');

        this._options.children.forEach((kuang) => {
            let op = kuang.getComponent('options');
            op.init(this);
        })

        cc.YL.addClock(this.tips);
        GD.sound.setShowTips(this.tips, true);
        cc.YL.unLockTouch();
    },

    checkIsAllRight() {
        let isRight = true;
        this._boxs.children.forEach((box) => {
            box._state != 'lock' && (isRight = false);
        })

        if (isRight && !this._isAllFinish) {
            //正确
            this._isAllFinish = true;
            cc.YL.lockTouch();
            this.showFinishLayer();
        }
    },

    setError() {
        this._errorCount++;
        let maxErrCount = 3
        if (this._errorCount >= maxErrCount) {
            cc.YL.lockTouch();
            cc.YL.timeOut(() => {
                GD.sound.playTips('tipsWatch', () => {
                    this.showRightAnswer();
                })
            }, 1000);
        }
    },

    showRightAnswer() {
        this._isAllFinish = true;
        this._options.children.forEach((kuang) => {
            let op = kuang.getComponent('options');
            op.showRightAnswer();
        })
        GD.root.showStar(this.node);
        cc.YL.timeOut(this.showFinishLayer.bind(this), 1500);
    },

    showFinishLayer() {
        cc.YL.timeOut(() => {
            //此环节完成 注销所有事件
            //this.node.destroy();
            let layer = this.node.getChildByName('layer2');
            layer.destroy();
            cc.YL.emitter.emit('continueGame');
        }, 1000)

    },
});
