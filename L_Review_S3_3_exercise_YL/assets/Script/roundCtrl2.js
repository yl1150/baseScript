let tipsData = require('Define').TIPSDATA;

cc.Class({
    extends: cc.Component,

    properties: {
        tips: {
            displayName: '问题语音',
            default: ''
        },
        gameTips: {
            displayName: '解说语音',
            default: ''
        },
        rightNode: [cc.Node],
        finishType: '',
        gameTipsData: [tipsData]
    },

    // LIFE-CYCLE CALLBACKS:

    init() {
        this._errorCount = 0;
        GD.sound.setTipsButton(true);
        cc.YL.addClock(this.tips);
        GD.sound.setShowTips(this.tips, true)
        cc.YL.unLockTouch();

        this.options = this.node.getChildByName('options');
        this.options.children.forEach(op => {
            op._isSelect = false;
            cc.YL.tools.registerTouch(
                op,
                (e) => {
                    // e.target.setScale(1.2);
                    this.setTouch(e.target, true);
                    e.target._isSelect = !e.target._isSelect;
                    this.setTouch(e.target, e.target._isSelect);
                },
                null,
                (e) => {
                    //e.target.setScale(1);
                    this.checkIsAllRight();
                },
            );
            op.setScale(0);
            cc.tween(op)
                .to(0.5, { scale: 1 })
                .start()
        });
    },

    checkIsAllRight() {
        let arr = [];
        this.options.children.forEach((op) => {
            op._isSelect && arr.push(op);
        });
        if (arr.length < this.rightNode.length) {
            return;
        }
        if (cc.YL.tools.checkArrIsSame(arr, this.rightNode)) {
            this.showRight();
        } else {
            this.showWrong();
        }
    },

    showRight() {
        cc.YL.lockTouch();
        GD.sound.playSound('right');
        this.rightNode.forEach((op) => {
            GD.root.showStar(op);
        });
        cc.YL.timeOut(() => {
            this.showFinishLayer();
        }, 1000);
    },

    showWrong() {
        this.options.children.forEach((op) => {
            op._isSelect = false;
            this.setTouch(op, false);
        });
        GD.sound.playSound('wrong');
        GD.sound.playSound('blank');
        this.setError();
    },

    setTouch(target, isShow) {
        target.getComponent(cc.Sprite).enabled = isShow;
        let nor = target.getChildByName('nor');
        let touch = target.getChildByName('touch');
        if (nor) nor.active = !isShow;
        if (touch) touch.active = isShow;
    },

    setError() {
        this._errorCount++;
        let maxErrCount = 3
        if (this._errorCount >= maxErrCount) {
            cc.YL.lockTouch();
            setTimeout(() => {
                if (cc.YL.tools.getIsWrongModel()) {
                    GD.sound.playTips('tipsWatch', () => {
                        this.showRightAnswer();
                    })
                } else {
                    this.showFinishLayer();
                }
            }, 1000);
        }
    },

    showRightAnswer() {
        this.setTouch(this.rightNode, true);
        GD.root.showStar(this.rightNode, () => {
            this.showFinishLayer();
        });
        cc.YL.lockTouch();
    },

    showFinishLayer() {
        cc.YL.lockTouch();
        cc.YL.emitter.emit('addWrongMes', this._errorCount);
        if (cc.YL.tools.getIsWrongModel()) {
            //错题模式 展示解说
            this.showGameTips(() => {
                GD.root.setStarBoard(true);
                GD.root.showAddStar(GD.root.getStarNum(this._errorCount), () => {
                    GD.root.setStarBoard(false);
                    this.node.active = false;
                    this.node.destroy();
                    cc.YL.emitter.emit('PASSLV');
                })
            })
        } else {
            GD.root.setStarBoard(true);
            GD.root.showAddStar(GD.root.getStarNum(this._errorCount), () => {
                GD.root.setStarBoard(false);
                this.node.active = false;
                this.node.destroy();
                cc.YL.emitter.emit('PASSLV');
            })
        }
    },

    showGameTips(cb) {
        cc.YL.lockTouch();
        if (this.finishType == 'action') {
            GD.sound.playTips(this.gameTips);
            cc.YL.qTeach.showGameTips(this.gameTipsData, () => {
                cb && cb();
            })
        } else {
            GD.sound.playTips(this.gameTips, () => {
                cb && cb();
            });
            cc.YL.qTeach.showGameTips(this.gameTipsData)
        }
    },
});
