cc.Class({
    extends: cc.Component,

    properties: {
        tips: cc.String,
        options: cc.Node,
        rightAnswer: cc.String
    },

    // LIFE-CYCLE CALLBACKS:

    init() {
        this._errorCount = 0;
        this.speakPool = [];
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
        let op_com = this.options.getComponent('options');
        op_com.init();
        op_com.registerCallFunc((target)=>{
            if (target.name == this.rightAnswer) {
                //正确
                cc.YL.lockTouch();
                GD.sound.playSound('right');
                GD.root.showStar(target, () => {
                    this.showFinishLayer();
                });
            } else {
                //错误
                GD.sound.playSound('wrong');
                GD.sound.playSound('blank');
                this.setError();
            }
        })
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
        let op_com = this.options.getComponent('options');
        op_com.setTouch(op_com.getTarget(this.rightAnswer),true);
        GD.root.showStar(op_com.getTarget(this.rightAnswer), () => {
            this.showFinishLayer();
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
