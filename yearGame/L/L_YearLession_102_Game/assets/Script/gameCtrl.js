//选择选项对应的脚本 
cc.Class({
    extends: cc.Component,

    properties: {
        kidTips: cc.String,
        tips: cc.String,
        kidSke: sp.Skeleton,
        rightAnswer: [cc.String],
    },

    // LIFE-CYCLE CALLBACKS:

    init() {

        let options = this.node.getChildByName('options');
        let arr = cc.YL.tools.arrCopy(this.rightAnswer);
        options.children.forEach((op) => {
            op._state = 'init';
            op.getComponent('baseKey').init(this.touchKey.bind(this), arr.shift());
        });
        this.options = options;

        let gKeyboard = this.node.getChildByName('gKeyBoard').getComponent('keyBoardCtrl');
        gKeyboard.init();
        gKeyboard.setTouchCallFunc(this.touchkeyBoard.bind(this));
        gKeyboard.setBtn();
        this._gKeyBoard = gKeyboard;


        this._errorCount = 0;
        this.registerEvent();

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
        if (key.key != 'enter') {
            return;
        }
        let wrongArr = [];
        let rightArr = [];
        let isAllFill = true;
        this.options.children.forEach((op) => {
            if (op._state == 'init') {
                let baseKey = op.getComponent('baseKey');
                if (baseKey.getKeys() == '?' || baseKey.getKeys() == '') {
                    isAllFill = false;
                } else {
                    if (baseKey.getIsRight()) {
                        rightArr.push(baseKey);
                    } else {
                        wrongArr.push(baseKey);
                    }
                }
            }
        });


        if (wrongArr.length > 0) {
            wrongArr.forEach((baseKey) => {
                baseKey.setKey('?');
                baseKey.setTouch(false);
            });
            this.kidSke.setAnimation(0, 'cuo', false);
            this.kidSke.addAnimation(0, 'zhan', true);
            GD.sound.playSound('wrong');
            GD.sound.playSound('blank');
            this.setError();
        } else {
            GD.sound.playSound('right');
            rightArr.forEach((op) => {
                op.lockKey();
                GD.root.showStar(op.node);
            });
            if (isAllFill) {
                cc.YL.timeOut(() => {
                    this.showFinishLayer();
                }, 1000);
            }
        }
        this.kidSke.setAnimation(0, 'zhan', true);
        this._gKeyBoard.getBindKey().setTouch(false);
        this._gKeyBoard.setBindKey(null);
        this._gKeyBoard.hideKeyBoard();
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
        //展示孩子进场

        this.kidSke.setAnimation(0, 'zou', true);
        cc.tween(this.kidSke.node)
            .to(2, { x: 570 })
            .call(() => {
                if (this.kidTips != '') {
                    GD.sound.setBindAniIsLock(false);
                    GD.sound.playTips(this.kidTips,()=>{
                        this.kidSke.setAnimation(0, 'zhan', true);
                        GD.sound.setTipsButton(true);
                        GD.sound.setShowTips(this.tips, true);
                        cc.YL.unLockTouch();
                    });
                    this.kidSke.setAnimation(0, 'shuo', true);
                } else {
                    GD.sound.setBindAniIsLock(true);
                    this.kidSke.setAnimation(0, 'zhan', true);
                    GD.sound.setTipsButton(true);
                    GD.sound.setShowTips(this.tips, true);
                    cc.YL.unLockTouch();
                }
            })
            .start()
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
        //此环节完成 注销所有事件
        this.kidSke.setAnimation(0, 'shui', false);
        cc.tween(this.kidSke.node)
            .delay(1)
            .call(() => {
                this.kidSke.setAnimation(0, 'zou2', true);
            })
            .to(2, { x: -1500 })
            .call(() => {
                this.kidSke.setAnimation(0, 'zhan', true);
                cc.YL.emitter.emit('continueGame');
                this.node.destroy();
            })
            .start()
        this.unregisterEvent();
    },
});
