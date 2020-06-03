const questionType = cc.Enum({
    default: 0,
    qBank: 1,
    exercises: 2,
});

cc.Class({
    extends: cc.Component,

    properties: {
        maxLv: 5,
        qType: {
            type: questionType,
            default: questionType.default,
            displayName: '问题类型'
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
        let roundCom = round.getComponent('round_Choose') || round.getComponent('round_chooseNum') || round.getComponent('round_touch')|| round.getComponent('round_chooseImg');
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
    // update (dt) {},
});
