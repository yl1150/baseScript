cc.Class({
    extends: cc.Component,

    properties: {
        maxLv: 4,
        tipsNodes: [cc.Node],
        delayTimes: [cc.Float],
    },


    start() {
        this.lv = 1;
        this.btn_check = this.node.getChildByName('btn_check').getComponent(cc.Button);
        this.gKeyboard = this.node.getChildByName('gKeyboard').getComponent('keyBoardCtrl');
        this.ddSke = this.node.getChildByName('doudou').getComponent(sp.Skeleton);
        this.sbSke = this.node.getChildByName('shubao').getComponent(sp.Skeleton);
        this.holes = this.node.getChildByName('holes');
        this._formula = this.node.getChildByName('formula');
        this.holePool = cc.YL.tools.arrCopy(this.holes.children);

        this.gKeyboard.init();
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

    //豆豆挖坑 数宝撒种子
    showGrowCarrot(hole, cb) {
        if (hole) {
            //豆豆走到坑前
            let pos = cc.YL.tools.getRelativePos(hole, this.ddSke.node.parent);
            pos.x -= hole.width * 0.8;

            //判断豆豆前进的方向
            if (pos.x < this.ddSke.node.x) {
                //反向
                this.ddSke.node.scaleX = -1;
            } else {
                this.ddSke.node.scaleX = 1;
            }

            this.ddSke.setAnimation(0, 'zoulu', true);
            cc.tween(this.ddSke.node)
                .to(0.5, { position: pos })
                .call(() => {
                    //豆豆挖土 坑逐渐出现
                    this.ddSke.node.scaleX = 1;
                    GD.sound.playSound('dip', 0.1);
                    this.ddSke.setAnimation(0, 'juetu', false);
                    hole.active = true;
                    hole.opacity = 0;
                    cc.tween(hole)
                        .to(0.5, { opacity: 255 })
                        .call(() => {
                            //数宝撒种子
                            pos.x += 150;
                            cc.tween(this.sbSke.node)
                                .to(0.5, { position: pos })
                                .call(() => {
                                    GD.sound.playSound('sazz');
                                    this.sbSke.setAnimation(0, 'sazhongzi', false);
                                })
                                .start()
                        })
                        .delay(1)
                        .call(() => {
                            cc.tween(this.sbSke.node)
                                .by(0.5, { position: cc.v2(200, 200) })
                                .start()
                            cb && cb();
                        })
                        .start()
                })
                .start()
        } else {
            this.ddSke.setAnimation(0, 'zoulu', true);
            this.ddSke.timeScale = 2;
            cc.tween(this.ddSke.node)
                .by(0.5, { position: cc.v2(300, 100) })
                .call(() => {
                    this.ddSke.timeScale = 1;
                    this.ddSke.node.scaleX = -1;
                    this.ddSke.setAnimation(0, 'daiji', true);
                })
                .start()

            cc.tween(this.sbSke.node)
                .by(0.5, { position: cc.v2(300, 100) })
                .call(() => {
                    this.sbSke.setAnimation(0, 'daiji', true);
                    cb && cb()
                })
                .start()
        }
    },

    showSBWatering(hole, cb) {
        let pos = cc.YL.tools.getRelativePos(hole, this.sbSke.node.parent);
        pos.x -= 80;
        cc.tween(this.sbSke.node)
            .to(0.5, { position: pos })
            .call(() => {
                //数宝浇水 萝卜出现
                let carrot = hole.getChildByName('carrot');
                this.sbSke.setAnimation(0, 'daoshui', false);
                carrot.active = true;
                carrot.opacity = 0;
                cc.tween(carrot)
                    .delay(0.5)
                    .call(() => {
                        GD.sound.playSound('water');
                    })
                    .to(0.5, { opacity: 255 })
                    .start()
            })
            .delay(1)
            .call(() => {
                cb && cb();
            })
            .start()
    },

    showDipAnwWatering(cb) {
        /*     cb && cb()
            return; */



        let holePool = [];
        for (let i = 0; i < 6; i++) {
            holePool.push(this.holePool.shift());
        }
        let showWatering = (arr, num) => {
            this.showSBWatering(arr[num++], () => {
                if (num < 6) {
                    showWatering(arr, num);
                } else {
                    cb && cb();
                }
            })
        };

        let showGrows = (arr, count) => {
            this.showGrowCarrot(arr[count++], () => {
                count < 6 ? showGrows(arr, count) : this.showGrowCarrot(null, () => {
                    showWatering(holePool, 0);
                });
            })
        };
        showGrows(holePool, 0)
    },

    //展示开场动画
    showOpeingAnimation() {
        this.showDipAnwWatering(() => {
            //开场动画完成
            GD.sound.playTips('answer_tips1', () => {
                this._formula.active = false;
                this.showGameLayer();
            })
            cc.YL.timeOut(() => {
                this._formula.active = true;
            }, 1000)

        })
    },

    //展示游戏场景
    showGameLayer() {
        this.showDipAnwWatering(() => {
            //开场动画完成
            this.btn_check.node.active = true;
            GD.root.setStarBoard(false);
            let layer = this.node.getChildByName('layer' + this.lv);
            layer.active = true;
            for (let i in layer._components) {
                layer._components[i].init && layer._components[i].init(this._formula, this.gKeyboard, this.btn_check);
            }
        })
    },

    continueGame() {
        if (this.lv >= this.maxLv) {
            cc.YL.emitter.emit('gameEnd');
        } else {
            this.lv++;
            this._formula.active = false;
            this.btn_check.node.active = false;
            this.showGameLayer();
        }
    },
});
