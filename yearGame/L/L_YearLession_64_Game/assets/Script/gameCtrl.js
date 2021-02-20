//选择选项对应的脚本 
cc.Class({
    extends: cc.Component,

    properties: {
        tips: 'tips',
        rightNode: cc.Node
    },

    // LIFE-CYCLE CALLBACKS:

    init(asset) {
        this.registerEvent();
        this._errorCount = 0;
        //生成随机空格
        this.options = this.node.getChildByName('options');
        this.options.children.forEach(op => {
            cc.YL.tools.registerTouch(
                op,
                (e) => {
                    e.target.setScale(1.2);
                },
                null,
                (e) => {
                    e.target.setScale(1);
                    this.rightNode == e.target ? this.showRight() : this.showWrong(e.target);
                },
            )
        });


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
        console.log('startGame')
        GD.sound.setTipsButton(true);
        GD.sound.setShowTips(this.tips, true, () => {
        });
        cc.YL.unLockTouch();
    },

    showRight() {
        cc.YL.emitter.emit('showAni', 'happy');
        GD.sound.playSound('right');
        GD.root.showStar(this.rightNode);
        cc.YL.emitter.emit('getClothers', this.rightNode);
        cc.YL.lockTouch();
        cc.YL.timeOut(() => {
            cc.YL.emitter.emit('showAni', 'stay');
            this.showFinishLayer();
        }, 2000)
    },

    showWrong(wrongOp) {
        cc.YL.emitter.emit('showAni', 'stay');
        GD.sound.playSound('wrong');
        GD.sound.playSound('blank');
        this.setError();
        cc.tween(wrongOp)
            .then(cc.YL.aMgr.SHAKING_X)
            .start()
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
        this.showRight();
    },

    showFinishLayer() {
        //此环节完成 注销所有事件
        this.unregisterEvent();
        GD.root.showAddStar(GD.root.getStarNum(this._errorCount), () => {
            cc.YL.timeOut(() => {
                cc.YL.emitter.emit('continueGame');
            }, 500)

            cc.YL.timeOut(() => {
                this.node.destroy();
            }, 3000)
        })
    },
});
