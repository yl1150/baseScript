const questionType = cc.Enum({
    default: 0,
    qBank: 1,
    exercises1: 2,
    exercises2: 3,
});

const actionType = cc.Enum({
    default: 0,//突然出现
    scale: 1,//缩放
    jump: 2,//挑一挑
});

cc.Class({
    extends: cc.Component,

    properties: {
        maxLv: 8,
        qType: {
            type: questionType,
            default: questionType.default,
            displayName: '问题类型'
        },
        aType: {
            type: actionType,
            default: actionType.default,
            displayName: '提示动画类型'
        },
        isOneByOne: {
            default: true,
            displayName: '是否是逐个显示'
        }
    },

    start() {
        GD.sound.setTipsButton(true);
        GD.root.setStarBoard(false);
        this.canvasBG = cc.YL.setCanvasBG(this.node.getChildByName('bj').getComponent(cc.Sprite).spriteFrame);
        GD.exercises = this;
        this.folderName = 'qBank';
        GD.root.setQuestionBg(true);
        GD.root.setSeqIcon(true, this.maxLv);
        this.canvasBG.active = true;
        this.registerEvent();
        //this.fitWhiteBG();
    },

    registerEvent() {
        cc.YL.emitter.on('startGame', (e, data) => {
            console.log('startGame')
            GD.sound.playBGM();
            this.startLv = GD.iRoundID;
            this.startGame();
        })

        cc.YL.emitter.on('PASSLV', (data) => {
            this.passLV();
        })
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
        cc.YL.emitter.emit('refreshSeqID', this.startLv);
        GD.root.setStarBoard(false);
        let round = this.node.getChildByName('round' + this.startLv);
        if (round && round.isValid) {
            round.active = true;
            for (let i in round._components) {
                round._components[i].init && round._components[i].init();
            }
        } else {
            cc.loader.loadRes('prefab/' + this.folderName + '/round' + this.startLv, cc.Prefab, (err, _prefab) => {
                if (err) {
                    console.log(err);
                    return;
                }
                var round = cc.instantiate(_prefab);
                round.parent = this.node;
                round.active = true;
                for (let i in round._components) {
                    round._components[i].init && round._components[i].init();
                }
            });
        }
    },

    passLV() {
        if (this.startLv >= this.maxLv) {
            GD.sound.pauseBgm();
            cc.YL.emitter.emit('gameEnd', this.rounData);
        } else {
            this.startLv++;
            this.startGame();
        }
    },

    onDestroy() {
        cc.YL.emitter.off('PASSLV');

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
                this.setAction(box, this.isOneByOne ? i * durTime : 0, durTime);
            }
            cc.YL.timeOut(() => {
                this.showTips(arrPool, delayTimePool, scaleNumPool, durPool, endCallFunc);
            }, this.isOneByOne ? scaleNum * 1000 : durTime);
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
