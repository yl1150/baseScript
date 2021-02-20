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
        sceneCamera: cc.Node,
        gameCamera: cc.Node,
        aniPool: [cc.String],
        redFrame: cc.SpriteFrame,
        greenFrame: cc.SpriteFrame,
    },


    start() {
        this.lv = 1;
        cc.YL.yearGame = this;
        cc.YL.lockTouch();
        this._sCamera = this.sceneCamera.getComponent('cameraCtrl');
        this._gCamera = this.gameCamera.getComponent('cameraCtrl');
        this._plane = this.node.getChildByName('plane').getComponent(sp.Skeleton);
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
        cc.YL.emitter.on('continueGame', (gift) => {
            this.continueGame();
        })
    },

    //开场动画
    showOpening() {
        let bj = this.node.getChildByName('bj');
        this._plane.node.active = true;
        this._plane.setAnimation(0, 'denglu', false);
        GD.sound.playSound('hj', 0.5);

        let time = 3;

        cc.YL.timeOut(() => {
            GD.sound.playTips('startTips2');
        }, time * 1000);

        time += GD.sound.getDuringTime('startTips2');
        cc.YL.timeOut(() => {
            bj.active = true;
            bj.opacity = 0;
            cc.tween(bj)
                .to(0.5, { opacity: 255 })
                .start()
            this._sCamera.showLensTensile(3, 0.05, () => {
 
                cc.tween(bj)
                    .delay(0.5)
                    .to(1, { opacity: 0 })
                    .start() 


                this._sCamera.setLensTensile(1);
                this.gameLayer.active = true;
                this.gameLayer.opacity = 0;
                this.gameLayer.setScale(1);
                this.gameLayer.getComponent(cc.Mask).enabled = false;
                 cc.tween(this.gameLayer)
                    .to(0.5, { opacity: 255 })
                    .call(() => {
                        this.initGameLayer();
                    })
                    .start() 
            });
            setTimeout(() => {
            }, 2000);
            GD.sound.playTips('startTips3',()=>{
                this.showGameLayer();
            });
        }, time * 1000);
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
        let layer = this.gameLayer.getChildByName('layer' + this.lv);
        let ctrl = null;
        layer.active = true;
        for (let i in layer._components) {
            if (layer._components[i].init) {
                ctrl = layer._components[i];
                layer._components[i].init();
            }
        }
    },

    //展示游戏场景
    showGameLayer() {
        //初始化
        GD.root.setStarBoard(false);
        cc.YL.emitter.emit('startGame');
    },

    //展示结束时的动画
    showEnding(cb) {
        this._plane.setAnimation(0, 'qifei', false);
        GD.sound.playSound('hj', 0.5);
        cc.YL.timeOut(() => {
            GD.sound.playTips('startTips2');
            cb && cb();
        }, 3 * 1000);
    },


    showPassLv(cb) {
        //能量条加1
        let arr = this.gameLayer.getChildByName('power').children;
        for (let i in arr) {
            arr[i].getComponent(cc.Sprite).spriteFrame = i < this.lv ? this.greenFrame : this.redFrame;
        }

        //扇叶打开一个
        this._plane.setAnimation(0, this.aniPool.shift(), false);

        cc.YL.timeOut(() => {
            cb && cb();
        }, 1000);
    },

    continueGame() {
        this.showPassLv(() => {
            if (this.lv >= this.maxLv) {
                this.showEnding(() => {
                    cc.YL.emitter.emit('gameEnd');
                })
            } else {
                this.lv++;
                this.initGameLayer();
                this.showGameLayer();
            }
        })

    },
});
