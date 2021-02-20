const { timeOut } = require("../../../baseScript/Common/register");

cc.Class({
    extends: cc.Component,

    properties: {
    },


    onLoad() {

    },


    init(callFunc) {
        this._touchCallFunc = callFunc;
        this.text_bg = this.node.getChildByName('text_bg');
        this.in_put_label = this.text_bg.getChildByName('input').getComponent(cc.Label);
        this.grid = this.node.getChildByName('grid');
        this.grid.children.forEach((btn) => {
            btn._canHandle = true
            btn.getComponent('key').init(this.touchKeyHandle.bind(this));
        });
        //this.hideKeyBoard();
    },

    showKeyBoard() {
        this.node.active = true;
        this.node.opacity = 0;
        this.setBtn();
        cc.tween(this.node)
            .to(0.5, { opacity: 255 })
            .start();
    },

    setKey(key) {
        this.in_put_label.string = key;
    },

    hideKeyBoard() {
        this.node.active = true;
        this.node.opacity = 255;
        cc.tween(this.node)
            .to(0.5, { opacity: 0 })
            .call(()=>{
                this.node.active = false;
            })
            .start();
    },

    clearKeyBoard(isShowAction = false) {
        if (isShowAction) {
            cc.tween(this.in_put_label.node)
                .then(cc.YL.aMgr.zoomAction(2))
                .call(() => {
                    this.in_put_label.string = '';
                })
        } else {
            this.in_put_label.string = '';
        }
    },

    setBtn() {
        let _numLabel = this.in_put_label
        let del = this.grid.getChildByName('delete_nor').getComponent('key')
        let enter = this.grid.getChildByName('confirm_nor').getComponent('key')
        let isShow = _numLabel.string != '';

        if (enter) {
            enter.setBtn(isShow);
        }
        if (del) {
            del.setBtn(isShow);
        }
    },

    getKey() {
        return this.in_put_label.node;
    },

    touchKeyHandle(key) {
        if (!key.getCanHandle()) {
            return
        }
        let keyMes = key.getKeys();
        //target.setScale(1)

        let _numLabel = this.in_put_label
        if (keyMes == 'del') {
            if (_numLabel.string.length <= 1) {
                _numLabel.string = ''
            } else {
                _numLabel.string = _numLabel.string.split('').shift()
            }
        } else if (keyMes == 'enter') {
            //点击确认键 判断正误
            this._touchCallFunc && this._touchCallFunc(_numLabel.string);
            //this.hideKeyBoard()
        } else {
            if (_numLabel.string.length > 1) {
                GD.sound.playSound('blank2')
                return
            }
            if (_numLabel.string == '') {
                _numLabel.string = keyMes
            } else {
                _numLabel.string += keyMes
            }
        }
        this.setBtn();
    },

});
