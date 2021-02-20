cc.Class({
    extends: cc.Component,

    properties: {
        tips: cc.String,
        rightAnswers: {
            default: [],
            type: [cc.Integer],
            displayName: '正确答案'
        },
        delayTimes: {
            default: [],
            type: [cc.Float],
            displayName: '演示延时时间',
        },
        exampleOpNum: 0,
    },

    // onLoad () {},

    init(rightCB, wrongCB) {
        this.options = this.node.getChildByName('options');
        this.opBoard = this.node.getChildByName('opBoard');
        this.exampleBoard = this.node.getChildByName('exampleBoard');
        this.opPool = [];

        cc.YL.lockTouch();
        GD.sound.setShowTips(this.tips, true, () => {
            cc.YL.unLockTouch();
        });

        cc.YL.unLockTouch();

        let time = this.delayTimes.shift();
        let arr = cc.YL.tools.arrCopy(this.options.children);
        var _layout = this.exampleBoard.getComponent(cc.Layout);

        cc.YL.timeOut(() => {
            arr.forEach((op) => {
                cc.tween(op)
                    .then(cc.YL.aMgr.zoomAction(2))
                    .start()
            });
        }, time * 1000)



        time += this.delayTimes.shift();


        cc.YL.timeOut(() => {
            //选出n个飞出
            _layout.enabled = false;
            for (let i = 0; i < this.exampleOpNum; i++) {
                let exOp = arr.pop();
                let pos = cc.YL.tools.getRelativePos(exOp, this.exampleBoard);
                /*   let xx = exOp.getChildByName('baozixuxian');
                  xx.active = true;
                  xx.setParent(this.options);
                  xx.setPosition(exOp.position); */
                exOp.parent = this.exampleBoard;
                exOp.position = pos;
                cc.tween(exOp)
                    .to(0.5, { position: cc.v2(0, 0) })
                    .start()



            }

            //为剩余的选中注册
            arr.forEach((op) => {
                let opScript = op.addComponent('options');
                this.opPool.push(opScript);
                opScript.init(this);
            });
        }, time * 1000)


        time += 0.5;

        cc.YL.timeOut(() => {
            _layout.enabled = true;
        }, time * 1000)

        this.rightCB = rightCB;
        this.wrongCB = wrongCB;
    },


    checkIsAllRight() {
        for (let i in this.opPool) {
            if (!this.opPool[i].checkIsPutDown()) return;
        }

        //全部放置了，检测正误
        let arr = [];
        this.opBoard.children.forEach((board) => {
            arr.push(board.childrenCount);
        });

        if (cc.YL.tools.checkArrIsSameStrict(this.rightAnswers, arr)) {
            //正确
            this.rightCB && this.rightCB();
        } else {
            //所有算式全部清除
            for (let i in this.opPool) {
                this.opPool[i].showBack();
            }
            this.wrongCB && this.wrongCB();
        }


    },

    //展示正确答案
    showRightAnswer() {
        this.opBoard.children.forEach((board) => {
            let answer = this.rightAnswers.shift()
            for (let i = 0; i < answer; i++) {
                this.opPool.shift().showRightAnswer(board);
            }
        });
    },
});
