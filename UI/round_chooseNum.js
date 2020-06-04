// 点击选项 选择数字的脚本
cc.Class({
    extends: cc.Component,

    properties: {
        qNodeArr: [cc.Node],
        rightAnswer: [cc.String],
        tips: {
            type: cc.AudioClip,
            default: null
        },
        errorTips: {
            displayName: '错误过多时的提示语音',
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

        let pKeyBoard = this.node.getChildByName('keyBoard');
        let boardWidget = pKeyBoard.getComponent(cc.Widget);
        boardWidget.target = cc.find('Canvas');
        boardWidget.bottom = 80;
        boardWidget.right = 60;
        pKeyBoard.zIndex = -1

        cc.loader.loadRes('prefab/keyBoard', cc.Prefab, (err, _prefab) => {
            if (err) {
                console.log(err);
            }
            var keyBoard = cc.instantiate(_prefab);
            keyBoard.parent = pKeyBoard;
            this._keyBoard = keyBoard.getComponent('keyBoard');
            this._keyBoard.init(this.touchKeyBoardCallFunc.bind(this));
        })


        this.qNodeArr.forEach((option) => {
            option._state = 'init';
            option._touchImg = option.getChildByName('touchImg');
            option._numLabel = option.getChildByName('num').getComponent(cc.Label);
            cc.YL.tools.registerTouch(
                option,
                (e) => {
                    //e.target.setScale(1.2);
                },
                null,
                (e) => {
                    //e.target.setScale(1);
                    if (this._targetK == e.target) {
                        this._targetK = null;
                        this._keyBoard.hideKeyBoard();
                    } else {
                        this._keyBoard.showKeyBoard(e.target._numLabel, 4);
                        this._targetK = e.target;
                        this._keyBoard.setBtn(this.checkIsAllFinished());
                        this.setTouch(e.target, true);
                    }
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
        let opList = this.node.getChildByName('opList');
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
        this.qNodeArr.forEach((op) => {
            op._touchImg && (op._touchImg.active = false);
        })
        if (!target) {
            return;
        }
        target._touchImg && (target._touchImg.active = isShow);
        //target._numLabel.node.color = (isShow ? cc.color(219, 247, 143, 255) : cc.color(109, 201, 40, 255))
    },

    touchKeyBoardCallFunc(keys) {
        //this.setTouch(this._targetK,false);
        /*         this._targetK._numLabel.node.stopAllActions();
                this._targetK._numLabel.node.setScale(1); */
        this._keyBoard.setBtn(this.checkIsAllFinished());
        keys == 'enter' && this.check(this._targetK);
    },

    checkIsAllFinished() {
        for (let i in this.qNodeArr) {
            if (this.qNodeArr[i]._numLabel.string == '?') {
                return false;
            }
        }
        return true;
    },

    check(target) {
        this.setTouch(null, false);
        this._targetK = null;
        let isRight = true;
        for (let i in this.qNodeArr) {
            if (this.qNodeArr[i]._numLabel.string != this.rightAnswer[i]) {
                isRight = false;
            }
        }
        if (!isRight) {
            GD.sound.playSound('wrong');
            GD.sound.playSound('blank');
            for (let i in this.qNodeArr) {
                let label = this.qNodeArr[i]._numLabel;
                cc.tween(label.node).parallel(
                    cc.tween().to(0.5, { opacity: 0 }),
                    cc.YL.aMgr.zoomAction(2)
                ).call(() => {
                    label.node.opacity = 255;
                    label.string = '?';
                    label.node.setScale(1);
                }).start()
            }

            !this.setError() && this._keyBoard.hideKeyBoard();
        } else {
            cc.YL.lockTouch();
            this._keyBoard.hideKeyBoard();
            target._state = 'lock';
            cc.YL.tools.unRegisterTouch(target);
            GD.sound.playSound('right');
            let opList = this.node.getChildByName('opList');
            GD.root.showStar(opList, () => {
                this.showRightAnswer();
            })
        }
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
        cc.YL.timeOut(() => {
            for (let i in this.qNodeArr) {
                this.qNodeArr[i]._numLabel.string = this.rightAnswer[i];
            }
            this.showAnswerTips();
            //opList.active = false;
        }, 500);
    },

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
        let options = null;
        options = this._keyBoard.getKey(this.rightAnswer.shift());
        let node = cc.instantiate(options)
        node.parent = destination
        node.position = cc.YL.tools.getRelativePos(options, destination)

        cc.tween(node)
            .delay(0.1)
            .then(cc.YL.aMgr.lineMove(node.position, cc.v2(0, 0), 0.1))
            .call(() => {
                GD.sound.playSound('ding')
                destination.setScale(1)
                destination._numLabel.string = options.name
                node.active = false
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
