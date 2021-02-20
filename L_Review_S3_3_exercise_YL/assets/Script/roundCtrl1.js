let tipsData = require('Define').TIPSDATA;

cc.Class({
    extends: cc.Component,

    properties: {
        tips: {
            displayName: '问题语音',
            default: ''
        },
        gameTips: {
            displayName: '解说语音',
            default: ''
        },
        finishType: '',
        rightAnswer: [cc.String],
        gameTipsData: [tipsData]
    },

    // LIFE-CYCLE CALLBACKS:

    init() {
        this._errorCount = 0;
        GD.sound.setTipsButton(true);
        cc.YL.addClock(this.tips);
        GD.sound.setShowTips(this.tips, true)
        cc.YL.unLockTouch();

        let gKeyboard = this.node.getChildByName('gKeyboard').getComponent('keyBoardCtrl');
        gKeyboard.init(this.touchkeyBoard.bind(this));
        gKeyboard.setBtn();
        this._gKeyBoard = gKeyboard;


        let options = this.node.getChildByName('options');
        let arr = cc.YL.tools.arrCopy(this.rightAnswer);
        options.children.forEach((op) => {
            op._state = 'init';
            op.getComponent('baseKey').init(this.touchKey.bind(this), arr.shift());
        });
        this.options = options;
    },

    touchKey(key) {
        let ex_touch_key = this._gKeyBoard.getBindKey();
        let initKey = function (pKey, value) {
            if (pKey.getKeys() == '' || pKey.getKeys() == '?') {
                pKey.setKey(value);
            }
        }

        if (key == ex_touch_key) {
            //判定为取消操作
            //取消绑定并隐藏键盘
            this._gKeyBoard.setBindKey(null);
            this._gKeyBoard.hideKeyBoard();
            //取消选中
            initKey(key, '?');
            key.setTouch(false);
        } else {
            if (ex_touch_key) {
                //取消原有
                ex_touch_key.setTouch(false);
                initKey(ex_touch_key, '?');
            }
            //绑定键盘
            initKey(key, '');
            key.setTouch(true);
            this._gKeyBoard.setBindKey(key);
            this._gKeyBoard.showKeyBoard();
        }
    },

    //点击键盘数字回调
    touchkeyBoard(key) {
        if (key != 'enter') {
            return;
        }
        let wrongArr = [];
        this.options.children.forEach((op) => {
            if (op._state == 'init') {
                let baseKey = op.getComponent('baseKey');
                !baseKey.getIsRight() && wrongArr.push(baseKey);
            }
        });


        if (wrongArr.length > 0) {
            wrongArr.forEach((baseKey) => {
                baseKey.setKey('?');
                baseKey.setTouch(false);

            });
            this.showWrong();
        } else {
            GD.sound.playSound('right');
            this.options.children.forEach((op) => {
                GD.root.showStar(op);
            });
            cc.YL.timeOut(() => {
                this.showFinishLayer();
            }, 1000);
        }
        this._gKeyBoard.getBindKey().setTouch(false);
        this._gKeyBoard.setBindKey(null);
        this._gKeyBoard.hideKeyBoard();
    },

    showWrong(op) {
        GD.sound.playSound('wrong');
        GD.sound.playSound('blank');
        this.setError();
    },

    setError() {
        this._errorCount++;
        let maxErrCount = 3
        if (this._errorCount >= maxErrCount) {
            cc.YL.lockTouch();
            setTimeout(() => {
                if (cc.YL.tools.getIsWrongModel()) {
                    GD.sound.playTips('tipsWatch', () => {
                        this.showRightAnswer();
                    })
                } else {
                    this.showFinishLayer();
                }
            }, 1000);
        }
    },

    showRightAnswer() {
        this.options.children.forEach((op) => {
            let key = op.getComponent('baseKey');
            key.setKey('?');
            key.setKey(this.rightAnswer.shift());
            key.setTouch(false);
            GD.root.showStar(op);
        });

        this._gKeyBoard.setBindKey(null);
        this._gKeyBoard.hideKeyBoard();

        cc.YL.timeOut(() => {
            this.showFinishLayer();
        }, 1000);
    },


    showFinishLayer() {
        cc.YL.lockTouch();
        cc.YL.emitter.emit('addWrongMes', this._errorCount);
        if (cc.YL.tools.getIsWrongModel()) {
            //错题模式 展示解说
            this.showGameTips(() => {
                GD.root.setStarBoard(true);
                GD.root.showAddStar(GD.root.getStarNum(this._errorCount), () => {
                    GD.root.setStarBoard(false);
                    this.node.active = false;
                    this.node.destroy();
                    cc.YL.emitter.emit('PASSLV');
                })
            })
        } else {
            GD.root.setStarBoard(true);
            GD.root.showAddStar(GD.root.getStarNum(this._errorCount), () => {
                GD.root.setStarBoard(false);
                this.node.active = false;
                this.node.destroy();
                cc.YL.emitter.emit('PASSLV');
            })
        }
    },

    showGameTips(cb) {
        cc.YL.lockTouch();
        if (this.finishType == 'action') {
            GD.sound.playTips(this.gameTips);
            cc.YL.qTeach.showGameTips(this.gameTipsData, () => {
                cb && cb();
            })
        } else {
            GD.sound.playTips(this.gameTips, () => {
                cb && cb();
            });
            cc.YL.qTeach.showGameTips(this.gameTipsData)
        }
    },
});
