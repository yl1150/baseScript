const questionType = cc.Enum({
    default: 0,
    qBank: 1,
    exercises: 2,
});

const actionType = cc.Enum({
    default: 0,//突然出现
    scale: 1,//缩放
    jump: 2,//挑一挑
});

cc.Class({
    extends: cc.Component,

    properties: {
        maxLv: 5,
        qType: {
            type: questionType,
            default: questionType.default,
            displayName: '问题类型'
        },
        aType: {
            type: actionType,
            default: actionType.default,
            displayName: '提示动画类型'
        }
    },

    start() {
        this.lv = 1;
        GD.sound.setTipsButton(true);
        let canvasBG = cc.YL.setCanvasBG(this.node.getChildByName('bj').getComponent(cc.Sprite).spriteFrame);
        GD.exercises = this;
        if (this.qType == questionType.exercises) {
            canvasBG.active = false;
            GD.root.showLoading(
                () => {
                    canvasBG.active = true;
                    GD.root.setStarBoard(true);
                    GD.root.setQuestionBg(true);
                    // this.node.getChildByName('board').active = true;
                },
                () => {
                    this.startGame();
                }
            )
        } else {
            GD.root.setQuestionBg(true);
            GD.root.setStarBoard(true);
            canvasBG.active = true;
            this.startGame();
        }
        //this.fitWhiteBG();
    },

    fitWhiteBG(round) {
        //适配白底板
        console.log(cc.winSize)
        var whiteBG = cc.find('Canvas/questionBg');
        let board = round.getChildByName('board');
        let opList = round.getChildByName('opList');
        console.log(board.position);
        round.setContentSize(whiteBG.width, whiteBG.height);
        setTimeout(() => {
            board.getComponent(cc.Widget).updateAlignment();
            opList.getComponent(cc.Widget).updateAlignment();
            console.log(board.position);
        }, 1000);
    },

    startGame() {
        let round = this.node.getChildByName('round' + this.lv);
        round.active = true;
        let roundCom = round.getComponent('round_Choose') || round.getComponent('round_chooseNum') || round.getComponent('round_touch') || round.getComponent('round_chooseImg');
        roundCom && roundCom.init(this.lv);
        //this.fitWhiteBG(round);
    },

    passLV() {
        if (this.lv >= this.maxLv) {
            let canvasBG = cc.YL.setCanvasBG(this.node.getChildByName('bj').getComponent(cc.Sprite).spriteFrame);
            if (this.qType == questionType.exercises) {
                GD.root.showLoading(
                    () => {
                        canvasBG.active = false;
                        this.node.active = false;
                        this.node.destroy();
                        GD.root.setStarBoard(false);
                        GD.root.setQuestionBg(false);
                        cc.YL.emitter.emit('finishRound');
                    },
                    () => {
                        cc.YL.emitter.emit('continueGame');
                    }
                )
            } else {
                cc.YL.emitter.emit('gameEnd', this.rounData);
            }
        } else {
            this.lv++;
            this.startGame();
        }
    },

    showAnswerTips(arr, dtArr, sNumArr, durArr, endCallFunc) {
        this.showTips(arr, dtArr, sNumArr, durArr, endCallFunc);
    },

    showTips(arrPool, delayTimePool, scaleNumPool, durPool, endCallFunc) {
        let time = delayTimePool.shift();
        if (scaleNumPool.length < 1) {
            endCallFunc && endCallFunc(time);
            return;
        }
        let scaleNum = scaleNumPool.shift();
        let durTime = durPool.shift();
        cc.YL.timeOut(() => {
            for (let i = 0; i < scaleNum; i++) {
                let box = arrPool.shift();
                box.active = true;
                this.setAction(box, i * durTime, durTime);
            }
            cc.YL.timeOut(() => {
                this.showTips(arrPool, delayTimePool, scaleNumPool, durPool, endCallFunc);
            }, scaleNum * 1000);
        }, time * 1000);
    },

    setAction(target, delayT1, delayT2) {
        switch (this.aType) {
            case actionType.default:
                target.opacity = 0;
                cc.tween(target)
                    .delay(delayT1)
                    .to(0, { opacity: 255 })
                    .delay(delayT2)
                    .to(0, { opacity: 0 })
                    .start()
                break;
            case actionType.scale:
                cc.tween(target)
                    .delay(delayT1)
                    .then(cc.YL.aMgr.zoomAction(1))
                    .delay(delayT2)
                    .start()
                break;
            case actionType.jump:
                cc.tween(target)
                    .delay(delayT1)
                    .then(cc.YL.aMgr.jump(1))
                    .delay(delayT2)
                    .start()
                break;
            default:
                break;
        }
    },
    // update (dt) {},
});
