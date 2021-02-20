cc.Class({
    extends: cc.Component,

    properties: {},

    onLoad() {
        cc.origin.Script[this.__classname__] = this;
        var pAudioFolder = this.__classname__.toLowerCase();
        var pIndex = pAudioFolder.indexOf('_');
        this.audioFolder = pAudioFolder.substring(0, pIndex) + '/';
        //初始化
        this.base = this.node.getChildByName('base');
        this.base.active = false;

        this.pic2 = this.base.getChildByName('pic2');
        var pScale = cc.origin.Util.getWorldScale(this.pic2);
        this.pic2.width = cc.winSize.width / pScale.x;
        this.pic2.height = cc.winSize.height / pScale.y;

        this.table = this.pic2.getChildByName('table');
        this.inside_table = this.table.getChildByName('inside');
        this.column_arr = this.inside_table.children.map(x => { return x });
        this.sample_rect = this.table.getChildByName('rect');

        this.keyboard = this.pic2.getChildByName('keyboard');
        this.script_keyboard = this.keyboard.getComponent('Keyboard');

        this.mistakeCount = 0;//犯错次数
        this.ratio_table = 1;
        this.answer = 2;
    },

    start() { },

    initRound(roundId = 1) {
        this.roundId = roundId;
        this.base.active = true;
        //初始化UI
        this.initUI();
        //题目语音且可操作
        cc.origin.Note.trumpet.setTrumpet(this.audioFolder + 'round' + this.roundId, false);
        cc.origin.Note.trumpet.playTrumpet();
        cc.origin.Note.trumpet.setLoopPlay(true);
        cc.origin.EventManager.emit(cc.origin.EventDefine.COMMON.KINETIC_TIME);
        //设置键盘
        this.script_keyboard.setVisible(true);
        this.inputBox = this.pic2.getChildByName('box');
        this.script_keyboard.setKeyboard(this.inputBox, 1, 2,
            () => {
                //确认回调
                this.checkResult();
            }
        )
    },

    clearRound(cb) {
        var pic1 = this.base.getChildByName('pic1');
        var skeCom_xiaomi = pic1.getChildByName('xiaomi').getComponent(sp.Skeleton);
        skeCom_xiaomi.setAttachment('qiu', 'badminton')
        skeCom_xiaomi.setAnimation(0, 'newAnimation', true);
        var skeCom_doudou = pic1.getChildByName('doudou').getComponent(sp.Skeleton);
        skeCom_doudou.setAttachment('qiu', 'volleyball')
        skeCom_doudou.setAnimation(0, 'newAnimation', true);
        //
        var tempBg = cc.find('Canvas/bg').children[0];
        cc.origin.ActionBase.follow(this.base, tempBg);
        cc.tween(tempBg)
            .to(0.5, { x: 0 })
            .delay(0.5)
            .call(() => {
                cc.origin.ActionBase.unfollow(tempBg);
                this.base.active = false;
                //
                if (cb) cb();
            })
            .start();
    },

    initUI() {
        //背景
        var tempBg = cc.find('Canvas/bg').children[0];
        this.base.getChildByName('bg').active = false;
        //
        var pic1 = this.base.getChildByName('pic1');
        var worldpos_pic1 = tempBg.getChildByName('1').convertToWorldSpaceAR(cc.v2(0, 0));
        var pos_pic1 = pic1.parent.convertToNodeSpaceAR(worldpos_pic1);
        pic1.setPosition(pos_pic1);
        var pic2 = this.base.getChildByName('pic2');
        var worldpos_pic2 = tempBg.getChildByName('2').convertToWorldSpaceAR(cc.v2(0, 0));
        var pos_pic2 = pic2.parent.convertToNodeSpaceAR(worldpos_pic2);
        pic2.setPosition(pos_pic2);
    },

    checkResult() {
        var numNode = this.inputBox.getChildByName('numNode');
        var input = numNode.getComponent(cc.Label).string;
        if (input == this.answer) {
            cc.origin.Note.trumpet.playAndCover('correct' + cc.origin.MathBase.random(1, 3, false), true);
            //键盘不可触摸
            this.script_keyboard.setTouch(false);
            //星星
            cc.origin.AudioBase.play('star');
            cc.origin.Script.Tools.addStarEffect(numNode);
            //显示结果
            this.showResult(true);
        } else {
            this.mistakeCount++;
            cc.origin.Note.trumpet.playAndCover('wrong' + cc.origin.MathBase.random(1, 3, false), true, () => {
                //清空空白输入框数值
                this.inputBox.getChildByName('numNode').getComponent(cc.Label).string = '';
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
            cc.origin.ActionBase.vibrate(numNode);
        }
    },

    showResult(isWin = true) {
        var self = this;
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
            var numNode = self.inputBox.getChildByName('numNode');
            cc.origin.AudioBase.play('star');
            cc.origin.Script.Tools.addStarEffect(numNode);
            numNode.getComponent(cc.Label).string = self.answer;
            numNode.setScale(0, 0);
            cc.tween(numNode).to(0.7, { scale: 2 }).to(0.3, { scale: 1 }).start();
            //演示
            cc.origin.ScheduleBase.addTimeout(hint, 1);
        }
        function hint() {
            //伴随语音提示
            cc.origin.AudioBase.play(self.audioFolder + 'tell' + self.roundId, () => {
                cc.origin.EventManager.emit(cc.origin.EventDefine.COMMON.FINISH_ROUND);
            });
            cc.origin.ScheduleBase.addTimeout(() => {
                cc.origin.AudioBase.play('bubble');
                var rect_arr = self.column_arr[1].children.map(x => { return x });
                rect_arr.reverse();
                for (let i = 0; i < 2; i++) {
                    let rect = rect_arr[i];
                    cc.tween(rect).to(0.5, { scale: 2 }).to(0.5, { scale: 1 }).start();
                }
            }, 1.3);
        }
    },
});