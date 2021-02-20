//选择选项对应的脚本 
cc.Class({
    extends: cc.Component,

    properties: {
        tips: cc.String,
        isTransition: true
    },

    // LIFE-CYCLE CALLBACKS:

    init() {
        this._errorCount = 0;
        this.registerEvent();
    },


    //注册事件
    registerEvent() {
        cc.YL.emitter.on('startGame', (e) => {
            this.showGame();
        })
    },

    unregisterEvent() {
        cc.YL.emitter.off('startGame');
    },

    showGame() {
        this.birdNests = this.node.getChildByName('birdNests');
        this.options = this.node.getChildByName('options');
        this.options.children.forEach((op) => {
            op.getComponent('options').init(this);
        })
        GD.sound.setTipsButton(true);
        GD.sound.setShowTips(this.tips, true);
        cc.YL.unLockTouch();
    },

    putOp(op) {
        let arr = this.options.children;
        let arr2 = this.labas.children;
        for (let i in arr) {
            if (arr[i] == op) {
                let laba = arr2[i];
                laba.parent = null;
                laba.destroy();
                return;
            }
        }
    },

    checkIsAllRight() {
        if (this.options.childrenCount < 1) {
            cc.YL.lockTouch();
            cc.YL.timeOut(() => {
                this.showFinishLayer();
            }, 1000)
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
        //展示正确答案
        let arr = cc.YL.tools.arrCopy(this.options.children);
        arr.forEach((op) => {
            op.getComponent('options').showRightAnswer();
        })
        GD.root.showStar(this.options, () => {
            this.showFinishLayer();
        });
        cc.YL.lockTouch();
    },

    showFinishLayer() {
        //此环节完成 注销所有事件
        this.unregisterEvent();
        GD.root.showAddStar(GD.root.getStarNum(this._errorCount), () => {
            cc.YL.emitter.emit('continueGame');
            cc.YL.timeOut(() => {
                this.node.destroy();
            }, 2000)
        })
    },
});
