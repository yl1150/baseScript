
let skeMessage = cc.Class({
    name: "skeData",
    properties: {
        tipsArr: [cc.AudioClip],
        moveX: [cc.Float]
    }
})
cc.Class({
    extends: cc.Component,

    properties: {
        tips: cc.String,
        maxStageLv: 1,
        isTransition: true,
    },

    // LIFE-CYCLE CALLBACKS:

    init() {
        this.stageLv = 1;
        this._errorCount = 0;
        this.registerEvent();
    },


    //注册事件
    registerEvent() {
        cc.YL.emitter.on('startGame', (e) => {
            this.startGame();
        })
    },

    unregisterEvent() {
        cc.YL.emitter.off('startGame');
    },

    //展示结束时的动画
    showEnding(cb) {
        cb && cb();
    },

    startGame() {
        GD.sound.setTipsButton(true);
        cc.YL.unLockTouch();
        GD.sound.setShowTips(this.tips, true);

        this.showQuestion();
    },


    showQuestion() {
        let formula = this.node.getChildByName('formula' + this.stageLv).getComponent('formula');
        formula.node.active = true;
        this.formula = formula;
        formula.init(
            () => {
                //正确
                this.stageLv++;
                cc.YL.lockTouch();
                GD.sound.playSound('right');
                GD.root.showStar(formula.node, () => {
                    formula.node.active = false;
                    this.passStage();
                });
            },
            () => {
                //错误
                GD.sound.playSound('wrong');
                GD.sound.playSound('blank');
                this.setError();
            }
        )
    },

    passStage() {
        this._errorCount = 0;
        if (this.stageLv > this.maxStageLv) {
            this.showFinishLayer();
        } else {
            cc.YL.unLockTouch();
            this.showQuestion();
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
        this.formula.showRightAnswer();
        GD.root.showStar(this.formula.node, () => {
            this.passStage();
        })
        cc.YL.lockTouch();
    },

    showFinishLayer() {
        //此环节完成 注销所有事件
        this.unregisterEvent();
        GD.root.showAddStar(GD.root.getStarNum(this._errorCount), () => {
            this.showEnding(() => {
                cc.YL.emitter.emit('continueGame');
                this.node.destroy();
            })
        })
    },
});
