//选择选项对应的脚本 
cc.Class({
    extends: cc.Component,

    properties: {
        tips: {
            displayName: '问题语音',
            type: [cc.AudioClip],
            default: []
        },
        answerTips: {
            displayName: '答案语音',
            type: [cc.AudioClip],
            default: []
        },
        delayTimes: [cc.Float],
        snowManNum: 1,
        isShowScale: true,
        maxLv: 2,
    },

    // LIFE-CYCLE CALLBACKS:

    init() {
        this._errorCount = 0;
        this._stagelv = 1;
        this._teachPool = [];

        let snowmans = this.node.getChildByName('snowmans');
        let time = 2;


        cc.YL.timeOut(() => {
            let snowManPool = cc.YL.tools.arrCopy(snowmans.children);
            this._teachPool.push(snowManPool);
            let arr = []
            for (let i = 0; i < this.snowManNum; i++) {
                let snowMan = cc.YL.tools.getRandomCell(snowManPool);
                snowMan.getComponent(sp.Skeleton).setAnimation(0, 'newAnimation_1', false);
                arr.push(snowMan);
            }
            this._teachPool.push(arr);
        }, time * 1000)

        time += 0.5;
        cc.YL.timeOut(() => {
            this.showGame();
        }, time * 1000)
    },

    showGame() {
        let stage = this.node.getChildByName('stage' + this._stagelv);
        let options = stage.getChildByName('options');
        let formula = stage.getChildByName('formula');
        this.opPool = options.getChildByName('ops');
        this.opPool.children.forEach((op) => {
            op.getComponent('options').init(this);
        });

        if (this._stagelv == 2) {
            this._teachPool = cc.YL.tools.arrCopy(formula.children);
        }

        stage.active = true;
        let widget = options.getComponent(cc.Widget);
        widget.target = cc.find('Canvas');
        widget.updateAlignment();

        this._stageNode = stage;
        GD.sound.setShowTips(this.tips.shift(), true);
        cc.YL.unLockTouch();
    },


    checkIsAllRight() {
        let isAllRight = true;
        this.opPool.children.forEach((op) => {
            !op.getComponent('options').checkIsLock() && (isAllRight = false);
        });

        if (isAllRight) {
            cc.YL.lockTouch();
            cc.YL.timeOut(() => { this.showTeach() }, 1000)
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

    passLv() {
        if (this._stagelv >= this.maxLv) {
            this.showFinishLayer();
        } else {
            this._stageNode.active = false;
            this._stagelv++;
            this.showGame();
        }
    },

    showRightAnswer() {
        //展示正确答案
        cc.YL.lockTouch();
        this.opPool.children.forEach((op) => {
            op.getComponent('options').showRightAnswer();
        });
        GD.root.showStar(this.opPool, () => {
            this.showTeach();
        })
    },

    showTeach() {

        GD.sound.playTips(this.answerTips.shift(), () => {
            this.passLv();
        });

        let showAction = (arr) => {
            if (arr.length < 1) {
                return;
            }
            let target = arr.shift();
            let time = 1;
            if (target.constructor == Array) {
                target.forEach((kid) => {
                    cc.tween(kid)
                        .then(cc.YL.aMgr.zoomAction(2))
                        .start()
                });
            } else {
                cc.tween(target)
                    .then(cc.YL.aMgr.zoomAction(2))
                    .start()
            }
            cc.YL.timeOut(() => {
                showAction(arr)
            }, time * 1000)
        }
        cc.YL.timeOut(() => { showAction(this._teachPool) }, this.delayTimes.shift() * 1000)
    },

    showFinishLayer() {
        //此环节完成 注销所有事件
        cc.YL.timeOut(() => {
            this.node.destroy();
            cc.YL.emitter.emit('continueGame');
        }, 500)
    },
});
