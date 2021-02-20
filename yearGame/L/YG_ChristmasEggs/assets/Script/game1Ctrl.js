//选择选项对应的脚本 
cc.Class({
    extends: cc.Component,

    properties: {
        rightNode: cc.Node,
        tips: {
            displayName: '问题语音',
            type: cc.AudioClip,
            default: null
        },
        answerTips: {
            displayName: '答案语音',
            type: cc.AudioClip,
            default: null
        },
        time: {
            displayName: '初始时间',
            type: [cc.Integer],
            default: []
        },
        right_time: {
            displayName: '最终时间',
            type: [cc.Integer],
            default: []
        },
        eggSkin: 'qiu_a',
        isShowScale: true
    },

    // LIFE-CYCLE CALLBACKS:

    init(clock, eggSke, boxs) {
        clock.setTime(this.time.shift(), this.time.shift(), 0.25);
        this._clock = clock;

        eggSke.setSkin(this.eggSkin);
        eggSke.setAnimation(0,'newAnimation',true);
        this._eggSke = eggSke;
        this._giftSke = this.node.getChildByName('liwu').getComponent(sp.Skeleton);
        this._boxs = boxs;
        this._errorCount = 0;

        this._options = this.node.getChildByName('options');

        this._options.children.forEach((kuang) => {
            kuang._touchImg = kuang.getChildByName('touchImg');
            cc.YL.tools.registerTouch(
                kuang,
                (e) => {
                    this.isShowScale && e.target.setScale(1.2);
                    this.setTouch(e.target, true);
                },
                null,
                (e) => {
                    this.isShowScale && e.target.setScale(1);
                    this.rightNode == e.target ? this.showRight(this.rightNode) : this.showWrong(e.target);
                },
            )
        });
        //cc.YL.emitter.emit('setDDAni','say');
        cc.YL.addClock(this.tips);
        GD.sound.setShowTips(this.tips, true);
        cc.YL.unLockTouch();
    },

    setTouch(target, isShow) {
        target._touchImg && (target._touchImg.active = isShow);
    },

    showRight(option) {
        cc.YL.lockTouch();
        cc.YL.emitter.emit('setDDAni', 'happy');
        GD.sound.playSound('right');
        GD.root.showStar(option, () => {
            this.showGetGift();
        })
    },

    showWrong(option) {
        this.setTouch(option, false);
        GD.sound.playSound('wrong');
        GD.sound.playSound('blank');
        cc.tween(option).then(
            cc.YL.aMgr.zoomAction(2)
        ).start()
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
        cc.YL.emitter.emit('setDDAni', 'happy');
        this.setTouch(this.rightNode, true);
        GD.root.showStar(this.rightNode, () => {
            this.showGetGift();
        })
    },

    showGetGift() {
        this._options.active = false;
        GD.sound.playTips(this.answerTips);
        this._clock.setTime(this.right_time.shift(), this.right_time.shift(), 1, () => {
            //彩蛋打开
            let entry = this._eggSke.setAnimation(0, 'newAnimation_1', false);

            this._eggSke.setTrackEventListener(entry, (event) => {
                //礼物出现
                this._giftSke.node.active = true;
                this._giftSke.setAnimation(0, 'newAnimation_1', false);

                cc.YL.timeOut(() => {
                    let box = null;
                    this._boxs.children.map((kid) => { if (!kid.active && !box) box = kid })
                    let pos = cc.YL.tools.getRelativePos(box, this.node);
                    cc.tween(this._giftSke.node)
                        .to(0.5, { position: pos })
                        .call(() => {
                            this._giftSke.node.active = false;
                            box.active = true;
                            this.showFinishLayer();
                        })
                        .start()

                }, 1000);
            })
        });






    },

    showFinishLayer() {
        //此环节完成 注销所有事件
        cc.YL.timeOut(() => {
            this.node.destroy();
            cc.YL.emitter.emit('continueGame');
        }, 500)
    },
});
