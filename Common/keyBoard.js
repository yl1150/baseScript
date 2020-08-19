const keyBoardType = cc.Enum({
    Default: 0,
    Nums: 1,
    Symbol: 2,
});
cc.Class({
    extends: cc.Component,

    properties: {
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
    },

    init(callFunc, oriString = '?') {
        this._oriString = oriString;
        this._touchCallFunc = callFunc;
        this._shadow = this.node.getChildByName('shadow');
        this._board = this.node.getChildByName('board');
        this._board.children.forEach((btn) => {
            btn._canHandle = true
            cc.YL.tools.registerTouch(btn, this.touchStart.bind(this), null, this.touchEnd.bind(this));
        });
        this.hideKeyBoard();
    },

    showKeyBoard(targetLabel, type = 1) {
        this._targetLabel = targetLabel
        this._keyB = this._board
        this._keyB.active = true
        this._type = type
        this._shadow.active = true;
        this.setBtn(false)
    },

    setBtn(isShow) {
        let del = this._keyB.getChildByName('del')
        let enter = this._keyB.getChildByName('enter')
        if (enter) {
            enter._canHandle = isShow
            enter.children.forEach((img) => {
                cc.YL.tools.setSpriteShader(isShow ? 'normal' : 'gray', img)
            });
        }
        if (del) {
            if (this._targetLabel && this._targetLabel.string != this._oriString) {
                isShow = true
            }
            del._canHandle = isShow
            del.children.forEach((img) => {
                cc.YL.tools.setSpriteShader(isShow ? 'normal' : 'gray', img)
            });
        }
    },

    getKey(key) {
        return this._keyB.getChildByName(key)
    },

    hideKeyBoard() {
        this._board.active = false;
        this._shadow.active = false;
    },

    touchStart(event) {
        let target = event.target
        if (!target._canHandle) {
            return
        }
        //target.setScale(1.2)
        this.setKeyTouch(target, true)
    },

    touchEnd(event) {
        let target = event.target
        if (!target._canHandle) {
            return
        }
        let keys = target.name
        //target.setScale(1)
        this.setKeyTouch(target, false)

        let _numLabel = this._targetLabel
        if (keys == 'del') {
            if (_numLabel.string.length <= 1) {
                _numLabel.string = this._oriString
            } else {
                _numLabel.string = _numLabel.string.split('').shift()
            }
        } else if (keys == 'enter') {
            //this.hideKeyBoard()
        } else {
            if (_numLabel.string.length > 1) {
                GD.sound.playSound('blank2')
                return
            }
            if (this._type == keyBoardType.Symbol) {
                _numLabel.string = keys
            } else {
                if (_numLabel.string == this._oriString) {
                    _numLabel.string = keys
                } else {
                    _numLabel.string += keys
                }
            }
        }
        _numLabel.node.setScale(_numLabel.string.length > 1 ? 1 : 1.2)
        this._touchCallFunc && this._touchCallFunc(keys)
    },

    setKeyTouch(key, isTouch) {
        let name = isTouch ? 'touch' : 'normal'
        key.children.forEach((img) => {
            img.active = false
        });
        key.getChildByName(name).active = true
    },
});
