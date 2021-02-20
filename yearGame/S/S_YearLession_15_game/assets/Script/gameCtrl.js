//选择选项对应的脚本 
cc.Class({
    extends: cc.Component,

    properties: {
        tips: cc.String,
        rightNode: cc.Node,
    },

    // LIFE-CYCLE CALLBACKS:

    init(asset) {
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

    setTouch(target, isShow) {
        let touchImg = target.getChildByName('k_on');
        if (!touchImg) {
            return;
        }
        touchImg.active = isShow;
    },

    showGame() {
        this.options = this.node.getChildByName('options');
        this.options.children.forEach(op => {
            cc.YL.tools.registerTouch(
                op,
                (e) => {
                    //e.target.setScale(1.2);
                    this.setTouch(e.target, true);
                },
                null,
                (e) => {
                    //e.target.setScale(1);
                    if (this.rightNode == e.target) {
                        this.showRight();
                    } else {
                        GD.sound.playSound('wrong');
                        GD.sound.playSound('blank');
                        this.setError();
                        this.setTouch(e.target, false);
                        cc.tween(e.target)
                            .then(cc.YL.aMgr.SHAKING_X)
                            .start()
                    }
                },
            )
        });

        GD.sound.setTipsButton(true);
        GD.sound.setShowTips(this.tips, true);
        cc.YL.unLockTouch();
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

    showRight() {
        this.setTouch(this.rightNode, true);
        GD.sound.playSound('right');
        GD.root.showStar(this.rightNode, () => {
            this.showFinishLayer();
        });
        cc.YL.lockTouch();
    },


    showRightAnswer() {
        //展示正确答案
        this.setTouch(this.rightNode, true);
        GD.root.showStar(this.rightNode, () => {
            this.showFinishLayer();
        });
        cc.YL.lockTouch();
    },

    showFinishLayer() {
        //此环节完成 注销所有事件
        GD.root.showAddStar(GD.root.getStarNum(this._errorCount), () => {
            cc.YL.timeOut(() => {
                this.node.destroy();
            }, 3000)
            cc.YL.emitter.emit('continueGame');
        })
  
        this.unregisterEvent();
        this.options.active = false;
    },
});
