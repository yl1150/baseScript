//选择选项对应的脚本 
cc.Class({
    extends: cc.Component,

    properties: {
        tips: cc.String,
        showingNode: cc.Node,
        options: cc.Node,
        rightNode: cc.Node,
    },

    // LIFE-CYCLE CALLBACKS:

    init(asset) {
        this._errorCount = 0;
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
        let touchImg = target.getChildByName('touchImg');
        if (!touchImg) {
            return;
        }
        touchImg.active = isShow;
    },

    showGame() {
        this.options.children.forEach(op => {
            op.setScale(0);
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
        this.options.active = true;
        let _widget = this.options.getComponent(cc.Widget);
        if (_widget) {
            _widget.target = cc.find('Canvas');
            _widget.bottom = 0;
            _widget.updateAlignment();
        }
        cc.YL.fitPhone(this.options);

        cc.YL.timeOut(() => {
            this.options.children.forEach(op => {
                cc.tween(op)
                    .to(0.5, { scale: 1 })
                    .start()
            });

        }, 500)

        GD.sound.setTipsButton(true);
        GD.sound.setShowTips(this.tips, true);
        cc.YL.unLockTouch();

        this.showingNode.active = true;
        this.showingNode.opacity = 0;
        cc.tween(this.showingNode)
            .to(0.5, { opacity: 255 })
            .start()
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
            GD.root.showAddStar(GD.root.getStarNum(this._errorCount), () => {
                this.showFinishLayer();
            })
        });
        cc.YL.lockTouch();
    },


    showRightAnswer() {
        //展示正确答案
        this.showRight();
    },

    showFinishLayer() {
        //此环节完成 注销所有事件
        this.unregisterEvent();
        this.options.active = false;
        this.showingNode.active = false;
        this.options.children.forEach(op => {
            cc.YL.tools.unRegisterTouch(op)
        });

        cc.YL.timeOut(() => {
            cc.YL.emitter.emit('continueGame');
        }, 500)

        cc.YL.timeOut(() => {
            this.node.destroy();
        }, 1000)

    },
});
