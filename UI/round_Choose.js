//选择选项对应的脚本 
cc.Class({
    extends: cc.Component,

    properties: {
        rightNode: cc.Node,
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
        },
        isShowTouchImg: true,
    },

    // LIFE-CYCLE CALLBACKS:

    init() {
        this._errorCount = 0;
        let opList = this.node.getChildByName('opList');
        opList.children.forEach((kuang) => {
            GD.root.setTouchImg(kuang, 1);
            kuang._numLabel = kuang.getChildByName('num');
            cc.YL.tools.registerTouch(
                kuang,
                (e) => {
                    e.target.setScale(1.2);
                    this.setTouch(e.target, true);
                },
                null,
                (e) => {
                    e.target.setScale(1);
                    this.setTouch(e.target, false);
                    this.rightNode == e.target ? this.showRight(e.target) : this.showWrong(e.target);
                },
            )
        });

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

        cc.YL.addClock(this.tips);
        GD.sound.setShowTips(this.tips, true);
        cc.YL.unLockTouch();
    },

    setTouch(target, isShow) {
        if (!this.isShowTouchImg) {
            return;
        }
        target._touchImg && (target._touchImg.active = isShow);
        target._numLabel && (target._numLabel.color = (isShow ? cc.color(219, 247, 143, 255) : cc.color(109, 201, 40, 255)))
    },

    showRight(option) {
        cc.YL.lockTouch();
        GD.sound.playSound('right');
        GD.root.showStar(option, () => {
            this.showAnswerTips();
        })
    },

    showWrong(option) {
        GD.sound.playSound('wrong');
        GD.sound.playSound('blank');
        cc.tween(option).then(
            cc.YL.aMgr.zoomAction(2)
        ).call(() => {
            option.opacity = 255;
            option.setScale(1);
        }).start()
        this.setError();
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
        cc.YL.lockTouch();
        //GD.sound.playSound('right');
        GD.root.showStar(this.rightNode, () => {
            callFunc && callFunc();
        })
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
