//选择选项对应的脚本 
cc.Class({
    extends: cc.Component,

    properties: {
        tips:'',
        isRandomOp: false,
        showGetGift: ''
    },

    // LIFE-CYCLE CALLBACKS:

    init() {
        cc.YL.fitPhone(this.node);
        this.registerEvent();
        this._errorCount = 0;
        //生成随机空格
        this.optionsPool = this.node.getChildByName('optionsPool');
        this.options = this.node.getChildByName('options');
        this.missOpArr = [];

        if (this.isRandomOp) {
            let setOp = (qNode, op) => {
                let xuxian = qNode.getChildByName('xuanxuxian');
                xuxian.active = true;
                let q_frame = qNode.getChildByName('frame');
                q_frame.active = false;
                qNode._state = 'init';
                qNode.getComponent(cc.Sprite).enabled = false;
                let box = qNode.addComponent(cc.BoxCollider);
                box.size.width = qNode.width;
                box.size.height = qNode.height;
                box.tag = 99;

                op.getChildByName('frame').getComponent(cc.Sprite).spriteFrame = q_frame.getComponent(cc.Sprite).spriteFrame;
                op.getComponent('options').init(this, qNode);
                this.missOpArr.push(qNode);
            }

            console.log(this.optionsPool)
            let arr = this.options.children;
            let pool = this.getRandomPool(cc.YL.tools.arrCopy(this.optionsPool.children), arr.length)
            for (let i = 0; i < arr.length; i++) {
                setOp(pool[i], arr[i]);
            }
        } else {
            this.optionsPool.children.forEach((op) => {
                !op.getComponent(cc.Sprite).enabled && this.missOpArr.push(op);
            });

            let arr = this.options.children;
            for (let i = 0; i < arr.length; i++) {
                this.missOpArr[i]._state = 'init';
                let box = this.missOpArr[i].addComponent(cc.BoxCollider);
                box.size.width = this.missOpArr[i].width;
                box.size.height = this.missOpArr[i].height;
                box.tag = 99;
                arr[i].getComponent('options').init(this);
            }
        }
    },

    getRandomPool(target_Arr, length) {
        let getPool = (a_arr) => {
            let arr = [];
            for (let i = 0; i < length; i++) {
                arr.push(cc.YL.tools.popRandomCell(a_arr));
            }
            return arr;
        }
        let checkIsUesd = function (arr1, arr2) {
            for (let i in arr1) {
                if (cc.YL.tools.checkArrIsSame(arr1[i], arr2)) return true;
            }
            return false;
        };
        let r_arr = getPool(cc.YL.tools.arrCopy(target_Arr));
        while (checkIsUesd(GD.miss_op_pool, r_arr)) {
            r_arr = getPool(cc.YL.tools.arrCopy(target_Arr));
        }
        return r_arr;
    },

    //注册事件
    registerEvent() {
        cc.YL.emitter.on('startGame', (e) => {
            this.showGame();
        })
    },

    onDestroy() {
        cc.YL.emitter.off('startGame');
    },

    showGame() {
        console.log('startGame')
        this.options.active = true;
        GD.sound.setTipsButton(true);
        GD.sound.setShowTips(this.tips, true);
        cc.YL.unLockTouch();
    },


    checkIsAllRight() {
        let isAllRight = true;
        this.missOpArr.forEach((op) => {
            op._state == 'init' && (isAllRight = false);
        });

        if (isAllRight) {
            cc.YL.lockTouch();
            cc.YL.timeOut(() => { this.showFinishLayer() }, 1000)
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

    passLv() {
        if (this._stagelv >= this.maxLv) {
            this.showFinishLayer();
        } else {
            this._stageNode.active = false;
            this._stagelv++;
            this.showGame();
        }
    },

    showRightAnswer() {
        //展示正确答案
        cc.YL.lockTouch();
        this.options.children.forEach((op) => {
            op.getComponent('options').showRightAnswer();
        });
        GD.root.showStar(this.optionsPool, () => {
            this.showFinishLayer();
        })
    },

    showFinishLayer() {
        //此环节完成 注销所有事件
        GD.root.showAddStar(GD.root.getStarNum(this._errorCount), () => {
            if (this.showGetGift != '') {
                cc.YL.emitter.emit('showGetGift', this.showGetGift);
                cc.YL.timeOut(() => {
                    cc.YL.emitter.emit('continueGame');
                }, 2500)
    
                cc.YL.timeOut(() => {
                    this.node.destroy();
                }, 4000)
            } else {
                cc.YL.timeOut(() => {
                    cc.YL.emitter.emit('continueGame');
                }, 500)
    
                cc.YL.timeOut(() => {
                    this.node.destroy();
                }, 2000)
            }
        })
       
    },
});
