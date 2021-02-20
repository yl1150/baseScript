cc.Class({
    extends: cc.Component,

    properties: {
        maxLv: 4,
    },


    start() {
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
        let layer = cc.find('Canvas/bg/layer1');
        let dd = layer.getChildByName('doudou').getComponent(sp.Skeleton);

        //豆豆进场
        cc.tween(dd.node)
            .by(2, { x: -dd.node.x })
            .call(() => {
                dd.setAnimation(0, 'newAnimation_2', true);
                //豆豆开始bb
                GD.sound.playTips('tips1', () => {
                    //bb完展示背景移动
                    dd.setAnimation(0, 'newAnimation_1', true);
                    this.lv++;
                    this.showGameLayer();
                    this.showLayerMove(() => {
                        cc.YL.emitter.emit('startGame');
                    })
                })
            })
            .start()
    },

    showLayerMove(cb) {
        let bg = cc.find('Canvas/bg');
        //豆豆进场
        cc.tween(bg)
            .by(1, { x: -1920 })
            .call(() => {
                cb && cb()
            })
            .start()
    },

    //展示游戏场景
    showGameLayer() {
        GD.root.setStarBoard(false);
        let layer = cc.find('Canvas/bg/layer' + this.lv + '/layer');
        layer.active = true;
        for (let i in layer._components) {
            layer._components[i].init && layer._components[i].init();
        }
    },

    continueGame() {
        if (this.lv >= this.maxLv) {
            cc.YL.emitter.emit('gameEnd');
        } else {
            this.lv++;
            this.showGameLayer();
            this.showLayerMove(() => {
                cc.YL.emitter.emit('startGame');
            })
        }
    },
});
