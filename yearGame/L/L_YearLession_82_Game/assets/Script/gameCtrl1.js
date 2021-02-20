//选择选项对应的脚本 
cc.Class({
    extends: cc.Component,

    properties: {
        tips: cc.String,
        isTransition: false,
        isShowAni: false,
        bsSke: sp.Skeleton,
        bsAni: cc.String,
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
        let touchImg = target.getComponent(cc.Sprite);
        if (!touchImg) {
            return;
        }
        touchImg.enabled = isShow;
    },

    showGame() {
        this.options.active = true;
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
        this.unregisterEvent();
        this.options.active = false;
        this.options.children.forEach(op => {
            this.setTouch(this.rightNode, false);
            cc.YL.tools.unRegisterTouch(op)
        });

        if (this.bsSke && this.isShowAni) {
            let example = this.bsSke.node.getChildByName('example');
            if(example)example.active = false;
            this.bsSke.setAnimation(0, this.bsAni, false);
            cc.YL.timeOut(() => {
                this.bsSke.node.active = false;
                cc.YL.emitter.emit('continueGame');
                this.node.destroy();
            }, 4000)
        } else {
            let pos = cc.YL.tools.getRelativePos(this.rightNode, this.bsSke.node);
            this.rightNode.setParent(this.bsSke.node);
            this.rightNode.setPosition(pos);
            this.rightNode.name = 'example';
            cc.tween(this.rightNode)
                .then(cc.YL.aMgr.lineMove(this.rightNode.position, cc.v2(500, 25), 0.05))
                .delay(1)
                .call(() => {
                    cc.YL.emitter.emit('continueGame');
                    this.node.destroy();
                })
                .start()
        }
    },
});
