//选择选项对应的脚本 
cc.Class({
    extends: cc.Component,

    properties: {
        tips: cc.String,
        isShowTransitionAnimation: false,
        transitionSke: sp.Skeleton,
        options: cc.Node,
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
        let touchImg = target.getChildByName('touchImg');
        if (!touchImg) {
            return;
        }
        touchImg.active = isShow;
    },

    showGame() {
        this.options.active = true;
        this.options.children.forEach(op => {
            cc.YL.tools.registerTouch(
                op,
                (e) => {
                    e.target.setScale(1.2);
                    this.setTouch(e.target, true);
                },
                null,
                (e) => {
                    e.target.setScale(1);
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
        GD.root.showStar(this.rightNode, () => {
            GD.root.showAddStar(GD.root.getStarNum(this._errorCount), () => {
                this.showFinishLayer();
            })
        });
        cc.YL.lockTouch();
    },


    showRightAnswer() {
        //展示正确答案
        this.showRight();
    },

    //展示过渡动画
    showTransitionAnimation(cb) {
        if (!this.transitionSke) {
            cb && cb();
        }
        this.transitionSke.setAnimation(0, 'newAnimation_1', false);
        this.transitionSke.setEndListener(() => {
            cb && cb();
            this.transitionSke.setEndListener(null);
        })



    },

    showFinishLayer() {
        //此环节完成 注销所有事件
        this.unregisterEvent();
        this.options.active = false;
        this.options.children.forEach(op => {
            this.setTouch(this.rightNode, false);
            let icon = this.rightNode.getChildByName('icon');
            icon && (icon.active = false);
            cc.YL.tools.unRegisterTouch(op)
        });

        if (this.isShowTransitionAnimation) {
            this.showTransitionAnimation(() => {
                cc.YL.emitter.emit('continueGame');
                this.node.destroy();
            })
        } else {
            cc.YL.emitter.emit('continueGame');
            this.node.destroy();
        }
    },
});
