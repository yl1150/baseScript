cc.Class({
    extends: cc.Component,

    properties: {
        startTips: cc.AudioClip,
        maxLv: 4,
        boxs: cc.Node
    },


    start() {
        this.lv = 1;
        this._clock = this.node.getChildByName('clock').getComponent('clock');
        this._eggSke = this.node.getChildByName('caidan').getComponent(sp.Skeleton);
        this._ddSke = this.node.getChildByName('doudou').getComponent(sp.Skeleton);
        cc.YL.lockTouch();
        GD.sound.playBGM();
        GD.sound.setTipsButton(false);
        GD.sound.playTips(this.startTips, () => {
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

        this._ddSke.setAnimation(0, 'newAnimation_3', true);
        cc.YL.emitter.on('setDDAni', (state) => {
            switch (state) {
                case 'run':
                    this._ddSke.setAnimation(0, 'newAnimation_1', true);
                    break;
                case 'happy':
                    this._ddSke.setAnimation(0, 'newAnimation_2', false);
                    break;
                case 'stay':
                    this._ddSke.setAnimation(0, 'newAnimation_3', true);
                    break;
                case 'say':
                    this._ddSke.setAnimation(0, 'newAnimation_4', true);
                    break;
                default:
                    break;
            }
        })
    },

    //展示开场动画
    showOpeingAnimation() {
        cc.tween(this._eggSke.node)
            .to(0.5, { y: 100 })
            .call(() => {
                this.showGameLayer();
            })
            .start()
    },

    //展示游戏场景
    showGameLayer() {
        GD.sound.setTipsButton(true);
        GD.root.setStarBoard(false);
        if(this.lv >2){
            this._ddSke.node.active = false;
        }
        cc.loader.loadRes('prefab/layer' + this.lv, cc.Prefab, (err, _prefab) => {
            if (err) {
                console.log(err);
            }
            var layer = cc.instantiate(_prefab);
            layer.parent = this.node;
            for (let i in layer._components) {
                layer._components[i].init && layer._components[i].init(this._clock, this._eggSke, this.boxs);
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
