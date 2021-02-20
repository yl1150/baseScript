cc.Class({
    extends: cc.Component,

    properties: {
        maxLv: 4,
        tipsNodes: [cc.Node],
        delayTimes: [cc.Float],
        ddSkin: [cc.String]
    },


    start() {
        this.lv = 1;
        this.layers = this.node.getChildByName('layers');
        this.ddSke = this.node.getChildByName('doudou').getComponent(sp.Skeleton);
        cc.YL.lockTouch();
        this.ddSke.setSkin(this.ddSkin.shift());
        GD.sound.playBGM();
        GD.sound.setTipsButton(false);
        GD.sound.playTips('startTips', () => {
            this.showOpeingAnimation();
        })
        this.fitLayer();
        this.registerEvent();
    },

    //注册事件
    registerEvent() {
        //继续下一环节游戏
        cc.YL.emitter.on('getGift', (gift) => {
            let pos = cc.YL.tools.getRelativePos(this.ddSke.node, gift.parent);
            pos.y += this.ddSke.node.height / 2;
            cc.tween(gift)
                .to(0.5, { position: pos })
                .call(() => {
                    gift.active = false;
                    this.ddSke.setSkin(this.ddSkin.shift());
                    this.showDDAni('jump');
                })
                .start()

        })

        cc.YL.emitter.on('showDDAni', (state) => {
            this.showDDAni(state);
        })

        cc.YL.emitter.on('continueGame', (gift) => {
            this.continueGame();
        })
    },

    showDDAni(state) {
        switch (state) {
            case 'stay':
                this.ddSke.setAnimation(0, 'newAnimation_1', true);
                break;
            case 'run':
                this.ddSke.setAnimation(0, 'newAnimation_2', true);
                break;
            case 'speak':
                this.ddSke.setAnimation(0, 'newAnimation_3', true);
                break;
            case 'happy':
                this.ddSke.setAnimation(0, 'newAnimation_4', true);
                break;
            case 'jump':
                this.ddSke.setAnimation(0, 'newAnimation_5', true);
                break;
            case 'sad':
                this.ddSke.setAnimation(0, 'newAnimation_6', true);
                break;
            default:
                break;
        }
    },

    //展示开场动画
    showOpeingAnimation() {
        //初始化dd皮肤
        this.showDDAni('stay');
        let layer = this.layers.getChildByName('layer' + this.lv);
        layer.active = true;
        //豆豆奔跑进场
        this.showDDAni('run');
        let modeNode = this.lv == 1 ? this.ddSke.node : this.layers;
        let moveX = this.lv == 1 ? 500 : -1920

        if (this.lv > 1) {
            let bg = cc.find('Canvas/bg');
            cc.tween(bg)
                .by(2, { x: -1920 })
                .start()
        }

        this.fitLayer();
        cc.tween(modeNode)
            .by(2, { x: moveX })
            .call(() => {
                //停止奔跑 说话
                if (this.lv == 1) {
                    this.showDDAni('speak');
                    GD.sound.playTips('startTips2', () => {
                        this.showDDAni('stay');
                        this.showGameLayer();
                    })
                } else {
                    this.showDDAni('stay');
                    this.showGameLayer();
                }

            })
            .start()

    },

    fitLayer(){
        GD.root.setStarBoard(false);
        let layer = this.layers.getChildByName('layer' + this.lv);
        layer.active = true;
        for (let i in layer._components) {
            layer._components[i].fitPhone && layer._components[i].fitPhone();
        }
    },

    //展示游戏场景
    showGameLayer() {
        let layer = this.layers.getChildByName('layer' + this.lv);
        for (let i in layer._components) {
            layer._components[i].init && layer._components[i].init();
        }
        cc.YL.emitter.emit('startGame');
    },

    continueGame() {
        if (this.lv >= this.maxLv) {
            cc.YL.emitter.emit('gameEnd');
        } else {
            this.lv++;
            this.showOpeingAnimation();
        }
    },
});
