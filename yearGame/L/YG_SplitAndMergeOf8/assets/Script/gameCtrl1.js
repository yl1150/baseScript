//选择选项对应的脚本 
cc.Class({
    extends: cc.Component,

    properties: {
        tips: cc.String,
    },

    // LIFE-CYCLE CALLBACKS:

    init(yearGame) {
        this._errorCount = 0;
        this._btn_check = this.node.getChildByName('btn_check').getComponent(cc.Button);
        this.opBoard = this.node.getChildByName('opBoard');
        this.opBoard.children.forEach((tank) => {
            tank.kidCount = 0;
        });


        this.opArr = [];
        this.options = this.node.getChildByName('options');
        this.options.children.forEach((op) => {
            let op_Com = op.getComponent('options');
            this.opArr.push(op_Com);
            op_Com.init();
        });

        this.registerEvent();
        this.showGame();
    },

    //注册事件
    registerEvent() {
        cc.YL.emitter.on('reFreshUI', (e) => {
            console.log('reFreshUI')
            this._btn_check.interactable = true;
            this.opBoard.children.forEach((board) => {
                board.kidCount == 0 && (this._btn_check.interactable = false);
            });
        })

        cc.YL.emitter.on('startGame', (e) => {
        })
    },

    unregisterEvent() {
        cc.YL.emitter.off('reFreshUI');
        cc.YL.emitter.off('startGame');
    },

    showGame() {
        console.log('startGame')
        this.opBoard.active = true;
        this.opBoard.getComponent(cc.Widget).updateAlignment();
        this._btn_check.node.active = true;
        this.options.active = true;
        GD.sound.setTipsButton(true);
        GD.sound.setShowTips(this.tips, true);
        cc.YL.unLockTouch();
    },


    checkIsAllRight() {
        this._btn_check.interactable = false;
        let arr = this.opBoard.children;
        let answerArr = [];
        let count = 0;
        for (let i in arr) {
            count += arr[i].kidCount;
            answerArr.push(arr[i].kidCount);
        }
        if (count != 8) {
            //错误
            this.opArr.forEach(op => {
                op.showBack();
            });
            this.opBoard.children.forEach((tank) => {
                tank.kidCount = 0;
            });
            GD.sound.playSound('wrong');
            GD.sound.playSound('blank');
            this.setError();
        } else {
            //判断是否已经用过此种答案
            for (let i in GD.usedAnswerData) {
                if (cc.YL.tools.checkArrIsSame(GD.usedAnswerData[i], answerArr)) {
                    //已使用
                    cc.YL.lockTouch();
                    GD.sound.playTips('uesed', () => {
                        cc.YL.unLockTouch();
                        this.opArr.forEach(op => {
                            op.showBack();
                        });
                        this.opBoard.children.forEach((tank) => {
                            tank.kidCount = 0;
                        });
                    });
                    GD.sound.playSound('blank');
                    this.setError();
                    return;
                }
            }
            GD.usedAnswerData.push(answerArr);
            //正确
            GD.sound.playSound('right');
            GD.root.showStar(this.node);
            cc.YL.lockTouch();
            cc.YL.timeOut(() => { this.showFinishLayer(answerArr) }, 1000)
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

    getRandomAnswer() {
        let arr = []
        while (arr.length < 1) {
            let a = cc.YL.tools.randomNum(1, 7);
            let b = 8 - a;
            arr = [a, b];
            for (let i in GD.usedAnswerData) {
                if (cc.YL.tools.checkArrIsSame(GD.usedAnswerData[i], arr)) {
                    arr = [];
                    break;
                }
            }
        }
        return arr;
    },

    showRightAnswer() {
        //展示正确答案
        cc.YL.lockTouch();
        let arr = this.opBoard.children;
        let _opArr = cc.YL.tools.arrCopy(this.opArr);
        let answerArr = this.getRandomAnswer();
        GD.usedAnswerData.push(answerArr);
        for (let i in answerArr) {
            for (let j = 0; j < answerArr[i]; j++) {
                let op = _opArr.shift();
                op.showDown(arr[i]);
            }
        }
        GD.root.showStar(this.node, () => {
            this.showFinishLayer(answerArr);
        })
    },

    showFinishLayer(answerArr) {
        GD.root.showAddStar(GD.root.getStarNum(this._errorCount), () => {
            //此环节完成 注销所有事件
            GD.layerPool.push(this);
            GD.answerArr = answerArr.concat([8]);
            this._btn_check.node.active = false;
            this.opArr.forEach((op) => {
                op.getComponent('options').clear();
            });
            this.unregisterEvent();
            cc.YL.emitter.emit('continueGame');
        })


    },
});
