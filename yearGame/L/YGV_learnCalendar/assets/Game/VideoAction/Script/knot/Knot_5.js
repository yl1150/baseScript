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

        this.options = this.base.getChildByName('options');
        this.option_arr = this.options.children.map(x => { return x });

        this.answer_arr = [1, 3, 5, 7, 8, 10, 12];
    },

    onDestroy() {
        cc.origin.Script[this.__classname__] = null;
    },

    start() {
        //暂停背景音乐
        cc.origin.AudioBase.pauseBgm();
        this.initRound();
    },

    initRound(roundId = this.roundId) {
        this.roundId = roundId;
        this.base.active = true;
        //视频暂停
        cc.origin.Note.script_video.pause();
        //隐藏返回键
        cc.origin.Note.script_gameback.setVisible(false);
        //出现喇叭
        cc.origin.Note.trumpet.setVisible(true);
        //voice此部分语音
        cc.origin.Note.trumpet.setTrumpet(this.audioFolder + 'round' + this.roundId, false);
        if (this.node.isAutoRunGame) {
            cc.origin.Note.trumpet.playTrumpet();
        } else {
            cc.origin.Note.trumpet.playTrumpet();
        }
        cc.origin.Note.trumpet.setLoopPlay(true);
        cc.origin.EventManager.emit(cc.origin.EventDefine.COMMON.KINETIC_TIME);
        //添加确认键
        this.ok = cc.origin.Script.Tools.addOkButton(this.base, this.checkResult.bind(this));
        this.ok.active = false;
        //关闭layout组件
        var layoutCom_options = this.options.getComponent(cc.Layout);
        if (layoutCom_options) {
            layoutCom_options.updateLayout();
            layoutCom_options.enabled = false;
        }
        //给选项注册触摸
        this.registerOptionTouch();
    },

    clearRound() {
        var starWorldpos = cc.v2(cc.winSize.width / 2, cc.winSize.height / 2);
        var starNum = cc.origin.Note.script_star.getStarNumByMistakeCount(this.mistakeCount, true);
        cc.origin.Note.script_star.earnStar(starWorldpos, starNum);
        cc.origin.Note.script_star.showWin(starNum, () => {
            cc.origin.Note.script_videoCtrl.finishGame();
        });
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
                if (chosen) chosen.active = !chosen.active;
                //喇叭停止循环
                cc.origin.Note.trumpet.setLoopPlay(false);
            }, this)
            pTouch.on(cc.Node.EventType.TOUCH_MOVE, function (event) { }, this)
            pTouch.on(cc.Node.EventType.TOUCH_END, touchUp, this)
            pTouch.on(cc.Node.EventType.TOUCH_CANCEL, touchUp, this)
            function touchUp(event) {
                if (!cc.origin.Note.touchTarget) return;
                cc.origin.EventManager.emit(cc.origin.EventDefine.COMMON.KINETIC_TIME);
                //已选就出现确认键
                this.ok.active = (this.option_arr.filter(option => { return option.getChildByName('chosen').active }).length > 0);
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

    checkResult() {
        var isCorrect;
        var chosenOption_arr = this.option_arr.filter(x => { return x.getChildByName('chosen').active });
        if (chosenOption_arr.length === this.answer_arr.length) {
            isCorrect = true;
            for (let i in chosenOption_arr) {
                let option = chosenOption_arr[i];
                let index = this.answer_arr.indexOf(parseInt(option.name));
                if (index < 0) {
                    isCorrect = false;
                    break;
                }
            }
        }
        if (isCorrect) {
            cc.origin.Note.trumpet.playAndCover('correct' + cc.origin.MathBase.random(1, 3, false), false);
            //星星
            cc.origin.AudioBase.play('star');
            chosenOption_arr.forEach(option => {
                cc.origin.Script.Tools.addStarEffect(option);
            })
            //显示结果
            this.showResult(true);
        } else {
            this.mistakeCount++;
            cc.origin.Note.trumpet.playAndCover('wrong' + cc.origin.MathBase.random(1, 3, false), true, () => {
                //选中效果消失
                chosenOption_arr.forEach(option => {
                    let chosen = option.getChildByName('chosen');
                    if (chosen) chosen.active = false;
                })
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
        if (isWin) {
            //演示
            cc.origin.ScheduleBase.addTimeout(hint, 1);
        } else {
            //模拟正确操作
            simulate();
        }
        function simulate() {
            cc.origin.AudioBase.play('star');
            for (let i in self.answer_arr) {
                let answer = self.answer_arr[i];
                let option = self.options.getChildByName('' + answer);
                //选中效果
                var chosen = option.getChildByName('chosen');
                if (chosen) chosen.active = true;
                //星星
                cc.origin.Script.Tools.addStarEffect(option);
            }
            //演示
            cc.origin.ScheduleBase.addTimeout(hint, 1);
        }
        function hint() {
            //结束本段
            self.clearRound();
        }
    },
});