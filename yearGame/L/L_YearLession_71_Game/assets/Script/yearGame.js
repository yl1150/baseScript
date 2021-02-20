cc.Class({
    extends: cc.Component,

    properties: {
        maxLv: 4,
        salesman: sp.Skeleton
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
    },

    //注册事件
    registerEvent() {
        //继续下一环节游戏
        cc.YL.emitter.on('continueGame', (gift) => {
            this.continueGame();
        })

        cc.YL.emitter.on('setAni', (ani) => {
            switch (ani) {
                case 'stay':
                    this.salesman.setAnimation(0, 'newAnimation_1', true);
                    break;
                case 'speak':
                    this.salesman.setAnimation(0, 'newAnimation_2', true);
                    break;
                case 'happy':
                    this.salesman.setAnimation(0, 'newAnimation_3', true);
                    break;
                default:
                    break;
            }
        })
    },

    //开场动画
    showOpening() {
        this.showGameLayer();
    },

    //展示过场动画
    showPassLvAni(isTransition, func) {


    },


    //展示游戏场景
    showGameLayer() {
        //初始化
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
        cc.YL.emitter.emit('startGame');
    },

    //展示结束时的动画
    showEnding(cb) {
        cb && cb();
    },

    continueGame() {
        if (this.lv >= this.maxLv) {
            cc.YL.emitter.emit('gameEnd');
        } else {
            this.lv++;
            this.showEnding(() => {
                this.showGameLayer();
            })
        }
    },
});
