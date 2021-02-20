let formulaData = cc.Class({
    name: "formulaData",
    properties: {
        cells: [cc.String],
    }
})
cc.Class({
    extends: cc.Component,

    properties: {
        rightAnswers: {
            default: [],
            type: [formulaData],
            displayName: '算式数据',
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
                option.getComponent('baseKey').init(this.touchKey.bind(this));
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
                if (!option.getComponent('baseKey').getKeysState()) isAllLock = false;
            });
        });

        if (!isAllLock) {
            return;
        }

        //确认已经全部填完
        this.checkBtn.interactable = true;
    },


    checkIsAllRight() {
        let rightAnswers = cc.YL.tools.arrCopy(this.rightAnswers);
        let rightFormulaArr = [];
        this.formulaList.children.forEach((formula) => {
            let keyArr = []
            formula.children.forEach((option) => {
                keyArr.push(option.getComponent('baseKey').getKeys());
            });

            //判断本算式是否全部正确
            for (let i in rightAnswers) {
                let answer = rightAnswers[i].cells;
                if (cc.YL.tools.checkArrIsSameStrict(answer, keyArr)) {
                    //正确
                    formula._state = 'finish';
                    rightFormulaArr.push(formula);
                    rightAnswers.splice(i, 1);
                    break;
                }
            }
        });

        //清理所有算式的选中效果
        this.formulaList.children.forEach((formula) => {
            formula._state = 'init';
            formula.children.forEach((option) => {
                option.getComponent('baseKey').setTouch(false);
            });
        });

        if (rightFormulaArr.length == this.formulaList.childrenCount) {
            //全部正确
            this.rightCB && this.rightCB();
        } else {
            //所有算式全部清除
            this.formulaList.children.forEach((formula) => {
                formula._state = 'init';
                formula.children.forEach((option) => {
                    option.getComponent('baseKey').initKey('')
                });
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
        let rightAnswers = cc.YL.tools.arrCopy(this.rightAnswers);
        this.formulaList.children.forEach((formula) => {
            if (formula._state == 'init') {
                let answer = rightAnswers.shift().cells;
                formula.children.forEach((option) => {
                    let baseKey = option.getComponent('baseKey');
                    baseKey.setKey('');
                    baseKey.setKey(answer.shift());
                });
            }
        });
    },
});
