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

        /*   this.showMoveLayer(() => {
              this.initGameLayer();
              this.showMoveLayer(() => {
                  this.showGameLayer();
              })
          }); */

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
        let layer = this.gameLayer.getChildByName('layer' + this.lv);
        layer.active = true;
        for (let i in layer._components) {
            if (layer._components[i].init) {
                layer._components[i].init();
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
