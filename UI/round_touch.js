cc.Class({
    extends: cc.Component,

    properties: {
        qNodeArr: [cc.Node],
        tips: {
            displayName: '问题语音',
            type: cc.AudioClip,
            default: null
        },
        errorTips: {
            displayName: '答案语音',
            type: cc.AudioClip,
            default: null
        },
        isShowErrorTips: {
            displayName: '是否展示错误过多时的提示语音',
            default: false
        },

        delayTime: {
            displayName: '提示语音',
            type: [cc.Float],
            default: []
        },

        scaleNum: {
            displayName: '提示语音对应的数量',
            type: [cc.Integer],
            default: []
        },

        answerDur: {
            displayName: '答案显示时间,可不填 默认均为0',
            type: [cc.Float],
            default: []
        }
    },

    // LIFE-CYCLE CALLBACKS:

    init() {
        GD.nRound = this;
        this._errorCount = 0;

        let opList = this.node.getChildByName('opList');
        opList.children.forEach((kuang) => {
            kuang.getComponent('items') && kuang.getComponent('items').init();
        })

        for (let i in this.qNodeArr) {
            this.qNodeArr[i]._state = 'init';
        }

        cc.YL.addClock(this.tips);
        GD.sound.setShowTips(this.tips, true);
        cc.YL.unLockTouch();

        if (this.answerDur.length == 0) {
            for (let i in this.delayTime) {
                this.answerDur.push(1);
            }
        } else {
            for (let i in this.answerDur) {
                this.answerDur[i] == 0 && (this.answerDur[i] = 1);
            }
        }

        let board = this.node.getChildByName('board');
        let fruits = this.node.getChildByName('fruits');
        if (cc.find('Canvas/game').scaleX == 1) {
            fruits && fruits.setScale(1);
            board && board.setScale(1);
            opList && board && (opList.y -= board.height * 0.2)
        }
    },

    setItemsPut() {
        for (let i in this.qNodeArr) {
            if (this.qNodeArr[i]._state == 'init') return;
        }
        cc.YL.lockTouch();
        cc.YL.timeOut(() => {
            this.showRightAnswer();
        }, 1200);
    },

    setError() {
        this._errorCount++;
        let maxErrCount = 3
        if (this.isShowErrorTips && this._errorCount >= maxErrCount) {
            cc.YL.lockTouch();
            cc.YL.timeOut(() => {
                GD.sound.playTips('tips_start', () => {
                    this.showRightAnswer();
                })
            }, 1000);
        }
        return (this.isShowErrorTips && this._errorCount > maxErrCount)
    },

    showRightAnswer() {
        //展示正确答案
        let opList = this.node.getChildByName('opList');
        opList && (opList.zIndex = -1);
        this.showAnswerFly(() => {
            this.showAnswerTips();
        })
    },

    //展示正确答案
    showAnswerFly(callFunc) {
        if (this.qNodeArr.length < 1) {
            cc.YL.timeOut(() => {
                callFunc && callFunc()
            }, 500);
            return
        }
        let destination = this.qNodeArr.shift()
        if (destination._state != 'init') {
            this.showAnswerFly(callFunc)
            return
        }
        let options = this.node.getChildByName('opList').getChildByName(destination.name);
        let node = cc.instantiate(options)
        node.parent = destination
        node.position = cc.YL.tools.getRelativePos(options, destination)

        cc.tween(node)
            .delay(0.1)
            .then(cc.YL.aMgr.lineMove(node.position, cc.v2(0, 0), 0.1))
            .call(() => {
                GD.sound.playSound('ding')
                destination.setScale(1)
                if (this.isChoosenNum) {
                    destination._numLabel.string = options.name
                    node.active = false
                } else {
                    destination.getComponent(cc.Sprite).enabled = false;
                }
                this.showAnswerFly(callFunc)
            })
            .start()
    },

    showAnswerTips() {
        GD.sound.playTips(this.errorTips);
        let arr = cc.YL.tools.arrCopy(this.node.getChildByName('board').children);
        GD.exercises.showAnswerTips(arr, this.delayTime, this.scaleNum, this.answerDur, (time) => {
            //统计星星数量
            let starNum = 3;
            if (this._errorCount == 0) {
                starNum = 3;
            } else if (this._errorCount < 3) {
                starNum = 2;
            } else {
                starNum = 1;
            }
            setTimeout(() => {
                GD.root.showAddStar(starNum, () => {
                    this.showFinishLayer();
                })
            }, time * 1000);
        })
    },

    showFinishLayer() {
        this.node.active = false;
        this.node.destroy();
        GD.exercises.passLV();
    },
});
