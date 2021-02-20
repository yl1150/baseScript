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
        errorTips: {
            displayName: '答案语音',
            type: cc.AudioClip,
            default: null
        },
        isShowScale:true
    },

    // LIFE-CYCLE CALLBACKS:

    init() {
        this._errorCount = 0;
        let dimonds = this.node.getChildByName('dimonds');
        dimonds.children.forEach((kuang) => {
            cc.YL.tools.registerTouch(
                kuang,
                (e) => {
                    this.isShowScale && e.target.setScale(1.2);
                    this.setTouch(e.target, true);
                },
                null,
                (e) => {
                    this.isShowScale && e.target.setScale(1);
                    this.setTouch(e.target, false);
                    this.rightNode == e.target ? this.showRight(this.rightNode) : this.showWrong(e.target);
                },
            )
        });
        cc.YL.addClock(this.tips);
        GD.sound.setShowTips(this.tips, true);
        cc.YL.unLockTouch();
    },

    setTouch(target, isShow) {
        target._touchImg && (target._touchImg.active = isShow);
    },

    showRight(option) {
        cc.YL.lockTouch();
        GD.sound.playSound('right');
        this.setTouch(option, true);
        GD.root.showStar(option, () => {
            this.showAnswerTips(option);
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
            this.showAnswerTips();
        })
    },

    showAnswerTips() {
        GD.sound.playTips(this.errorTips, () => {
            setTimeout(() => {
                GD.root.showAddStar(GD.root.getStarNum(this._errorCount), () => {
                    this.showFinishLayer();
                })
            }, 500);
        });
        cc.tween(this.rightNode)
            .delay(0)
            .then(cc.YL.aMgr.zoomAction(2))
            .start()
    },

    showFinishLayer() {
        //此环节完成 注销所有事件
        let dimonds = this.node.getChildByName('dimonds');
        dimonds.children.forEach((dimond) => {
            cc.YL.tools.unRegisterTouch(dimonds);
        });
        cc.YL.emitter.emit('continueGame');
    },
});
