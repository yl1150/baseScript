cc.Class({
    extends: cc.Component,

    properties: {
        maxLv: 4,
        actionNode: [cc.Node],
        actionTime: [cc.Float],
        ddSke: sp.Skeleton
    },


    start() {
        this.lv = 1;
        cc.YL.yearGame = this;
        cc.YL.lockTouch();
        this.gameLayer = this.node.getChildByName('gameLayer');
        GD.sound.playBGM();
        GD.sound.setTipsButton(false);

        GD.sound.playTips('startTips', () => {
            this.showOpening();
        })
        this.registerEvent();
        /*  this.bgs.children.forEach(bg => {
             cc.YL.fitPhone(bg.getChildByName('layer'));
         }); */
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
        this.actionNode.forEach((animal) => {
            animal.getComponent(sp.Skeleton).setAnimation(0, 'newAnimation_1', true);
        });
        //绑定动画和音效
        GD.sound.bindSpine(this.ddSke, 'newAnimation_1', 'newAnimation_5');
        GD.sound.playTips('startTips2', () => {
            GD.sound.playTips('startTips3', () => {
                //展示游戏场景
                cc.tween(this.node)
                    .by(2, { y: 1480 })
                    .call(() => {
                        this.showGameLayer();
                    })
                    .start()



            })
        })


        let arr = this.actionNode;
        let showTeach = (tPool) => {
            if (arr.length < 1) {
                return;
            }
            let tNode = arr.shift();
            tNode.active = true;
            cc.tween(tNode)
                .then(cc.YL.aMgr.zoomAction(2, tNode.scaleX, tNode.scaleY))
                .start()
            cc.YL.timeOut(() => { showTeach(tPool) }, tPool.shift() * 1000)
        }
        cc.YL.timeOut(() => { showTeach(this.actionTime) }, this.actionTime.shift() * 1000)

    },

    //展示游戏场景
    showGameLayer() {
        GD.root.setStarBoard(false);
        let layer = this.gameLayer.getChildByName('layer' + this.lv);
        layer.active = true;
        for (let i in layer._components) {
            if (layer._components[i].init) layer._components[i].init();
        }
        cc.YL.emitter.emit('startGame');
    },

    //展示结束时的动画
    showEnding(cb) {
        cb && cb();
        /*     this.endSKe.setAnimation(0, 'animation', true);
            cc.YL.timeOut(() => {
            }, 2000); */
    },

    continueGame() {
        if (this.lv >= this.maxLv) {
            this.showEnding(() => {
                cc.YL.emitter.emit('gameEnd');
            })
        } else {
            this.lv++;
            this.showGameLayer();
        }
    },
});
