cc.Class({
    extends: cc.Component,

    properties: {
        maxLv: 4,
        openingSke:sp.Skeleton
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

    layerMove(cb) {
        cc.tween(this.node)
            .delay(0.5)
            .by(2, { x: -2480 })
            .call(() => {
                cb && cb();
            })
            .start()
    },

    //欢迎界面
    showWelcome() {
        let welcomeLayer = this.node.getChildByName('welcomeLayer');
        let ddSke = welcomeLayer.getChildByName('biaotidoudou').getComponent(sp.Skeleton);
        welcomeLayer.active = true;

        ddSke.setAnimation(0, 'newAnimation_1', false);
        ddSke.addAnimation(0, 'newAnimation_2', true);
        GD.sound.playTips('startTips1', () => {
            ddSke.setAnimation(0, 'newAnimation', false);
            this.gameLayer.active = true;
            this.layerMove(() => {
                welcomeLayer.destroy();
                this.showOpening();
            });
        })
    },

    //开场动画
    showOpening() {
        this.openingSke.setSkin('shuo');
        this.openingSke.setAnimation(0,'ti1_1',true);
        GD.sound.playTips('startTips2', () => {
            this.openingSke.setSkin('kou');
            this.showGameLayer();
        })
        this.gameLayer.active = true;
        this.showInitLayer();
    },

    showInitLayer() {
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
    },

    //展示游戏场景
    showGameLayer() {
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
            this.showInitLayer();
            this.layerMove(() => {
                this.showGameLayer();
            });
        }
    },
});
