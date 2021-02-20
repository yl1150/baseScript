//选择选项对应的脚本 
cc.Class({
    extends: cc.Component,

    properties: {
        tips: cc.String,
        isTransition: false,
        rightAnswer: [cc.Node]
    },

    // LIFE-CYCLE CALLBACKS:

    init(asset) {
        this._errorCount = 0;
        this.opPool = [];
        this.posPool = [];
        this.hand = this.node.getChildByName('shou');
        this.checkBtn = this.node.getChildByName('checkBtn').getComponent(cc.Button);
        this._options = this.node.getChildByName('options');
        let id = 0;
        this._options.children.forEach((op) => {
            this.opPool.push(op);
            op.opID = id++;
            this.posPool.push(op.position);
            op.getComponent('options').init(this);
        })
        this.registerEvent();
    },

    hideHand() {
        if (this.hand) this.hand.active = false;
    },

    //注册事件
    registerEvent() {
        cc.YL.emitter.on('startGame', (e) => {
            this.showGame();
        })
    },

    moveOp(self, other) {
        let other_id = other.opID;
        let self_id = self.opID;

        self.opID = other_id;
        if (self_id > other_id) {
            for (let i in this.opPool) {
                if (this.opPool[i].opID >= other_id && this.opPool[i] != self && this.opPool[i].opID <= self_id) {
                    this.opPool[i].opID += 1;
                }
            }
        }
        if (self_id < other_id) {
            for (let i in this.opPool) {
                if (this.opPool[i].opID <= other_id && this.opPool[i] != self && this.opPool[i].opID >= self_id) {
                    this.opPool[i].opID -= 1;
                }
            }
        }

        for (let i in this.opPool) {
            let id = this.opPool[i].opID;
            this.opPool[i].zIndex = id;
            if(self != this.opPool[i]){
                cc.tween(this.opPool[i])
                .to(0.25, { position: this.posPool[id] })
                .start()
            }
        }
    },

    putOP(self, other) {
        /*    let other_id = other.opID;
           let self_id = self.opID;
   
           self.opID = other_id;
           if (self_id > other_id) {
               for (let i in this.opPool) {
                   if (this.opPool[i].opID >= other_id && this.opPool[i] != self && this.opPool[i].opID <= self_id) {
                       this.opPool[i].opID += 1;
                   }
               }
           }
           if (self_id < other_id) {
               for (let i in this.opPool) {
                   if (this.opPool[i].opID <= other_id && this.opPool[i] != self && this.opPool[i].opID >= self_id) {
                       this.opPool[i].opID -= 1;
                   }
               }
           } */

        for (let i in this.opPool) {
            let id = this.opPool[i].opID;
            this.opPool[i].zIndex = id;
            cc.tween(this.opPool[i])
                .to(0.25, { position: this.posPool[id] })
                .start()
        }
        this.checkBtn.interactable = true;
    },

    unregisterEvent() {
        cc.YL.emitter.off('startGame');
    },

    showGame() {
        GD.sound.setTipsButton(true);
        GD.sound.setShowTips(this.tips, true);
        cc.YL.unLockTouch();
    },

    check() {
        for (let i in this.rightAnswer) {
            if (this._options.children[i] != this.rightAnswer[i]) {
                GD.sound.playSound('wrong');
                GD.sound.playSound('blank');
                this.setError();
                return;
            }
        }
        GD.sound.playSound('right');
        GD.root.showStar(this._options, () => {
            GD.root.showAddStar(GD.root.getStarNum(this._errorCount), () => {
                this.showFinishLayer();
            })
        });
        this.checkBtn.node.active = false;
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
        this.checkBtn.interactable = false;
    },

    showRightAnswer() {
        //展示正确答案
        for (let i in this.rightAnswer) {
            cc.tween(this.rightAnswer[i])
                .to(0.25, { position: this.posPool[i] })
                .start()
        }
        GD.root.showStar(this._options, () => {
            GD.root.showAddStar(GD.root.getStarNum(this._errorCount), () => {
                this.showFinishLayer();
            })
        });
        cc.YL.lockTouch();
    },

    showFinishLayer() {
        this.checkBtn.node.active = false;
        //此环节完成 注销所有事件
        this.unregisterEvent();
        cc.YL.emitter.emit('continueGame');
        this.node.destroy();
    },
});
