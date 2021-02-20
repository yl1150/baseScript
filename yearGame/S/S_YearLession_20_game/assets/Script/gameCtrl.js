//选择选项对应的脚本 
cc.Class({
    extends: cc.Component,

    properties: {
        tips: cc.String,
        rightNodes: [cc.Node],
    },

    // LIFE-CYCLE CALLBACKS:

    init(asset) {
        this._errorCount = 0;
        this.list = this.node.getChildByName('box').getChildByName('list');
        this.registerEvent();
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
        cc.YL.unLockTouch();
        GD.sound.setShowTips(this.tips, true);
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
                    this.setTouch(e.target, false);
                    for (let i in this.rightNodes) {
                        if (this.rightNodes[i] == e.target) {
                            this.rightNodes.splice(i, 1);
                            this.showRight(e.target, () => {
                                this.rightNodes.length < 1 && this.showFinishLayer();
                            });
                            return
                        }
                    }
                    GD.sound.playSound('wrong');
                    GD.sound.playSound('blank');
                    this.setError();
                    cc.tween(e.target)
                        .then(cc.YL.aMgr.SHAKING_X)
                        .start()
                },
            )
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

    showRight(target, cb) {
        cc.YL.lockTouch();
        cc.YL.tools.unRegisterTouch(target);
        GD.sound.playSound('right');
        GD.root.showStar(target, () => {
            //展示食物飞去篮子里
            let pos = cc.YL.tools.getRelativePos(this.list, target.parent);
            cc.tween(target)
                .then(cc.YL.aMgr.lineMove(target.position, pos, 0.05))
                .call(() => {
                    cc.YL.unLockTouch();
                    target.setParent(this.list);
                    target.y = 0;
                    cb && cb();
                })
                .start()
        });
    },


    showRightAnswer() {
        cc.YL.lockTouch();
        //展示正确答案
        for (let i in this.rightNodes) {
            this.showRight(e.target);
        }
        GD.root.showStar(this.options, () => {
            this.showFinishLayer();
        });
    },

    showFinishLayer() {
        //此环节完成 注销所有事件
        this.unregisterEvent();
        cc.YL.timeOut(()=>{
            cc.YL.emitter.emit('continueGame');
            this.node.destroy();
        },1000)
    },
});
