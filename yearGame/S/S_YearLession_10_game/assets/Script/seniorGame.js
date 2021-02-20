cc.Class({
    extends: cc.Component,

    properties: {
        maxLv: 4,
    },


    start() {
        this.lv = 1;
        cc.YL.lockTouch();
        this.gameLayer = this.node.getChildByName('gameLayer');
        GD.sound.playBGM();
        GD.sound.setTipsButton(false);
        this.registerEvent();
        this.showWelcome();
    },

    //注册事件
    registerEvent() {
        //继续下一环节游戏
        cc.YL.emitter.on('continueGame', (gift) => {
            this.continueGame();
        })
    },

    //欢迎界面
    showWelcome() {
        let welcomeLayer = this.node.getChildByName('welcomeLayer');
        let ddSke = welcomeLayer.getChildByName('biaotidoudou').getComponent(sp.Skeleton);
        welcomeLayer.active = true;
        ddSke.setAnimation(0, 'newAnimation_1', false);
        ddSke.addAnimation(0, 'newAnimation_2', true);
        GD.sound.playTips('startTips', () => {
            ddSke.setAnimation(0, 'newAnimation', false);
            this.gameLayer.active = true;
            cc.tween(this.node)
                .delay(0.5)
                .by(2, { x: -2480 })
                .start()
            this.showGameLayer();
        })
    },

    //开场动画
    showOpening() {
        let opening = this.node.getChildByName('opening');
        let ground = opening.getChildByName('ground').getComponent(sp.Skeleton);
        let shubao = opening.getChildByName('shubao').getComponent(sp.Skeleton);
        let light = opening.getChildByName('light').getComponent(sp.Skeleton);

        let arr = opening.getChildByName('kids').children;
        let pArr = opening.getChildByName('points').children;
        let pArr2 = opening.getChildByName('points2').children;
        let pArr3 = opening.getChildByName('points3').children;


        let bezierMove = function (s_arr, e_arr, time, cb, revised = 0) {
            for (let i in arr) {
                let s_pos = s_arr[i].position;
                let e_pos = e_arr[i].position;
                let mid_pos = cc.v2((e_pos.x), (s_pos.y) + revised);
                s_arr[i].setPosition(s_pos.x, s_pos.y);
                var bezier = [s_pos, e_pos, mid_pos];
                cc.tween(s_arr[i])
                    .then(cc.bezierTo(time, bezier))
                    .start()
                s_arr[i].getComponent(sp.Skeleton).setAnimation(0, 'animation3', true);
            }
            cc.YL.timeOut(() => {
                cb && cb();
            }, time * 1000)
        };

        let showTakePhoto = (cb) => {
            GD.sound.playSound('takePhoto');
            light.node.active = true;
            shubao.setAnimation(0, 'animation4', false);
            shubao.addAnimation(0, 'animation2', true);
            light.setAnimation(0, 'newAnimation', false);
            cc.YL.timeOut(() => {
                cb && cb();
            }, 1000)
        };


        bezierMove(arr, pArr, 2, () => {
            for (let i in arr) {
                arr[i].getComponent(sp.Skeleton).setAnimation(0, 'animation2', true);
            }
        }, 100);

        GD.sound.playTips('startTips2', () => {
            //发令枪响
            shubao.setAnimation(0, 'animation3', false);
            shubao.setEndListener((event) => {
                shubao.setEndListener(null);
                shubao.setAnimation(0, 'animation2', true);
                shubao.setSkin('xiangji');
                cc.YL.timeOut(() => {
                    showTakePhoto(() => {
                        bezierMove(arr, pArr3, 2, () => {
                            //展示游戏场景
                            this.showGameLayer();
                        }, 10);

                    })
                }, 1500)
                GD.sound.playTips('startTips3');
            })
            cc.YL.timeOut(() => {
                GD.sound.playSound('shot');
                bezierMove(arr, pArr2, 2);
                ground.setAnimation(0, 'animation2', false);
            }, 600)

        })
    },

    //展示游戏场景
    showGameLayer() {
        GD.root.setStarBoard(false);
        let layer = this.gameLayer.getChildByName('layer' + this.lv);
        let ctrl = null;
        layer.active = true;
        for (let i in layer._components) {
            if (layer._components[i].init) {
                ctrl = layer._components[i];
                layer._components[i].init();
            }
        }
        if (ctrl && ctrl.isTransition) {
            cc.tween(this.node)
                .by(2, { y: -1480 })
                .call(() => {
                    cc.YL.emitter.emit('startGame');
                })
                .start()
        } else {
            cc.YL.timeOut(()=>{
                cc.YL.emitter.emit('startGame');
            },2000)
        }
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
            this.lv++;
            this.showGameLayer();
        }
    },
});
