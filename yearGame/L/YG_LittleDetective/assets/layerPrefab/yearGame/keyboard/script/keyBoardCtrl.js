cc.Class({
    extends: cc.Component,

    properties: {
    },


    onLoad() {

    },

    fitScreen() {
        let winSize = cc.view.getFrameSize()
        let CanvasSize = cc.find('Canvas').getComponent(cc.Canvas).designResolution;
        //web页面DOM的屏幕比例大于16/9时,为全面屏手机
        if (winSize.width / winSize.height > 16 / 9) {
            this.node.setPosition((winSize.width / 2) / (winSize.height / CanvasSize.height) - 20, this.node.position.y)
        }
        //web页面DOM的屏幕比例小于16/9时,为ipad
        if (winSize.width / winSize.height < 16 / 9) {
            this.node.setPosition(this.node.position.x, (-winSize.height / 2) / (winSize.width / CanvasSize.width) + 20)
        }
    },

    init(callFunc) {
        this.fitScreen();
        this._touchCallFunc = callFunc;
        this.text_bg = this.node.getChildByName('text_bg');
        this.in_put_label = this.text_bg.getChildByName('input').getComponent(cc.Label);
        this.grid = this.node.getChildByName('grid');
        this.grid.children.forEach((btn) => {
            btn._canHandle = true
            btn.getComponent('key').init(this.touchKeyHandle.bind(this));
        });
        this.hideKeyBoard();
    },

    showKeyBoard() {
        this.node.active = true;
        this.setBtn();
    },

    setKey(key){
        this.in_put_label.string = key;
    },

    hideKeyBoard() {
        this.node.active = false;
    },

    clearKeyBoard(){
        this.in_put_label.string = '';
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
        _numLabel.node.setScale(_numLabel.string.length > 1 ? 1 : 1.2);
        this.setBtn();
    },

});
