cc.Class({
    extends: cc.Component,

    properties: {
        startTips: cc.AudioClip,
        maxLv: 4,
    },


    start() {
        this.lv = 1;
        cc.YL.lockTouch();
        GD.sound.playBGM();
        GD.sound.setTipsButton(false);
        GD.sound.playTips(this.startTips, () => {
            this.showGameLayer();
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
        
    },

    //展示游戏场景
    showGameLayer() {
        GD.sound.setTipsButton(true);
        GD.root.setStarBoard(false);
        cc.loader.loadRes('prefab/layer' + this.lv, cc.Prefab, (err, _prefab) => {
            if (err) {
                console.log(err);
            }
            var layer = cc.instantiate(_prefab);
            layer.parent = this.node;
            for (let i in layer._components) {
                layer._components[i].init && layer._components[i].init();
            }
        });
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
