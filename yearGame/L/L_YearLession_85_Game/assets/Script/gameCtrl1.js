let skeMessage = cc.Class({
    name: "skeData",
    properties: {
        mes: '数据内容',
        effect: '',
        tips: '',
        durT: 0,
        MoveScreen: '',
        ActionType: '',
        delayT: 0.0,
        actionNodes: [cc.Node],
        skeDelayT: 0.0,
        skes: [sp.Skeleton],
        aniName: '',
        endAniName: 'daiji',
        isLoop: true,
    }
})
cc.Class({
    extends: cc.Component,

    properties: {
        tips: cc.String,
        isTransition: '',
        options: cc.Node,
        rightNode: cc.Node,
        openingAnis: {
            default: [],
            type: [skeMessage],
            displayName: '开场动画数据',
        },
        endingAnis: {
            default: [],
            type: [skeMessage],
            displayName: '退场动画数据',
        }
    },

    init() {
        this._errorCount = 0;
        this.registerEvent();
    },


    //注册事件
    registerEvent() {
        cc.YL.emitter.on('startGame', (e) => {
            this.showOpening();
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

    showOpening() {
        this.showSpineAni(this.openingAnis, () => {
            this.showGame();
        })
    },

    showSpineAni(dataPool, finishCB) {
        let showAni = function (aniDataPool, cb) {
            if (aniDataPool.length < 1) {
                cb && cb();
                return;
            }
            let time = 0;
            let data = aniDataPool.shift();
            if (data.MoveScreen != '') {
                cc.YL.emitter.emit('moveScreen', data.MoveScreen);
                time = 2;
            }
            cc.YL.timeOut(() => {
                if (data.durT == 0) data.durT = GD.sound.getDuringTime(data.tips);
                if (data.tips != '') GD.sound.playTips(data.tips);
                if (data.effect != '') GD.sound.playSound(data.effect);

                cc.YL.timeOut(() => {
                    data.skes.forEach((ske) => {
                        if (data.endAniName != '') ske.setAnimation(0, data.endAniName, true);
                    });
                    showAni(aniDataPool, cb);
                }, data.durT * 1000);
                //动画
                if (data.skes.length > 0) {
                    cc.YL.timeOut(() => {
                        data.skes.forEach((ske) => {
                            ske.setAnimation(0, data.aniName, data.isLoop);
                        });
                    }, data.skeDelayT * 1000)
                }

                //节点动作
                if (data.ActionType != '') {
                    cc.YL.timeOut(() => {
                        if (data.ActionType == 'active') {
                            data.actionNodes.forEach((pnode) => {
                                pnode.active = true;
                                pnode.opacity = 0;
                                cc.tween(pnode)
                                    .to(0.5, { opacity: 255 })
                                    .to(0.5, { opacity: 0 })
                                    .start()
                            });
                        }
                        if (data.ActionType == 'hide') {
                            data.actionNodes.forEach((pnode) => {
                                pnode.active = false;
                            });
                        }
                        if (data.ActionType == 'show') {
                            data.actionNodes.forEach((pnode) => {
                                pnode.active = true;
                            });
                        }
                    }, data.delayT * 1000);
                }
            }, time * 1000)
        }
        showAni(dataPool, finishCB);
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
        this.options.children.forEach(op => {
            this.setTouch(this.rightNode, false);
            cc.YL.tools.unRegisterTouch(op)
        });
        this.options.active = false;
        this.showSpineAni(this.endingAnis, () => {
            cc.YL.emitter.emit('continueGame');
            this.node.destroy();
        })
    },
});
