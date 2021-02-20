let skeMessage = cc.Class({
    name: "skeData",
    properties: {
        isShowDip: false,
        tips: '',
        skin: '',
        baoshiName: 'baoshi1'
    }
})
cc.Class({
    extends: cc.Component,

    properties: {
        maxLv: 4,
        aniPool: [cc.String],
        redFrame: cc.SpriteFrame,
        greenFrame: cc.SpriteFrame,
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

        /*   this.showMoveLayer(() => {
              this.initGameLayer();
              this.showMoveLayer(() => {
                  this.showGameLayer();
              })
          }); */

    },


    //注册事件
    registerEvent() {
        //继续下一环节游戏
        cc.YL.emitter.on('continueGame', () => {
            this.continueGame();
        })

        cc.YL.emitter.on('updatePointPool', (data) => {

            //刷新对应数量的点
            let pointPool = this.node.getChildByName('pointPool');
            let arr = pointPool.children;
            let arr2 = [];
            pointPool.active = true;
            for (let i in arr) {
                arr[i].getComponent(cc.Sprite).spriteFrame = this.greenFrame;
                arr[i].active = i < data.sum;
                i < data.sum && arr2.push(arr[i]);
            }
            for (let i = data.mNum; i > 0; i--) {
                arr2.pop().getComponent(cc.Sprite).spriteFrame = this.redFrame;
            }

            //刷新对应的label 

        })
    },

    //开场动画
    showOpening() {
        this.initGameLayer();
        this.showGameLayer();
    },

    showMoveLayer(cb, direction = 'left') {
        cb && cb();
        return;
        let moveDis = 2480;
        let pos = cc.v2(0, 0);
        switch (direction) {
            case 'left':
                pos = cc.v2(-moveDis, 0);
                break;
            case 'right':
                pos = cc.v2(moveDis, 0);
                break;
            case 'down':
                pos = cc.v2(0, -moveDis);

                break;
            case 'up':
                pos = cc.v2(0, moveDis);
                break;

        }
        cc.tween(this.node)
            .by(2, { position: pos })
            .call(() => {
                cb && cb();
            })
            .start()
    },

    initGameLayer() {
        let formula = this.node.getChildByName('formula');
        let layer = this.gameLayer.getChildByName('layer' + this.lv);
        let ctrl = null;
        layer.active = true;
        for (let i in layer._components) {
            if (layer._components[i].init) {
                ctrl = layer._components[i];
                layer._components[i].init();
            }
        }
        let arr = cc.YL.tools.arrCopy(formula.children);
        arr.forEach((kid) => {
            if (kid.name != 'jianhao') {
                kid.setParent(null);
                kid.destroy();
            }
        });
    },

    //展示游戏场景
    showGameLayer() {
        //展示下落
        let time = 1;
        let formula = this.node.getChildByName('formula');
        let blocks = this.node.getChildByName('blocks');
        let arr = cc.YL.tools.arrCopy(blocks.children);
        arr.forEach((block) => {
            console.log(block.y)
            cc.tween(block)
                .by(time - 0.1, { y: -block.height }, { easing: 'quadIn' })
                .start()
        });
        cc.YL.timeOut(() => {
            arr.forEach((block) => {
                block.children.forEach((kid) => {
                    kid.getComponent(sp.Skeleton).setAnimation(0, 'animation4', false);
                })
            });
            let block = arr.shift();
            cc.YL.timeOut(() => {
                block.setParent(formula);
                block.setPosition(0, 0);
            }, 500)
        }, time * 1000)
        GD.root.setStarBoard(false);
        cc.YL.emitter.emit('startGame');
    },

    //展示结束时的动画
    showEnding(cb) {
        let shuibo = this.node.getChildByName('shuibo').getComponent(sp.Skeleton);
        shuibo.setAnimation(0, this.aniPool.shift(), false);
        cc.YL.timeOut(() => {
            cb && cb();
        }, 2000)
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
