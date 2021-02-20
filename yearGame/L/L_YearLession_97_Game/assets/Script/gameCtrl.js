//选择选项对应的脚本 
cc.Class({
    extends: cc.Component,

    properties: {
        tips: cc.String,
        sum: cc.Node,
        pen: cc.Node,
        rightAnswer: cc.String,
    },

    // LIFE-CYCLE CALLBACKS:

    init(gKeyBoard) {
        let key = this.sum.getComponent('baseKey');
        key.init();
        gKeyBoard.setTouchCallFunc((data) => {
            console.log('key');
            if (data.key == 'enter') {
                //检测正误
                if (key.getKeys() == this.rightAnswer) {
                    GD.sound.playSound('right');
                    GD.root.showStar(this.sum, () => {
                        GD.root.showAddStar(GD.root.getStarNum(this._errorCount), () => {
                            this.showFinishLayer();
                        })
                    });
                    cc.YL.lockTouch();
                } else {
                    GD.sound.playSound('wrong');
                    GD.sound.playSound('blank');
                    this.setError();
                    key.setKey('?');
                    gKeyBoard.setBtn();
                }
            }
        })
        gKeyBoard.setBindKey(key);
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
        this.light.node.active = isShow;
        let pos = cc.YL.tools.getRelativePos(target, this.node);
        this.light.node.x = pos.x;
        this.light.setAnimation(0, 'animation_1', true);
    },

    showGame() {
        //展示对应动画
        GD.sound.setTipsButton(true);
        GD.sound.setShowTips(this.tips, true, () => {
            GD.sound.playTips('writeTips');
            cc.tween(this.pen)
                .then(cc.YL.aMgr.zoomAction(5))
                .start()
        });
        cc.YL.unLockTouch();
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
        this.sum.getComponent('baseKey').setKey(this.rightAnswer);
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
        this.sum.getComponent('baseKey').setKey(this.rightAnswer);
        GD.root.showStar(this.sum, () => {
            GD.root.showAddStar(GD.root.getStarNum(this._errorCount), () => {
                this.showFinishLayer();
            })
        });
        cc.YL.lockTouch();
    },

    showFinishLayer() {
        //此环节完成 注销所有事件
        this.unregisterEvent();
        cc.YL.timeOut(() => {
            cc.YL.emitter.emit('continueGame');
            this.node.destroy();
        }, 1000);
    },
});
