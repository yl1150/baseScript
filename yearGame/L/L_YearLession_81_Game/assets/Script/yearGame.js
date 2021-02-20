cc.Class({
    extends: cc.Component,

    properties: {
        maxLv: 4,
        salesman: sp.Skeleton,

    },


    start() {
        this.lv = 1;
        cc.YL.yearGame = this;
        cc.YL.lockTouch();
        this.gameLayer = this.node.getChildByName('gameLayer');
        GD.sound.playBGM();
        GD.sound.setTipsButton(false);
          GD.sound.playTips('startTips', () => {
              this.showOpening();
          })
        this.registerEvent();
        
      /*   this.showMoveLayer(() => {
            this.initGameLayer();
            this.showMoveLayer(() => {
                this.showGameLayer();
            })
        }); */

        GD.noodlesData = ['noodlesSize', 'noodlesType', 'noodlesSD', 'noodlesEgg'];
    },

    //注册事件
    registerEvent() {
        //继续下一环节游戏
        cc.YL.emitter.on('continueGame', (gift) => {
            this.continueGame();
        })
    },

    //开场动画
    showOpening() {
        // this.initGameLayer();
        // this.showGameLayer();
        let opening = cc.find('Canvas/opening');
        let dd = opening.getChildByName('doudou').getComponent(sp.Skeleton);
        let sb = opening.getChildByName('shubao').getComponent(sp.Skeleton);

        let time = 0;
        GD.sound.playTips('startTips2');
        //豆豆说话  数宝，你看，这就是美食街，有好多美食。
        dd.setAnimation(0, 'newAnimation_2', true);

        time += GD.sound.getDuringTime('startTips2');
        cc.YL.timeOut(() => {
            GD.sound.playTips('startTips3');
            //数宝说话  啾啾啾
            dd.setAnimation(0, 'newAnimation_1', true);
            sb.setAnimation(0, 'newAnimation_2', true);
        }, time * 1000);

        time += GD.sound.getDuringTime('startTips3');
        cc.YL.timeOut(() => {
            GD.sound.playTips('startTips4');
            //豆豆说话 前面有好吃的面条，我们去看看吧！
            dd.setAnimation(0, 'newAnimation_2', true);
            sb.setAnimation(0, 'newAnimation_1', true);

        }, time * 1000);

        time += GD.sound.getDuringTime('startTips4');
        cc.YL.timeOut(() => {
            GD.sound.playTips('startTips3');
            //数宝说话
            dd.setAnimation(0, 'newAnimation_1', true);
            sb.setAnimation(0, 'newAnimation_2', true);
        }, time * 1000);

        time += GD.sound.getDuringTime('startTips3');
        cc.YL.timeOut(() => {
            //走路
            dd.setAnimation(0, 'newAnimation_4', true);
            sb.setAnimation(0, 'newAnimation_1', true);
            this.showMoveLayer(() => {
                let pos = cc.YL.tools.getRelativePos(opening, this.salesman.node.parent);
                let move_x = - dd.node.x + this.salesman.node.width;

                opening.setParent(this.salesman.node.parent);
                opening.setPosition(pos);
                cc.tween(opening)
                    .by(1.5, { x: move_x })
                    .call(() => {
                        dd.setAnimation(0, 'newAnimation_5', true);
                        sb.setAnimation(0, 'newAnimation_5', true);
                        //售货员说话
                        this.salesman.setAnimation(0, 'newAnimation_2', true);
                        GD.sound.playTips('startTips5', () => {
                            this.salesman.setAnimation(0, 'newAnimation_1', true);
                   /*          dd.setAnimation(0, 'newAnimation_2', true);
                            sb.setAnimation(0, 'newAnimation_2', true); */
                            GD.sound.playTips('startTips6', () => {
                                //售货员说话
                                /* dd.setAnimation(0, 'newAnimation_1', true);
                                sb.setAnimation(0, 'newAnimation_1', true); */
                                this.salesman.setAnimation(0, 'newAnimation_2', true);
                                GD.sound.playTips('startTips7', () => {
                                    this.salesman.setAnimation(0, 'newAnimation_1', true);
                                    this.initGameLayer();
                                    this.showMoveLayer(() => {
                                        this.showGameLayer();
                                    })
                                });
                            })
                        });
                    })
                    .start()
                /* cc.tween(sb.node)
                    .by(1.5, { x: move_x })
                    .start() */
            });
        }, time * 1000);

    },

    showMoveLayer(cb, direction = 'left') {
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

    //展示过场动画
    showPassLvAni(isTransition, func) {


    },

    initGameLayer() {
        let layer = this.gameLayer.getChildByName('layer' + this.lv);
        let ctrl = null;
        layer.active = true;
        for (let i in layer._components) {
            if (layer._components[i].init) {
                ctrl = layer._components[i];
                layer._components[i].init();
            }
        }
    },

    //展示游戏场景
    showGameLayer() {
        //初始化
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
            this.lv++;
            this.initGameLayer();
            this.showGameLayer();
        }
    },
});
