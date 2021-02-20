//选择选项对应的脚本 
cc.Class({
    extends: cc.Component,

    properties: {
        tips: cc.String,
        ballAni: cc.String,
        winKids: [cc.Node],
        loseKids: [cc.Node],
        rightAnswers: [cc.String]
    },

    // LIFE-CYCLE CALLBACKS:

    init(asset) {
        this.pointList = this.node.getChildByName('pointList');
        this.checkBtn = this.node.getChildByName('checkBtn').getComponent(cc.Button);
        this._errorCount = 0;
        this.registerEvent();
    },


    //注册事件
    registerEvent() {
        cc.YL.emitter.on('startGame', (e) => {
            this.showGame();
        })
    },

    initPoint(){
        let arr = this.pointList.children;
        arr.forEach((kid) => {
            let ske = kid.getComponent(sp.Skeleton);
            ske.setAnimation(0, 'shu_wen', true);
            kid.exPoint = -1;
        });
    },

    reFreshPoint(data) {
        //刷新比分
        let arr = this.pointList.children;
        arr.forEach((kid) => {
            let ske = kid.getComponent(sp.Skeleton);
            let tPoint = data.shift();
            if (tPoint > 10) {
                kid.exPoint = 0;
                ske.setAnimation(0, 'shu_' + 10 + '_' + 0, false);
                return
            }
            if (kid.exPoint >= tPoint) return;
            ske.setAnimation(0, 'shu_' + (kid.exPoint == -1 ? 'wen' : kid.exPoint) + '_' + (kid.exPoint + 1), false);
            kid.exPoint++
            for (; kid.exPoint < tPoint; kid.exPoint++) {
                ske.addAnimation(0, 'shu_' + kid.exPoint + '_' + (kid.exPoint + 1), false);
            }
        });
    },

    unregisterEvent() {
        cc.YL.emitter.off('startGame');

        let duihua = this.node.getChildByName('duihua');
        duihua.children.forEach((kuang) => {
            kuang.getComponent('laba').unregisterEvent();
        });
    },

    setTouch(target, isShow) {
        let touchImg = target.getChildByName('touchImg');
        if (!touchImg) {
            target.getComponent(cc.Sprite).enabled = isShow;
            return;
        }
        touchImg.active = isShow;
    },

    //展示玩球动画
    showPlayBall(cb) {
        let kids = this.node.getChildByName('kids');
        let ballSke = this.node.getChildByName('ball').getComponent(sp.Skeleton);
        ballSke.node.active = true;
        ballSke.setEventListener((trackEntry, event) => {
            console.log(event.data.name);
            if (event.data.name == 'ku') {
                //展示失败和开心动画
                this.winKids.forEach((kid) => {
                    let ske = kid.getComponent(sp.Skeleton);
                    ske.setAnimation(0, 'animation_3', true);
                });
                this.loseKids.forEach((kid) => {
                    let ske = kid.getComponent(sp.Skeleton);
                    ske.setAnimation(0, 'animation_4', true);
                });
            } else {
                let ske = kids.getChildByName(event.data.name).getComponent(sp.Skeleton);
                ske.setAnimation(0, 'animation_2', false);
                ske.addAnimation(0, 'animation_1', true);
            }
        })
        ballSke.setAnimation(0, this.ballAni, false);

        ballSke.setCompleteListener(() => {
            //玩球结束 
            this.winKids.forEach((kid) => {
                let ske = kid.getComponent(sp.Skeleton);
                ske.setAnimation(0, 'animation_1', true);
            });
            this.loseKids.forEach((kid) => {
                let ske = kid.getComponent(sp.Skeleton);
                ske.setAnimation(0, 'animation_1', true);
            });
            cb && cb();
        })
    },

    showKisSpeak(finishCB) {
        let duihua = this.node.getChildByName('duihua');
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

        showSpeak(cc.YL.tools.arrCopy(duihua.children), finishCB);
    },


    showGame() {
        let kids = this.node.getChildByName('kids');
        //展示对应动画
        this.showPlayBall(() => {
            //展示语音
            this.showKisSpeak(() => {
                GD.sound.setTipsButton(true);
                GD.sound.setShowTips(this.tips, true);
                cc.YL.unLockTouch();
                let arr = this.pointList.children;
                this.pointList.active = true;
                this.checkBtn.node.active = true;
                arr.forEach((kid) => {
                    kid.exPoint = -1;
                    cc.YL.tools.registerTouch(
                        kid,
                        (e) => {
                            // e.target.setScale(1.2);
                        },
                        null,
                        (e) => {
                            //e.target.setScale(1);
                            let data = [];
                            this.checkBtn.interactable = true;
                            arr.forEach((pnode) => {
                                if (pnode == e.target) {
                                    data.push(pnode.exPoint + 1);
                                } else {
                                    data.push(pnode.exPoint);
                                }
                            });
                            data.forEach((da) => {
                                if (da < 0) this.checkBtn.interactable = false;
                            });
                            this.reFreshPoint(data);
                        },
                    );
                });
            })
        });
    },

    checkIsRight() {
        let arr = [];
        this.pointList.children.forEach((kid) => {
            arr.push(kid.exPoint);
        });

        if (cc.YL.tools.checkArrIsSameStrict(arr, this.rightAnswers)) {
            //全部选完
            cc.YL.lockTouch();
            GD.sound.playSound('right');
            GD.root.showStar(this.pointList, () => {
                GD.root.showAddStar(GD.root.getStarNum(this._errorCount), () => {
                    this.showFinishLayer();
                })
            });
        } else {
            this.checkBtn.interactable = false;
            GD.sound.playSound('wrong');
            GD.sound.playSound('blank');
            this.setError();
            this.initPoint();
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
        this.reFreshPoint(this.rightAnswers);
        GD.root.showStar(this.pointList);
        cc.YL.lockTouch();
        cc.YL.timeOut(()=>{
            GD.root.showAddStar(GD.root.getStarNum(this._errorCount), () => {
                this.showFinishLayer();
            })
        },4000)
    },

    showFinishLayer() {
        //此环节完成 注销所有事件
        this.unregisterEvent();
        cc.YL.emitter.emit('continueGame');
        this.node.destroy();
    },
});
