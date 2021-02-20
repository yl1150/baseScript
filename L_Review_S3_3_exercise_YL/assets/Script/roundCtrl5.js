let tipsData = require('Define').TIPSDATA;
const line = cc.Class({
    name: "line",
    properties: {
        points: [cc.Node]
    }
});
cc.Class({
    extends: cc.Component,

    properties: {
        tips: {
            displayName: '问题语音',
            default: ''
        },
        gameTips: {
            displayName: '解说语音',
            default: ''
        },
        finishType: '',
        rightLine: [line],
        gameTipsData: [tipsData],
    },

    // LIFE-CYCLE CALLBACKS:

    init() {
        this.game = this.node.getChildByName('game1');
        let hand = this.game.getChildByName('shou');
        let line = this.game.getChildByName('xian');

        this._errorCount = 0;
        GD.sound.setTipsButton(true);
        GD.sound.setShowTips(this.tips, true);
        cc.YL.unLockTouch();

        this.touch = this.game.getChildByName('touch');

        this.drawCtx = null;
        let tPoint = null;
        cc.YL.tools.registerTouch(
            this.touch,
            (e) => {
                hand.active = false;
                line.active = false;
                this.isShowTeach = false;

                tPoint = this.getTouchPoint(e);
                if (tPoint) {
                    this.drawCtx = this.getDrawCtx(tPoint.color);
                    //初始化线段

                    let startP = cc.YL.tools.getRelativePos(tPoint, this.drawCtx.node.parent);
                    let endP = this.drawCtx.node.parent.convertToNodeSpaceAR(e.getLocation())
                    this.drawLine(startP, endP);
                }
            },
            (e) => {
                if (tPoint) {
                    let startP = cc.YL.tools.getRelativePos(tPoint, this.drawCtx.node.parent);
                    let endP = this.drawCtx.node.parent.convertToNodeSpaceAR(e.getLocation())
                    this.drawLine(startP, endP);
                }
            },
            (e) => {
                if (tPoint) {
                    //检测是否触碰到另一个点
                    let endPoint = this.getTouchPoint(e, tPoint);
                    if (endPoint) {
                        let startP = cc.YL.tools.getRelativePos(tPoint, this.drawCtx.node.parent);
                        let endP = cc.YL.tools.getRelativePos(endPoint, this.drawCtx.node.parent);
                        this.drawLine(startP, endP);


                        //检测2个点是否是一对
                        if (this.checkIsRightLine([tPoint, endPoint])) {
                            //正确
                            GD.sound.playSound('right');
                            GD.root.showStar(this.drawCtx.node);
                            //两个点隐藏 线段保留
                            endPoint.active = false;
                            tPoint.active = false;

                            //检测是否全部完成
                            this.checkIsAllRight();
                        } else {
                            //错误 清理线段
                            GD.sound.playSound('wrong');
                            GD.sound.playSound('blank');
                            this.setError();

                            this.drawCtx.fillColor = new cc.Color().fromHEX('#FF1D1D');
                            this.drawCtx.strokeColor = new cc.Color().fromHEX('#FF1D1D');
                            this.drawCtx.fill();
                            this.drawCtx.stroke();
                            cc.tween(this.drawCtx.node)
                                .to(0.5, { opacity: 0 })
                                .call(() => {
                                    this.drawCtx.clear();
                                    this.drawCtx.node.destroy();
                                    this.drawCtx = null;
                                })
                                .start()
                            tPoint = null;
                        }
                    } else {
                        //检测不到点 清理线段
                        this.drawCtx.clear();
                        this.drawCtx.node.destroy();
                        this.drawCtx = null;
                        tPoint = null;
                    }
                }
            },
        )

        this.showTeach();
    },

    showTeach() {
        let hand = this.game.getChildByName('shou');
        let line = this.game.getChildByName('xian');

        this.isShowTeach = true;

        cc.tween(line)
            .repeatForever(
                cc.tween()
                    .to(0.5, { scaleX: 1 })
                    .delay(1)
                    .to(0.0, { scaleX: 0 })
            )
            .start()

        let teach_Line = this.rightLine[0];
        let sPoint = teach_Line.points[0];
        let ePoint = teach_Line.points[1];

        hand.active = true;
        cc.tween(hand)
            .repeatForever(
                cc.tween()
                    .to(0.5, { position: ePoint.position })
                    .delay(1)
                    .to(0.0, { position: sPoint.position })
            )
            .start()

        GD.sound.setTipsButton(true);
        cc.YL.addClock(this.tips);
        GD.sound.setShowTips(this.tips, true, () => {
            if (this.isShowTeach) {
                hand.active = false;
                line.active = false;
                this.isShowTeach = false;
                //this.showGame();
            }
        })
        cc.YL.unLockTouch();
    },

    getTouchPoint(touch, point = null) {
        let touchLoc = touch.getLocation();
        let arr = touch.target.children

        for (let i in arr) {
            let box = arr[i].getComponent(cc.BoxCollider);
            if (cc.Intersection.pointInPolygon(touchLoc, box.world.points) && arr[i] != point) {
                console.log("Hit!");
                return arr[i];
            }
        }
        return null;
    },

    drawLine(startP, endP) {
        this.drawCtx.clear();
        this.drawCtx.moveTo(startP.x, startP.y);
        this.drawCtx.lineTo(endP.x, endP.y);
        this.drawCtx.fill();
        this.drawCtx.stroke();
    },

    getDrawCtx(color = new cc.Color().fromHEX('#559AFF')) {
        let ctxList = this.game.getChildByName('ctx');

        let pGraphics = new cc.Node();
        pGraphics.name = 'graphics';
        pGraphics.parent = ctxList;

        let ctx = pGraphics.addComponent(cc.Graphics);
        ctx.lineWidth = 5;
        ctx.fillColor = color;
        ctx.strokeColor = color;
        pGraphics.ctx = ctx;
        return ctx;
    },

    checkIsRightLine(arr) {
        for (let i in this.rightLine) {
            if (cc.YL.tools.checkArrIsSame(this.rightLine[i].points, arr)) {
                //符合
                this.rightLine.splice(i, 1);
                return true;
            }
        }
        return false;
    },

    checkIsAllRight() {
        if (this.rightLine.length < 1) {
            //全部正确
            cc.YL.lockTouch();
            setTimeout(() => {
                this.showFinishLayer();
            }, 1000);
        }
    },

    setError() {
        this._errorCount++;
        let maxErrCount = 3
        if (this._errorCount >= maxErrCount) {
            cc.YL.lockTouch();
            setTimeout(() => {
                if (cc.YL.tools.getIsWrongModel()) {
                    GD.sound.playTips('tipsWatch', () => {
                        this.showRightAnswer();
                    })
                } else {
                    this.showFinishLayer();
                }
            }, 1000);
        }
    },

    showRightAnswer() {
        this.rightLine.forEach((line) => {
            let arr = line.points;
            this.drawCtx = this.getDrawCtx(arr[0].color);
            let startP = cc.YL.tools.getRelativePos(arr[0], this.drawCtx.node.parent);
            let endP = cc.YL.tools.getRelativePos(arr[1], this.drawCtx.node.parent);
            arr.forEach((point) => {
                point.active = false;
            });
            this.drawLine(startP, endP);
        });
        GD.root.showStar(this.game, () => {
            this.showFinishLayer();
        });
        cc.YL.lockTouch();
    },

    showFinishLayer() {
        cc.YL.lockTouch();
        cc.YL.emitter.emit('addWrongMes', this._errorCount);
        this.touch.active = false;
        cc.tween(this.game)
            .by(1, { x: -250 })
            .call(() => {
                this.game2 = this.node.getChildByName('game2');
                this.game2.getComponent('roundCtrl4').init();
            })
            .start()
    },
});
