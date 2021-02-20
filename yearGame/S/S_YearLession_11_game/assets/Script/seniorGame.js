cc.Class({
    extends: cc.Component,

    properties: {
        maxLv: 4,
    },


    start() {
        this.lv = 1;
        cc.YL.lockTouch();
        this.gameLayer = this.node.getChildByName('gameLayer');
        this.curtain = this.gameLayer.getChildByName('curtain').getComponent(sp.Skeleton);
        this.light = this.gameLayer.getChildByName('light').getComponent(sp.Skeleton);
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

        //灯光出现
        cc.YL.emitter.on('showLight', (cb) => {
            this.light.setAnimation(0, 'newAnimation2', false);
            this.light.setEndListener(() => {
                this.light.setEndListener(null);
                cb && cb();
            })
        })

        //打开幕布
        cc.YL.emitter.on('openCurtain', () => {
            this.light.setAnimation(0, 'newAnimation', true);
            this.curtain.setAnimation(0, 'newAnimation_2', false);
            this.curtain.setEndListener(() => {
                this.curtain.setEndListener(null);
                this.light.setAnimation(0, 'newAnimation_3', true);
            })
        })

        //关上幕布
        cc.YL.emitter.on('closeCurtain', () => {
            this.light.setAnimation(0, 'newAnimation', true);
            this.curtain.setAnimation(0, 'newAnimation_1', false);
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
            this.showGameLayer();
        }
    },
});
