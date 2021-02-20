//选择选项对应的脚本 
cc.Class({
    extends: cc.Component,

    properties: {
        adders: [cc.Integer],
        sum: cc.Integer,
        tipsPool: {
            displayName: '问题语音',
            type: [cc.AudioClip],
            default: []
        },
        tipsNode: [cc.Node],
        delayTimes: [cc.Float],
        isShowScale: true
    },

    // LIFE-CYCLE CALLBACKS:

    init(game) {
        this.game = game;
        this._errorCount = 0;
        this.chuan = this.node.getChildByName('chuan');
        this.suanshi = this.node.getChildByName('suanshi');

        //初始化算式
        this.options = this.suanshi.getChildByName('options');
        this.checkBtn = this.suanshi.getChildByName('checkBtn').getComponent(cc.Button);

        this._keyBoard = this.suanshi.getChildByName('gKeyboard').getComponent('keyBoardCtrl');


        let isShowKeyBoard = false;
        this._addPool = [];
        this.sumOp = null;
        this.options.children.forEach((option) => {
            if (option.name != 'sum') {
                this._addPool.push(option);
            } else {
                this.sumOp = option;
            }
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
                        this.setTouch(e.target, false);
                        this._targetK = null;
                        this._keyBoard.setKeyBoard();
                        this._keyBoard.hideKeyBoard();
                    } else {
                        this._keyBoard.setKeyBoard(e.target._numLabel);
                        this._targetK = e.target;
                        this.setTouch(e.target, true);
                        this._keyBoard.showKeyBoard();
                    }
                },
            )
        });

        this.showOpening();
        cc.YL.unLockTouch();
    },

    showOpening() {
        let arr = cc.YL.tools.arrCopy(this.chuan.children);

        let showAppear = (nPool, tipsPool) => {
            if (nPool.length < 1) {
                GD.sound.setShowTips(tipsPool.shift(), true);
                this.suanshi.active = true;
                this._keyBoard.init(this.touchKeyBoardCallFunc.bind(this));
                return;
            }
            let pNode = nPool.shift();
            cc.tween(pNode)
                .by(1, { x: pNode.x > 0 ? -1500 : 1500 })
                .call(() => {
                    let ske = pNode.getChildByName('ske').getComponent(sp.Skeleton);
                    ske.setAnimation(0, 'newAnimation_2', true);
                })
                .start()
            GD.sound.playTips(tipsPool.shift(), () => {
                showAppear(arr, tipsPool);
            })
        }
        showAppear(arr, this.tipsPool);
    },

    touchKeyBoardCallFunc(keys) {
        //this._targetK._numLabel.string = keys;
        this.checkBtn.interactable = true;
        this.options.children.forEach((op) => {
            if (op._numLabel.string == '' || op._numLabel.string == '?') {
                this.checkBtn.interactable = false;
            }
        });
    },

    setTouch(target, isShow) {
        target._touchImg && (target._touchImg.active = isShow);
        if (target._numLabel.string == '' || target._numLabel.string == '?') {
            target._numLabel.string = isShow ? '' : '?';
        }

        this.options.children.forEach((op) => {
            if (op != target) {
                op._touchImg && (op._touchImg.active = false);
                if (op._numLabel.string == '') {
                    op._numLabel.string = '?';
                }
            }
        });
    },

    check() {
        if (this.sumOp._numLabel.string != this.sum) {
            this.showWrong();
            return;
        }

        let arr = [];
        let aArr = this.adders;
        for (let i in this._addPool) {
            arr.push(this._addPool[i]._numLabel.string);
        }

        if (cc.YL.tools.checkArrIsSame(arr, this.adders)) {
            this.showRight();
        } else {
            this.showWrong();
        }
    },

    showRight() {
        cc.YL.lockTouch();
        GD.sound.playSound('right');
        GD.root.showStar(this.options, () => {
            this.showMoveScream();
        })
    },

    showWrong() {
        this.options.children.forEach((op) => {
            op._numLabel.string = '?';
            op._touchImg && (op._touchImg.active = false);

        });
        this.checkBtn.interactable = false;
        this._targetK = null;
        this._keyBoard.setKeyBoard();
        GD.sound.playSound('wrong');
        GD.sound.playSound('blank');
        this.setError();
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
        this.sumOp._numLabel.string = this.sum;

        for (let i in this._addPool) {
            this._addPool[i]._numLabel.string = this.adders[i]
            GD.root.showStar(this._addPool[i]);
        }

        cc.YL.timeOut(() => {
            this.showMoveScream();
        }, 1000);
    },

    showMoveScream() {


        this.game.showMoveScream(() => {
            this.chuan.active = false;
            let ship = this.node.getChildByName('ship');
            ship.active = true;
            cc.YL.timeOut(() => {
                let ske = ship.getChildByName('ske').getComponent(sp.Skeleton);
                GD.sound.playTips(this.tipsPool.shift(), () => {
                    ske.setAnimation(0, 'newAnimation_2', true);
                    cc.tween(ship)
                        .by(1, { x: 2000 })
                        .start()
                    setTimeout(() => {
                        GD.root.showAddStar(GD.root.getStarNum(this._errorCount), () => {
                            this.showFinishLayer();
                        })
                    }, 1000);
                });

                let showAction = function (arr, tPool) {
                    if (arr.length < 1) {
                        return;
                    }
                    let pNode = arr.shift();

                    cc.tween(pNode)
                        .then(cc.YL.aMgr.zoomAction(2))
                        .start()
                    cc.YL.timeOut(() => {
                        showAction(arr, tPool);
                    }, tPool.shift() * 1000)
                }

                cc.YL.timeOut(() => {
                    showAction(this.tipsNode, this.delayTimes);
                }, this.delayTimes.shift() * 1000)
            }, 500)
        })

        this.suanshi.active = false;
        this._keyBoard.hideKeyBoard();
    },

    showFinishLayer() {
        //此环节完成 注销所有事件
        cc.YL.timeOut(() => {
            this.node.destroy();
            cc.YL.emitter.emit('continueGame');
        }, 500)
    },
});
