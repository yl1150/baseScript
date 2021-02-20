cc.Class({
    extends: cc.Component,

    properties: {
        openingTips: [cc.AudioClip],
        maxLv: 4
    },


    onLoad() {
        this.lv = 1;
        cc.YL.lockTouch();
        GD.sound.playBGM();
        GD.sound.setTipsButton(false);
        GD.sound.playTips('startTips', () => {
            this.showOpeingAnimation();
        })
        this.registerEvent();
    },

    //注册事件
    registerEvent() {
        //继续下一环节游戏
        cc.YL.emitter.on('continueGame', (e, data) => {
            console.log('continueGame')
            this.continueGame();
        })
    },

    //展示开场动画
    showOpeingAnimation() {
        let opNode = this.node.getChildByName('openingNode');
        let thief = opNode.getChildByName('thief')
        let counter = opNode.getChildByName('counter');
        let breakedCounter = opNode.getChildByName('breakedCounter');
        let warningBg = opNode.getChildByName('warningBg');

        opNode.active = true;

        let ske = thief.getComponent(sp.Skeleton);
        thief.active = true;
        let endPos = thief.position;
        thief.x = cc.winSize.width / 2 + thief.width / 2;

        let stage4 = () => {
            //4阶段豆豆侦探出现
            warningBg.active = false;
            GD.sound.playTips(this.openingTips.shift(), () => {
                let dd = opNode.getChildByName('dd')
                let ddSke = dd.getComponent(sp.Skeleton);
                dd.active = true;
                dd.x = cc.winSize.width / 2 + dd.width / 2;

                ddSke.setAnimation(0, 'newAnimation_2', true);//慢速走动画
                cc.tween(dd)
                    .by(2, { position: cc.v2(-dd.x, 0) })
                    .call(() => {
                        ddSke.setAnimation(0, 'newAnimation_3', true);//豆豆晃一晃手中的纸
                        GD.sound.playTips(this.openingTips.shift(), () => {
                            //结束
                            opNode.active = false;
                            this.showGameLayer();
                        })
                    })
                    .start()
            })
        }

        let stage2 = () => {
            //2阶段小偷砸玻璃取宝石
            let entry = ske.setAnimation(0, 'newAnimation_4', false);//慢速走动画
            ske.setEventListener((event, track) => {
                if (track.data.name == 'da') {

                    counter.active = false;
                    breakedCounter.active = track;
                    GD.sound.playSound('glass')
                    setTimeout(() => {
                        GD.sound.playSound('warning',0.5)
                        warningBg.active = true;
                        cc.tween(warningBg)
                            .repeatForever(
                                cc.tween()
                                    .to(0.1, { opacity: 125 })
                                    .to(0.1, { opacity: 255 })
                                    .delay(0.2)
                            )
                            .start()
                    }, 100);
                }

                if (track.data.name == 'baoshi') {
                    let dimonds = opNode.getChildByName('dimonds');
                    dimonds.active = false;
                }
            });
            ske.setTrackEndListener(entry, (event) => {
                GD.sound.playSound('run_Fast')
                cc.tween(thief)
                    .by(1.5, { position: cc.v2(-(cc.winSize.width / 2 + thief.width), 0) })
                    .delay(0.5)
                    .call(() => {
                        stage4();
                    })
                    .start()
            });
            ske.addAnimation(0, 'newAnimation_3', true);//慢速走动画


        }

        //1阶段小偷缓慢走入
        ske.setAnimation(0, 'newAnimation_2', true);//慢速走动画
        cc.tween(thief)
            .to(4, { position: endPos })
            .call(() => {
                ske.setAnimation(0, 'newAnimation_1', true);//静止动画
                setTimeout(() => {
                    stage2();
                }, 500);
            })
            .start()
    },

    //展示游戏场景
    showGameLayer() {
        GD.sound.setTipsButton(true);
        GD.root.setStarBoard(false);
        let layer = this.node.getChildByName('gameLayer');
        layer.active = true;
        layer.getComponent('game' + this.lv + 'Ctrl').init();
    },

    continueGame() {
        if (this.lv >= this.maxLv) {
            cc.YL.emitter.emit('gameEnd');
        } else {
            this.lv++;
            this.showGameLayer();
        }
    },
});
