cc.Class({
    extends: cc.Component,

    properties: {
        maxLv: 4,
    },


    start() {
        this.lv = 1;
        cc.YL.yearGame = this;
        cc.YL.lockTouch();
        this.openingLayer = this.node.getChildByName('openingLayer');
        this.gameLayer = this.node.getChildByName('gameLayer');
        GD.sound.playBGM();
        GD.sound.setTipsButton(false);
        GD.sound.playTips('startTips', () => {
            this.showOpening();
        })
        this.registerEvent();

    },


    //注册事件
    registerEvent() {
        //继续下一环节游戏
        cc.YL.emitter.on('continueGame', () => {
            this.continueGame();
        })
    },

    //开场动画
    showOpening() {
        //展示来点话动画
        let sb = this.openingLayer.getChildByName('shubao').getComponent(sp.Skeleton);
        let dd = this.openingLayer.getChildByName('doudou').getComponent(sp.Skeleton);
        let touchPoint = this.openingLayer.getChildByName('touchPoint');
        sb.setAnimation(0, 'animation3', false);
        sb.addAnimation(0, 'animation5', true);
        GD.sound.playTips('phoneTips');
        sb.setCompleteListener(() => {
            //注册触摸
            sb.setCompleteListener(null);
            cc.YL.unLockTouch();
            cc.YL.tools.registerTouch(
                touchPoint,
                (e) => {
                    // e.target.setScale(1.2);
                },
                null,
                (e) => {
                    //e.target.setScale(1);
                    //电话接通 过渡到打电话场景
                    touchPoint.active = false;
                    sb.node.active = false;
                    this.showPhoneCall();
                },
            );
        })
    },

    showPhoneCall() {
        let pcLayer = this.openingLayer.getChildByName('pcLayer');
        let ddUI = this.openingLayer.getChildByName('ddUI');
        let dd = ddUI.getChildByName('doudou').getComponent(sp.Skeleton);
        let xm = pcLayer.getChildByName('xiaomi').getComponent(sp.Skeleton);
        let mm = pcLayer.getChildByName('maomao').getComponent(sp.Skeleton);
        let pg = pcLayer.getChildByName('pgjj').getComponent(sp.Skeleton);
        let guanji = this.openingLayer.getChildByName('guanji').getComponent(sp.Skeleton);


        ddUI.active = true;
        pcLayer.active = true;
        cc.tween(pcLayer)
            .to(0.5, { scale: 1, angle: 0 })
            .call(() => {
                //聊天开始 嗨，你们好，有什么需要吗？
                dd.setAnimation(0, 'animation6', true);
                GD.sound.playTips('startTips_1', () => {
                    dd.setAnimation(0, 'animation5', true);

                    //你好，我们想订购一些食物
                    pg.setAnimation(0, 'animation3', true);
                    GD.sound.playTips('startTips_2', () => {
                        pg.setAnimation(0, 'animation2', true);

                        //现在店里有这三种食物，你们想要哪个呢？
                        dd.setAnimation(0, 'animation6', true);
                        dd.node.children.forEach((gt) => {
                            gt.active = true;
                        });
                        GD.sound.playTips('startTips_3', () => {
                            dd.setAnimation(0, 'animation5', true);
                            //我不想要1号食物
                            mm.setAnimation(0, 'animation3', true);
                            GD.sound.playTips('startTips_4', () => {
                                mm.setAnimation(0, 'animation2', true);

                                //我要3号食物
                                xm.setAnimation(0, 'animation3', true);
                                GD.sound.playTips('startTips_5', () => {
                                    xm.setAnimation(0, 'animation2', true);

                                    //那剩下的那个食物给我吧的！
                                    pg.setAnimation(0, 'animation3', true);
                                    GD.sound.playTips('startTips_6', () => {
                                        pg.setAnimation(0, 'animation2', true);

                                        //好的，我知道大家需要的分别是几号食物了，一会就给你们送过去！
                                        dd.setAnimation(0, 'animation6', true);
                                        GD.sound.playTips('startTips_7', () => {
                                            dd.setAnimation(0, 'animation5', true);

                                            //好的，谢谢，再见
                                            pg.setAnimation(0, 'animation3', true);
                                            GD.sound.playTips('startTips_8', () => {
                                                pg.setAnimation(0, 'animation2', true);
                                                //再见！
                                                dd.setAnimation(0, 'animation6', true);
                                                GD.sound.playTips('startTips_9', () => {
                                                    dd.setAnimation(0, 'animation5', true);
                                                    pcLayer.active = false;
                                                    guanji.node.active = true;
                                                    guanji.setAnimation(0, 'animation2', false);
                                                    guanji.setCompleteListener(() => {
                                                        guanji.setCompleteListener(null);
                                                        this.openingLayer.active = false;
                                                        this.initGameLayer();
                                                        this.showGameLayer();
                                                    })

                                                })
                                            })
                                        })
                                    })
                                })
                            })
                        })


                    })
                })

                dd.active = true;
            })
            .start()
    },

    showMoveLayer(cb, direction = 'left') {
        cb && cb();
        return;
        let moveDis = 2480;
        let pos = cc.v2(0, 0);
        switch (direction) {
            case 'left':
                pos = cc.v2(-moveDis, 0);
                break;
            case 'right':
                pos = cc.v2(moveDis, 0);
                break;
            case 'down':
                pos = cc.v2(0, -moveDis);

                break;
            case 'up':
                pos = cc.v2(0, moveDis);
                break;

        }
        cc.tween(this.node)
            .by(2, { position: pos })
            .call(() => {
                cb && cb();
            })
            .start()
    },

    initGameLayer() {
        let layer = this.gameLayer.getChildByName('layer' + this.lv);
        layer.active = true;
        for (let i in layer._components) {
            if (layer._components[i].init) {
                layer._components[i].init();
            }
        }
    },

    //展示游戏场景
    showGameLayer() {
        GD.root.setStarBoard(false);
        cc.YL.emitter.emit('startGame');
    },

    //展示结束时的动画
    showEnding(cb) {
        cb && cb();
    },

    continueGame() {
        if (this.lv >= this.maxLv) {
            this.showEnding(() => {
                cc.YL.emitter.emit('gameEnd');
            })
        } else {
            this.showEnding(() => {
                this.lv++;
                this.initGameLayer();
                this.showGameLayer();
            })
        }
    },
});
