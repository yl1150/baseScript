cc.Class({
    extends: cc.Component,

    properties: {
        maxLv: 4,
    },


    start() {
        this.lv = 1;
        cc.YL.lockTouch();
        this.bgs = this.node.getChildByName('bgs');
        GD.sound.playBGM();
        GD.sound.setTipsButton(false);

        GD.sound.playTips('startTips', () => {
            GD.sound.playTips('startTips2', () => {
                this.showGameLayer();
            })
        })
        this.registerEvent();
       /*  this.bgs.children.forEach(bg => {
            cc.YL.fitPhone(bg.getChildByName('layer'));
        }); */
    },

    //注册事件
    registerEvent() {
        //继续下一环节游戏
        cc.YL.emitter.on('continueGame', (gift) => {
            this.continueGame();
        })
    },

    //展示游戏场景
    showGameLayer() {
        GD.root.setStarBoard(false);
        let layer = this.node.getChildByName('layer' + this.lv);
        layer.active = true;
        for (let i in layer._components) {
            if (layer._components[i].init) layer._components[i].init();
        }
        cc.YL.emitter.emit('startGame');
    },

    continueGame() {
        if (this.lv >= this.maxLv) {
            cc.YL.emitter.emit('gameEnd');
        } else {
            this.lv++;
            this.showGameLayer();

        }
    },
});
