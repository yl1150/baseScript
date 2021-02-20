//选择选项对应的脚本 
let stageMessage = cc.Class({
    name: "data",
    properties: {
        optionData: [cc.String],
    }
})
cc.Class({
    extends: cc.Component,

    properties: {
        tips: cc.String,
        eggAni: [cc.String],
        rightAnswers: [cc.Node],
        questionData: [stageMessage]
    },

    // LIFE-CYCLE CALLBACKS:

    init() {
        this.eggSke = this.node.getChildByName('egg').getComponent(sp.Skeleton);
        this.options = this.node.getChildByName('options');
        this.formulaList = this.node.getChildByName('formulaList');
        this._stage = 1;
        this._errorCount = 0;
        this.registerEvent();

        this.options.children.forEach((op) => {
            cc.YL.tools.registerTouch(
                op,
                (e) => {
                    // e.target.setScale(1.2);
                },
                null,
                (e) => {
                    //e.target.setScale(1);
                    if (this.rAnswer == e.target) {
                        this.showRight(e.target);
                    } else {
                        GD.sound.playSound('wrong');
                        GD.sound.playSound('blank');
                        this.setError();
                        cc.tween(e.target)
                            .then(cc.YL.aMgr.SHAKING_X)
                            .start()
                    }
                },
            );

        });

        this.initStage();
    },


    //注册事件
    registerEvent() {
        cc.YL.emitter.on('startGame', (e) => {
            cc.YL.unLockTouch();
            GD.sound.playTips('tips_touch');
        })
    },

    unregisterEvent() {
        cc.YL.emitter.off('startGame');
    },

    setTouch(target, isShow) {
        this.light.node.active = isShow;
        let pos = cc.YL.tools.getRelativePos(target, this.node);
        this.light.node.x = pos.x;
        this.light.setAnimation(0, 'animation_1', true);
    },

    showGame() {
        //展示对应动画

        let startBtn = this.node.getChildByName('startBtn');
        let hand = startBtn.getChildByName('hand');
        hand.active = false;
        startBtn.getComponent(cc.Button).interactable = false;
        GD.sound.playSound('machine');
        let btnSke = startBtn.getComponent(sp.Skeleton);
        btnSke.setAnimation(0, 'animation3', false);

        this.eggSke.node.active = true;
        this.eggSke.setAnimation(0, 'animation', false);
        this.eggSke.setCompleteListener(() => {
            this.eggSke.setCompleteListener(null);
            this.showStartGame();
        })
    },

    initStage() {
        //初始化选项
        let data = this.questionData.shift();
        this.options.children.forEach((op) => {
            let fnt = op.getChildByName('fnt').getComponent(cc.Label);
            fnt.string = data.optionData.shift();
        });

        //初始化答案
        this.rAnswer = this.rightAnswers.shift();

        //初始化算式
        this.formula = this.node.getChildByName('formulas').children[this._stage - 1];

        //初始化锤子
        let hammers = this.node.getChildByName('hammers');

        this.hammer = hammers.children[this._stage - 1];

        //初始化蛋动画名
        this._eggAniName_break = this.eggAni.shift();
        this._eggAniName_line = this.eggAni.shift();

    },

    showStartGame() {
        cc.YL.unLockTouch();
        GD.sound.setTipsButton(true);
        GD.sound.setShowTips(this.tips, true);
        this.options.active = true;
        this.formula.active = true;
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

    showRight(target) {
        GD.sound.playSound('right');
        GD.root.showStar(target, () => {
            /* GD.root.showAddStar(GD.root.getStarNum(this._errorCount), () => {
                this.showFinishLayer();
            }) */
            this.showHitEggs(target);



        });
        cc.YL.lockTouch();
    },

    showHitEggs(op) {
        this.options.active = false;
        let pos = cc.YL.tools.getRelativePos(op, this.eggSke.node);
        let originPos = this.hammer.position;
        let ske = this.hammer.getChildByName('ske').getComponent(sp.Skeleton);

        this.hammer.active = true;
        this.hammer.setPosition(pos);

        let findFormula = function (arr) {
            let pNode = null;
            arr.forEach((kid) => {
                if (!kid.active && !pNode) pNode = kid;
            });
            return pNode;
        }


        cc.tween(this.hammer)
            .then(cc.YL.aMgr.lineMove(pos, originPos, 0.05))
            .call(() => {
                ske.setAnimation(0, 'chuizi_2', false);
                this.eggSke.setAnimation(0, this._eggAniName_break, false);
                this.eggSke.addAnimation(0, this._eggAniName_line, false);

                let fNode = findFormula(this.formulaList.children);
                cc.tween(this.formula)
                    .delay(0.5)
                    .call(() => {
                        fNode.active = true;
                        this.formula.active = false;
                        this.hammer.active = false;
                        this.showPassStage();
                    })
                    .start()
            })
            .start()
    },

    showRightAnswer() {
        //展示正确答案
        GD.root.showStar(this.rAnswer, () => {
            this.showHitEggs(this.rAnswer);
        });
        cc.YL.lockTouch();
    },

    showPassStage() {
        if (this._stage >= 2) {
            this.showFinishLayer();
        } else {
            this._stage++;
            this.initStage();
            this.showStartGame();
        }
    },

    showFinishLayer() {
        //展示数宝
        this.eggSke.setAnimation(0, 'animation8', false);
        this.eggSke.addAnimation(0, 'animation9', true);

        //此环节完成 注销所有事件
        this.unregisterEvent();
        cc.YL.timeOut(() => {
            cc.YL.emitter.emit('continueGame');
            this.node.destroy();
        }, 2000);
    },
});
