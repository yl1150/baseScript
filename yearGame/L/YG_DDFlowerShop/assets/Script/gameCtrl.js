//选择选项对应的脚本 
cc.Class({
    extends: cc.Component,

    properties: {
        isFitPhone: true
    },

    // LIFE-CYCLE CALLBACKS:

    init(asset) {
        this.registerEvent();
        this._errorCount = 0;
        //生成随机空格
        this.board = this.node.getChildByName('board');
        this.optionsPool = this.board.getChildByName('pool');
        this.optionsBoard = this.node.getChildByName('optionsBoard');
        this.options = this.optionsBoard.getChildByName('options');


        this.missOpArr = [];
        let setOp = (qNode, op) => {
            let frame = qNode.getComponent(cc.Sprite).spriteFrame;
            qNode.getComponent(cc.Sprite).spriteFrame = asset.getSpriteFrame('xuxian')
            qNode._state = 'init';
            let box = qNode.addComponent(cc.BoxCollider);
            box.size.width = qNode.width;
            box.size.height = qNode.height;
            box.tag = 99;

            op.getComponent('options').init(this, qNode, frame);
            this.missOpArr.push(qNode);
        }

        console.log(this.optionsPool)
        let arr = this.options.children;
        let pool = this.getRandomPool(cc.YL.tools.arrCopy(this.optionsPool.children), arr.length)
        for (let i = 0; i < arr.length; i++) {
            setOp(pool[i], arr[i]);
        }


        if (this.node.scaleX < 1 && this.isFitPhone) {
            this.board.y -= (1 - this.node.scaleX) / 2 * this.board.height;
            this.optionsBoard.y -= (1 - this.node.scaleX) / 2 * this.optionsBoard.height;
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

        //检测数据是否有相同的元素
        let checkIsSame = function (arr) {
            for (let i = 0; i < arr.length; i++) {
                for (let j = 0; j < arr.length; j++) {
                    if (i != j) {
                        if (arr[i].name == arr[j].name) {
                            console.log('不可以重复')
                            console.log(arr[i].name ,arr[j].name)
                            return true;
                        }
                    }
                }
            }
            return false;
        };

        let r_arr = getPool(cc.YL.tools.arrCopy(target_Arr));
        while (checkIsUesd(GD.miss_op_pool, r_arr) || checkIsSame(r_arr)) {
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

    unregisterEvent() {
        cc.YL.emitter.off('startGame');
    },

    showGame() {
        console.log('startGame')
        this.options.active = true;
        this.optionsBoard.active = true;
        GD.sound.setTipsButton(true);
        GD.sound.setShowTips('tips', true);
        cc.YL.unLockTouch();
    },


    checkIsAllRight() {
        let isAllRight = true;
        this.missOpArr.forEach((op) => {
            op._state == 'init' && (isAllRight = false);
        });

        if (isAllRight) {
            cc.YL.lockTouch();
            this.optionsBoard.active = false;
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
        this.optionsBoard.active = false;
        this.unregisterEvent();
        GD.root.showAddStar(GD.root.getStarNum(this._errorCount), () => {
            cc.YL.timeOut(() => {
                cc.YL.emitter.emit('continueGame');
            }, 500)

            cc.YL.timeOut(() => {
                this.node.destroy();
            }, 2000)
        })
    },
});
