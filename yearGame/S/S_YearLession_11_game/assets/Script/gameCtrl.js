//选择选项对应的脚本 
cc.Class({
    extends: cc.Component,

    properties: {
        tips: cc.String,
        rightNode: cc.Node,
        realAniaml: [sp.Skeleton]
    },

    // LIFE-CYCLE CALLBACKS:

    init(asset) {
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
    },

    setTouch(target, isShow) {
        let touchImg = target.getChildByName('touchImg');
        if (!touchImg) {
            return;
        }
        touchImg.active = isShow;
    },

    showGame() {
        this.shadow_Animal = this.node.getChildByName('shadow_Animal');


        this.options = this.node.getChildByName('options');
        this.options.children.forEach(op => {
            cc.YL.tools.registerTouch(
                op,
                (e) => {
                    //e.target.setScale(1.2);
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
            )
        });


        cc.YL.emitter.emit('showLight', () => {
            //展示跳舞动画
            GD.sound.playSound('dance');
            this.shadow_Animal.active = true;
            this.shadow_Animal.children.forEach((kid) => {
                let ske = kid.getComponent(sp.Skeleton);
                ske.setSkin('b1');
                ske.setAnimation(0, 'newAnimation_2', true);
            });

           

            //4s 后播放题目
            cc.YL.timeOut(() => {
                this.shadow_Animal.children.forEach((kid) => {
                    let ske = kid.getComponent(sp.Skeleton);
                    ske.setAnimation(0, 'newAnimation_1', true);
                });
                this.options.active = true;
                this.options.y -= 1000;
                cc.tween(this.options)
                    .by(1, { y: 1000 })
                    .start()
                GD.sound.setTipsButton(true);
                GD.sound.setShowTips(this.tips, true);
                cc.YL.unLockTouch();
            }, 4000)
        });
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
            this.showFinishLayer();
        });
        cc.YL.lockTouch();
    },


    showRightAnswer() {
        //展示正确答案
        this.setTouch(this.rightNode, true);
        GD.root.showStar(this.rightNode, () => {
            this.showFinishLayer();
        });
        cc.YL.lockTouch();
    },

    showFinishLayer() {
        //此环节完成 注销所有事件
        //幕布打开 动物跳舞
        this.shadow_Animal.active = false;
        cc.YL.emitter.emit('openCurtain');

        //展示跳舞动画
        for(let i in this.realAniaml){
            this.realAniaml[i].node.active = true;
            this.realAniaml[i].setSkin('a1');
            this.realAniaml[i].setAnimation(0, 'newAnimation', true);
        }



        //一段时间后 合上幕布结束本轮

        let time = 2;

        cc.YL.timeOut(() => {
            GD.sound.playSound('dance');
            for(let i in this.realAniaml){
                this.realAniaml[i].setAnimation(0, 'newAnimation_2', true);
            }
        }, time * 1000)

        time += 4

        cc.YL.timeOut(() => {
            cc.YL.emitter.emit('closeCurtain');
        }, time * 1000)

        time += 1;

        cc.YL.timeOut(() => {
            GD.sound.stopTips();
            GD.root.showAddStar(GD.root.getStarNum(this._errorCount), () => {
                for(let i in this.realAniaml){
                    this.realAniaml[i].node.active = false;
                }
                cc.YL.emitter.emit('continueGame');
                this.node.destroy();
            })
        }, time * 1000)

        this.unregisterEvent();
        this.options.active = false;
    },
});
