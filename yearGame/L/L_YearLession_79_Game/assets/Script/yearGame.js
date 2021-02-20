cc.Class({
    extends: cc.Component,

    properties: {
        maxLv: 4,
        powerBox:sp.Skeleton
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
        let opening = this.node.getChildByName('opening');
        let waring_icon = opening.getChildByName('dashboard');
        let warningSke = waring_icon.getComponent(sp.Skeleton);
        let dd = opening.getChildByName('doudou').getComponent(sp.Skeleton);
        let xm = opening.getChildByName('xiaomi').getComponent(sp.Skeleton);
        let time = 2;

        cc.YL.timeOut(() => {
            //警报
            waring_icon.active = true;
            warningSke.setAnimation(0, 'newAnimation_1', true);
            GD.sound.playSound('waring');
            cc.tween(waring_icon)
                .then(cc.YL.aMgr.blink())
                .start()

        }, time * 1000);

        time += 1;
        cc.YL.timeOut(() => {
            GD.sound.playTips('startTips2');
            //豆豆说话
            dd.setAnimation(0, 'newAnimation_2', true);

        }, time * 1000);

        time += GD.sound.getDuringTime('startTips2');
        cc.YL.timeOut(() => {
            GD.sound.playTips('startTips3');
            //小米说话
            dd.setAnimation(0, 'newAnimation_1', true);
            xm.setAnimation(0, 'newAnimation_2', true);

        }, time * 1000);

        time += GD.sound.getDuringTime('startTips3');
        cc.YL.timeOut(() => {
            GD.sound.playTips('startTips4');
            //豆豆说话
            dd.setAnimation(0, 'newAnimation_2', true);
            xm.setAnimation(0, 'newAnimation_1', true);

        }, time * 1000);


        time += GD.sound.getDuringTime('startTips4');
        cc.YL.timeOut(() => {
            dd.setAnimation(0, 'newAnimation_1', true);
            xm.setAnimation(0, 'newAnimation_1', true);
            this.initGameLayer();
            this.showMoveLayer(() => {
                this.showGameLayer();
                opening.active = false;
            });
        }, time * 1000);
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
        let opening = this.node.getChildByName('opening');
        let dashboard = opening.getChildByName('dashboard');
        let dashboardSke = dashboard.getComponent(sp.Skeleton);
        let dd = opening.getChildByName('doudou').getComponent(sp.Skeleton);
        let xm = opening.getChildByName('xiaomi').getComponent(sp.Skeleton);

        opening.active = true;
        this.powerBox.setAnimation(0, 'newAnimation_2', false);
        //展示能量罐打开
        cc.tween(this.node)
            .delay(2)
            .by(2, { x: 2480 })
            .call(() => {
                let time = 4;
                dashboardSke.setAnimation(0, 'newAnimation_2', false);
                dashboardSke.addAnimation(0, 'newAnimation_3', false);
                dashboardSke.addAnimation(0, 'newAnimation_4', false);
                dashboardSke.addAnimation(0, 'newAnimation_5', false);
                
                cc.YL.timeOut(()=>{
                    cb && cb();
                },time*1000);
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
            this.showGameLayer();
        }
    },
});
