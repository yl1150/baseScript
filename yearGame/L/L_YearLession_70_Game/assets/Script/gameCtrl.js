//选择选项对应的脚本 
cc.Class({
    extends: cc.Component,

    properties: {
        tips: cc.String,
        rightAnswer: cc.String,
        isTransition: true
    },

    // LIFE-CYCLE CALLBACKS:

    init() {
        this._errorCount = 0;
        this.speakPool = [];
        this.registerEvent();

        let gKeyboard = this.node.getChildByName('gKeyboard').getComponent('keyBoardCtrl');
        gKeyboard.init((keys) => {
            //判断正误
            if (keys == this.rightAnswer) {
                cc.YL.lockTouch();
                GD.sound.playSound('right');
                GD.root.showStar(this._gKeyBoard.getKey(), () => {
                    gKeyboard.hideKeyBoard();
                    this.showFinishLayer();
                })
            } else {
                GD.sound.playSound('wrong');
                GD.sound.playSound('blank');
                gKeyboard.clearKeyBoard();
                this.setError();
            }
        })
        this._gKeyBoard = gKeyboard;
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

    startGame() {
        GD.sound.setTipsButton(true);
        cc.YL.unLockTouch();
        GD.sound.setShowTips(this.tips, true);
        this._gKeyBoard.showKeyBoard();
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
        this._gKeyBoard.setKey(this.rightAnswer);
        GD.root.showStar(this._gKeyBoard.getKey(), () => {
            this._gKeyBoard.hideKeyBoard();
            this.showFinishLayer();
        })
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
