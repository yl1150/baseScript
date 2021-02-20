cc.Class({
    extends: cc.Component,

    properties: {
        isTransition: {
            default: false,
            displayName: '是否展示开场动画'
        },
        aniTips: {
            default: [],
            type: [cc.AudioClip],
            displayName: '对应动画的语音'
        },
    },

    // LIFE-CYCLE CALLBACKS:

    init() {
        this._errorCount = 0;
        this.registerEvent();
    },


    //注册事件
    registerEvent() {
        cc.YL.emitter.on('startGame', (e) => {
            this.isTransition ? this.showOpening() : this.startGame();
        })
    },

    unregisterEvent() {
        cc.YL.emitter.off('startGame');
    },

    showOpening() {
        let kid1 = this.node.getChildByName('kids').getChildByName('kid1');
        let kid2 = this.node.getChildByName('kids').getChildByName('kid2');

        var ske1 = kid1.getComponent(sp.Skeleton);
        var ske2 = kid2.getComponent(sp.Skeleton);

        var aniTips = this.aniTips;

        GD.sound.playSound('hungry');
        ske1.setAnimation(0, 'newAnimation_4', false);

        cc.YL.timeOut(() => {
            ske1.setAnimation(0, 'newAnimation_2', true);
            GD.sound.playTips(aniTips.shift(), () => {
                ske1.setAnimation(0, 'newAnimation_1', true);
                ske2.setAnimation(0, 'newAnimation_2', true);
                GD.sound.playTips(aniTips.shift(), () => {
                    ske2.setAnimation(0, 'newAnimation_1', true);
                    this.startGame();
                })
            })
        }, 1000)
    },

    //展示结束时的动画
    showEnding(cb) {
        let kid1 = this.node.getChildByName('kids').getChildByName('kid1');
        let kid2 = this.node.getChildByName('kids').getChildByName('kid2');

        var ske1 = kid1.getComponent(sp.Skeleton);
        var ske2 = kid2.getComponent(sp.Skeleton);

        ske1.setAnimation(0, 'newAnimation_3', false);
        ske2.setAnimation(0, 'newAnimation_3', false);

        let desk = this.node.getChildByName('desk');
        let arr = cc.YL.tools.arrCopy(desk.getChildByName('zhenlong').children);

        let showBaoziHide = () => {
            ske1.setCompleteListener(null);
            cb && cb()
            return;
            if (arr.length < 1) {
                ske1.setCompleteListener(null);
                ske2.setCompleteListener(null);
                cb && cb()
                return;
            }
            arr.shift().active = false;
        };


        ske1.setCompleteListener(showBaoziHide.bind(this));
        //ske2.setCompleteListener(showBaoziHide.bind(this));
    },

    //展示包子出现
    showBaozi() {
        let desk = this.node.getChildByName('desk');
        let hand = desk.getChildByName('hand');
        desk.active = true;
        cc.tween(desk)
            .by(1, { y: 700 })
            .delay(0.5)
            .call(() => {
                cc.tween(hand)
                    .by(1, { y: -700 })
                    .start()
            })
            .start()


    },

    startGame() {
        let showQuestionLayer = () => {
            GD.sound.setTipsButton(true);

            let questionLayer = this.node.getChildByName('questionLayer').getComponent('questionLayer');
            questionLayer.node.active = true;
            this.questionLayer = questionLayer;
            questionLayer.init(
                () => {
                    //正确
                    cc.YL.lockTouch();
                    GD.sound.playSound('right');
                    GD.root.showStar(questionLayer.node, () => {
                        questionLayer.node.active = false;
                        this.showEnding(this.showFinishLayer.bind(this));
                    });
                },
                () => {
                    //错误
                    GD.sound.playSound('wrong');
                    GD.sound.playSound('blank');
                    this.setError();
                }
            )
        }



        if (this.isTransition) {
            this.showBaozi();
            let kid1 = this.node.getChildByName('kids').getChildByName('kid1');
            let kid2 = this.node.getChildByName('kids').getChildByName('kid2');

            var ske1 = kid1.getComponent(sp.Skeleton);
            var ske2 = kid2.getComponent(sp.Skeleton);

            ske2.setAnimation(0, 'newAnimation_2', true);
            ske1.setAnimation(0, 'newAnimation_2', true);
            GD.sound.playTips(this.aniTips.shift(), () => {
                //展示问题场景
                ske2.setAnimation(0, 'newAnimation_1', true);
                ske1.setAnimation(0, 'newAnimation_1', true);
                showQuestionLayer();
            })
        } else {
            this.showBaozi();
            cc.YL.timeOut(() => {
                showQuestionLayer();
            }, 2000)
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
        this.questionLayer.showRightAnswer();
        GD.root.showStar(this.questionLayer.node, () => {
            this.showEnding(this.showFinishLayer.bind(this));
        })
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
