cc.Class({
    extends: cc.Component,

    properties: {
        maxLv: 4,
        imgAsset: cc.SpriteAtlas,
        ddSke: sp.Skeleton
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

        this.node.children.forEach(bg => {
            let layer = bg.getChildByName('layer');
            layer && cc.YL.fitPhone(layer);
        });

    },

    //注册事件
    registerEvent() {
        //继续下一环节游戏
        cc.YL.emitter.on('continueGame', (gift) => {
            this.continueGame();
        })
    },

    //展示开场动画
    showOpeingAnimation() {
        //豆豆进场
        this.ddSke.node.active = true;
        this.ddSke.setAnimation(0, 'ruchang', false);
        cc.YL.timeOut(() => {
            this.ddSke.setAnimation(0, 'shuohua', true);
            GD.sound.playTips('startTips2', () => {
                this.ddSke.setAnimation(0, 'daiji', true);
                this.continueGame();
            })
        }, 1500)
    },

    //展示游戏场景
    showGameLayer() {
        GD.root.setStarBoard(false);
        let bg = this.node.getChildByName('bg' + this.lv);
        let layer = bg.getChildByName('layer');
        layer.active = true;
        for (let i in layer._components) {
            if (layer._components[i].init) layer._components[i].init(this.imgAsset);
        }
        cc.tween(this.node)
            .by(2, { x: -1920 })
            .call(() => {
                cc.YL.emitter.emit('startGame');
            })
            .start()
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
