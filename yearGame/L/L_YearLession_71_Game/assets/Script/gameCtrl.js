
let skeMessage = cc.Class({
    name: "skeData",
    properties: {
        tipsArr: [cc.AudioClip],
        moveX: [cc.Float]
    }
})
cc.Class({
    extends: cc.Component,

    properties: {
        tips: cc.String,
        isTransition: true,
        skeData: {
            default: null,
            type: skeMessage,
            displayName: '游戏数据',
        },
    },

    // LIFE-CYCLE CALLBACKS:

    init() {
        this._errorCount = 0;
        this.speakPool = [];
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

    showOpening() {
        let kidsArr = cc.YL.tools.arrCopy(this.node.getChildByName('kids').children);


        var skeData = this.skeData;
        var tipsArr = skeData.tipsArr;
        var moveX = skeData.moveX;

        let showBubble = (pNode) => {
            let pB = pNode.getChildByName('qipao');
            pB.active = true;
        };

        let hideBubble = (pNode) => {
            let pB = pNode.getChildByName('qipao');
            pB.active = false;
        };


        let showShopping = (cb) => {
            if (kidsArr.length < 1) {
                cb && cb();
                return;
            }
            let kid = kidsArr.shift();
            kid.active = true;
            let kidSke = kid.getComponent(sp.Skeleton);
            //人物进场
            kidSke.setAnimation(0, 'newAnimation_2', true);
            cc.tween(kid)
                .to(2, { x: 0 })
                .call(() => {
                    //人物说话
                    var clip = tipsArr.shift();
                    GD.sound.playTips(clip);
                    kidSke.setAnimation(0, 'newAnimation_4', true);

                    showBubble(kid);

                    var time = GD.sound.getDuringTime(clip) - 0.25;
                    cc.YL.timeOut(() => {
                        //播放苹果姐姐说话
                        kidSke.setAnimation(0, 'newAnimation_3', true);
                        clip = tipsArr.shift();

                        //当有苹果姐姐的回复语音时
                        if (clip) {
                            cc.YL.emitter.emit('setAni', 'speak');
                            GD.sound.playTips(clip, () => {
                                cc.YL.emitter.emit('setAni', 'stay');
                                let mX = moveX.shift();
                                if (mX != 0) {
                                    hideBubble(kid);
                                    kidSke.setAnimation(0, 'newAnimation_2', true);
                                    cc.tween(kid)
                                        .by(0.5, { x: mX })
                                        .call(() => {
                                            showBubble(kid);
                                            kidSke.setAnimation(0, 'newAnimation_1', true);
                                            showShopping(cb);
                                        })
                                        .start()
                                } else {
                                    kidSke.setAnimation(0, 'newAnimation_1', true);
                                    showShopping(cb);
                                }
                            });
                        } else {
                            //不播放苹果说话相关
                            let mX = moveX.shift();
                            if (mX != 0) {
                                hideBubble(kid);
                                kidSke.setAnimation(0, 'newAnimation_2', true);
                                cc.tween(kid)
                                    .by(0.5, { x: mX })
                                    .call(() => {
                                        showBubble(kid);
                                        kidSke.setAnimation(0, 'newAnimation_1', true);
                                        showShopping(cb);
                                    })
                                    .start()
                            } else {
                                kidSke.setAnimation(0, 'newAnimation_1', true);
                                showShopping(cb);
                            }
                        }





                    }, time * 1000)

                })
                .start()
        };


        showShopping(() => {
            this.startGame();
        })
    },


    //展示结束时的动画
    showEnding(cb) {
        let kidsArr = cc.YL.tools.arrCopy(this.node.getChildByName('kids').children);
        let showBubble = (pNode) => {
            let pB = pNode.getChildByName('qipao');
            pB.active = true;
            pB.setScale(0);
            cc.tween(pB)
                .to(0.5, { scale: 1 })
                .start()
        };

        let hideBubble = (pNode) => {
            let pB = pNode.getChildByName('qipao');
            pB.active = false;
        };


        kidsArr.forEach((kid) => {
            hideBubble(kid);
            let kidSke = kid.getComponent(sp.Skeleton);
            //人物进场
            kidSke.setAnimation(0, 'newAnimation_2', true);
            let moveX;
            if (kid.x < 0) {
                moveX = -cc.winSize.width / 2 - kid.width;
            } else {
                kid.scaleX = -kid.scaleX;
                moveX = cc.winSize.width / 2 + kid.width;
            }
            cc.tween(kid)
                .by(2, { x: moveX })
                .call(() => {
                    kidSke.setAnimation(0, 'newAnimation_4', true);
                })
                .start()
        });


        cc.YL.timeOut(() => {
            cb && cb();
        }, 2500)

    },

    startGame() {
        GD.sound.setTipsButton(true);
        cc.YL.unLockTouch();
        GD.sound.setShowTips(this.tips, true);

        let formula = this.node.getChildByName('formula').getComponent('formula');
        formula.node.active = true;
        this.formula = formula;
        formula.init(
            () => {
                //正确
                cc.YL.lockTouch();
                GD.sound.playSound('right');
                GD.root.showStar(formula.node, () => {
                    formula.node.active = false;
                    this.showFinishLayer();
                });
            },
            () => {
                //错误
                GD.sound.playSound('wrong');
                GD.sound.playSound('blank');
                this.setError();
            }
        )

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
        this.formula.showRightAnswer();
        GD.root.showStar(this.formula.node, () => {
            this.showFinishLayer();
        })
        cc.YL.lockTouch();
    },

    showFinishLayer() {
        //此环节完成 注销所有事件
        this.unregisterEvent();
        GD.root.showAddStar(GD.root.getStarNum(this._errorCount), () => {
            this.showEnding(() => {
                cc.YL.emitter.emit('continueGame');
                this.node.destroy();
            })
        })
    },
});
