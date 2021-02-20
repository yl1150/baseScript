//选择选项对应的脚本 
cc.Class({
    extends: cc.Component,

    properties: {
        rightAnswer: 1,
        tips: {
            displayName: '问题语音',
            type: cc.AudioClip,
            default: null
        },
        errorTips: {
            displayName: '答案语音',
            type: cc.AudioClip,
            default: null
        },
        teachNodes: {
            displayName: '展示动画节点',
            type: [cc.Node],
            default: []
        },
        isShowScale: true
    },

    // LIFE-CYCLE CALLBACKS:

    init() {
        this._errorCount = 0;
        cc.YL.addClock(this.tips);
        GD.sound.setShowTips(this.tips, true);
        cc.YL.unLockTouch();

        let keyboard_full_yellow = this.node.getChildByName('keyboard_full_yellow');
        this.keyBoard = keyboard_full_yellow.getComponent('keyBoardCtrl');
        this.keyBoard.init((key) => {
            console.log(key);
            parseInt(key) == this.rightAnswer ? this.showRight() : this.showWrong();
        })
        this.keyBoard.showKeyBoard();
    },

    showRight() {
        cc.YL.lockTouch();
        GD.sound.playSound('right');
        GD.root.showStar(this.keyBoard.getKey(), () => {
            this.showAnswerTips();
        })
    },

    showWrong() {
        GD.sound.playSound('wrong');
        GD.sound.playSound('blank');
        let key = this.keyBoard.getKey();

        cc.tween(key).then(this.blink(2)).call(() => { this.keyBoard.clearKeyBoard() }).start();
        this.setError();
    },

    blink(num) {
        let action = cc.tween().to(0.2, { opacity: 0 }).to(0.2, { opacity: 255 });
        if (num) {
            return cc.tween().repeat(num, action)
        } else {
            return cc.tween().repeatForever(action)
        }
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
        this.keyBoard.setKey(this.rightAnswer);
        GD.root.showStar(this.keyBoard.getKey(), () => {
            this.showAnswerTips();
        })
    },

    showAnswerTips() {
        GD.sound.playTips(this.errorTips, () => {
            setTimeout(() => {
                GD.root.showAddStar(GD.root.getStarNum(this._errorCount), () => {
                    this.showFinishLayer();
                })
            }, 500);
        });
        this.teachNodes.forEach((pNode) => {
            cc.tween(pNode)
                .delay(0)
                .then(cc.YL.aMgr.zoomAction(2))
                .start()
        });

    },

    showFinishLayer() {
        //此环节完成 注销所有事件
        cc.YL.emitter.emit('continueGame');
    },
});
