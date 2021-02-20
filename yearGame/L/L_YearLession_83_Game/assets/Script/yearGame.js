let skeMessage = cc.Class({
    name: "skeData",
    properties: {
        isShowDip: false,
        tips: '',
        skin: '',
        baoshiName: 'baoshi1'
    }
})
cc.Class({
    extends: cc.Component,

    properties: {
        maxLv: 4,
        lvData: [skeMessage]
    },


    start() {
        this.lv = 1;
        cc.YL.yearGame = this;
        cc.YL.lockTouch();
        this.txPool = cc.YL.tools.arrCopy(this.node.getChildByName('tuxing').children);
        this.gameLayer = this.node.getChildByName('gameLayer');
        this.screen = this.node.getChildByName('screen').getComponent(sp.Skeleton);
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
        /*  let dd = this.dd;
         let time = 2;
 
         //豆豆进场
         dd.setAnimation(0, 'newAnimation_3', true);
         cc.tween(dd.node)
             .by(2, { x: 1000 })
             .call(() => {
                 this.showPassLvAni(() => {
                     this.initGameLayer();
                     this.showMoveLayer(() => {
                         this.showGameLayer();
                     })
                 })
             })
             .start() */
    },

    //展示图形
    showTX(cb) {
        let txBoard = this.node.getChildByName('tuxing')
        let machine = this.node.getChildByName('machine').getComponent(sp.Skeleton);
        let tx = this.txPool.shift();
        txBoard.children.forEach((kid) => {
            kid.active = tx == kid;
        })
        machine.setAnimation(0, 'newAnimation', true);
        txBoard.setScale(1, 0);
        cc.tween(txBoard)
            .to(0.5, { scaleY: 1 })
            .start()
        cc.YL.timeOut(() => {
            machine.setAnimation(0, 'newAnimation_1', true);
            cb && cb();
        }, 200)
    },

    showMoveLayer(cb, direction = 'left') {
        cb && cb();
        return;
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
    showPassLvAni(func) {
        let data = this.lvData.shift();
        if (!data || !data.isShowDip) {
            func && func();
            return;
        }
        let dd = this.dd;
        let time = 0;
        let tips = data.tips;
        if (data.skin != '') dd.setSkin(data.skin);

        //豆豆挖矿
        dd.setEventListener((event) => {
            GD.sound.playSound('dip');
        });
        dd.setAnimation(0, 'newAnimation_6', false);

        time += 3.5;
        cc.YL.timeOut(() => {
            dd.setEventListener(null);
            dd.node.children.forEach(kid => {
                kid.active = (kid.name == data.baoshiName);
            });
            tips != '' && GD.sound.playTips(tips);
            //豆豆说话  
            dd.setAnimation(0, 'newAnimation_2', true);
        }, time * 1000);

        tips != '' && (time += GD.sound.getDuringTime('startTips2'));
        cc.YL.timeOut(() => {
            dd.setAnimation(0, 'newAnimation_1', true);
            func && func();
        }, time * 1000);

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
        this.screen.node.active = false;
        ctrl.isTransition ? this.showTX(this.showGameLayer.bind(this)) : cc.YL.timeOut(() => {
            this.showGameLayer();
        }, 2000);
    },

    //展示游戏场景
    showGameLayer() {
        //初始化
        this.screen.node.active = true;
        this.screen.setAnimation(0, 'newAnimation_1', false);
        this.screen.addAnimation(0, 'newAnimation_2', true);
        GD.root.setStarBoard(false);
        cc.YL.emitter.emit('startGame');
    },

    //展示结束时的动画
    showEnding(cb) {
        cb && cb();
        return;
        this.screen.timeScale = -1;
        this.screen.setAnimation(0, 'newAnimation_1', false);

        cc.YL.timeOut(() => {
            this.screen.node.active = false;
            this.screen.timeScale = 1;
            cb && cb();
        }, 1000)
    },

    continueGame() {
        if (this.lv >= this.maxLv) {
            this.showEnding(() => {
                cc.YL.emitter.emit('gameEnd');
            })
        } else {
            this.lv++;
            this.showEnding(() => {
                this.initGameLayer();
            })
        }
    },
});
