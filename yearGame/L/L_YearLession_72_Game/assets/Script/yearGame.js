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
        this.initGameLayer();
        this.startGameLayer();
    },

    //展示过场动画
    showPassLvAni(func) {
        cc.tween(this.node)
            .by(2, { x: -2480 })
            .call(() => {
                func && func();
            })
            .start()
    },


    //展示游戏场景
    initGameLayer() {
        //初始化
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

    startGameLayer() {
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
            cc.YL.emitter.emit('gameEnd');
        } else {
            this.lv++;
            this.initGameLayer();
            this.showPassLvAni(() => {
                this.startGameLayer();
            })
        }
    },
});
