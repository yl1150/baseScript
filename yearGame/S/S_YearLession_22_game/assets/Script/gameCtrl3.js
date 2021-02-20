//选择选项对应的脚本 
cc.Class({
    extends: cc.Component,

    properties: {
        tips: cc.String,
    },

    // LIFE-CYCLE CALLBACKS:

    init() {
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
        let touchImg = target.getComponent(cc.Sprite);
        if (!touchImg) {
            return;
        }
        touchImg.enabled = isShow;
    },

    showGame() {
        GD.sound.setTipsButton(true);
        cc.YL.unLockTouch();
        GD.sound.setShowTips(this.tips, true);
        this.options = this.node.getChildByName('options');

        let count = 0;
        let max_C = this.options.childrenCount;

        this.options.children.forEach(op => {
            cc.YL.tools.registerTouch(
                op,
                (e) => {
                    //e.target.setScale(1.2);
                },
                null,
                (e) => {
                    //e.target.setScale(1);
                    if (e.target._isSelected) {
                        //已经点击过的无法再次点击
                        return;
                    }
                    this.setTouch(e.target, true);
                    count++;
                    //报数
                    GD.sound.playTips(count.toString());

                    //判断是否全部数完
                    if (count >= max_C) {
                        cc.YL.lockTouch();
                        cc.YL.timeOut(() => {
                            GD.sound.playSound('right');
                            GD.root.showStar(this.node, () => {
                                this.showFinishLayer();
                            });
                        }, 1000)
                    }
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
        cc.YL.timeOut(() => {
            cc.YL.emitter.emit('continueGame');
            this.node.destroy();
        }, 1000)
    },
});
