cc.Class({
    extends: cc.Component,

    properties: {
        maxLv: 4,
    },


    start() {
        this.lv = 1;

        GD.sound.playBGM();

        this.registerEvent();

        cc.YL.unLockTouch();

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
        this.ddSke.setAnimation(0,'ce_daiji',true);
        GD.sound.bindSpine(this.ddSke, 'kou', 'shuo');
        GD.sound.setShowTips('startTips2',true, () => {
            this.initGameLayer();
            this.showGameLayer();
        });
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
        this.ddSke.setAnimation(0,'ce_daiji',true);
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
