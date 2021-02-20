//选择选项对应的脚本 
cc.Class({
    extends: cc.Component,

    properties: {
        tips: cc.String,
        tipsAnimal: sp.Skeleton,
        isTransition:true
    },

    // LIFE-CYCLE CALLBACKS:

    init() {
        this._errorCount = 0;
        this.speakPool = [];
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

    showGame() {
        let pwindows = this.node.getChildByName('windows');
        let animals = this.node.getChildByName('animals');
        this.animals = animals;
        //展示窗户打开动画
        let time = 0.3;
        pwindows.children.forEach((pw) => {
            pw.getComponent(sp.Skeleton).setAnimation(0, 'animation', false);
        });

        //动物出现说话
        cc.YL.timeOut(() => {
            animals.children.forEach((kid) => {
                kid.active = true;
                kid.getComponent(sp.Skeleton).setAnimation(0, 'animation2', false);
            });
        }, time * 1000)

        time += 0.7;
        cc.YL.timeOut(() => {
            this.showQuestion();
            GD.sound.setTipsButton(true);
            cc.YL.unLockTouch();
            this.tipsAnimal && this.tipsAnimal.setAnimation(0, 'animation4', true);
            GD.sound.setShowTips(this.tips, true, () => {
                this.tipsAnimal && this.tipsAnimal.setAnimation(0, 'animation3', true);
            });
        }, time * 1000);
    },

    showQuestion() {
        let optionBoard = this.node.getChildByName('optionBoard');
        let opBgs = optionBoard.getChildByName('opBgs');
        let options = optionBoard.getChildByName('options');
        let labas = optionBoard.getChildByName('labas');

        options.children.forEach((op) => {
            op.getComponent('options').init(this);
        })

        this.labas = labas;
        this.options = options;
        optionBoard.active = true;
        return;
        //选项依次出现
        let showAppear = function (pNode) {
            let time = 0;
            pNode.children.forEach((kid) => {
                kid.setScale(0);
                cc.tween(kid)
                    .delay(time)
                    .to(0.5, { scale: 1 })
                    .start()
                time += 0.5;
            })
        };
        showAppear(opBgs);
        showAppear(options);
        showAppear(labas);


        cc.YL.timeOut(() => {
            let labaArr = cc.YL.tools.arrCopy(labas.children);
            let showTips = function (arr) {
                if (arr.length < 1) {
                    return;
                }
                let laba = arr.shift();
                laba.getComponent('laba').playTips(() => {
                    showTips(arr);
                })
            };
            showTips(labaArr);
        }, 2000)

    },

    putOp(op) {
        let arr = this.options.children;
        //let arr2 = this.labas.children;
        for(let i in arr){
            if(arr[i] == op){
                /* let laba = arr2[i];
                laba.parent = null;
                laba.destroy(); */
                return;
            }
        }
    },

    checkIsAllRight() {
        if (this.options.childrenCount < 1) {
            cc.YL.lockTouch();
            cc.YL.timeOut(() => {
                this.showFinishLayer();
            }, 1000)
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
        let arr = cc.YL.tools.arrCopy(this.options.children);
        arr.forEach((op) => {
            op.getComponent('options').showRightAnswer();
        })
        GD.root.showStar(this.options, () => {
            this.showFinishLayer();
        });
        cc.YL.lockTouch();
    },

    showFinishLayer() {
        //此环节完成 注销所有事件
        this.unregisterEvent();
        this.node.getChildByName('optionBoard').active = false;
        this.animals.children.forEach((kid) => {
            kid.getComponent(sp.Skeleton).setAnimation(0, 'animation4', true);
        })
        GD.sound.playTips('thanks', () => {
            this.animals.children.forEach((kid) => {
                kid.getComponent(sp.Skeleton).setAnimation(0, 'animation3', true);
            })
            GD.root.showAddStar(GD.root.getStarNum(this._errorCount), () => {
                cc.YL.emitter.emit('continueGame');
                cc.YL.timeOut(()=>{
                    this.node.destroy();
                },2000)
            })
        })

    },
});
