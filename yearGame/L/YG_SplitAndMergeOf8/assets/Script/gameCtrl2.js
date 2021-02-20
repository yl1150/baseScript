//选择选项对应的脚本 
cc.Class({
    extends: cc.Component,

    properties: {
        tipsNodes: [cc.Node],
        num_showTime: [cc.Float],
        delayTimes: [cc.Float],
        tips: cc.String,
    },

    // LIFE-CYCLE CALLBACKS:

    init(yearGame) {
        this.rightAnswers = GD.answerArr;
        this._errorCount = 0;
        cc.YL.unLockTouch();
        GD.sound.setTipsButton(true);
        GD.sound.setShowTips(this.tips, true);

        this._gKeyBoard = yearGame.gKeyboard;
        this._gKeyBoard.bindCallFunc(this.touchCallFunc.bind(this));
        this._gKeyBoard.hideKeyBoard();


        this.formula = this.node.getChildByName('formula');
        //初始化算式
        this.formula.active = true;
        this.formula.children.forEach((op) => {
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

        this.btn_check = this.node.getChildByName('btn_check').getComponent(cc.Button);
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

        let tips = 'tips';
        for (let i in this.rightAnswers) {
            tips += ('_' + this.rightAnswers[i]);
        }
        cc.YL.lockTouch();
        GD.sound.playTips(tips, () => {
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

    showFinishLayer() {
        //此环节完成 注销所有事件
        cc.YL.emitter.emit('continueGame');
        GD.layerPool.push(this);
        while (GD.layerPool.length > 0) {
            GD.layerPool.shift().node.destroy();
        }
    },
});
