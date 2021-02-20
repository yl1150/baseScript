//选择选项对应的脚本 
cc.Class({
    extends: cc.Component,

    properties: {
        tips: cc.String,
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
        this.boxs = this.node.getChildByName('guantou');
        this.registerEvent();

        this.node.getChildByName('labas').children.forEach((laba) => {
            laba.getComponent('laba').init();
        });
    },

    //注册事件
    registerEvent() {
        cc.YL.emitter.on('startGame', (e) => {
            this.showGame();
        })

        cc.YL.emitter.on('check', (e) => {
            this.check();
        })
    },

    unregisterEvent() {
        cc.YL.emitter.off('startGame');
        cc.YL.emitter.off('check');

        let duihua = this.node.getChildByName('labas');
        duihua.children.forEach((laba) => {
            laba.getComponent('laba').unregisterEvent();
        });
    },

    showGame() {
        GD.sound.setTipsButton(true);
        GD.sound.setShowTips(this.tips, true, () => {
            this.showKisSpeak();
        });
        cc.YL.unLockTouch();
    },

    showKisSpeak(finishCB) {
        let duihua = this.node.getChildByName('labas');
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

    check() {
        let isAllPut = true;
        this.boxs.children.forEach((box) => {
            if (box.childrenCount == 1) isAllPut = false;
        });
        if (!isAllPut) {
            return;
        }
        let isRight = true;
        this.opPool.forEach((op) => {
            if (op.getComponent('options').isRight()) {
                isRight = false;
            }
        });
        if (isRight) {
            GD.sound.playSound('right');
            GD.root.showStar(this.boxs, () => {
                GD.root.showAddStar(GD.root.getStarNum(this._errorCount), () => {
                    this.showFinishLayer();
                })
            });
            cc.YL.lockTouch();
        } else {
            GD.sound.playSound('wrong');
            GD.sound.playSound('blank');
            this.setError();
            this.opPool.forEach((op) => {
                op.getComponent('options').showBack();
            });
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
        this.opPool.forEach((op) => {
            op.getComponent('options').showRightAnswer();
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
        let duihua = this.node.getChildByName('labas');
        duihua.active = false;
        GD.sound.setTipsButton(false);
        //展示无人机
        this.boxs.active = false;
        let plane = this.node.getChildByName('plane');
        plane.active = true;
        plane.children.forEach((kid) => {
            kid.getComponent(sp.Skeleton).setAnimation(0, 'animation2', false);
        });

        cc.YL.timeOut(() => {
            cc.tween(plane)
                .by(1, { x: 3000 })
                .call(() => {
                    this.node.active = false;
                    cc.YL.emitter.emit('continueGame');
                    this.node.destroy();
                })
                .start()
        }, 1000)

        this.unregisterEvent();
    },
});
