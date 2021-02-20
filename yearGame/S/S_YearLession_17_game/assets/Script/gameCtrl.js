//选择选项对应的脚本 
cc.Class({
    extends: cc.Component,

    properties: {
        tips: [cc.String],
        delayTime: cc.Float,
        tipsNodes: [cc.Node],
        rightNode: cc.Node,
        ddSke: sp.Skeleton,
        skin: cc.String
    },

    // LIFE-CYCLE CALLBACKS:

    init(asset) {
        this._errorCount = 0;
        this.registerEvent();

        let shubao = this.node.getChildByName('shubao');
        if (shubao) {
            shubao.getComponent(sp.Skeleton).setAnimation(0, 'newAnimation_1', true);
        }

    },


    //注册事件
    registerEvent() {
        cc.YL.emitter.on('startGame', (e) => {
            this.showGame();
        })
    },

    unregisterEvent() {
        cc.YL.emitter.off('startGame');
    },

    setTouch(target, isShow) {
        let touchImg = target.getChildByName('k_on');
        if (!touchImg) {
            return;
        }
        touchImg.active = isShow;
    },

    showGame() {
        GD.sound.setTipsButton(true);
        GD.sound.playTips(this.tips.shift(), () => {
            cc.YL.unLockTouch();
            GD.sound.setShowTips(this.tips.shift(), true);
        });
        this.options = this.node.getChildByName('options');
        this.options.children.forEach(op => {
            cc.YL.tools.registerTouch(
                op,
                (e) => {
                    //e.target.setScale(1.2);
                    this.setTouch(e.target, true);
                },
                null,
                (e) => {
                    //e.target.setScale(1);
                    if (this.rightNode == e.target) {
                        this.showRight();
                    } else {
                        GD.sound.playSound('wrong');
                        GD.sound.playSound('blank');
                        this.setError();
                        this.setTouch(e.target, false);
                        cc.tween(e.target)
                            .then(cc.YL.aMgr.SHAKING_X)
                            .start()
                    }
                },
            )
        });

        this.tipsNodes.forEach(op => {
            cc.tween(op)
                .delay(this.delayTime)
                .then(cc.YL.aMgr.zoomAction(2))
                .start()
        });
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

    showRight() {
        this.setTouch(this.rightNode, true);
        GD.sound.playSound('right');
        GD.root.showStar(this.rightNode, () => {
            this.showFinishLayer();
        });
        cc.YL.lockTouch();
    },


    showRightAnswer() {
        //展示正确答案
        this.setTouch(this.rightNode, true);
        GD.root.showStar(this.rightNode, () => {
            this.showFinishLayer();
        });
        cc.YL.lockTouch();
    },

    showFinishLayer() {
        //展示食物飞去篮子里
        let target = this.ddSke.node.getChildByName('lanzi');
        let food = this.rightNode.getChildByName('food');
        let pos = cc.YL.tools.getRelativePos(food, target);

        food.setParent(target);
        food.setPosition(pos);
        cc.tween(food)
            .then(cc.YL.aMgr.lineMove(food.position, cc.v2(0,0), 0.05))
            .call(() => {
                this.ddSke.setSkin(this.skin);
                food.active = false;

                //此环节完成 注销所有事件
                GD.root.showAddStar(GD.root.getStarNum(this._errorCount), () => {
                    cc.YL.timeOut(() => {
                        this.node.destroy();
                    }, 3000)
                    cc.YL.emitter.emit('continueGame');
                })

            })
            .start()



        this.unregisterEvent();
    },
});
