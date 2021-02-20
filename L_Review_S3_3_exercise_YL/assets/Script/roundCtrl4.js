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
        finishType: '',
        gameTipsData: [tipsData],
    },

    // LIFE-CYCLE CALLBACKS:

    init() {
        this.node.active = true;
        this._errorCount = 0;
        let options = this.node.getChildByName('options');
        options.children.forEach((op) => {
            op.getComponent('options').init(this);
        })
        options.active = true;
        let tPoint = null;
        cc.YL.tools.registerTouch(
            options,
            (e) => {
                tPoint = this.getTouchPoint(e);
                if (tPoint) {
                   tPoint.getComponent('options').touchStart(e);
                }
            },
            (e)=>{
                if (tPoint) {
                    tPoint.getComponent('options').touchMove(e);
                }
            },
            (e) => {
                if (tPoint) {
                    tPoint.getComponent('options').touchEnd(e);
                }
                tPoint = null;
            },
        )

        this.options = options;
        GD.sound.setTipsButton(true);
        GD.sound.setShowTips(this.tips, true);
        cc.YL.unLockTouch();
    },

    getTouchPoint(touch) {
        let touchLoc = touch.getLocation();
        let arr = touch.target.children

        for (let i in arr) {
            let box = arr[i].getComponent(cc.PolygonCollider);
            if (cc.Intersection.pointInPolygon(touchLoc, box.world.points)) {
                console.log("Hit!");
                return arr[i];
            }
        }
        return null;
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
        cc.YL.lockTouch();
        cc.YL.emitter.emit('addWrongMes',this._errorCount);
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
