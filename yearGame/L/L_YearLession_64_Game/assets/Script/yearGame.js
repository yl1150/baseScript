cc.Class({
    extends: cc.Component,

    properties: {
        maxLv: 4,
        xmSke: sp.Skeleton,
        xmSkin: [cc.String]
    },


    start() {
        this.lv = 1;
        cc.YL.lockTouch();
        this.bgs = this.node.getChildByName('bgs');
        GD.sound.playBGM();
        GD.sound.setTipsButton(false);

        GD.sound.playTips('startTips', () => {
            this.showAni('speak');
            GD.sound.playTips('startTips2', () => {
                this.showAni('stay');
                this.showGameLayer();
            })
        })
        this.registerEvent();
        this.bgs.children.forEach(bg => {
            cc.YL.fitPhone(bg.getChildByName('layer'));
        });
    },

    showAni(state) {
        switch (state) {
            case 'stay':
                this.xmSke.setAnimation(0, 'animation', true);
                break;
            case 'light':
                this.xmSke.setAnimation(0, 'animation3', true);
                break;
            case 'speak':
                this.xmSke.setAnimation(0, 'animation2', true);
                break;
            case 'happy':
                this.xmSke.setAnimation(0, 'animation4', true);
                break;

            default:
                break;
        }
    },

    //注册事件
    registerEvent() {
        //继续下一环节游戏
        cc.YL.emitter.on('continueGame', (gift) => {
            this.continueGame();
        })

        cc.YL.emitter.on('showAni', (ani) => {
            this.showAni(ani);
        })

        cc.YL.emitter.on('getClothers', (gift) => {
            let pos = cc.YL.tools.getRelativePos(this.xmSke.node, gift.parent);
            pos.y += this.xmSke.node.height / 2;
            cc.tween(gift)
                .to(0.5, { position: pos })
                .call(() => {
                    gift.active = false;
                    this.xmSke.setSkin(this.xmSkin.shift());
                    this.showAni('happy');
                })
                .start()

        })
    },


    //展示开场动画
    showOpeingAnimation() {
        //豆豆进场
        this.xmSke.node.active = true;
        this.xmSke.setAnimation(0, 'ruchang', false);
        cc.YL.timeOut(() => {
            this.xmSke.setAnimation(0, 'shuohua', true);
            GD.sound.playTips('startTips2', () => {
                this.xmSke.setAnimation(0, 'daiji', true);
                this.continueGame();
            })
        }, 1500)
    },

    //展示游戏场景
    showGameLayer() {
        GD.root.setStarBoard(false);
        let bg = this.bgs.getChildByName('bg' + this.lv);
        let layer = bg.getChildByName('layer');
        layer.active = true;
        for (let i in layer._components) {
            if (layer._components[i].init) layer._components[i].init();
        }
        cc.YL.emitter.emit('startGame');
    },

    continueGame() {
        if (this.lv >= this.maxLv) {
            this.showAni('speak');
            GD.sound.playTips('endTips', () => {
                this.showAni('stay');
                cc.YL.emitter.emit('gameEnd');
            });
        } else {
            this.lv++;
            let bg = this.bgs.getChildByName('bg' + this.lv);
            let layer = bg.getChildByName('layer');
            layer.active = true;
            cc.tween(this.bgs)
                .by(2, { x: -1920 })
                .call(() => {
                    this.showGameLayer();
                })
                .start()
        }
    },
});
