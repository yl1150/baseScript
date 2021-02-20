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
        caidan:cc.Node
    },


    start() {
        this.lv = 1;
        cc.YL.lockTouch();

        this.ddSke = this.node.getChildByName('dd').getComponent(sp.Skeleton);
        this.gameLayer = this.node.getChildByName('gameLayer');

        GD.sound.playBGM();
        GD.sound.setTipsButton(false);
        this.showOpening();

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
        //豆豆进场
        cc.tween(this.ddSke.node)
            .to(2, { x: -250 })
            .call(() => {
                this.caidan.active = true;
                cc.YL.timeOut(()=>{
                    this.caidan.getComponent(cc.Widget).updateAlignment();
                },200)
                this.ddSke.setAnimation(0,'animation3',false);
                this.ddSke.addAnimation(0,'animation5',true);
                GD.sound.playTips('startTips', () => {
                    this.initGameLayer();
                    this.showGameLayer();
                })
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
