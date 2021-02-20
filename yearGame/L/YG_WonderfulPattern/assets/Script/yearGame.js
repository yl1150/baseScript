cc.Class({
    extends: cc.Component,

    properties: {
        maxLv: 4,
        imgAsset: cc.SpriteAtlas,
        ddSke: sp.Skeleton,
        bgLayer: cc.Node,
    },


    start() {
        this.lv = 1;
        this.stone = this.node.getChildByName('st');
        this.qNode = this.node.getChildByName('questionNode');
        this.light = this.node.getChildByName('guang').getComponent(sp.Skeleton);
        cc.YL.lockTouch();
        GD.sound.playBGM();
        GD.sound.setTipsButton(false);
        GD.sound.playTips('startTips', () => {
            this.showOpeingAnimation();
        })
        this.showDDAni('speak');
        this.registerEvent();
        this.initGame();
    },

    //注册事件
    registerEvent() {
        //继续下一环节游戏
        cc.YL.emitter.on('continueGame', (gift) => {
            this.continueGame();
        })
    },

    showDDAni(state) {
        switch (state) {
            case 'stay':
                this.ddSke.setAnimation(0, 'newAnimation_3', true);
                break;
            case 'walk':
                //走路
                this.ddSke.setAnimation(0, 'newAnimation_1', true);
                break;
            case 'run':
                //奔跑
                this.ddSke.setAnimation(0, 'newAnimation_5', true);
                break;
            case 'speak':
                this.ddSke.setAnimation(0, 'newAnimation_4', true);
                break;
            case 'happy':
                this.ddSke.setAnimation(0, 'newAnimation_2', true);
                break;
            default:
                break;
        }
    },

    //展示开场动画
    showOpeingAnimation() {
        //豆豆进场
        this.showDDAni('run');
        cc.tween(this.bgLayer)
            .by(2, { x: -1600 })
            .call(() => {
                this.showDDAni('speak');
                this.light.node.x = this.stone.x;
                this.light.setAnimation(0, 'newAnimation2', true);
                cc.YL.emitter.emit('showShader');
                GD.sound.playTips('startTips2', () => {
                    this.light.setAnimation(0, 'newAnimation', true);
                    this.showDDAni('stay');
                    this.showGameLayer();
                })
            })
            .start()
        cc.tween(this.stone)
            .by(2, { x: -1600 })
            .start()
        cc.tween(this.qNode)
            .by(2, { x: -1600 })
            .start()
    },

    //中场动画
    showMidfieldShow() {
        GD.sound.playSound('shitou');
        let spine = this.stone.getComponent(sp.Skeleton);
        this.stone.active = true;
        spine.setAnimation(0, 'newAnimation2', true);
        cc.tween(this.stone)
            .by(2, { x: 2000 })
            .call(() => {
                //豆豆进入山洞
                this.showDDAni('run');
                cc.tween(this.ddSke.node)
                    .by(2, { x: 600, scale: 0.1 })
                    .start()


                let shadow = this.node.getChildByName('shadow');
                shadow.active = true;
                cc.tween(shadow)
                    .to(2, { opacity: 255 })
                    .call(() => {
                        spine.setAnimation(0, 'newAnimation', true);
                        this.stone.x -= 2000;
                        this.ddSke.node.setScale(1);
                        this.ddSke.node.x -= 600;
                        this.showDDAni('stay');
                        this.initGame();
                    })
                    .to(2, { opacity: 0 })
                    .call(() => {
                        shadow.active = false;
                        this.showGameLayer();
                    })
                    .start()
            })
            .start()
    },

    initGame() {
        GD.root.setStarBoard(false);
        let question = this.qNode.getChildByName('question' + this.lv);
        question.active = true;
        for (let i in question._components) {
            if (question._components[i].init) question._components[i].init(this.imgAsset);
        }
    },

    //展示游戏场景
    showGameLayer() {
        cc.YL.emitter.emit('startGame');
    },

    continueGame() {
        if (this.lv >= this.maxLv) {
            cc.YL.emitter.emit('gameEnd');
        } else {
            this.lv++;
            if (this.lv == 3) {
                this.showMidfieldShow();
            } else {
                this.initGame();
                this.showGameLayer();
            }
        }
    },
});
