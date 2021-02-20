//选择选项对应的脚本 
cc.Class({
    extends: cc.Component,

    properties: {
        tips: cc.String,
    },

    // LIFE-CYCLE CALLBACKS:

    init(asset) {
        this._errorCount = 0;
        this.opPool = [];
        this._options = this.node.getChildByName('options');
        this._options.children.forEach((op) => {
            this.opPool.push(op);
            op.getComponent('options').init(this);
        })
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
        GD.sound.setTipsButton(true);
        GD.sound.setShowTips(this.tips, true);
        cc.YL.unLockTouch();
    },

    checkIsAllRight() {
        if (this._options.childrenCount < 1) {
            cc.YL.timeOut(() => {
                GD.root.showAddStar(GD.root.getStarNum(this._errorCount), () => {
                    this.showFinishLayer();
                })
            }, 1000);
            cc.YL.lockTouch();
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
        let arr = cc.YL.tools.arrCopy( this._options.children);
        for (let i in arr) {
            arr[i].getComponent('options').showRightAnswer();
        }

        GD.root.showStar(this._options, () => {
            GD.root.showAddStar(GD.root.getStarNum(this._errorCount), () => {
                this.showFinishLayer();
            })
        });
        cc.YL.lockTouch();
    },

    showFinishLayer() {
        //此环节完成 注销所有事件
        this.unregisterEvent();
        cc.YL.emitter.emit('continueGame');
        this.node.destroy();
    },
});
