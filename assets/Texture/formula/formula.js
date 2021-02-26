let formulaData = cc.Class({
    name: "formulaData",
    properties: {
        cells: [cc.String],
    }
})
cc.Class({
    extends: cc.Component,

    properties: {
        qLabel: cc.Node
    },

    onLoad() {
        let key = this.qLabel.getComponent('baseKey');
        key.init();
        let gKeyboard = this.node.getChildByName('gKeyboard').getComponent('keyBoardCtrl');
        gKeyboard.init(this.touchkeyBoard.bind(this));
        gKeyboard.setBindKey(key)
        gKeyboard.setBtn();
        this._gKeyBoard = gKeyboard;
        this._key = key;
        this.registerEvent();
    },

    //注册事件
    registerEvent() {
        cc.YL.emitter.on('showWrong', (e) => {
            this._key.initKey();
            this._gKeyBoard.setBtn();
        })
        cc.YL.emitter.on('showRightAnswer', (answer) => {
            this.showRightAnswer(answer);
        })
        cc.YL.emitter.on('continueGame', () => {
            this._key.initKey();
        })
    },

    //点击键盘数字回调
    touchkeyBoard(key) {
        if (key.key == 'enter') {
            //发送检测答案的事件
            cc.YL.emitter.emit('checkAnswer', this._key);
        }
    },

    //展示正确答案
    showRightAnswer(answer) {
        this._key.initKey();
        this._key.setKey(answer);
    },
});
