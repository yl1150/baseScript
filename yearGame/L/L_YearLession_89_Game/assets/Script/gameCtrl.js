//选择选项对应的脚本 
cc.Class({
    extends: cc.Component,

    properties: {
        tips: cc.String,
        rightAnswer: cc.String,
        sum: cc.Integer,
        mNum: cc.Integer
    },

    // LIFE-CYCLE CALLBACKS:

    init() {
        //初始化算式
        cc.YL.emitter.emit('updatePointPool', {
            sum: this.sum,
            mNum: this.mNum
        })


        this._errorCount = 0;
        this.registerEvent();
    },


    //注册事件
    registerEvent() {
        cc.YL.emitter.on('startGame', (e) => {
            this.showGame();
        })

        cc.YL.emitter.on('checkAnswer', (key) => {
            if (key.getKeys() == this.rightAnswer) {
                GD.sound.playSound('right');
                GD.root.showStar(key.node, () => {
                    GD.root.showAddStar(GD.root.getStarNum(this._errorCount), () => {
                        this.showFinishLayer();
                    })
                });
                cc.YL.lockTouch();
            } else {
                cc.YL.emitter.emit('showWrong');
                GD.sound.playSound('wrong');
                GD.sound.playSound('blank');
                this.setError(key.node);
                cc.tween(key.node)
                    .then(cc.YL.aMgr.SHAKING_X)
                    .start()
            }
        })
    },

    unregisterEvent() {
        cc.YL.emitter.off('startGame');
        cc.YL.emitter.off('checkAnswer');
    },

    setTouch(target, isShow) {
        let touchImg = target.getChildByName('xuan2');
        if (!touchImg) {
            return;
        }
        touchImg.active = isShow;
    },

    showGame() {
        //展示对应动画
        GD.sound.setTipsButton(true);
        GD.sound.setShowTips(this.tips, true);
        cc.YL.unLockTouch();
    },

    setError(key) {
        this._errorCount++;
        let maxErrCount = 3
        if (this._errorCount >= maxErrCount) {
            cc.YL.lockTouch();
            cc.YL.timeOut(() => {
                GD.sound.playTips('tipsWatch', () => {
                    this.showRightAnswer(key);
                })
            }, 1000);
        }
    },

    showRightAnswer(key) {
        //展示正确答案
        cc.YL.emitter.emit('showRightAnswer',this.rightAnswer);
        GD.root.showStar(key, () => {
            GD.root.showAddStar(GD.root.getStarNum(this._errorCount), () => {
                this.showFinishLayer();
            })
        });
        cc.YL.lockTouch();
    },

    showFinishLayer() {
        //此环节完成 注销所有事件
        this.unregisterEvent();
        cc.YL.emitter.emit('continueGame');
        this.node.destroy();
    },
});
