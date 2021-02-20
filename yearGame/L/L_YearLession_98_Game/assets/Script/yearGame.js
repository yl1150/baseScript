let skeMessage = cc.Class({
    name: "skeData",
    properties: {
        tips: '',
        ani: '',
        endAni: 'animation_1',
        ske: [sp.Skeleton]
    }
})
cc.Class({
    extends: cc.Component,

    properties: {
        maxLv: 4,
    },


    start() {
        this.lv = 1;
        cc.YL.yearGame = this;
        cc.YL.lockTouch();


        this.masker = this.node.getChildByName('masker').getComponent('masker');
        this.openingLayer = this.node.getChildByName('openingLayer');
        this.gameLayer = this.node.getChildByName('gameLayer');
        this.gKeyboard = this.node.getChildByName('gKeyboard').getComponent('keyBoardCtrl');

        this.gKeyboard.init();

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
        cc.YL.emitter.on('continueGame', () => {
            this.continueGame();
        })
    },

    //开场动画
    showOpening() {
        this.initGameLayer();
        this.showGameLayer();
        return;
        let opening = this.node.getChildByName('opening');
        let num1 = opening.getChildByName('1');
        let num3 = opening.getChildByName('3');
        let num4 = opening.getChildByName('4');
        let num9 = opening.getChildByName('9');
        let num10 = opening.getChildByName('10');
        let sum = opening.getChildByName('sum');
        let xianlu = this.node.getChildByName('xianlu').getComponent(sp.Skeleton);

        let showAction = function (pNode) {
            pNode.active = true;
            cc.tween(pNode)
                .then(cc.YL.aMgr.zoomAction(2))
                .start()
        };

        showAction(num9)
        showAction(num4)

        GD.sound.playTips('opening_1', () => {
            GD.sound.playTips('opening_2', () => {

            })
            let time = 0;
            cc.YL.timeOut(() => {
                showAction(num9);
                showAction(num1);
            }, time * 1000)

            time += 1.5;
            cc.YL.timeOut(() => {
                showAction(num10);
            }, time * 1000)

            time += 3;
            cc.YL.timeOut(() => {
                xianlu.setAnimation(0, 'animation_1', false);
                showAction(num4);
                showAction(num1);
                showAction(num3);
            }, time * 1000)

            time += 2;
            cc.YL.timeOut(() => {
                xianlu.setAnimation(0, 'animation_2', false);
                showAction(num9);
                showAction(num1);
                showAction(num10);
            }, time * 1000)

            time += 2;
            cc.YL.timeOut(() => {
                showAction(num10);
                showAction(num3);
                sum.getComponent(cc.Label).string = '13';
                showAction(sum);
            }, time * 1000)

            time += 2;
            cc.YL.timeOut(() => {
                opening.active = false;
                this.initGameLayer();
                this.showGameLayer();
            }, time * 1000)
        })
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

    initGameLayer() {
        this.masker.clear();
        let layer = this.gameLayer.getChildByName('layer' + this.lv);
        layer.active = true;
        for (let i in layer._components) {
            if (layer._components[i].init) {
                layer._components[i].init(this.gKeyboard);
            }
        }
    },

    //展示游戏场景
    showGameLayer() {
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
            this.showEnding(() => {
                this.lv++;
                this.initGameLayer();
                this.showGameLayer();
            })
        }
    },
});
