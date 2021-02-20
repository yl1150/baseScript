//选择选项对应的脚本 
cc.Class({
    extends: cc.Component,

    properties: {
        tips: cc.String,
        isTransition: false,
        rightAnswer: [cc.Node]
    },

    // LIFE-CYCLE CALLBACKS:

    init() {
        this._errorCount = 0;
        this.opPool = [];
        this._options = this.node.getChildByName('options');
        this._options.children.forEach((op) => {
            this.opPool.push(op);
            op.getComponent('options').init();
        })
        this.boxs = this.node.getChildByName('boxs');
        this.registerEvent();
    },

    //注册事件
    registerEvent() {
        cc.YL.emitter.on('startGame', (e) => {
            this.showGame();
        })

        cc.YL.emitter.on('check', (e) => {
            this.check();
        })

        cc.YL.emitter.on('setError', (e) => {
            this.setError();
        })

        cc.YL.emitter.on('setXuxian', (isShow) => {
            this.boxs.children.forEach((box) => {
                if (box.childrenCount > 1) {
                    box.active = true;
                    box.getChildByName('faguang').active = true;
                    box.getComponent(cc.BoxCollider).enabled = false;
                    box.getComponent(cc.Sprite).enabled = false;
                } else {
                    box.active = isShow;
                    box.getComponent(cc.BoxCollider).enabled = isShow;
                    box.getComponent(cc.Sprite).enabled = isShow;
                }
            });
        })
    },

    unregisterEvent() {
        cc.YL.emitter.off('startGame');
        cc.YL.emitter.off('check');
        cc.YL.emitter.off('setError');
        cc.YL.emitter.off('setXuxian');
    },

    showGame() {
        GD.sound.setTipsButton(true);
        GD.sound.setShowTips(this.tips, true);
        cc.YL.unLockTouch();
    },

    check() {
        let isAllPut = true;
        this.boxs.children.forEach((box) => {
            if (box.childrenCount == 1) isAllPut = false;
        });
        if (!isAllPut) {
            return;
        }
        cc.YL.timeOut(() => {
            GD.root.showAddStar(GD.root.getStarNum(this._errorCount), () => {
                this.showFinishLayer();
            })
        }, 1000);
        cc.YL.lockTouch();
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
        let arr = cc.YL.tools.arrCopy(this._options.children);
        this.boxs.children.forEach((box) => {
            if (box.childrenCount == 1) {
                box.active = true;
                box.getComponent(cc.BoxCollider).enabled = false;
                box.getComponent(cc.Sprite).enabled = false;
                let type = box.getComponent('box').getType();
                for (let i in arr) {
                    var op_com = arr[i].getComponent('options');
                    if (op_com.opType == type) {
                        op_com.showRightAnswer(box);
                        arr.splice(i, 1);
                        break;
                    }
                }
            }
        });
        GD.root.showStar(this.boxs, () => {
            GD.root.showAddStar(GD.root.getStarNum(this._errorCount), () => {
                this.showFinishLayer();
            })
        });
        cc.YL.lockTouch();
    },

    showFinishLayer() {
        //此环节完成 注销所有事件
        this.unregisterEvent();
        this.node.active = false;
        cc.YL.emitter.emit('continueGame');
        this.node.destroy();
    },
});
