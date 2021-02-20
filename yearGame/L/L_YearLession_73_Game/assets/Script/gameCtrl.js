//选择选项对应的脚本 
cc.Class({
    extends: cc.Component,

    properties: {
        tips: cc.String,
        isTransition:true
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

    showGame() {
        this.showQuestion();
        GD.sound.setTipsButton(true);
        cc.YL.unLockTouch();
        GD.sound.setShowTips(this.tips, true);
    },

    showQuestion() {
        let optionBoard = this.node.getChildByName('opBoard');
        let options = this.node.getChildByName('options');
        let arrow = this.node.getChildByName('arrow');



        options.children.forEach((op) => {
            op.getComponent('options').init(this);
        })

        this.options = options;
        optionBoard.active = true;
        options.active = true;
        arrow.active = true;
    },


    checkIsAllRight() {
        if (this.options.childrenCount < 1) {
            cc.YL.lockTouch();
            cc.YL.timeOut(() => {
                this.showFinishLayer();
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
        let arr = cc.YL.tools.arrCopy(this.options.children);
        arr.forEach((op) => {
            op.getComponent('options').showRightAnswer();
        })
        GD.root.showStar(this.options, () => {
            this.showFinishLayer();
        });
        cc.YL.lockTouch();
    },

    showFinishLayer() {
        //此环节完成 注销所有事件
        this.unregisterEvent();
        GD.root.showAddStar(GD.root.getStarNum(this._errorCount), () => {
            cc.YL.emitter.emit('continueGame');
            this.node.destroy();
        })

    },
});
