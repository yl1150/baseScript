cc.Class({
    extends: cc.Component,

    properties: {
        maxLv: 4,
    },


    start() {
        this.lv = 1;
        cc.YL.yearGame = this;
        cc.YL.lockTouch();
        this.gameLayer = this.node.getChildByName('gameLayer');
        GD.sound.playBGM();
        GD.sound.setTipsButton(false);

        GD.sound.playTips('startTips', () => {
            GD.sound.playTips('startTips2', () => {
                this.showOpening();
            })
        })
        this.registerEvent();
    },

    //注册事件
    registerEvent() {
        //继续下一环节游戏
        cc.YL.emitter.on('continueGame', (gift) => {
            this.continueGame();
        })
    },

    //开场动画
    showOpening() {
        let count = 3;
        let pOp = this.node.getChildByName('opening');
        let showTeach = (arr, cb) => {
            if (arr.length < 1) {
                cb && cb();
                return;
            }

            let opening = arr.shift();
            opening.active = true;
            let door = opening.getChildByName('door');
            let zhuzi = opening.getChildByName('zhuzi');
            GD.sound.playTips('startTips' + count++, () => {
                opening.active = false;
                opening.destroy();
                showTeach(arr, cb);
            });
            door.active = true;
            zhuzi.active = true;
            let time = 2;

            cc.YL.timeOut(() => {
                zhuzi.children.forEach((kid) => {
                    let selected = kid.getChildByName('selected');
                    selected && (selected.active = true);
                    selected && cc.tween(selected)
                        .delay(1)
                        .to(0.5,{opacity:0})
                        .start()
                });
            }, time * 1000);
        }

        showTeach(cc.YL.tools.arrCopy(pOp.children), () => {
            this.showGameLayer();
        })
    },

    //展示过场动画
    showPassLvAni(isTransition, func) {


    },


    //展示游戏场景
    showGameLayer() {
        //初始化
        GD.root.setStarBoard(false);
        let layer = this.gameLayer.getChildByName('layer' + this.lv);
        let ctrl = null;
        layer.active = true;
        for (let i in layer._components) {
            if (layer._components[i].init) {
                ctrl = layer._components[i];
                layer._components[i].init();
            }
        }
        cc.YL.emitter.emit('startGame');
    },

    //展示结束时的动画
    showEnding(cb) {
        cb && cb();
    },

    continueGame() {
        if (this.lv >= this.maxLv) {
            cc.YL.emitter.emit('gameEnd');
        } else {
            this.lv++;
            this.showEnding(() => {
                this.showGameLayer();
            })
        }
    },
});
