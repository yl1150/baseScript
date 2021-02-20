cc.Class({
    extends: cc.Component,

    properties: {},

    onLoad() {
        cc.origin.Script[this.__classname__] = this;
        //初始化
        this.base = this.node.getChildByName('base');
        this.base.active = false;

        this.options = this.base.getChildByName('options');
        this.option_arr = this.options.children.map(x => { return x });

        this.items = this.base.getChildByName("items");
        this.item_arr = this.items.children.map(x => { return x });

        this.qiu2 = this.base.getChildByName("qiu2");
        this.qiu_arr2 = this.qiu2.children.map(x => { return x });
        this.qiu_arr2.forEach(qiu => {
            qiu.active = false;
        })

        this.jiqiSke = this.item_arr[0].getComponent(sp.Skeleton);
        this.ddSke = this.item_arr[1].getComponent(sp.Skeleton);
        this.sbSke = this.item_arr[2].getComponent(sp.Skeleton);

        this.dbAction = this.base.getChildByName("dbAction");
        this.dbSke = this.dbAction.getComponent(sp.Skeleton);
        this.dbAction.active = false;

        this.over = this.base.getChildByName("over");
        this.over_arr = this.over.children.map(x => { return x });

        this.curImg = this.base.getChildByName("curImg");
        this.curImg_arr = this.curImg.children.map(x => { return x });
        this.curImg_arr.forEach(img => {
            img.active = false;
        })
        this.btnImg = this.base.getChildByName("btnImg");
        this.mistakeCount = 0;//犯错次数
        this.answer = 3;
        this.orderLoop = false;
    },

    start() { },

    initRound(roundId = 2) {
        this.roundId = roundId;
        cc.origin.Note.roundId = roundId;
        this.base.active = true;
        //开场秀
        this.sceneGameStar();
        this.initUI();
    },

    clearRound(cb) {
        this.base.active = false;
        if (cb) cb();
    },

    initUI() {
        //换背景
        // var canvasBg = cc.find('Canvas/bg');
        // canvasBg.active = true;
        // cc.origin.Util.destroyAllChildrenSync(canvasBg);
        // var bg = this.base.getChildByName('bg');
        // var tempBg = cc.instantiate(bg);
        // tempBg.setParent(canvasBg);
        // tempBg.setPosition(cc.v2(0, 0));
        this.jiqiSke.setAnimation(0, 'newAnimation_1', true);

    },

    /**---------------------------------- */
    btnImgTouch() {
        this.btnImg._canTouch = true;
        this.btnImg.on(cc.Node.EventType.TOUCH_START, function (event) {
            cc.origin.EventManager.emit(cc.origin.EventDefine.COMMON.FREEZE_TIME);
            if (!this.btnImg._canTouch) {
                return;
            }
            cc.origin.AudioBase.play('click');
            this.btnImg.getChildByName("img").active = false;
            this.jiqiSke.setAnimation(0, 'newAnimation_2', false);
        }, this);
        this.btnImg.on(cc.Node.EventType.TOUCH_MOVE, function (event) { }, this);
        this.btnImg.on(cc.Node.EventType.TOUCH_END, this.touchSubmitEnd.bind(this), this);
        this.btnImg.on(cc.Node.EventType.TOUCH_CANCEL, this.touchSubmitEnd.bind(this), this);
    },

    touchSubmitEnd(event) {
        cc.origin.EventManager.emit(cc.origin.EventDefine.COMMON.KINETIC_TIME);
        var node = event.target;
        if (!node._canTouch) {
            return;
        }
        node._canTouch = false;
        //合上挡板
        this.dbAction.active = true;
        this.dbSke.setAnimation(0, 'newAnimation_2', false);
        this.dbSke.setCompleteListener(() => {
            this.qiu_arr2.forEach(qiu => {
                qiu.active = false;
                qiu.getComponent(sp.Skeleton).setAnimation(0, 'newAnimation', false);
            })
            this.dbAction.active = false;
            //启动机器
            var isOnce = false;
            this.jiqiSke.setSkin("tang1");
            this.jiqiSke.setAnimation(0, 'newAnimation', false);
            this.jiqiSke.setCompleteListener(() => {
                //数宝抱着糖豆
                if (!isOnce) {
                    this.sbSke.setSkin("tang1")
                    this.sbSke.setAnimation(0, 'newAnimation_5', false);
                    this.sbSke.setCompleteListener(() => {
                        this.sbSke.setAnimation(0, 'newAnimation_4', true);
                    });
                    isOnce = true;
                }
            })
        });
        cc.origin.ScheduleBase.addTimeout(() => {
            cc.origin.EventManager.emit(cc.origin.EventDefine.COMMON.FINISH_ROUND);
        }, 2);
    },
    /**---------------------------------- */
    sceneGameStar() {
        //题目语音且可操作
        cc.origin.Note.trumpet.setTrumpet('round' + this.roundId, false, () => {
            this.sbSke.setAnimation(0, 'zheng1', true);
            this.dbSke.setAnimation(0, 'newAnimation_1', false);
            var isFirst = false;
            var isDaiji = false;
            this.ddSke.setSkin("green")
            this.ddSke.setAnimation(0, 'newAnimation_3', true);
            this.ddSke.setCompleteListener((event) => {
                if (event.animation.name == "newAnimation_1") {
                    isDaiji = true;
                    return;
                }
                if (isDaiji) {
                    if (this.orderLoop) {
                        this.ddSke.setSkin("red");
                        this.orderLoop = false;
                        return;
                    }
                    if (!this.orderLoop) {
                        this.ddSke.setSkin("green");
                        this.orderLoop = true;
                        return;
                    }
                } else {
                    if (isFirst) {
                        this.ddSke.setSkin("green");
                        isFirst = false;
                        return;
                    }
                    if (!isFirst) {
                        this.ddSke.setSkin("red");
                        isFirst = true;
                        return;
                    }
                }
            });
            this.setQiuAction();
            cc.origin.ScheduleBase.addTimeout(() => {
                this.curImg_arr.forEach(img => {
                    img.active = true;
                })
                this.ddSke.setAnimation(0, 'newAnimation_1', true);
                this.registerOptionTouch();
            }, 5.9);
            //启动机器
        });
        cc.origin.Note.trumpet.playTrumpet();
        cc.origin.Note.trumpet.setLoopPlay(false);
        cc.origin.EventManager.emit(cc.origin.EventDefine.COMMON.KINETIC_TIME);
        this.jiqiSke.setAnimation(0, 'newAnimation_1', false);
        this.options.active = true;
    },

    setQiuAction() {
        var flyTime = 1;
        var delay_arr = [1, 2, 3, 4, 5, 6];
        for (let k in delay_arr) {
            let delay = delay_arr[k];
            let curWord = this.over_arr[k].convertToWorldSpaceAR(cc.v2(0, 0));
            let curPos = this.over.convertToNodeSpaceAR(curWord);
            var upWord = this.qiu_arr2[k].convertToWorldSpaceAR(cc.v2(0, 0));
            var upPos = this.qiu2.convertToNodeSpaceAR(upWord);
            this.qiu_arr2[k].setParent(this.qiu2);
            this.qiu_arr2[k].setPosition(upPos);
            cc.origin.ScheduleBase.addTimeout(() => {
                this.qiu_arr2[k].active = true;
                cc.tween(this.qiu_arr2[k])
                    .to(flyTime, { position: curPos })
                    .start();
            }, delay);
        }
    },

    /**----------------------------------------------------- */
    registerOptionTouch(pNode) {
        var temp_arr = [];
        if (pNode) {
            temp_arr.push(pNode);
        } else {
            temp_arr = this.option_arr;
        }
        temp_arr.forEach(pTouch => {
            pTouch._canTouch = true;
            pTouch.on(cc.Node.EventType.TOUCH_START, function (event) {
                if (!pTouch._canTouch) return;
                if (cc.origin.Note.touchTarget) return;
                cc.origin.Note.touchTarget = pTouch;
                cc.origin.EventManager.emit(cc.origin.EventDefine.COMMON.FREEZE_TIME);
                cc.origin.AudioBase.play('click');
                pTouch.stopAllActions();
                pTouch.getChildByName('img').setScale(1.2, 1.2);
                cc.origin.Note.trumpet.setLoopPlay(false);
            }, this)
            pTouch.on(cc.Node.EventType.TOUCH_MOVE, function (event) {
                if (!cc.origin.Note.touchTarget) return;
            }, this)
            pTouch.on(cc.Node.EventType.TOUCH_END, touchUp, this)
            pTouch.on(cc.Node.EventType.TOUCH_CANCEL, touchUp, this)
            function touchUp(event) {
                if (!cc.origin.Note.touchTarget) return;
                //重置触摸对象
                this.checkResult(pTouch);
                pTouch.getChildByName('img').setScale(1, 1);
                cc.origin.Note.touchTarget = null;
                cc.origin.EventManager.emit(cc.origin.EventDefine.COMMON.KINETIC_TIME);
            }
        })
    },

    unregisterOptionTouch(pNode) {
        var temp_arr = [];
        if (pNode) {
            temp_arr.push(pNode);
        } else {
            temp_arr = this.option_arr;
        }
        temp_arr.forEach(pTouch => {
            pTouch.off(cc.Node.EventType.TOUCH_START)
            pTouch.off(cc.Node.EventType.TOUCH_MOVE)
            pTouch.off(cc.Node.EventType.TOUCH_END)
            pTouch.off(cc.Node.EventType.TOUCH_CANCEL)
        })
    },

    checkResult(option) {
        if (Number(option.name) == this.answer) {
            //正确
            cc.origin.Note.trumpet.playAndCover('correct' + cc.origin.MathBase.random(1, 3, false), true);
            //星星
            cc.origin.AudioBase.play('star');
            cc.origin.Script.Tools.addStarEffect(option);
            //显示结果
            this.showResult(true);
        } else {
            this.mistakeCount++;
            cc.origin.Note.trumpet.playAndCover('wrong' + cc.origin.MathBase.random(1, 3, false), true, () => {
                //错误第三次,自动显示结果
                if (this.mistakeCount >= 3) {
                    cc.origin.EventManager.emit(cc.origin.EventDefine.COMMON.FREEZE_TIME);
                    cc.origin.AudioBase.play('listenCorrect', () => {
                        this.showResult(false);
                    })
                }
            });
            //数字抖动
            cc.origin.AudioBase.play('blank');
            cc.origin.ActionBase.vibrate(option);
        }
    },

    showResult(isWin = true) {
        var self = this;
        self.unregisterOptionTouch();
        cc.origin.EventManager.emit(cc.origin.EventDefine.COMMON.FREEZE_TIME);
        if (isWin) {
            //演示
            cc.origin.ScheduleBase.addTimeout(hint, 1);
        } else {
            //模拟正确操作
            simulate();
        }
        function simulate() {
            //星星、填入数值
            cc.origin.AudioBase.play('star');
            cc.origin.Script.Tools.addStarEffect(self.option_arr[2]);
            //演示
            cc.origin.EventManager.emit(cc.origin.EventDefine.COMMON.KINETIC_TIME)
            cc.origin.ScheduleBase.addTimeout(hint, 1);
        }
        function hint() {
            //伴随语音提示
            self.ddSke.setSkin("green");
            self.orderLoop = true;
            self.ddSke.setAnimation(0, 'newAnimation_3', true);
            self.setOverAction();
            cc.origin.ScheduleBase.addTimeout(() => {
                self.ddSke.setAnimation(0, 'newAnimation_1', true);
                self.btnImgTouch();
            }, 1.9);
        }
    },

    setOverAction() {
        var flyTime = 0.5;
        var delay_arr = [1, 2];
        var id_arr = [6, 7];
        for (let k in delay_arr) {
            let delay = delay_arr[k];
            let index = id_arr[k];
            let curWord = this.over_arr[index].convertToWorldSpaceAR(cc.v2(0, 0));
            let curPos = this.over.convertToNodeSpaceAR(curWord);
            var upWord = this.qiu_arr2[index].convertToWorldSpaceAR(cc.v2(0, 0));
            var upPos = this.qiu2.convertToNodeSpaceAR(upWord);
            this.qiu_arr2[index].setParent(this.qiu2);
            this.qiu_arr2[index].setPosition(upPos);
            cc.origin.ScheduleBase.addTimeout(() => {
                this.qiu_arr2[index].active = true;
                this.curImg_arr[k].active = false;
                cc.tween(this.qiu_arr2[index])
                    .to(flyTime, { position: curPos })
                    .start();
            }, delay);
        }
    },
});