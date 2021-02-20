//选择选项对应的脚本 
cc.Class({
    extends: cc.Component,

    properties: {
        tips: cc.String,
        sum: cc.Node,
        kidSke: sp.Skeleton,
        rightAnswer: cc.String,
    },

    // LIFE-CYCLE CALLBACKS:

    init() {
        let gKeyBoard = this.node.getChildByName('gKeyBoard').getComponent('keyBoardCtrl');
        let key = this.sum.getComponent('baseKey');
        key.init();

        gKeyBoard.init();
        gKeyBoard.setTouchCallFunc((data) => {
            console.log('key');
            if (data.key == 'enter') {
                //检测正误
                if (key.getKeys() == this.rightAnswer) {
                    GD.sound.playSound('right');
                    GD.root.showStar(this.sum, () => {
                        GD.root.showAddStar(GD.root.getStarNum(this._errorCount), () => {
                            this.showFinishLayer();
                        })
                    });
                    cc.YL.lockTouch();
                } else {
                    GD.sound.playSound('wrong');
                    GD.sound.playSound('blank');
                    this.setError();
                    key.setKey('?');
                    gKeyBoard.setBtn();
                }
            }
        });
        gKeyBoard.setBindKey(key);
        gKeyBoard.setBtn();
        this._errorCount = 0;
        this.registerEvent();
        this._gKeyBoard = gKeyBoard;

    },


    //注册事件
    registerEvent() {
        cc.YL.emitter.on('startGame', (e) => {
            this.showGame();
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
        GD.sound.setTipsButton(true);
        GD.sound.setShowTips(this.tips, true);
        cc.YL.unLockTouch();
        this.kidSke.node.active = true;
        this.kidSke.setAnimation(0, 'in', false);
        this.kidSke.addAnimation(0, 'jiayou', false);
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

    showRight() {
        this.sum.getComponent('baseKey').setKey(this.rightAnswer);
        GD.sound.playSound('right');
        GD.root.showStar(this.rightNode, () => {
            GD.root.showAddStar(GD.root.getStarNum(this._errorCount), () => {
                this.showFinishLayer();
            })
        });
        cc.YL.lockTouch();
    },


    showRightAnswer() {
        //展示正确答案
        this.sum.getComponent('baseKey').setKey(this.rightAnswer);
        GD.root.showStar(this.sum, () => {
            GD.root.showAddStar(GD.root.getStarNum(this._errorCount), () => {
                this.showFinishLayer();
            })
        });
        cc.YL.lockTouch();
    },

    showFinishLayer() {
        //此环节完成 注销所有事件
        let power = this.node.getChildByName('power').getComponent(sp.Skeleton);
        this.kidSke.setAnimation(0, 'jiayou2', true);


        power.node.active = true;
        power.setAnimation(0, 'zhang_a1', false);
        power.setCompleteListener(() => {
            power.setCompleteListener(null);
            this.kidSke.setAnimation(0, 'jiayou3', false);
            this.kidSke.addAnimation(0, 'out', false);
            cc.YL.timeOut(() => {
                GD.sound.playSound('plane');
            }, 1500);
        })

        this.unregisterEvent();
        cc.YL.timeOut(() => {
            cc.YL.emitter.emit('continueGame');
            this.node.destroy();
        }, 5000);
    },
});
