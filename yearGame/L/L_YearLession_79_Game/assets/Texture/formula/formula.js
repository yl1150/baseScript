let formulaData = cc.Class({
    name: "formulaData",
    properties: {
        cells: [cc.String],
    }
})
cc.Class({
    extends: cc.Component,

    properties: {
        addRightAnswers: {
            default: [],
            type: [formulaData],
            displayName: '加法算式数据',
        },
        subRightAnswers: {
            default: [],
            type: [formulaData],
            displayName: '减法算式数据',
        },
    },

    // onLoad () {},

    init(rightCB, wrongCB) {
        this.checkBtn = this.node.getChildByName('checkBtn').getComponent(cc.Button);
        this.formulaList = this.node.getChildByName('formulaList');

        let gKeyboard = this.node.getChildByName('gKeyboard').getComponent('keyBoardCtrl');
        gKeyboard.init(this.touchkeyBoard.bind(this));
        this._gKeyBoard = gKeyboard;


        this.formulaList.children.forEach((formula) => {
            formula._state = 'init';
            formula.children.forEach((option) => {
                let baseKey = option.getComponent('baseKey');
                if (baseKey) {
                    baseKey.init(this.touchKey.bind(this));
                    option.baseKey = baseKey;
                }
            });
        });

        this.rightCB = rightCB;
        this.wrongCB = wrongCB;
    },

    touchKey(key) {
        let ex_touch_key = this._gKeyBoard.getBindKey();

        if (key == ex_touch_key) {
            //判定为取消操作
            //取消绑定并隐藏键盘
            this._gKeyBoard.setBindKey(null);
            this._gKeyBoard.hideKeyBoard();
            //取消选中
            key.setKey('?');
            key.setTouch(false);
        } else {
            if (ex_touch_key) {
                //取消原有
                ex_touch_key.setTouch(false);
                ex_touch_key.setKey('?');
            }
            //绑定键盘
            this._gKeyBoard.setBindKey(key);
            this._gKeyBoard.showKeyBoard();
            key.setKey('');
            key.setTouch(true);
        }


    },

    //点击键盘数字回调
    touchkeyBoard() {
        //检测是否全部填完
        let isAllLock = true;
        this.formulaList.children.forEach((formula) => {
            formula.children.forEach((option) => {
                if (option.baseKey && !option.baseKey.getKeysState()) isAllLock = false;
            });
        });

        if (!isAllLock) {
            return;
        }

        //确认已经全部填完
        this.checkBtn.interactable = true;
    },

    checkIsAllRight() {
        let rightFormulaArr = [];
        this.formulaList.children.forEach((formula) => {
            let keyArr = []
            formula.children.forEach((option) => {
                option.baseKey && keyArr.push(option.baseKey.getKeys());
            });

            //判断本算式是否全部正确
            let rightAnswers = (formula.name == 'add' ? this.addRightAnswers : this.subRightAnswers);
            for (let i in rightAnswers) {
                if (cc.YL.tools.checkArrIsSameStrict(rightAnswers[i].cells, keyArr)) {
                    //正确
                    formula._state = 'finish';
                    rightAnswers.splice(i, 1);
                }
            }
            formula._state == 'finish' && rightFormulaArr.push(formula);
        })


        //清理所有算式的选中效果
        this.formulaList.children.forEach((formula) => {
            formula.children.forEach((option) => {
                option.baseKey && option.baseKey.setTouch(false);
            });
        });

        if (rightFormulaArr.length == this.formulaList.childrenCount) {
            //全部正确
            this.rightCB && this.rightCB();
        } else {
            //所有算式全部清除 不清理正确算式
            this.formulaList.children.forEach((formula) => {
                if (formula._state == 'finish') {
                    formula.children.forEach((option) => {
                        option.baseKey && option.baseKey.lockKey();
                    });
                } else {
                    formula._state = 'init';
                    formula.children.forEach((option) => {
                        option.baseKey && option.baseKey.initKey('');
                    });
                }
            });
            this.wrongCB && this.wrongCB();
        }

        this.checkBtn.interactable = false;
        //清理并隐藏键盘
        this._gKeyBoard.clearKeyBoard();
        this._gKeyBoard.hideKeyBoard();
    },

    //展示正确答案
    showRightAnswer() {
        this.formulaList.children.forEach((formula) => {
            if (formula._state == 'init') {
                let rightAnswers = (formula.name == 'add' ? this.addRightAnswers : this.subRightAnswers);
                let answer = rightAnswers.shift().cells;
                formula.children.forEach((option) => {
                    let baseKey = option.baseKey;
                    baseKey && baseKey.setKey('');
                    baseKey && baseKey.setKey(answer.shift());
                });
                formula._state = 'finish';
            }
        });
    },

    showStar(cb) {
        this.formulaList.children.forEach((formula) => {
            formula.children.forEach((option) => {
                GD.root.showStar(option,null,1);
            });
        });

        cc.YL.timeOut(()=>{
            cb && cb();
        },1000)
    },
});
