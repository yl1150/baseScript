cc.Class({
    extends: cc.Component,

    properties: {},

    onLoad() {
        cc.origin.Script[this.__classname__] = this;
        var pStr = this.__classname__.toLowerCase();
        var pIndex = pStr.indexOf('_');
        this.audioFolder = pStr.substring(0, pIndex) + '/';
        this.roundId = parseInt(pStr.substr(pIndex + 1));
        this.mistakeCount = 0;
        //初始化
        this.base = this.node.getChildByName('base');
        this.base.active = false;

        this.rule = this.base.getChildByName('rule');

        this.options = this.base.getChildByName('options');
        this.option_arr = this.options.children.map(x => { return x });

        this.answer = 2;
    },

    onDestroy() {
        cc.origin.Script[this.__classname__] = null;
    },

    start() { },

    initRound(roundId = 1) {
        this.roundId = roundId;
        this.base.active = true;
        //初始化UI
        this.initUI();
        //开场秀
        this.beginShow(() => {
            this.beginShow2(() => {
                this.beginShow3(this.startPlay.bind(this));
            });
        });
    },

    clearRound(cb) {
        this.base.active = false;
        if (cb) cb();
    },

    initUI() {
        var mainScriptName = this.__classname__.substring(0, this.__classname__.indexOf('_'));
        var mainScript = cc.origin.Script[mainScriptName];
        var mainBase = mainScript.base;
        var rawBg = mainBase.getChildByName('bg');
        this.balance = mainBase.getChildByName('balance');
        //换背景
        var canvasBg = cc.find('Canvas/bg');
        cc.origin.Util.destroyAllChildrenSync(canvasBg);
        this.bg = cc.instantiate(rawBg);
        this.bg.setParent(canvasBg);
        this.bg.setPosition(cc.v2(0, 0));
        this.bg.active = true;
        rawBg.active = false;
        //波纹
        this.bg.getChildByName('wave').getComponent(sp.Skeleton).setAnimation(0, 'animation', true);
        //天平归位
        var road1 = this.bg.getChildByName('road1');
        var worldpos_balance = road1.convertToWorldSpaceAR(cc.v2(0, 0));
        var pos_balance = this.balance.parent.convertToNodeSpaceAR(worldpos_balance);
        this.balance.setPosition(pos_balance);
        this.doudou = this.balance.getChildByName('doudou').getComponent(sp.Skeleton);
        this.doudou.setAnimation(0, 'newAnimation', true);
        //清空天平并放入新物品
        this.beam = this.balance.getChildByName('beam');
        this.beam.angle = 0;
        this.disks = this.beam.getChildByName('disks');
        this.inside_arr = [];
        var rawInsides = this.base.getChildByName('insides');
        for (let i = 1; i <= 2; i++) {
            let disk = this.disks.getChildByName('' + i);
            let inside_disk = disk.getChildByName('inside');
            this.inside_arr.push(inside_disk);
            cc.origin.Util.destroyAllChildrenSync(inside_disk);
            let rawInside = rawInsides.getChildByName('' + i);
            let stuff_arr = rawInside.children.map(x => { return x });
            stuff_arr.forEach(stuff => {
                stuff.setParent(inside_disk);
                stuff.active = false;
            })
        }
        rawInsides.destroy();
        //设置 规则和选项 widget
        var canvas = cc.find('Canvas');
        var widget_rule = this.rule.getComponent(cc.Widget);
        widget_rule.target = canvas;
        widget_rule.updateAlignment();
        this.rule.active = false;
        var widget_options = this.options.getComponent(cc.Widget);
        widget_options.target = canvas;
        widget_options.updateAlignment();
        this.options.active = false;
    },

    beginShow(cb) {
        var walkTime = 3;
        var flyTime = 1;
        //向前走
        this.doudou.setAnimation(0, 'newAnimation_1', true);
        var point1 = this.bg.getChildByName('point1');
        var road2 = this.bg.getChildByName('road2');
        var deltaY = point1.y - road2.y;
        cc.tween(this.bg)
            .by(walkTime, { y: deltaY })
            .call(() => {
                //豆豆停下
                this.doudou.setAnimation(0, 'newAnimation', true);
                //物品飞上去
                cc.origin.AudioBase.play(this.audioFolder + 'birdFly');
                var leftWorldpos = cc.v2(0, 0);
                var rightWorldpos = cc.v2(cc.winSize.width, 0);
                this.inside_arr.forEach(inside => {
                    let dir = (inside.parent.name === '1') ? 1 : -1;
                    let worldpos = dir > 0 ? leftWorldpos : rightWorldpos;
                    let pos = inside.convertToNodeSpaceAR(worldpos);
                    pos.y = 0;
                    inside.children.forEach(stuff => {
                        stuff.active = true;
                        stuff._initPosition = stuff.position;
                        stuff.x = pos.x - dir * stuff.width;
                        let skeCom = stuff.getComponent(sp.Skeleton);
                        skeCom.setAnimation(0, 'newAnimation_1', true);
                        cc.tween(stuff)
                            .to(flyTime, { position: stuff._initPosition })
                            .call(() => {
                                skeCom.setAnimation(0, 'newAnimation_2', true);
                            })
                            .start();
                    })
                })
                //飞上去之后天平摇晃后平衡
                cc.origin.ScheduleBase.addTimeout(() => {
                    this.balance.getComponent('Balance').turnAfterShake(0, cb);
                }, flyTime);
            })
            .start();
    },

    beginShow2(cb) {
        var flyTime = 1;
        //标签出现
        this.rule.active = true;
        cc.origin.AudioBase.play(this.audioFolder + 'round' + this.roundId + '_0', () => {
            //小鸟飞走
            cc.origin.AudioBase.play(this.audioFolder + 'birdFly');
            var worldpos = cc.v2(cc.winSize.width / 2, cc.winSize.height);
            this.inside_arr.forEach(inside => {
                let pos = inside.convertToNodeSpaceAR(worldpos);
                inside.children.forEach(stuff => {
                    let pX = pos.x;
                    let pY = pos.y + stuff.height;
                    let skeCom = stuff.getComponent(sp.Skeleton);
                    skeCom.setAnimation(0, 'newAnimation_1', true);
                    cc.tween(stuff)
                        .to(flyTime, { x: pX, y: pY })
                        .call(() => {
                            stuff.destroy();
                        })
                        .start();
                })
            });
            cc.origin.ScheduleBase.addTimeout(cb, flyTime);
        });
    },

    beginShow3(cb) {
        //清空天平并放入新物品
        var endInsides = this.base.getChildByName('endInsides');
        for (let i in this.inside_arr) {
            let inside = this.inside_arr[i];
            cc.origin.Util.destroyAllChildrenSync(inside);
            let endInside = endInsides.children[i];
            let stuff_arr = endInside.children.map(x => { return x });
            stuff_arr.forEach(stuff => {
                stuff.setParent(inside);
            })
        }
        endInsides.destroy();
        //后飞入动物
        var flyTime = 1;
        var leftWorldpos = cc.v2(0, 0);
        var rightWorldpos = cc.v2(cc.winSize.width, 0);
        cc.origin.AudioBase.play(this.audioFolder + 'birdFly');
        this.inside_arr.forEach(inside => {
            let dir = (inside.parent.name === '1') ? 1 : -1;
            let worldpos = dir > 0 ? leftWorldpos : rightWorldpos;
            let pos = inside.convertToNodeSpaceAR(worldpos);
            pos.y = 0;
            inside.children.forEach(stuff => {
                if (stuff.active) {
                    stuff._initPosition = stuff.position;
                    stuff.x = pos.x - dir * stuff.width;
                    let skeCom = stuff.getComponent(sp.Skeleton);
                    skeCom.setAnimation(0, 'newAnimation_1', true);
                    cc.tween(stuff)
                        .to(flyTime, { position: stuff._initPosition })
                        .call(() => {
                            skeCom.setAnimation(0, 'newAnimation_2', true);
                        })
                        .start();
                }
            })
        })
        cc.origin.ScheduleBase.addTimeout(cb, flyTime);
    },

    startPlay() {
        //题目语音且可操作
        cc.origin.Note.trumpet.setTrumpet(this.audioFolder + 'round' + this.roundId, false);
        cc.origin.Note.trumpet.playTrumpet();
        cc.origin.Note.trumpet.setLoopPlay(cc.origin.Note.gameData.askAudioLoop);
        cc.origin.EventManager.emit(cc.origin.EventDefine.COMMON.KINETIC_TIME);
        //出现选项
        this.options.active = true;
        //关闭layout便于操作
        var layoutCom_options = this.options.getComponent(cc.Layout);
        if (layoutCom_options) {
            layoutCom_options.updateLayout();
            layoutCom_options.enabled = false;
        }
        //给选项注册触摸
        this.registerOptionTouch();
    },

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
                //选中效果
                var chosen = pTouch.getChildByName('chosen');
                if (chosen) chosen.active = true;
                //喇叭停止循环
                cc.origin.Note.trumpet.setLoopPlay(false);
            }, this)
            pTouch.on(cc.Node.EventType.TOUCH_MOVE, function (event) { }, this)
            pTouch.on(cc.Node.EventType.TOUCH_END, touchUp, this)
            pTouch.on(cc.Node.EventType.TOUCH_CANCEL, touchUp, this)
            function touchUp(event) {
                if (!cc.origin.Note.touchTarget) return;
                cc.origin.EventManager.emit(cc.origin.EventDefine.COMMON.KINETIC_TIME);
                //检测结果
                this.checkResult(pTouch);
                //重置触摸对象
                cc.origin.Note.touchTarget = null;
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
            pTouch._canTouch = false;
            pTouch.off(cc.Node.EventType.TOUCH_START)
            pTouch.off(cc.Node.EventType.TOUCH_MOVE)
            pTouch.off(cc.Node.EventType.TOUCH_END)
            pTouch.off(cc.Node.EventType.TOUCH_CANCEL)
        })
    },

    checkResult(option) {
        var isCorrect = (option.name == this.answer);
        if (isCorrect) {
            cc.origin.Note.trumpet.playAndCover('correct' + cc.origin.MathBase.random(1, 3, false), false);
            //星星
            cc.origin.AudioBase.play('star');
            cc.origin.Script.Tools.addStarEffect(option);
            //显示结果
            this.showResult(true);
        } else {
            this.mistakeCount++;
            cc.origin.Note.trumpet.playAndCover('wrong' + cc.origin.MathBase.random(1, 3, false), true, () => {
                //选中效果消失
                var chosen = option.getChildByName('chosen');
                if (chosen) chosen.active = false;
                //错误第三次,自动显示结果
                if (this.mistakeCount >= 3) {
                    cc.origin.EventManager.emit(cc.origin.EventDefine.COMMON.FREEZE_TIME);
                    cc.origin.AudioBase.play('listenCorrect', () => {
                        this.showResult(false);
                    })
                }
            });
            //抖动
            cc.origin.AudioBase.play('blank');
            cc.origin.ActionBase.vibrate(option);
        }
    },

    showResult(isWin = true) {
        var self = this;
        cc.origin.EventManager.emit(cc.origin.EventDefine.COMMON.FREEZE_TIME);
        self.unregisterOptionTouch();
        if (isWin) {
            //演示
            cc.origin.ScheduleBase.addTimeout(hint, 1);
        } else {
            //模拟正确操作
            simulate();
        }
        function simulate() {
            //选中效果
            var option = self.options.getChildByName('' + self.answer);
            var chosen = option.getChildByName('chosen');
            if (chosen) chosen.active = true;
            //星星
            cc.origin.AudioBase.play('star');
            cc.origin.Script.Tools.addStarEffect(option);
            //演示
            cc.origin.ScheduleBase.addTimeout(hint, 1);
        }
        function hint() {
            //隐藏选项
            self.options.active = false;
            //伴随语音提示
            cc.origin.AudioBase.play(self.audioFolder + 'tell' + self.roundId, () => {
                //走到尽头
                var walkTime = 3;
                var road2 = self.bg.getChildByName('road2');
                var point2 = self.bg.getChildByName('point2');
                var deltaY_bg = road2.y - point2.y;
                self.doudou.setAnimation(0, 'newAnimation_1', true);
                cc.tween(self.bg)
                    .by(walkTime, { y: deltaY_bg })
                    .call(() => {
                        var road3 = self.bg.getChildByName('road3');
                        var worldpos1 = road3.convertToWorldSpaceAR(cc.v2(0, 0));
                        var pos1 = self.balance.parent.convertToNodeSpaceAR(worldpos1);
                        cc.tween(self.balance)
                            .to(2, { position: pos1 })
                            .call(() => {
                                self.doudou.setAnimation(0, 'newAnimation', true);
                                cc.origin.EventManager.emit(cc.origin.EventDefine.COMMON.FINISH_ROUND);
                            })
                            .start();
                    })
                    .start();
            });
            //飞入动物
            var flyTime = 1;
            var leftWorldpos = cc.v2(0, 0);
            var rightWorldpos = cc.v2(cc.winSize.width, 0);
            cc.origin.AudioBase.play(self.audioFolder + 'birdFly');
            self.inside_arr.forEach(inside => {
                let dir = (inside.parent.name === '1') ? 1 : -1;
                let worldpos = dir > 0 ? leftWorldpos : rightWorldpos;
                let pos = inside.convertToNodeSpaceAR(worldpos);
                pos.y = 0;
                inside.children.forEach(stuff => {
                    if (!stuff.active) {
                        stuff.active = true;
                        stuff._initPosition = stuff.position;
                        stuff.x = pos.x - dir * stuff.width;
                        let skeCom = stuff.getComponent(sp.Skeleton);
                        skeCom.setAnimation(0, 'newAnimation_1', true);
                        cc.tween(stuff)
                            .to(flyTime, { position: stuff._initPosition })
                            .call(() => {
                                skeCom.setAnimation(0, 'newAnimation_2', true);
                            })
                            .start();
                    }
                })
            })
            cc.origin.ScheduleBase.addTimeout(() => {
                //天平摇晃后平衡
                self.balance.getComponent('Balance').turnAfterShake(0)
            }, flyTime);
        }
    },
});