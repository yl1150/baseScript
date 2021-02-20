cc.Class({
    extends: cc.Component,

    properties: {
        startTips: [cc.AudioClip],
        maxLv: 4
    },


    onLoad() {
        this.lv = 1;
        cc.YL.lockTouch();
        GD.sound.playBGM();
        GD.sound.setTipsButton(false);
        GD.sound.playTips(this.startTips.shift(), () => {
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
        let opNode = this.node.getChildByName('openingNode');
        let doudouSke = opNode.getChildByName('doudou').getComponent(sp.Skeleton);
        doudouSke.setAnimation(0, 'newAnimation_2', true);
        GD.sound.playTips(this.startTips.shift(), () => {
            opNode.destroy();
            this.showGameLayer();
        })
    },

    //展示游戏场景
    showGameLayer() {
        GD.sound.setTipsButton(true);
        GD.root.setStarBoard(false);
        let layer = this.node.getChildByName('gameLayer');
        layer.active = true;
        layer.getComponent('game' + this.lv + 'Ctrl').init();
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
