//选择选项对应的脚本 
cc.Class({
    extends: cc.Component,

    properties: {
        tips: [cc.String],
        formulaType: [cc.String],
        isGetStar: [cc.Boolean],
        maxStageLv: 1,
    },

    // LIFE-CYCLE CALLBACKS:

    init() {
        this.stageLv = 1;
        this.checkBtn = this.node.getChildByName('checkBtn').getComponent(cc.Button);
        this.registerEvent();
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
        this.showQuestion();
        GD.sound.setTipsButton(true);
        cc.YL.unLockTouch();
    },

    showQuestion() {
        this.tips.length > 0 && GD.sound.setShowTips(this.tips.shift(), true);
        this._errorCount = 0;
        let optionBoard = this.node.getChildByName('board');
        if (this.stageLv == 1) {
            let options = this.node.getChildByName('options');

            options.children.forEach((op) => {
                op.getComponent('options').init(this);
            })

            this.optionBoard = optionBoard;
            this.options = options;
            optionBoard.active = true;
            options.active = true;
        } else {
            let formula = this.node.getChildByName('formula' + this.stageLv).getComponent('formula');
            formula.node.active = true;
            this.formula = formula;
            formula.initAnswer(this.formulaData, this.formulaType.shift());
            formula.init(
                () => {
                    //正确
                    cc.YL.lockTouch();
                    GD.sound.playSound('right');
                    GD.root.showStar(formula.node, () => {
                        formula.node.active = false;
                        this.passStage();
                    });
                },
                () => {
                    //错误
                    GD.sound.playSound('wrong');
                    GD.sound.playSound('blank');
                    this.setError();
                }
            )
        }


    },

    checkIsAllPut() {
        this.checkBtn.interactable = this.options.childrenCount < 1;
    },

    checkArrisCellIsSame(arr) {
        for (let i in arr) {
            for (let j in arr) {
                if (arr[i] != arr[j] && arr[i].checkProperty == arr[j].checkProperty) {
                    return true;
                }
            }
        }
        return false;
    },

    checkIsAllRight() {
        let noodlesData = GD.noodlesData;
        let boardArr = this.optionBoard.children;
        let opArr = [];

        for (let i in noodlesData) {
            let data = noodlesData[i];
            let isCheck = true;
            //检测 pSize
            this.formulaData = [];
            let maxNum = 0;
            for (let j in boardArr) {
                let layout = boardArr[j].getChildByName('layout');
                let isSame = true;
                let checkProperty = layout.children[0].noodlesData[data];
                layout.children.forEach((op) => {
                    if (op.noodlesData[data] != checkProperty) isSame = false;
                    opArr.push(op);
                });
                if (isSame) {
                    //全部相同
                    boardArr[j].checkProperty = checkProperty;
                } else {
                    isCheck = false;
                }
                this.formulaData.push(layout.childrenCount);
                maxNum += layout.childrenCount;
            }
            this.formulaData.push(maxNum);
            //是否继续检查pSize
            if (isCheck) {
                if (!this.checkArrisCellIsSame(boardArr)) {
                    //每一个盒子里的元素属性相同 且不同盒子属性不同 正确
                    console.log('正确规律：-----', data);
                    noodlesData.splice(i, 1);
                    cc.YL.lockTouch();
                    GD.sound.playSound('right');
                    GD.root.showStar(this.optionBoard, () => {
                        this.passStage();
                    });

                    //取消盒子碰撞体积 注销所有事件
                    boardArr.forEach((board) => {
                        board.getComponent(cc.BoxCollider).enabled = false;
                    });

                    opArr.forEach((op) => {
                        op.getComponent('options').lockOption();
                    });

                    this.checkBtn.node.active = false;
                    return;
                }
            }
        }
        //错误
        GD.sound.playSound('wrong');
        GD.sound.playSound('blank');
        this.setError();
        opArr.forEach((op) => {
            op.getComponent('options').showBack();
        });
        this.checkBtn.interactable = false;
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
        let starTarget = null;
        if (this.stageLv == 1) {
            this.checkBtn.node.active = false;
            starTarget = this.optionBoard;
            let noodlesData = ['noodlesSize', 'noodlesType', 'noodlesSD', 'noodlesEgg']
            let checkProperty = noodlesData[0];
            let opArr = cc.YL.tools.arrCopy(this.options.children);
            let arr = this.optionBoard.children;

            for (let i in arr) {
                let isSame = true;
                opArr.forEach((op) => {
                    if (op.noodlesData[checkProperty] == i) op.getComponent('options').showRightAnswer(arr[i]);
                });
            }
        }else{
            starTarget = this.formula.node;
            this.formula.showRightAnswer();
        }

        /*     let arr = cc.YL.tools.arrCopy(this.options.children);
            arr.forEach((op) => {
                op.getComponent('options').showRightAnswer();
            }) */
        GD.root.showStar(starTarget, () => {
            this.passStage();
        });
        cc.YL.lockTouch();
    },

    passStage() {
        let check = () => {
            this.stageLv++;
            if (this.stageLv > this.maxStageLv) {
                this.showFinishLayer();
            } else {
                cc.YL.unLockTouch();
                this.showQuestion();
            }
        }
        if (this.isGetStar.shift()) {
            GD.root.showAddStar(GD.root.getStarNum(this._errorCount), () => {
                if (this.stageLv == 1) {
                    this.showStageEnding(() => {
                        check();
                    })
                } else {
                    check();
                }
            })
        } else {
            if (this.stageLv == 1) {
                this.showStageEnding(() => {
                    check();
                })
            } else {
                check();
            }
        }
    },


    showStageEnding(cb) {
        cc.tween(this.optionBoard)
            .to(0.5, { scale: 0.8, y: 250 })
            .call(() => {
                cb && cb();
            })
            .start()
    },

    showFinishLayer() {
        //此环节完成 注销所有事件
        this.unregisterEvent();
        cc.YL.emitter.emit('continueGame');
        this.node.destroy();
    },
});
