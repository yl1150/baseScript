//选择选项对应的脚本 
cc.Class({
    extends: cc.Component,

    properties: {
        tips: cc.String,
        handAni: cc.String
    },

    // LIFE-CYCLE CALLBACKS:

    init() {
        this.drawBoard = this.node.getChildByName('drawBoard');
        this.hand = this.node.getChildByName('hand').getComponent(sp.Skeleton);
        this._errorCount = 0;
        this.registerEvent();
    },


    //注册事件
    registerEvent() {
        cc.YL.emitter.on('startGame', (e) => {
            this.showGame();
        })

       /*  cc.YL.emitter.on('setHand', (isShow) => {
            this.hand.node.active = isShow;
        }) */
    },

    unregisterEvent() {
        cc.YL.emitter.off('startGame');
        //cc.YL.emitter.off('setHand');
    },


    showGame() {
        //展示教程
        this.hand.node.active = true;
        this.hand.setAnimation(0, this.handAni, false);
        this.hand.setCompleteListener(() => {
            this.hand.node.active = false;
            this.hand.setCompleteListener(null);
            this.drawBoard.active = true;
            cc.YL.unLockTouch();
            GD.sound.setShowTips(this.tips, true);
            GD.sound.setTipsButton(true);
            this.drawBoard.getComponent('paints').init(this.showRight.bind(this));
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

    showRight() {
        GD.sound.playSound('right');
        GD.root.showStar(this.drawBoard, () => {
            this.showFinishLayer();
        });
        cc.YL.lockTouch();
    },


    showRightAnswer() {
        //展示正确答案
        this.setTouch(this.rightNode, true);
        GD.root.showStar(this.rightNode, () => {
            this.showFinishLayer();
        });
        cc.YL.lockTouch();
    },

    showFinishLayer() {
        //此环节完成 注销所有事件
        GD.root.showAddStar(GD.root.getStarNum(this._errorCount), () => {
            this.node.destroy();
            cc.YL.emitter.emit('continueGame');
        })
        this.unregisterEvent();
    },
});
