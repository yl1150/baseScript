//选择选项对应的脚本 
cc.Class({
    extends: cc.Component,

    properties: {
        maxLv: 2,
        tips: [cc.String],
        tipsNode: [cc.Node],
        delayTimes: [cc.Float],
        rightNodePool: [cc.Node],
    },

    // LIFE-CYCLE CALLBACKS:

    init(asset) {
        this._stageLV = 1;
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

    setTouch(target, isShow) {
        let touchImg = target.getChildByName('touchImg');
        if (!touchImg) {
            return;
        }
        touchImg.active = isShow;
    },

    showGame() {
        this._errorCount = 0;
        let options = this.node.getChildByName('options' + this._stageLV);
        this.rightNode = this.rightNodePool[this._stageLV - 1];
        let tipsNode = this.tipsNode[this._stageLV - 1];
        let tips = this.tips[this._stageLV - 1];

        this.options = options;

        options.children.forEach(op => {
            cc.YL.tools.registerTouch(
                op,
                (e) => {
                    e.target.setScale(1.2);
                    this.setTouch(e.target, true);
                },
                null,
                (e) => {
                    e.target.setScale(1);
                    if (this.rightNode == e.target) {
                        this.setTouch(e.target, true);
                        GD.sound.playSound('right');
                        GD.root.showStar(e.target);
                        cc.YL.lockTouch();
                        cc.YL.timeOut(() => {
                            this.passStage(options);
                        }, 1000)
                    } else {
                        GD.sound.playSound('wrong');
                        GD.sound.playSound('blank');
                        this.setError();
                        this.setTouch(e.target, false);
                        cc.tween(e.target)
                            .then(cc.YL.aMgr.SHAKING_X)
                            .start()
                    }
                },
            )
        });
        cc.YL.fitPhone(options);

        options.active = true;
        let _widget = options.getComponent(cc.Widget);
        if (_widget) {
            _widget.target = cc.find('Canvas');
            _widget.bottom = 0;
            _widget.updateAlignment();
        }

        GD.sound.setTipsButton(true);
        GD.sound.setShowTips(tips, true);

        cc.tween(tipsNode)
            .delay(2.5)
            .then(cc.YL.aMgr.zoomAction(2))
            .start()


        cc.YL.unLockTouch();
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
        this.setTouch(this.rightNode, true);
        GD.root.showStar(this.rightNode);
        cc.YL.lockTouch();
        cc.YL.timeOut(() => {
            this.passStage(this.options);
        }, 1000)
    },

    passStage(options) {
        GD.root.showAddStar(GD.root.getStarNum(this._errorCount), () => {
            options.active = false;
            options.destroy();

            if (this._stageLV >= this.maxLv) {
                this.showFinishLayer();
            } else {
                this._stageLV++;
                this.showGame();
            }
        })
    },

    showFinishLayer() {
        //此环节完成 注销所有事件
        let list = this.node.getChildByName('manList');
        let lanche = this.node.getChildByName('lanche');
        let lancheSke = lanche.getChildByName('ske').getComponent(sp.Skeleton);
        let arr = list.children;
        lancheSke.setAnimation(0,'kaimen',false);
        let showKid = () => {
            for (let i = arr.length - 1; i >= 0; i--) {
                if (arr[i].active) {
                    //隐藏次节点
                    arr[i].active = false;
                    let node = lanche.getChildByName(arr[i].name);
                    if (i == 0) {
                        //展示缆车移走
                        lancheSke.setAnimation(0,'guanmen',false);
                        let percent = 0.4;
                        cc.tween(lanche)
                            .delay(1)
                            .by(1, { position: cc.v2(1920 * percent, 220 * percent) })
                            .call(() => {
                                cc.YL.timeOut(() => {
                                    cc.YL.emitter.emit('continueGame');
                                }, 500)

                                cc.YL.timeOut(() => {
                                    this.node.destroy();
                                }, 1000)
                            })
                            .start()
                    }
                    node.active = true;
                    return;
                }
            }

        }

        arr.forEach((kid) => {
            let pos = cc.YL.tools.getRelativePos(lanche, list);
            pos.y = kid.y;
            kid.getComponent(sp.Skeleton).setAnimation(0,'animation',true);
            cc.tween(kid)
                .then(cc.YL.aMgr.lineMove(kid.position, pos, 0.5))
                .call(() => {
                    showKid();
                })
                .start()
        });




        this.unregisterEvent();

    },
});
