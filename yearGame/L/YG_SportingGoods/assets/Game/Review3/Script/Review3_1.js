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

        this.options = this.pic2.getChildByName('options');
        this.option_arr = this.options.children.map(x => { return x });

        this.ok = this.pic2.getChildByName('ok');
        this.ok.active = true;
        this.registerOkTouch();

        this.mistakeCount = 0;//犯错次数
        this.ratio_table = 1;
        this.answer_arr = [3, 5];
    },

    start() { },

    initRound(roundId = 1) {
        this.roundId = roundId;
        this.base.active = true;
        //初始化UI
        this.initUI();
        //初始化pic1
        this.initPic1();
        cc.origin.AudioBase.play(this.audioFolder + 'title')
        cc.origin.ScheduleBase.addTimeout(() => {
            //显示pic1
            this.showPic1();
        }, 3);
    },

    clearRound(cb) {
        var tag = this.pic2.getChildByName('tag');
        cc.tween(tag)
            .to(0.9, { scale: 0 })
            .call(() => {
                this.base.active = false;
                //
                if (cb) cb();
            })
            .start();
    },

    initUI() {
        //换背景
        var canvasBg = cc.find('Canvas/bg');
        canvasBg.active = true;
        cc.origin.Util.destroyAllChildrenSync(canvasBg);
        var bg = this.base.getChildByName('bg');
        var tempBg = cc.instantiate(bg);
        tempBg.setParent(canvasBg);
        tempBg.setPosition(cc.v2(0, 0));
        bg.active = false;
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

    initPic1() {
        var pic1 = this.base.getChildByName('pic1');
        var skeCom_xiaomi = pic1.getChildByName('xiaomi').getComponent(sp.Skeleton);
        skeCom_xiaomi.setAttachment('qiu', 'basketball')
        skeCom_xiaomi.setAnimation(0, 'newAnimation_1', true);
        var skeCom_doudou = pic1.getChildByName('doudou').getComponent(sp.Skeleton);
        skeCom_doudou.setAttachment('qiu', 'soccer')
        skeCom_doudou.setAnimation(0, 'newAnimation_1', true);
    },

    showPic1() {
        cc.origin.AudioBase.play(this.audioFolder + 'start1', () => {
            //转到pic2
            var bg = cc.find('Canvas/bg');
            var tempBg = bg.children[0];
            cc.origin.ActionBase.follow(this.base, tempBg);
            cc.tween(tempBg)
                .to(0.5, { x: -1920 })
                .call(() => {
                    cc.origin.ActionBase.unfollow(tempBg);
                    //题目语音且可操作
                    cc.origin.Note.trumpet.setTrumpet(this.audioFolder + 'round' + this.roundId, false);
                    cc.origin.Note.trumpet.playTrumpet();
                    cc.origin.Note.trumpet.setLoopPlay(true);
                    cc.origin.EventManager.emit(cc.origin.EventDefine.COMMON.KINETIC_TIME);
                    //关闭layout组件
                    var layoutCom_options = this.options.getComponent(cc.Layout);
                    if (layoutCom_options) {
                        layoutCom_options.updateLayout();
                        layoutCom_options.enabled = false;
                    }
                    //给选项注册触摸
                    this.registerOptionTouch();
                })
                .start();
        });
        var pic1 = this.base.getChildByName('pic1');
        var skeCom_xiaomi = pic1.getChildByName('xiaomi').getComponent(sp.Skeleton);
        skeCom_xiaomi.setAnimation(0, 'newAnimation_2', false);
        skeCom_xiaomi.addAnimation(0, 'newAnimation_3', true);
        var skeCom_doudou = pic1.getChildByName('doudou').getComponent(sp.Skeleton);
        skeCom_doudou.setAnimation(0, 'newAnimation_2', false);
        skeCom_doudou.addAnimation(0, 'newAnimation_3', true);
        cc.origin.ScheduleBase.addTimeout(() => {
            skeCom_xiaomi.setAttachment('qiu', null)
            skeCom_doudou.setAttachment('qiu', null)
            var shelf = pic1.getChildByName('shelf');
            shelf.children.forEach(x => { x.active = true })
        }, 0.5);
    },

    registerOptionTouch(pNode) {
        var temp_arr = [];
        if (pNode) {
            var btns = pNode.getChildByName('btns');
            btns.children.forEach(btn => { btn._optionId = parseInt(pNode.name) })
            temp_arr = temp_arr.concat(btns.children);
        } else {
            this.option_arr.forEach(option => {
                let btns = option.getChildByName('btns');
                btns.children.forEach(btn => { btn._optionId = parseInt(option.name) })
                temp_arr = temp_arr.concat(btns.children);
            })
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
                //加减对应栏目框
                var optionId = pTouch._optionId;
                var column = this.column_arr[optionId - 1];
                var option = this.option_arr[optionId - 1];
                if (pTouch.name == 1) {
                    //加框
                    if (column.childrenCount < 5) {
                        var newRect = cc.instantiate(this.sample_rect);
                        newRect.setParent(column);
                        newRect.x = 0;
                        newRect.active = true;
                        var rectImg = option.getChildByName('rectImg').getComponent(cc.Sprite).spriteFrame;
                        newRect.getChildByName('img').getComponent(cc.Sprite).spriteFrame = rectImg;
                    }
                } else {
                    //减框
                    if (column.childrenCount > 0) {
                        var lastRect = column.children[column.childrenCount - 1];
                        cc.origin.Util.destroySync(lastRect);
                    }
                }
                //喇叭停止循环
                cc.origin.Note.trumpet.setLoopPlay(false);
            }, this)
            pTouch.on(cc.Node.EventType.TOUCH_MOVE, function (event) { }, this)
            pTouch.on(cc.Node.EventType.TOUCH_END, touchUp, this)
            pTouch.on(cc.Node.EventType.TOUCH_CANCEL, touchUp, this)
            function touchUp(event) {
                if (!cc.origin.Note.touchTarget) return;
                cc.origin.EventManager.emit(cc.origin.EventDefine.COMMON.KINETIC_TIME);
                //取消选中
                var chosen = pTouch.getChildByName('chosen');
                if (chosen) chosen.active = false;
                //重置触摸对象
                cc.origin.Note.touchTarget = null;
            }
        })
    },

    unregisterOptionTouch(pNode) {
        var temp_arr = [];
        if (pNode) {
            temp_arr.push(pNode);
            var tag = pNode.getChildByName('tag');
            if (tag) temp_arr.push(tag);
        } else {
            temp_arr = this.option_arr;
            this.option_arr.forEach(option => {
                let tag = option.getChildByName('tag');
                if (tag) temp_arr.push(tag);
            })
        }
        temp_arr.forEach(pTouch => {
            pTouch._canTouch = false;
            pTouch.off(cc.Node.EventType.TOUCH_START)
            pTouch.off(cc.Node.EventType.TOUCH_MOVE)
            pTouch.off(cc.Node.EventType.TOUCH_END)
            pTouch.off(cc.Node.EventType.TOUCH_CANCEL)
        })
    },

    setOkTouch(statusId = 1) {
        //0禁止触摸，1正常，2按下
        this.ok.$canTouch = statusId;
        var spt_normal = this.ok.getChildByName('normal').getComponent(cc.Sprite).spriteFrame;
        var spt_pressed = this.ok.getChildByName('pressed').getComponent(cc.Sprite).spriteFrame;
        if (statusId === 1) {
            //正常效果
            this.ok.getComponent(cc.Sprite).spriteFrame = spt_normal;
            cc.origin.ShaderBase.setSpriteShader(this.ok, cc.origin.ShaderBase.ShaderType.Default);
        } else if (statusId === 2) {
            //按下效果
            this.ok.getComponent(cc.Sprite).spriteFrame = spt_pressed;
            cc.origin.ShaderBase.setSpriteShader(this.ok, cc.origin.ShaderBase.ShaderType.Default);
        } else {
            //不可交互效果
            this.ok.getComponent(cc.Sprite).spriteFrame = spt_normal;
            cc.origin.ShaderBase.setSpriteShader(this.ok, cc.origin.ShaderBase.ShaderType.Gray);
        }
    },

    registerOkTouch() {
        this.ok.on(cc.Node.EventType.TOUCH_START, function (event) {
            if (cc.origin.Note.touchTarget) return;
            cc.origin.Note.touchTarget = event.target;
            cc.origin.EventManager.emit(cc.origin.EventDefine.COMMON.FREEZE_TIME);
            cc.origin.AudioBase.play('click');
            //按下效果
            this.setOkTouch(2);
            //喇叭停止循环
            cc.origin.Note.trumpet.setLoopPlay(false);
        }, this)
        this.ok.on(cc.Node.EventType.TOUCH_MOVE, function (event) { }, this)
        this.ok.on(cc.Node.EventType.TOUCH_END, touchUp, this)
        this.ok.on(cc.Node.EventType.TOUCH_CANCEL, touchUp, this)
        function touchUp(event) {
            if (!cc.origin.Note.touchTarget) return;
            cc.origin.EventManager.emit(cc.origin.EventDefine.COMMON.KINETIC_TIME);
            //正常效果
            this.setOkTouch(1);
            //检测结果
            this.checkResult();
            //确认键消失
            // this.ok.active = false;
            //重置触摸对象
            cc.origin.Note.touchTarget = null;
        }
    },

    unregisterOkTouch() {
        this.ok.off(cc.Node.EventType.TOUCH_START)
        this.ok.off(cc.Node.EventType.TOUCH_MOVE)
        this.ok.off(cc.Node.EventType.TOUCH_END)
        this.ok.off(cc.Node.EventType.TOUCH_CANCEL)
    },

    checkResult() {
        var isCorrect = true;
        for (let i in this.column_arr) {
            let answer = this.answer_arr[i];
            let column = this.column_arr[i];
            if (answer !== column.childrenCount) {
                isCorrect = false;
                break;
            }
        }
        if (isCorrect) {
            cc.origin.Note.trumpet.playAndCover('correct' + cc.origin.MathBase.random(1, 3, false), false);
            //星星
            cc.origin.AudioBase.play('star');
            this.option_arr.forEach(option => {
                cc.origin.Script.Tools.addStarEffect(option);
            })
            //显示结果
            this.showResult(true);
        } else {
            this.mistakeCount++;
            cc.origin.Note.trumpet.playAndCover('wrong' + cc.origin.MathBase.random(1, 3, false), true, () => {
                //所有色块消失
                this.column_arr.forEach(column => { cc.origin.Util.destroyAllChildrenSync(column) });
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
        //确认键消失
        self.ok.active = false;
        if (isWin) {
            //演示
            cc.origin.ScheduleBase.addTimeout(hint, 1);
        } else {
            //模拟正确操作
            simulate();
        }
        function simulate() {
            var count = 0;
            var interval = 0.1;
            for (let i in self.answer_arr) {
                let answer = self.answer_arr[i];
                let column = self.column_arr[i];
                let option = self.option_arr[i];
                for (let j = 0; j < answer; j++) {
                    cc.origin.ScheduleBase.addTimeout(() => {
                        cc.origin.AudioBase.play('bubble');
                        //生成新格子
                        let newRect = cc.instantiate(self.sample_rect);
                        newRect.setParent(column);
                        newRect.x = 0;
                        newRect.active = true;
                        let rectImg = option.getChildByName('rectImg').getComponent(cc.Sprite).spriteFrame;
                        newRect.getChildByName('img').getComponent(cc.Sprite).spriteFrame = rectImg;
                    }, interval * count++);
                }
            }
            //演示
            cc.origin.ScheduleBase.addTimeout(hint, 1);
        }
        function hint() {
            //伴随语音提示
            cc.origin.AudioBase.play(self.audioFolder + 'tell' + self.roundId, () => {
                cc.origin.EventManager.emit(cc.origin.EventDefine.COMMON.FINISH_ROUND);
            });
            // //创建数字
            // var table = self.table;
            // var inside_table = table.getChildByName('inside');
            // var rect_table = table.getChildByName('rect');
            // var halfRectHeight = rect_table.height / 2;
            // var sample_num = table.getChildByName('num');
            // var nums = new cc.Node();
            // nums.setParent(table);
            // for (let i in inside_table.children) {
            //     let pInside = inside_table.children[i];
            //     let newNum = cc.instantiate(sample_num);
            //     newNum.setParent(nums);
            //     newNum.getComponent(cc.Label).string = pInside.childrenCount * self.ratio_table;
            //     let worldpos_num = pInside.convertToWorldSpaceAR(cc.v2(0, pInside.height - halfRectHeight));
            //     let pos_num = nums.convertToNodeSpaceAR(worldpos_num);
            //     newNum.setPosition(pos_num);
            // }
            // var firstInsideTable = inside_table.children[0];
            // var worldpos_firstInside = firstInsideTable.convertToWorldSpaceAR(cc.v2(-firstInsideTable.width / 2 - 20, 0));
            // var initX_num = nums.convertToNodeSpaceAR(worldpos_firstInside).x;
            //
            var tag = self.pic2.getChildByName('tag');
            //
            var delay_arr = [0, 2];
            for (let i in delay_arr) {
                let delay = delay_arr[i];
                // let num = nums.children[i];
                let column = self.column_arr[i];
                let one_tag = tag.children[i];
                let num_tag = one_tag.getChildByName('num');
                cc.origin.ScheduleBase.addTimeout(() => {
                    cc.origin.AudioBase.play('bubble');
                    column.children.forEach(rect => {
                        let dot = rect.getChildByName('img');
                        cc.tween(dot).to(0.5, { scale: 2 }).to(0.5, { scale: 1 }).start();
                    })
                    cc.tween(num_tag).to(0.5, { scale: 2 }).to(0.5, { scale: 1 }).start();
                    // //表格出现数字
                    // let pos1 = num.position;
                    // let pos0 = cc.v2(initX_num, num.y);
                    // num.active = true;
                    // num.setPosition(pos0);
                    // cc.tween(num).to(0.5, { position: pos1 }).start();
                    // //对应列闪烁
                    // cc.tween(column)
                    //     .to(0.25, { opacity: 0 })
                    //     .to(0.25, { opacity: 255 })
                    //     .to(0.25, { opacity: 0 })
                    //     .to(0.25, { opacity: 255 })
                    //     .start();
                }, delay);
            }
        }
    },
});