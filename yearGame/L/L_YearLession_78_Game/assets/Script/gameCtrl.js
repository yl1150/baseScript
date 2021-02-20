const dataType = cc.Enum({
    None: 0,
    WrongNum: 1,
    Used: 2,
    Wrong: 3,
    Right: 4,
});
cc.Class({
    extends: cc.Component,

    properties: {
        tips: cc.String,
        maxLv: 4
    },

    // LIFE-CYCLE CALLBACKS:

    init() {
        this.lv = 1;
        this.answerList = this.node.getChildByName('answerList').getComponent('answerList');
        this.seeUsedAnswerBtn = this.node.getChildByName('seeUsedAnswerBtn');
        this.registerEvent();

        this.answerList.init();

        this.options = this.node.getChildByName('options').getComponent('options');
        this.options.init();

        let checkBtn = this.node.getChildByName('checkBtn');
        cc.YL.tools.registerTouch(
            checkBtn,
            (e) => {
                this.setTouch(e.target, true);
            },
            null,
            (e) => {
                this.setTouch(e.target, false);
                this.check();
            },
        );

        cc.YL.tools.registerTouch(
            this.seeUsedAnswerBtn,
            (e) => {
                this.setTouch(e.target, true);
            },
            null,
            (e) => {
                this.setTouch(e.target, false);
                this.answerList.showList();
            },
        );
    },


    //注册事件
    registerEvent() {
        cc.YL.emitter.on('startGame', (e) => {
            this.startGame();
        })
    },

    unregisterEvent() {
        cc.YL.emitter.off('startGame');
    },


    //展示结束时的动画
    showEnding(cb) {
        cb && cb();
    },

    startGame() {
        this._errorCount = 0;
        GD.sound.setTipsButton(true);
        cc.YL.unLockTouch();
        GD.sound.setShowTips(this.tips, true);
        this.options.clear();
    },

    setTouch(target, isShow) {
        if (!target._touchImg) {
            target._touchImg = target.getChildByName('touchImg');
        }
        if (!target._touchImg) {
            return;
        }
        target._touchImg.active = isShow;
    },

    addPower(percent = 0.25) {
        let progress = this.node.getChildByName('powerPercent').getComponent(cc.ProgressBar);
        if (progress.progress >= 1) {
            return;
        }
        let per = percent / 100;
        let count = 0;
        let id = setInterval(() => {
            if (count + per > percent) {
                progress.progress += (percent - count);
                clearInterval(id);
                return;
            }
            count += per;
            progress.progress += per;
        }, 10)
    },

    checkAnswer(answer) {
        let count = 0;
        let max_row = 5;
        let max_col = 5;

        answer.forEach((cell) => {
            if (cell) count++;
        });

        if (count < 1) {
            return dataType.None;
        }
        if (count != 16) {
            return dataType.WrongNum;
        }


        count = 0;
        //判断条件  每一行或者每列数量为5的且总个数等于4
        //判断行
        for (let i = 0; i < max_row; i++) {
            let arr = [];
            for (let j = 0; j < max_col; j++) {
                answer[i * max_col + j] && arr.push(answer[i * max_col + j]);
            }
            arr.length == 5 && count++;
        }


        //判断列
        for (let i = 0; i < max_col; i++) {
            let arr = [];
            for (let j = 0; j < max_row; j++) {
                answer[j * max_col + i] && arr.push(answer[j * max_col + i]);
            }
            arr.length == 5 && count++;
        }

        if (count == 4) {
            //答案正确
            //判断答案是否已经使用过了

            for (let i in GD.usedAnswers) {
                if (cc.YL.tools.checkArrIsSameStrict(answer, GD.usedAnswers[i])) {
                    return dataType.Used;
                }
            }
            return dataType.Right
        } else {
            //错误
            return dataType.Wrong;
        }
    },

    check() {
        let answer = [];
        this.options.node.children.forEach((op) => {
            answer.push(op.isSelected);
        });
        let result = this.checkAnswer(answer);
        switch (result) {
            case dataType.None:
                GD.sound.playSound('blank2');
                break;
            case dataType.WrongNum:
                GD.sound.playSound('wrong');
                GD.sound.playSound('blank');
                this.setError();
                this.options.clear();
                break;
            case dataType.Used:
                //答案已使用
                GD.sound.playTips('answerused');
                GD.sound.playSound('blank');
                this.setError();
                this.options.clear();
                break;
            case dataType.Wrong:
                //错误
                GD.sound.playSound('wrong');
                GD.sound.playSound('blank');
                this.setError();
                this.options.clear();
                break;
            case dataType.Right:
                this.seeUsedAnswerBtn.active = true;
                GD.sound.playSound('right');
                this.addPower();
                cc.YL.lockTouch();
                GD.root.showStar(this.options.node, () => {
                    this.showPassLV();
                });

                GD.usedAnswers.push(answer);
                let pNode = cc.instantiate(this.options.node);
                if (pNode.getComponent('options')) pNode.getComponent('options').destroy();
                this.answerList.addAnswer(pNode);
                break;
            default:
                break;
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

        let answer = [];
        let max_row = 5;
        let max_col = 5;

        for (let i = 0; i < max_col & max_row; i++) {
            answer.push(false);
        }


        //随机获得一个正确答案

        let arr = [0, 1, 2, 3, 4];

        //随机2行
        for (let i = 0; i < 2; i++) {
            let c = cc.YL.tools.popRandomCell(arr);
            for (let j = 0; j < max_col; j++) {
                answer[c * max_col + j] = true;
            }
        }


        //随机2列
        arr = [0, 1, 2, 3, 4];
        for (let i = 0; i < 2; i++) {
            let c = cc.YL.tools.popRandomCell(arr);
            for (let j = 0; j < max_col; j++) {
                answer[i + j * max_row] = true;
            }
        }


        return answer;
    },

    showRightAnswer() {
        //展示正确答案
        let answer = this.getRandomAnswer();
        while (this.checkAnswer(answer) != dataType.Right) {
            answer = this.getRandomAnswer();
        }
        this.options.showAnswer(answer);

        this.seeUsedAnswerBtn.active = true;
        this.addPower();
        GD.usedAnswers.push(answer);
        let pNode = cc.instantiate(this.options.node);
        if (pNode.getComponent('options')) pNode.getComponent('options').destroy();
        this.answerList.addAnswer(pNode);

        GD.root.showStar(this.options.node, () => {
            this.showPassLV();
        })
        cc.YL.lockTouch();
    },

    showPassLV() {
        GD.root.showAddStar(GD.root.getStarNum(this._errorCount), () => {
            if (this.lv >= this.maxLv) {
                this.showFinishLayer();
            } else {
                this.lv++;
                cc.YL.emitter.emit('startGame');
            }
        })

    },

    showFinishLayer() {
        //此环节完成 注销所有事件
        this.unregisterEvent();
        this.showEnding(() => {
            cc.YL.emitter.emit('continueGame');
        })
    },
});
