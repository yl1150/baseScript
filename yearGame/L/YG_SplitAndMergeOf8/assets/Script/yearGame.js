cc.Class({
    extends: cc.Component,

    properties: {
        maxLv: 4,
        opBoard: cc.Node
    },


    start() {
        this.lv = 1;
        GD.usedAnswerData = [];
        GD.layerPool = [];
        this.gKeyboard = this.node.getChildByName('gKeyboard').getComponent('keyBoardCtrl');
        this.boshiSke = this.node.getChildByName('boshi').getComponent(sp.Skeleton);

        this.gKeyboard.init();
        cc.YL.lockTouch();
        GD.sound.playBGM();
        GD.sound.setTipsButton(false);
        GD.sound.playTips('startTips', () => {
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
        //博士进场
        this.boshiSke.setAnimation(0, 'rujing', true);
        this.boshiSke.timeScale = 2;
        cc.tween(this.boshiSke.node)
            .by(1, { x: 400 })
            .call(() => {
                //博士开始bb
                this.boshiSke.timeScale = 1;
                this.boshiSke.setAnimation(0, 'shuohua', true);
                GD.sound.playTips('openingTips1', () => {
                    GD.sound.playTips('openingTips2', () => {
                        this.boshiSke.setAnimation(0, 'daiji', true);
                        this.showGameLayer();
                    })
                    cc.YL.timeOut(() => {
                        //篮子出现
                        this.opBoard.children.forEach((board) => {
                            cc.tween(board)
                                .to(0.5, { scale: 1 })
                                .start()
                        });
                    }, 5000)
                })
            })
            .start()
    },

    //展示游戏场景
    showGameLayer() {
        //开场动画完成
        GD.root.setStarBoard(false);
        let layer = this.node.getChildByName('layer' + this.lv);
        layer.active = true;
        for (let i in layer._components) {
            layer._components[i].init && layer._components[i].init(this);
        }
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
