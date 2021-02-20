//选择选项对应的脚本 
cc.Class({
    extends: cc.Component,

    properties: {
        rightAnswers: {
            default: [],
            type: [cc.Integer],
            displayName: '正确答案',
        },
        tipsNodes: [cc.Node],
        num_showTime: [cc.Float],
        delayTimes: [cc.Float],
        tips: cc.String,
        answerTips: cc.String
    },

    // LIFE-CYCLE CALLBACKS:

    init(formula, gKeyboard, btn_check) {
        this._errorCount = 0;
        cc.YL.unLockTouch();
        GD.sound.setTipsButton(true);
        GD.sound.setShowTips(this.tips, true);

        gKeyboard.bindCallFunc(this.touchCallFunc.bind(this));
        this._gKeyBoard = gKeyboard;
        gKeyboard.hideKeyBoard();



        //初始化算式
        formula.active = true;
        formula.children.forEach((op) => {
            let label = op.getChildByName('num').getComponent(cc.Label);
            label.string = '?';
            op._nLabel = label;
            op.getComponent(cc.Sprite).enabled = false;
            cc.YL.tools.registerTouch(
                op,
                (e) => {
                    //
                },
                null,
                (e) => {
                    this._gKeyBoard.showKeyBoard();
                    this._gKeyBoard.bindTargetLabel(e.target._nLabel);
                    this.setTouch(e.target);
                },
            )

        });


        var clickEventHandler = new cc.Component.EventHandler();
        clickEventHandler.target = this.node; // 这个 node 节点是你的事件处理代码组件所属的节点
        clickEventHandler.component = "gameCtrl";// 这个是代码文件名
        clickEventHandler.handler = "check";
        btn_check.clickEvents[0] = clickEventHandler;


        this.btn_check = btn_check;
        this.formula = formula;
    },

    setTouch(target) {
        this.formula.children.forEach((op) => {
            target != op && (op.getComponent(cc.Sprite).enabled = false);
        });
        target && (target.getComponent(cc.Sprite).enabled = !target.getComponent(cc.Sprite).enabled);
    },

    touchCallFunc(key) {
        //判断是否全部做完
        let isAllFinish = true;
        this.formula.children.forEach((op) => {
            if (op._nLabel.string == '?' || op._nLabel.string == '') {
                isAllFinish = false;
            }
        });

        this.btn_check.interactable = isAllFinish;
    },

    check() {
        let isRight = true;
        let arr = this.formula.children;
        for (let i in arr) {
            if (arr[i]._nLabel.string != this.rightAnswers[i]) {
                isRight = false;
            }
        }
        if (isRight) {
            cc.YL.lockTouch();
            GD.sound.playSound('right');
            GD.root.showStar(this.formula, () => {
                this._gKeyBoard.hideKeyBoard();
                this.showAnswerTips();
            })
            this.setTouch();
        } else {
            GD.sound.playSound('wrong');
            GD.sound.playSound('blank');
            this._gKeyBoard.clearKeyBoard();
            for (let i in arr) {
                arr[i]._nLabel.string = '?';
            }
            this.setError();
            this.setTouch();
        }
        this.btn_check.interactable = false;
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
        cc.YL.lockTouch();
        let arr = this.formula.children;
        for (let i in arr) {
            arr[i]._nLabel.string = this.rightAnswers[i];
        }
        GD.root.showStar(this.formula, () => {
            this.showAnswerTips();
        })
    },

    showAnswerTips() {
        cc.YL.lockTouch();
        GD.sound.playTips(this.answerTips, () => {
            GD.root.showAddStar(GD.root.getStarNum(this._errorCount), () => {
                this.showFinishLayer();
            })
        });

        let arr = this.tipsNodes;
        let showTeach = (tPool) => {
            if (arr.length < 1) {
                return;
            }
            let tNode = arr.shift();
            tNode.active = true;
            cc.tween(tNode)
                .then(cc.YL.aMgr.zoomAction(2))
                .start()

            cc.YL.timeOut(() => { showTeach(tPool) }, tPool.shift() * 1000)
        }
        cc.YL.timeOut(() => { showTeach(this.delayTimes) }, this.delayTimes.shift() * 1000)
    },

    onDestroy() {
        this.formula.children.forEach((op) => {
            cc.YL.tools.unRegisterTouch(op);
        });
    },

    showFinishLayer() {
        //此环节完成 注销所有事件
        cc.YL.emitter.emit('continueGame');
        this.node.destroy();
    },
});
