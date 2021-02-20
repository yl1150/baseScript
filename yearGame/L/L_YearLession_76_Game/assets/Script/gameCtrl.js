
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
        isTransition: true,
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

    clickBtn(e,key){
        
    },

    //展示结束时的动画
    showEnding(cb) {
        cb && cb();
    },

    startGame() {
        GD.sound.setTipsButton(true);
        cc.YL.unLockTouch();
        GD.sound.setShowTips(this.tips, true);
        let layer = this.node.getChildByName('layer');
        let door = layer.getChildByName('door');
        let zhuzi = layer.getChildByName('zhuzi');

        let formula = this.node.getChildByName('formula').getComponent('formula');
        formula.node.active = true;
        this.formula = formula;
        formula.init(
            () => {
                //正确
                door.active = true;
                zhuzi.active = true;
                cc.YL.lockTouch();
                GD.sound.playSound('right');
                GD.root.showStar(formula.node, () => {
                    formula.node.active = false;
                    this.showFinishLayer();
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
