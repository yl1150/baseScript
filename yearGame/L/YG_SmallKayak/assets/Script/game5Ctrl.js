//选择选项对应的脚本 
cc.Class({
    extends: cc.Component,

    properties: {
        rightNode: cc.Node,
        tips: {
            displayName: '问题语音',
            type: cc.AudioClip,
            default: null
        },
        isShowScale: true
    },

    // LIFE-CYCLE CALLBACKS:

    init() {
        let riliSke = this.node.getChildByName('rili').getComponent(sp.Skeleton);
        riliSke.setSkin('3yue');
        riliSke.setAnimation(0, 'green_1', true);


        let layer = this.node.getChildByName('layer5');
        layer.active = true;
        this._errorCount = 0;

        this._options = layer.getChildByName('options');

        this._options.children.forEach((kuang) => {
            cc.YL.tools.registerTouch(
                kuang,
                (e) => {
                    this.isShowScale && e.target.setScale(1.2);
                    this.setTouch(e.target, true);
                },
                null,
                (e) => {
                    this.isShowScale && e.target.setScale(1);
                    this.rightNode == e.target ? this.showRight(this.rightNode) : this.showWrong(e.target);
                },
            )
        });
        cc.YL.addClock(this.tips);
        GD.sound.setShowTips(this.tips, true);
        cc.YL.unLockTouch();
    },

    setTouch(target, isShow) {
        target.getComponent(cc.Sprite).enabled = isShow;
    },

    showRight(option) {
        cc.YL.lockTouch();
        GD.sound.playSound('right');
        GD.root.showStar(option, () => {
            this.showFinishLayer();
        })
    },

    showWrong(option) {
        this.setTouch(option, false);
        GD.sound.playSound('wrong');
        GD.sound.playSound('blank');
        cc.tween(option).then(
            cc.YL.aMgr.zoomAction(2)
        ).start()
        this.setError();
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
        //展示正确答案
        cc.YL.lockTouch();
        this.setTouch(this.rightNode, true);
        GD.root.showStar(this.rightNode, () => {
            this.showFinishLayer();
        })
    },

    showFinishLayer() {
        //此环节完成 注销所有事件
       /*  let layer = this.node.getChildByName('layer5');
        layer.destroy(); */
        cc.YL.emitter.emit('continueGame');
    },
});
