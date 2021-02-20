//选择选项对应的脚本 
cc.Class({
    extends: cc.Component,

    properties: {
        tips: cc.String,
        giftSkin: cc.String,
        example1: cc.Node,
        example2: cc.Node,
        qBoard: cc.Node
    },

    // LIFE-CYCLE CALLBACKS:

    init() {
        this._errorCount = 0;
        this.doorSke = this.node.getChildByName('men').getComponent(sp.Skeleton);
        this.doorSke2 = this.node.getChildByName('men_1').getComponent(sp.Skeleton);
        this.giftSke = this.node.getChildByName('gift').getComponent(sp.Skeleton);
        this.opBoard = this.node.getChildByName('options');
        this.options = this.opBoard.getChildByName('ops');

        this.options.children.forEach((op) => {
            op.getComponent('options').init();
        });

        this.registerEvent();

    },


    showGame() {
        cc.YL.unLockTouch();
        GD.sound.setTipsButton(true);
        cc.YL.emitter.emit('showDDAni', 'speak');
        GD.sound.setShowTips(this.tips, true, () => {
            cc.YL.emitter.emit('showDDAni', 'stay');
        });

        //根据语音出现

        cc.YL.timeOut(() => {
            this.example1.children.forEach((kid) => {
                cc.tween(kid)
                    .then(cc.YL.aMgr.zoomAction(2))
                    .start()
            })

        }, 1000)

        cc.YL.timeOut(() => {
            this.example2.active = true;
            this.opBoard.active = true;
            this.opBoard.setScale(0);

            this.example2.children.forEach((kid) => {
                kid.setScale(0);
                cc.tween(kid)
                    .to(0.5, { scale: 1 })
                    .start()
            })


            cc.tween(this.opBoard)
                .to(0.5, { scale: 1 })
                .start()
        }, 3500)
    },

    fitPhone() {
        let game = cc.find('Canvas/game');
        let door = this.node.getChildByName('men');
        let opBoard = this.node.getChildByName('options');
        if (game.scaleX < 1 && !this._isFifPhone) {
            this._isFifPhone = true;
            door.y -= (1 - game.scaleX) * door.height / 2;
            door.y -= 20;
            opBoard.y -= (1 - game.scaleX) * opBoard.height / 2;
        }

    },

    //注册事件
    registerEvent() {
        //继续下一环节游戏
        cc.YL.emitter.on('checkFinish', (e, data) => {
            this.checkFinish();
        })
        cc.YL.emitter.on('setError', (e, data) => {
            this.setError();
        })

        cc.YL.emitter.on('startGame', (e) => {
            this.showGame();
        })
    },

    //注销事件
    unRegisterEvent() {
        //继续下一环节游戏
        cc.YL.emitter.off('checkFinish')
        cc.YL.emitter.off('setError')
        cc.YL.emitter.off('startGame')
    },

    checkFinish() {
        if (this.options.childrenCount < 1) {
            cc.YL.lockTouch();
            cc.YL.timeOut(() => {
                this.showOpenDoorBtn();
            }, 1000)
        }
    },

    setError() {
        this._errorCount++;
        let maxErrCount = 3
        if (this._errorCount >= maxErrCount) {
            cc.YL.lockTouch();
            cc.YL.timeOut(() => {
                GD.sound.playTips('tipsWatch', () => {
                    this.showRightAnswer();
                })
            }, 1000);
        }
    },

    showRightAnswer() {
        //展示正确答案
        cc.YL.lockTouch();
        this.options.children.forEach(op => {
            op.getComponent('options').showRightAnswer();
        });
        GD.root.showStar(this.options, () => {
            this.showOpenDoorBtn();
        })
    },


    showOpenDoorBtn() {
        cc.YL.unLockTouch();
        this.opBoard.active = false;
        let doorBtn = this.node.getChildByName('doorBtn');
        doorBtn.active = true;
        cc.tween(doorBtn)
            .then(cc.YL.aMgr.zoomAction(2))
            .start()
        GD.sound.playTips('openDoorTips');
        cc.YL.tools.registerTouch(
            doorBtn,
            (e) => {
                e.target.getChildByName('touchImg').active = true;
            },
            null,
            (e) => {
                e.target.getChildByName('touchImg').active = false;
                e.target.active = false;
                this.showGetGift();
            });

    },

    //展示豆豆获取装备
    showGetGift() {
        cc.YL.lockTouch();
        this.unRegisterEvent();
        //开门 展示装备动画
        this.giftSke.node.active = true;
        this.giftSke.setSkin(this.giftSkin);
        this.doorSke.setAnimation(0, 'newAnimation_1', false);
        this.doorSke2.setAnimation(0, 'newAnimation_1', false);

        cc.tween(this.doorSke.node)
            .delay(1)
            .to(0.5, { opacity: 0 })
            .start();

        cc.YL.timeOut(() => {
            cc.YL.emitter.emit('getGift', this.giftSke.node);
        }, 2000)

        cc.YL.timeOut(() => {
            this.showFinishLayer();
        }, 3500)
    },

    showFinishLayer() {
        //此环节完成 注销所有事件
        GD.root.showAddStar(GD.root.getStarNum(this._errorCount), () => {
            cc.YL.timeOut(() => {
                cc.YL.emitter.emit('continueGame');
            }, 500)

            cc.YL.timeOut(() => {
                this.node.destroy();
            }, 2000)
        })
    },
});
