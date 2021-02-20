/**
 * 日历数据
 */
const kCalendarData = {
    1: { firstIndex: 3, dayNum: 31 },
    2: { firstIndex: 6, dayNum: 29 },
    3: { firstIndex: 0, dayNum: 31 },
    4: { firstIndex: 3, dayNum: 30 },
    5: { firstIndex: 5, dayNum: 31 },
    6: { firstIndex: 1, dayNum: 30 },
    7: { firstIndex: 3, dayNum: 31 },
    8: { firstIndex: 6, dayNum: 31 },
    9: { firstIndex: 2, dayNum: 30 },
    10: { firstIndex: 4, dayNum: 31 },
    11: { firstIndex: 0, dayNum: 30 },
    12: { firstIndex: 2, dayNum: 31 }
}
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

        this.pic1 = this.base.getChildByName('pic1');
        this.pic1.active = true;

        this.pic2 = this.base.getChildByName('pic2');
        this.pic2.active = false;

        this.answer = { monthId: 8, dayId: 10, weekId: 1 };
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
        this.beginShow(this.startPlay.bind(this));
    },

    clearRound(cb) {
        this.base.active = false;
        if (cb) cb();
    },

    initUI() {
        //换背景
        var canvasBg = cc.find('Canvas/bg');
        canvasBg.active = true;
        cc.origin.Util.destroyAllChildrenSync(canvasBg);
        var bg = this.pic1.getChildByName('bg');
        var tempBg = cc.instantiate(bg);
        tempBg.setParent(canvasBg);
        tempBg.setPosition(cc.v2(0, 0));
        bg.active = false;
        //数宝静态
        var shubao = this.pic1.getChildByName('shubao');
        var skeCom_shubao = shubao.getComponent(sp.Skeleton);
        skeCom_shubao.setAnimation(0, 'newAnimation_1', true);
        //豆豆设置在屏幕右侧
        var doudou = this.pic1.getChildByName('doudou');
        doudou._initPosition = doudou.position;
        var worldpos0 = cc.v2(cc.winSize.width, 0);
        var pos0 = doudou.parent.convertToNodeSpaceAR(worldpos0);
        doudou.x = pos0.x + doudou.width * doudou.anchorX * doudou.scaleX;
        //小米不出现（缩小为0）
        var xiaomi = this.pic1.getChildByName('xiaomi');
        xiaomi.setScale(0, 0);
    },

    beginShow(cb) {
        var self = this;
        var audioFolder = this.audioFolder;
        var phone = this.pic1.getChildByName('phone');
        var skeCom_phone = phone.getComponent(sp.Skeleton);
        var shubao = this.pic1.getChildByName('shubao');
        var skeCom_shubao = shubao.getComponent(sp.Skeleton);
        var doudou = this.pic1.getChildByName('doudou');
        var skeCom_doudou = doudou.getComponent(sp.Skeleton);
        var xiaomi = this.pic1.getChildByName('xiaomi');
        var skeCom_xiaomi = xiaomi.getComponent(sp.Skeleton);
        function p1() {
            //电话铃声响（音效），电话来电动画
            skeCom_phone.setAnimation(0, 'newAnimation3', true);
            cc.origin.AudioBase.play(audioFolder + 'phoneRing', () => {
                skeCom_phone.setAnimation(0, 'newAnimation2', true);
                //电话响后，出现数宝手抓指向电话，嘴里 啾啾啾（音效）动画
                skeCom_shubao.setAnimation(0, 'newAnimation_3', true);
                cc.origin.AudioBase.play(audioFolder + 'baby', () => {
                    skeCom_shubao.setAnimation(0, 'newAnimation_1', true);
                    //接着播放豆豆入场接电话动画
                    skeCom_doudou.setAnimation(0, 'newAnimation_2', true);
                    cc.tween(doudou)
                        .to(2, { position: doudou._initPosition })
                        .call(() => {
                            //拿起手机动画
                            cc.origin.ScheduleBase.addTimeout(() => { phone.active = false }, 0.3);
                            skeCom_doudou.setAnimation(0, 'newAnimation_3', false);
                            skeCom_doudou.addAnimation(0, 'newAnimation_4', true);
                            cc.origin.ScheduleBase.addTimeout(p2, 1);
                        })
                        .start();
                });
            });
        }
        function p2() {
            //豆豆：喂，你好？（数宝同时飞到豆豆身边）
            cc.tween(shubao).by(2, { x: -210 }).start();
            self.doudouSpeak('phone_dou1', () => {
                //语音播完，豆豆脑袋出现小米脸蛋动画
                cc.tween(xiaomi)
                    .to(0.5, { scale: 1 })
                    .call(() => {
                        //小米语音：豆豆你好，我是小米
                        self.xiaomiSpeak('phone_mi1', () => {
                            //豆豆语音：小米，你找我有什么事儿嘛？
                            self.doudouSpeak('phone_dou2', () => {
                                //小米语音：豆豆，8月10日是我的生日，我想邀请你和数宝来参加我的生日聚会
                                self.xiaomiSpeak('phone_mi2', () => {
                                    //豆豆语音：好啊，好啊，我和数宝会准时参加的
                                    self.doudouSpeak('phone_dou3', () => {
                                        //小米语音：好的，豆豆再见！
                                        self.xiaomiSpeak('phone_mi3', () => {
                                            //豆豆语音：小米再见
                                            self.doudouSpeak('phone_dou4', () => {
                                                //小米消失
                                                cc.tween(xiaomi).to(0.5, { scale: 0 }).start();
                                                //播放豆豆放下电话，转脸对豆豆说话动画
                                                skeCom_doudou.setAnimation(0, 'newAnimation_6', false);
                                                skeCom_doudou.addAnimation(0, 'newAnimation_1', true);
                                                cc.origin.ScheduleBase.addTimeout(() => {
                                                    phone.active = true;
                                                }, 0.6)
                                                cc.origin.ScheduleBase.addTimeout(() => {
                                                    skeCom_phone.setAnimation(0, 'newAnimation', true);
                                                    doudou.scaleX *= -1;
                                                    p3();
                                                }, 1);
                                            })
                                        })
                                    })
                                })
                            })
                        })
                    })
                    .start();
            })
        }
        function p3() {
            //豆豆语音：数宝，小米邀请我们8月10去参加聚会
            self.doudouSpeak('dou5', () => {
                //数宝语音：啾啾啾（配合数宝开心动画）
                skeCom_shubao.setAnimation(0, 'newAnimation_2', true);
                cc.origin.AudioBase.play(audioFolder + 'baby', () => {
                    skeCom_shubao.setAnimation(0, 'newAnimation_1', true);
                    //豆豆语音：数宝，变个日历出来吧！
                    self.doudouSpeak('dou6', () => {
                        if (cb) cb();
                    }, false);
                })
            }, false);
        }
        //标题
        cc.origin.AudioBase.play(audioFolder + 'title', p1);
    },

    doudouSpeak(audioName, cb, havePhone = true) {
        var doudou = this.pic1.getChildByName('doudou');
        var skeCom_doudou = doudou.getComponent(sp.Skeleton);
        var animalName0 = havePhone ? 'newAnimation_5' : 'newAnimation_7';
        var animalName1 = havePhone ? 'newAnimation_4' : 'newAnimation_1';
        skeCom_doudou.setAnimation(0, animalName0, true);
        cc.origin.AudioBase.play(this.audioFolder + audioName, () => {
            skeCom_doudou.setAnimation(0, animalName1, true);
            if (cb) cb();
        })
    },

    xiaomiSpeak(audioName, cb) {
        var xiaomi = this.pic1.getChildByName('xiaomi');
        var skeCom_xiaomi = xiaomi.getComponent(sp.Skeleton);
        skeCom_xiaomi.setAnimation(0, 'newAnimation_2', true);
        cc.origin.AudioBase.play(this.audioFolder + audioName, () => {
            skeCom_xiaomi.setAnimation(0, 'newAnimation_1', true);
            if (cb) cb();
        })
    },

    startPlay() {
        this.pic1.active = false;
        this.pic2.active = true;
        //换背景
        var canvasBg = cc.find('Canvas/bg');
        canvasBg.active = true;
        cc.origin.Util.destroyAllChildrenSync(canvasBg);
        var bg = this.pic2.getChildByName('bg');
        var tempBg = cc.instantiate(bg);
        tempBg.setParent(canvasBg);
        tempBg.setPosition(cc.v2(0, 0));
        tempBg.getChildByName('ske').getComponent(sp.Skeleton).setAnimation(0, 'newAnimation2', true);
        bg.active = false;
        //初始化日历
        this.weeks = this.pic2.getChildByName('weeks');
        this.week_arr = this.weeks.children.map(x => { return x });
        this.days = this.pic2.getChildByName('days');
        this.day_arr = this.days.children.map(x => { return x });
        this.pages = this.pic2.getChildByName('pages');
        this.page_arr = this.pages.children.map(x => { return x });
        this.setMonth(1);
        //键
        this.keys = this.pic2.getChildByName('keys');
        this.key_arr = this.keys.children.map(x => { return x });
        //左右键动画
        this.key_arr.forEach(key => {
            let skeCom = key.getChildByName('ske').getComponent(sp.Skeleton);
            skeCom.setAnimation(0, 'newAnimation_1', true);
        })
        //题目语音且可操作
        cc.origin.Note.trumpet.setTrumpet(this.audioFolder + 'round' + this.roundId, false);
        cc.origin.Note.trumpet.playTrumpet();
        cc.origin.Note.trumpet.setLoopPlay(cc.origin.Note.gameData.askAudioLoop);
        cc.origin.EventManager.emit(cc.origin.EventDefine.COMMON.KINETIC_TIME);
        //初始化选项
        this.option_arr = this.day_arr.map(x => { return x });
        //给选项注册触摸
        this.registerOptionTouch();
        //给左右键注册触摸
        this.registerKeyTouch();
    },

    setMonth(monthId) {
        this.monthId = monthId;
        this.page_arr.forEach(x => { x.active = false });
        this.page_arr[this.monthId - 1].active = true;
        //设置可触摸项
        var monthData = kCalendarData[this.monthId];
        var firstIndex = monthData.firstIndex;
        var dayNum = monthData.dayNum;
        var finalIndex = firstIndex + dayNum - 1;
        for (let i = 0, len = this.day_arr.length; i < len; i++) {
            let day = this.day_arr[i];
            day._canTouch = (i >= firstIndex && i <= finalIndex);
        }
        this.week_arr.forEach(week => { week._canTouch = true });
    },

    getWeekId(rect) {
        if (!(rect && rect.isChildOf(this.weeks))) return;
        var index = this.week_arr.indexOf(rect);
        return index;
    },

    getDayId(rect) {
        if (!(rect && rect.isChildOf(this.days))) return;
        var index = this.day_arr.indexOf(rect);
        var monthData = kCalendarData[this.monthId];
        var firstIndex = monthData.firstIndex;
        return index - firstIndex + 1;
    },

    registerOptionTouch(pNode) {
        var temp_arr = [];
        if (pNode) {
            temp_arr.push(pNode);
        } else {
            temp_arr = this.option_arr;
        }
        temp_arr.forEach(pTouch => {
            // pTouch._canTouch = true;
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

    registerKeyTouch(pNode) {
        var temp_arr = [];
        if (pNode) {
            temp_arr.push(pNode);
        } else {
            temp_arr = this.key_arr;
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
                var skeCom = pTouch.getChildByName('ske').getComponent(sp.Skeleton);
                skeCom.setAnimation(0, 'newAnimation_2', true);
                // var chosen = pTouch.getChildByName('chosen');
                // if (chosen) chosen.active = true;
                //左右翻日历
                var dir = pTouch.name == 2 ? 1 : -1;
                var nextMonthId = this.monthId + dir;
                if (nextMonthId > 12) {
                    nextMonthId = 1;
                } else if (nextMonthId < 1) {
                    nextMonthId = 12;
                }
                this.setMonth(nextMonthId);
                //喇叭停止循环
                cc.origin.Note.trumpet.setLoopPlay(false);
            }, this)
            pTouch.on(cc.Node.EventType.TOUCH_MOVE, function (event) { }, this)
            pTouch.on(cc.Node.EventType.TOUCH_END, touchUp, this)
            pTouch.on(cc.Node.EventType.TOUCH_CANCEL, touchUp, this)
            function touchUp(event) {
                if (!cc.origin.Note.touchTarget) return;
                cc.origin.EventManager.emit(cc.origin.EventDefine.COMMON.KINETIC_TIME);
                //取消选中效果
                var skeCom = pTouch.getChildByName('ske').getComponent(sp.Skeleton);
                skeCom.setAnimation(0, 'newAnimation_1', true);
                // var chosen = pTouch.getChildByName('chosen');
                // if (chosen) chosen.active = false;
                //重置触摸对象
                cc.origin.Note.touchTarget = null;
            }
        })
    },

    unregisterKeyTouch(pNode) {
        var temp_arr = [];
        if (pNode) {
            temp_arr.push(pNode);
        } else {
            temp_arr = this.key_arr;
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
        var monthId = this.monthId;
        var dayId = this.getDayId(option);
        var isCorrect = (monthId === this.answer.monthId && dayId === this.answer.dayId);
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
        }
    },

    showResult(isWin = true) {
        var self = this;
        cc.origin.EventManager.emit(cc.origin.EventDefine.COMMON.FREEZE_TIME);
        self.unregisterOptionTouch();
        self.unregisterKeyTouch();
        if (isWin) {
            //演示
            cc.origin.ScheduleBase.addTimeout(hint, 1);
        } else {
            //模拟正确操作
            simulate();
        }
        function simulate() {
            //跳到正确的月份
            var jumpInterval = 0.2;
            var deltaMonth = self.answer.monthId - self.monthId;
            var dir = deltaMonth > 0 ? 1 : -1;
            var len = Math.abs(deltaMonth);
            for (let i = 1; i <= len; i++) {
                cc.origin.ScheduleBase.addTimeout(() => {
                    //设置月份
                    cc.origin.AudioBase.play('click');
                    self.setMonth(self.monthId + dir);
                }, i * jumpInterval);
            }
            cc.origin.ScheduleBase.addTimeout(() => {
                //正确日期星星
                var dayId = self.answer.dayId;
                var firstIndex = kCalendarData[self.answer.monthId].firstIndex;
                var correctOption = self.day_arr[firstIndex + dayId - 1];
                var chosen = correctOption.getChildByName('chosen');
                if (chosen) chosen.active = true;
                cc.origin.AudioBase.play('star');
                cc.origin.Script.Tools.addStarEffect(correctOption);
                //演示
                cc.origin.ScheduleBase.addTimeout(hint, 1);
            }, len * jumpInterval + 0.5);
        }
        function hint() {
            //伴随语音提示
            cc.origin.AudioBase.play(self.audioFolder + 'tell' + self.roundId, () => {
                cc.origin.EventManager.emit(cc.origin.EventDefine.COMMON.FINISH_ROUND);
            });
            //日期缩放
            cc.origin.AudioBase.play('bubble');
            var dayId = self.answer.dayId;
            var firstIndex = kCalendarData[self.answer.monthId].firstIndex;
            var day = self.day_arr[firstIndex + dayId - 1];
            var chosen_day = day.getChildByName('chosen');
            chosen_day.active = true;
            cc.tween(chosen_day).to(0.5, { scale: 2 }).to(0.5, { scale: 1 }).start();
        }
    },
});