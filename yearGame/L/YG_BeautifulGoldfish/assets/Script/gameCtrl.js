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
        answerTips: cc.String,
        showDDMove: false
    },

    // LIFE-CYCLE CALLBACKS:

    init() {
        this._errorCount = 0;
        this._ddSke = this.node.getChildByName('doudou').getComponent(sp.Skeleton);
        this._btn_check = this.node.getChildByName('btn_check').getComponent(cc.Button);
        this._targetTanks = this.node.getChildByName('targetTanks');

        this._targetTanks.children.forEach((tank) => {
            tank.fishCount = 0;
        });


        this.opArr = [];
        this.options = this.node.getChildByName('fishTank');
        this.options.children.forEach((op) => {
            let op_Com = op.getComponent('options');
            this.opArr.push(op_Com);
            op_Com.init();
        });

        cc.YL.fitPhone(this.node);
        this.registerEvent();
    },

    //注册事件
    registerEvent() {
        cc.YL.emitter.on('reFreshUI', (e) => {
            console.log('reFreshUI')
            this._btn_check.interactable = true;
            this._targetTanks.children.forEach((tank) => {
                tank.fishCount == 0 && (this._btn_check.interactable = false);
            });
        })

        cc.YL.emitter.on('startGame', (e) => {
            this._ddSke.node.active = true;
            if (this.showDDMove) {
                cc.tween(this._ddSke.node)
                    .by(0.5, { x: 500 })
                    .call(() => {
                        this.showGame();
                    })
                    .start()
            } else {
                this.showGame();
            }
        })

        //向sound 绑定豆豆的动画
        GD.sound.bindSpine(this._ddSke, 'daiji', 'shuohua');
    },

    unregisterEvent() {
        cc.YL.emitter.off('reFreshUI');
        cc.YL.emitter.off('startGame');
    },

    showGame() {
        console.log('startGame')
        this.options.active = true;
        GD.sound.setTipsButton(true);
        GD.sound.setShowTips(this.tips, true);
        cc.YL.unLockTouch();
    },


    checkIsAllRight() {
        this._btn_check.interactable = false;
        let arr = this._targetTanks.children;
        for (let i in arr) {
            if (arr[i].fishCount != this.rightAnswers[i]) {
                //错误
                this.opArr.forEach(op => {
                    op.showBack();
                });
                this._targetTanks.children.forEach((tank) => {
                    tank.fishCount = 0;
                });
                GD.sound.playSound('wrong');
                GD.sound.playSound('blank');
                this.setError();
                return;
            }
        }
        GD.sound.playSound('right');
        GD.root.showStar(this.node);
        cc.YL.lockTouch();
        cc.YL.timeOut(() => { this.showAnswerTips() }, 1000)
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
        let arr = this._targetTanks.children;
        for (let i in this.rightAnswers) {
            for (let j = 0; j < this.rightAnswers[i]; j++) {
                let op = this.opArr.shift();
                op.showDown(arr[i]);
            }
        }
        GD.root.showStar(this.node, () => {
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

        this.node.getChildByName('formula').active = true;
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
        cc.YL.timeOut(() => {
            GD.sound.unbundlingSpine(this._ddSke);
            this.unregisterEvent();
            cc.YL.emitter.emit('continueGame');
        }, 500)

        cc.YL.timeOut(() => {
            this.node.destroy();
        }, 2000)
    },
});
