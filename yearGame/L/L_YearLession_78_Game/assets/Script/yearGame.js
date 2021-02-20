cc.Class({
    extends: cc.Component,

    properties: {
        maxLv: 4,
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

        //已经使用的方法存储
        GD.usedAnswers = [];
        this.registerEvent();
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
        let opening = this.node.getChildByName('opening');
        let car = opening.getChildByName('che').getComponent(sp.Skeleton);
        car.setAnimation(0, 'animation3', true);
        GD.sound.playTips('no_power', () => {
            car.setAnimation(0, 'animation2', true);
            this.initGameLayer();
            this.showMoveLayer(() => {
                this.showGameLayer();
                opening.active = false;
            });

        })
    },

    showMoveLayer(cb) {
        cc.tween(this.node)
            .by(2, { x: -2480 })
            .call(() => {
                cb && cb();
            })
            .start()
    },

    //展示过场动画
    showPassLvAni(isTransition, func) {


    },

    initGameLayer() {
        let layer = this.gameLayer.getComponent('gameCtrl');
        layer.init();
    },

    //展示游戏场景
    showGameLayer() {
        //初始化
        GD.root.setStarBoard(false);
        cc.YL.emitter.emit('startGame');
    },

    //展示结束时的动画
    showEnding(cb) {
        let opening = this.node.getChildByName('opening');
        let car = opening.getChildByName('che').getComponent(sp.Skeleton);
        opening.active = true;
        cc.tween(this.node)
            .by(2, { x: 2480 })
            .call(() => {
                car.setSkin('deng')
                car.setAnimation(0, 'animation4', true);
                GD.sound.playSound('engine');
                cc.YL.timeOut(()=>{
                    cb && cb();
                },2000)
            })
            .start()
    },

    continueGame() {
        if (this.lv >= this.maxLv) {
            this.showEnding(() => {
                cc.YL.emitter.emit('gameEnd');
            })
        } else {
            this.lv++;
            this.initGameLayer();
            this.showEnding(() => {
                this.showGameLayer();
            })
        }
    },
});
