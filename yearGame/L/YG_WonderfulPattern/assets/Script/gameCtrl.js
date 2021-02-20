//选择选项对应的脚本 
cc.Class({
    extends: cc.Component,

    properties: {
        tips: cc.String,
        opNum: 3,
        rule: [cc.Integer]
    },

    // LIFE-CYCLE CALLBACKS:

    init(asset) {
        this.registerEvent();
        this._errorCount = 0;
        //生成随机空格
        this.optionsPool = [];
        this.wrongPool = [];
        this.missOpArr = [];

        this.checkBtn = this.node.getChildByName('checkBtn');
        this.optionsBoard = this.node.getChildByName('optionsBoard');
        this.options = this.optionsBoard.getChildByName('options');
        this.boxs = this.node.getChildByName('boxs');

        this.boxs.children.forEach(box => {
            box._opType = box.name;
            box.name == 'xuxian' ? this.wrongPool.push(box) : this.optionsPool.push(box)
        });

        this.options.children.forEach(box => {
            box.getComponent('options').init(this);
        });


        let pool = this.getRandomPool(cc.YL.tools.arrCopy(this.optionsPool), this.opNum)
        for (let i in pool) {
            let qNode = pool[i];
            qNode._opType = '';
            qNode.getComponent(cc.Sprite).spriteFrame = asset.getSpriteFrame('xuxian')
            let box = qNode.addComponent(cc.BoxCollider);
            box.size.width = qNode.width;
            box.size.height = qNode.height;
            box.tag = 99;
            this.missOpArr.push(qNode);
            qNode.getComponent(cc.Sprite).enabled = false;
        }

        for (let i = 0; i < this.wrongPool.length; i++) {
            let qNode = this.wrongPool[i];
            qNode._opType = '';
            qNode.getComponent(cc.Sprite).spriteFrame = asset.getSpriteFrame('xuxian')
            let box = qNode.addComponent(cc.BoxCollider);
            box.size.width = qNode.width;
            box.size.height = qNode.height;
            box.tag = 99;
        }
        this.random_Box_Pool = pool;
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

        //检测数据是否全部相同
        let checkIsSame = function (arr) {
            let name = arr[0].name;
            for (let i = 0; i < arr.length; i++) {
                if (arr[i].name != name) return false
            }
            console.log(arr);
            return true;
        };

        let r_arr = getPool(cc.YL.tools.arrCopy(target_Arr));
        while (checkIsUesd(GD.miss_op_pool, r_arr) || checkIsSame(r_arr)) {
            r_arr = getPool(cc.YL.tools.arrCopy(target_Arr));
        }
        return r_arr;
    },

    //获取对应种类的目标节点
    getTargetBox(type) {
        for (let i in this.random_Box_Pool) {
            if (this.random_Box_Pool[i].name == type && this.random_Box_Pool[i]._opType == '') {
                return this.random_Box_Pool[i];
            }
        }
        return null;
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
        this.checkBtn.active = true;
        this.options.active = true;
        this.optionsBoard.active = true;
        GD.sound.setTipsButton(true);
        GD.sound.setShowTips(this.tips, true);
        cc.YL.unLockTouch();
    },


    checkIsAllRight() {
        let isAllRight = true;
        let arr = this.boxs.children;


        let checkIsFitRules = function (cArr, rule) {
            if (!cc.YL.tools.checkArrIsSame(cArr, rule)) {
                console.log(cArr);
            }
            return cc.YL.tools.checkArrIsSame(cArr, rule)
        }


        let col = 4;
        let row = 4;
        let row_arr = [];
        let col_arr = [];

        //判断之前统计的数据
        //横排
        for (let i = 0; i < arr.length; i++) {
            if (arr[i]._opType != '') {
                row_arr.push(parseInt(arr[i]._opType));
            }
            if ((i + 1) % row == 0) {
                if (!checkIsFitRules(row_arr, this.rule)) isAllRight = false;
                row_arr = [];
            }
        }

        //竖排
        for (let i = 0; i < col; i++) {
            col_arr = []
            for (let j = 0; j < row; j++) {
                let id = i + row * j;
                if (arr.length > id && arr[id]._opType != '') col_arr.push(parseInt(arr[id]._opType));
            }
            if (!checkIsFitRules(col_arr, this.rule)) isAllRight = false;
        }




        if (isAllRight) {
            GD.sound.playSound('right');
            GD.root.showStar(this.boxs);
            cc.YL.lockTouch();
            cc.YL.timeOut(() => { this.showFinishLayer() }, 1000)
        } else {
            GD.sound.playSound('wrong');
            GD.sound.playSound('blank');
            arr.forEach((block) => {
                if(block.childrenCount>0){
                    block.destroyAllChildren()
                    block._opType = '';
                }
                
            });
            this.setError();
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
        let getOP = (type) => {
            let arr = this.options.children;
            for (let i in arr) {
                let op_com = arr[i].getComponent('options');
                if (op_com.targetName == type) return op_com;
            }
            return null;
        }


        this.random_Box_Pool.forEach((op) => {
            let op_com = getOP(op.name);
            op_com.copySelf();
            op_com.showDown(op);
            GD.root.showStar(op);
            op.getComponent(cc.BoxCollider).enabled = false;
        });
        cc.YL.timeOut(() => {
            this.showFinishLayer();
        }, 2000)
    },

    showFinishLayer() {
        //此环节完成 注销所有事件
        this.unregisterEvent();
        this.boxs.active = false;
        this.optionsBoard.active = false;
        this.checkBtn.active = false;
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
