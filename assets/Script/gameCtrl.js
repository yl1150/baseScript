cc.Class({
    extends: cc.Component,

    properties: {
        tips: cc.String,
        graphicsNode: cc.Node,
        options: cc.Node,
        rightNode: cc.Node,
        ske: sp.Skeleton,
        machine: sp.Skeleton,
        power: sp.Skeleton
    },

    // LIFE-CYCLE CALLBACKS:

    init() {
        this._errorCount = 0;
        this.options.children.forEach(op => {
            cc.YL.tools.registerTouch(
                op,
                (e) => {
                    // e.target.setScale(1.2);
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
        let touchImg = target.getChildByName('xuanzhong');
        if (!touchImg) {
            return;
        }
        touchImg.active = isShow;
    },

    showGame() {
        //展示动画
        let icon = this.node.getChildByName('icon');
        icon.active = true;
        this.options.active = true;

        GD.sound.setTipsButton(true);
        GD.sound.setShowTips(this.tips, true);
        cc.YL.unLockTouch();
        if (this.ske) {
            this.ske.setAnimation(0, 'ce_daiji2', true);
        } else {
            icon.y += 500;
            cc.tween(icon)
                .by(1, { y: -500 })
                .start()
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

    showRight() {
        this.setTouch(this.rightNode, true);
        GD.sound.playSound('right');
        GD.root.showStar(this.rightNode, () => {
            GD.root.showAddStar(GD.root.getStarNum(this._errorCount), () => {
                this.showFinishLayer();
            })
        });
        cc.YL.lockTouch();
    },


    showRightAnswer() {
        //展示正确答案
        this.setTouch(this.rightNode, true);
        GD.root.showStar(this.rightNode, () => {
            GD.root.showAddStar(GD.root.getStarNum(this._errorCount), () => {
                this.showFinishLayer();
            })
        });
        cc.YL.lockTouch();
    },

    showFinishLayer() {
        //此环节完成 注销所有事件
        GD.sound.setTipsButton(false);
        this.unregisterEvent();
        this.options.active = false;
        this.options.children.forEach(op => {
            this.setTouch(this.rightNode, false);
            cc.YL.tools.unRegisterTouch(op)
        });
        let icon = this.node.getChildByName('icon');
        icon.active = false;
        if (this.graphicsNode) {
            this.graphicsNode.active = true;

            this.machine.addAnimation(0, 'daiji2', false);
            this.machine.addAnimation(0, 'jing', true);
            this.power.node.active = true;
            this.power.setAnimation(0, 'zhang_a1', false);
            cc.tween(this.graphicsNode)
                .delay(2.5)
                .to(3, { x: 2000 })
                .call(() => {
                    this.power.node.active = false;
                    cc.YL.emitter.emit('continueGame');
                    this.node.destroy();
                })
                .start()
        } else {
            icon.active = true;
            cc.YL.emitter.emit('continueGame');
            this.node.destroy();

        }






















    },
});
