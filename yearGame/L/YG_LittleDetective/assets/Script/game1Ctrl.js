//选择选项对应的脚本 
cc.Class({
    extends: cc.Component,

    properties: {
        rightAnswer: {
            displayName: '正确答案',
            type: [cc.Integer],
            default: []
        },
        tips: {
            displayName: '问题语音',
            type: cc.AudioClip,
            default: null
        },
        errorTips: {
            displayName: '答案语音',
            type: [cc.AudioClip],
            default: []
        },
    },

    // LIFE-CYCLE CALLBACKS:

    init() {
        this.checkBtn = this.node.getChildByName('check');
        let listIcon = this.node.getChildByName('listIcon');
        let lists = this.node.getChildByName('lists');


        cc.tween(listIcon)
            .delay(2)
            .then(cc.YL.aMgr.zoomAction(2))
            .start()
        cc.YL.addClock(this.tips);
        GD.sound.setShowTips(this.tips, true);
        cc.YL.unLockTouch();


        this._errorCount = 0;
        this.opArr = [];
        lists.children.forEach((list) => {
            list.children.forEach((op) => {
                op.isTouch = false;
                this.opArr.push(op);
                op._touchImg = op.getComponent(cc.Sprite);
                cc.YL.tools.registerTouch(
                    op,
                    (e) => {
                        this.isShowScale && e.target.setScale(1.2);
                        this.setTouch(e.target, !e.target.isTouch);
                    },
                    null,
                    (e) => {
                        this.isShowScale && e.target.setScale(1);
                        //this.rightNode == e.target ? this.showRight(this.rightNode) : this.showWrong(e.target);
                    },
                )
            })
        });

    },

    setTouch(target, isShow) {
        target._touchImg && (target._touchImg.enabled = isShow);
        target.isTouch = isShow;

        //刷新按钮
        this.checkBtn.active = false;
        for (let i in this.opArr) {
            if (this.opArr[i].isTouch) {
                //只要有一个被选中则按钮可点
                this.checkBtn.active = true;
            }
        }
    },

    check() {
        let lists = this.node.getChildByName('lists');

        let wrongLists = [];//错误表容器
        let listCounter = [];
        //判断是否出现中断的情况 统计数量
        lists.children.forEach((list) => {
            let isStart = false;
            let arr = list.children;
            let count = 0;
            for (let i in arr) {
                if (arr[i].isTouch) {
                    isStart = true;
                }
                if (isStart) {
                    if (!arr[i].isTouch) {
                        //中断
                        console.log('中断！！！！');
                        wrongLists.push(list);
                        listCounter.push(count);
                        return;
                    }
                    count++;
                }
            }
            listCounter.push(count);
        });
        console.log('wrongLists:  ', wrongLists);
        console.log('listCounter: ', listCounter);

        let listArr = lists.children;
        for (let i in this.rightAnswer) {
            if (this.rightAnswer[i] != listCounter[i]) {
                !cc.YL.tools.getArrIsHaveCell(wrongLists, listArr[i]) && wrongLists.push(listArr[i])
            }
        }
        if (wrongLists.length > 0) {
            //有错误
            GD.sound.playSound('wrong');
            GD.sound.playSound('blank');
            this.setError();
            wrongLists.forEach((list) => {
                list.children.forEach((op) => {
                    this.setTouch(op, false);
                })
            });
        } else {
            cc.YL.lockTouch();
            GD.sound.playSound('right');
            GD.root.showStar(this.node, () => {
                this.showAnswerTips();
            })
        }
    },

    setError() {
        this._errorCount++;
        let maxErrCount = 3
        if (this._errorCount >= maxErrCount) {
            cc.YL.lockTouch();
            this.checkBtn.active = false;
            cc.YL.timeOut(() => {
                GD.sound.playTips('tipsWatch', () => {
                    this.showRightAnswer();
                })
            }, 1000);
        }
    },

    showRightAnswer() {
        //展示正确答案
        cc.YL.lockTouch();

        let listsArr = this.node.getChildByName('lists').children;
        for (let i in listsArr) {
            let num = this.rightAnswer[i];
            let arr = cc.YL.tools.arrCopy(listsArr[i].children);
            for (let j = 0; j < num; j++) {
                this.setTouch(arr.pop(), true);
            }
        }
        this.checkBtn.active = false;
        GD.root.showStar(this.node, () => {
            this.showAnswerTips();
        })
    },

    showAnswerTips() {
        let showTeach = (tipArr, listArr, answerArr) => {
            if (tipArr.length <= 0) {
                setTimeout(() => {
                    GD.root.showAddStar(GD.root.getStarNum(this._errorCount), () => {
                        this.showFinishLayer();
                    })
                }, 500);
                return;
            }
            let tips = tipArr.shift();
            GD.sound.playTips(tips);
            let arr = cc.YL.tools.arrCopy(listArr.shift().children);
            let num = answerArr.shift();
            for (let j = 0; j < num; j++) {
                let op = arr.pop();
                cc.tween(op)
                    .delay(j * 1)
                    .then(cc.YL.aMgr.zoomAction(1))
                    .start()
            }
            let time = GD.sound.getDuringTime(tips) + 0.5;
            cc.YL.timeOut(() => {
                showTeach(tipArr, listArr, answerArr);
            }, time * 1000)
        }
        showTeach(this.errorTips, cc.YL.tools.arrCopy(this.node.getChildByName('lists').children), this.rightAnswer);
    },

    showFinishLayer() {
        //此环节完成 注销所有事件
        this.checkBtn.active = false;
        let lists = this.node.getChildByName('lists');
        lists.children.forEach((list) => {
            list.children.forEach((op) => {
                cc.YL.tools.unRegisterTouch(op)
            })
        });
        cc.YL.emitter.emit('continueGame');
    },
});
