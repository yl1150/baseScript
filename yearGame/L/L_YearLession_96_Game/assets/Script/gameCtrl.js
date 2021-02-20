//选择选项对应的脚本 
cc.Class({
    extends: cc.Component,

    properties: {
        tips: cc.String,
        options: cc.Node,
        rightNode: cc.Node,
    },

    // LIFE-CYCLE CALLBACKS:

    init() {
        this.light = this.node.getChildByName('guang').getComponent(sp.Skeleton);
        this._errorCount = 0;
        this.registerEvent();
    },


    //注册事件
    registerEvent() {
        cc.YL.emitter.on('startGame', (e) => {
            this.showGame();
        })
    },

    unregisterEvent() {
        cc.YL.emitter.off('startGame');
        let duihua = this.node.getChildByName('labas');
        duihua.children.forEach((laba) => {
            laba.getComponent('laba').unregisterEvent();
        });
    },

    setTouch(target, isShow) {
        this.light.node.active = isShow;
        let pos = cc.YL.tools.getRelativePos(target, this.node);
        this.light.node.x = pos.x;
        this.light.setAnimation(0, 'animation_1', true);
    },

    showGame() {
        //展示对应动画
        this.options.active = true;
        this.options.children.forEach(op => {
            cc.YL.tools.registerTouch(
                op,
                (e) => {
                    // e.target.setScale(1.2);
                    this.setTouch(e.target, true);
                },
                null,
                (e) => {
                    //e.target.setScale(1);
                    if (this.rightNode == e.target) {
                        this.showRight();
                    } else {
                        GD.sound.playSound('wrong');
                        GD.sound.playSound('blank');
                        this.setError();
                        this.setTouch(e.target, false);
                        cc.tween(e.target)
                            .then(cc.YL.aMgr.SHAKING_X)
                            .start()
                    }
                },
            );
        });


        GD.sound.setTipsButton(true);
        GD.sound.setShowTips(this.tips, true, () => {
            this.showKisSpeak();
            cc.YL.unLockTouch();
        });
        cc.YL.lockTouch();
    },

    showKisSpeak(finishCB) {
        let duihua = this.node.getChildByName('labas');
        duihua.active = true;
        //展示说话
        let showSpeak = (arr, cb) => {
            if (arr.length < 1) {
                cb && cb();
                return;
            }
            let pNode = arr.shift();
            pNode.active = true;

            //初始化喇叭组件
            let laba = pNode.getComponent('laba');
            laba.init();
            laba.playTips(() => {
                showSpeak(arr, cb);
            });
        };

        duihua.children.forEach((laba) => {
            laba.getComponent('laba').init();
        });


        showSpeak(cc.YL.tools.arrCopy(duihua.children), finishCB);
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
        this.setTouch(this.rightNode, true);
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
        this.setTouch(this.rightNode, true);
        GD.root.showStar(this.rightNode, () => {
            GD.root.showAddStar(GD.root.getStarNum(this._errorCount), () => {
                this.showFinishLayer();
            })
        });
        cc.YL.lockTouch();
    },

    showFinishLayer() {
        //此环节完成 注销所有事件
        let duihua = this.node.getChildByName('labas');
        duihua.active = false;
        GD.sound.setTipsButton(false);
        this.unregisterEvent();
        this.options.children.forEach(op => {
            this.setTouch(this.rightNode, false);
            cc.YL.tools.unRegisterTouch(op)
        });
        this.options.active = false;
        cc.YL.timeOut(() => {
            cc.YL.emitter.emit('continueGame');
            this.node.destroy();
        }, 1000);
    },
});
