cc.Class({
    extends: cc.Component,

    properties: {
    },


    onLoad() {

    },


    init(callFunc) {
        this._touchCallFunc = callFunc;
        let num_gKeyboard = this.node.getChildByName('num_gKeyboard');
        let sys_gKeyboard = this.node.getChildByName('sys_gKeyboard');


        this.keyBoardPool = [];
        this.node.children.forEach((keyBoard) => {
            this.keyBoardPool[keyBoard.name] = keyBoard;
            let grid = keyBoard.getChildByName('keyList');
            grid && grid.children.forEach((btn) => {
                btn._canHandle = true
                btn.getComponent('key').init(this.touchKeyHandle.bind(this));
            });
            keyBoard.grid = grid;
        });

        let target = cc.find('Canvas/questionBg/gKeyboard');
        let pos = cc.YL.tools.getRelativePos(target, this.node.parent);
        this.node.setPosition(pos)

        //this.hideKeyBoard();
    },

    //设置绑定的key
    setBindKey(key) {
        this._bindKey = key;
        if (!key) {
            this.sKeyBoard = null;
            return;
        }
        this.sKeyBoard = this.keyBoardPool[key.keyType];
        this.node.children.forEach((keyBoard) => {
            keyBoard.active = false;
        });
        this.sKeyBoard.active = true;
    },

    //获取绑定的key
    getBindKey() {
        return this._bindKey;
    },

    setKey(key) {
        this._bindKey.label.string = key;
    },

    showKeyBoard() {
        this.setBtn();
        if (this.node.opacity == 255 && this.node.active == true) {
            return;
        }
        this.node.active = true;
        this.node.opacity = 0;
        cc.tween(this.node)
            .to(0.5, { opacity: 255 })
            .start();
    },

    hideKeyBoard() {
        this.node.active = true;
        this.node.opacity = 255;
        cc.tween(this.node)
            .to(0.5, { opacity: 0 })
            .call(() => {
                this.node.active = false;
            })
            .start();
    },

    clearKeyBoard(isShowAction = false) {
        if (isShowAction) {
            cc.tween(this._bindKey.label.node)
                .then(cc.YL.aMgr.zoomAction(2))
                .call(() => {
                    this._bindKey.label.string = '';
                })
        } else {
            this.setBindKey(null);
        }
    },

    setBtn() {
        if (!this._bindKey || !this.sKeyBoard) {
            return;
        }


        let _numLabel = this._bindKey.label
        let del = this.sKeyBoard.grid.getChildByName('del')
        let enter = this.sKeyBoard.grid.getChildByName('enter')
        let isShow = _numLabel.string != '';

        if (enter) {
            enter.getComponent('key').setBtn(isShow);
        }
        if (del) {
            del.getComponent('key').setBtn(isShow);
        }
    },

    getKey() {
        return this._bindKey.label.node;
    },

    touchKeyHandle(key) {
        this._bindKey.setKey(key.getKeys());
        this._touchCallFunc && this._touchCallFunc(key.getKeys());
        this.setBtn();
    },

});
