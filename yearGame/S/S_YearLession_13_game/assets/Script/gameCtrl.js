//选择选项对应的脚本 
cc.Class({
    extends: cc.Component,

    properties: {
        tips: cc.String,
    },

    // LIFE-CYCLE CALLBACKS:

    init(asset) {
        this._errorCount = 0;
        this.opPool = [];
        this._options = this.node.getChildByName('animals');
        this._options.children.forEach((op) => {
            this.opPool.push(op);
            op.getComponent('options').init(this);
        })
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
        GD.sound.setTipsButton(true);
        GD.sound.setShowTips(this.tips, true);
        cc.YL.unLockTouch();
    },

    checkIsAllRight() {
        if (this._options.childrenCount < 1) {
            cc.YL.timeOut(() => {
                GD.root.showAddStar(GD.root.getStarNum(this._errorCount), () => {
                    this.showFinishLayer();
                })
            }, 1000);
            cc.YL.lockTouch();
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
        for (let i in this.opPool) {
            this.opPool[i].getComponent('options').showRightAnswer();
        }

        GD.root.showStar(this._options, () => {
            GD.root.showAddStar(GD.root.getStarNum(this._errorCount), () => {
                this.showFinishLayer();
            })
        });
        cc.YL.lockTouch();
    },

    showFinishLayer() {
        //此环节完成 注销所有事件
        this.unregisterEvent();
        //展示 完成动画
        let boxs = this.node.getChildByName('boxs');

        boxs.children.forEach((box) => {
            let door = box.getChildByName('door').getComponent(sp.Skeleton);
            door.setAnimation(0, 'animation', false);
        });


        cc.YL.timeOut(() => {
            cc.YL.emitter.emit('continueGame');
            this.node.destroy();
        }, 2000)
    },
});
