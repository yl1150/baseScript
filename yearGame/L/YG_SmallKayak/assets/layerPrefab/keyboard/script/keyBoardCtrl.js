const { timeOut } = require("../../../baseScript/Common/register");

cc.Class({
    extends: cc.Component,

    properties: {
    },


    onLoad() {

    },

    fitScreen() {
        /*   let winSize = cc.view.getFrameSize()
          let CanvasSize = cc.find('Canvas').getComponent(cc.Canvas).designResolution;
          //web页面DOM的屏幕比例大于16/9时,为全面屏手机
          if (winSize.width / winSize.height > 16 / 9) {
              this.node.setPosition((winSize.width / 2) / (winSize.height / CanvasSize.height) - 20, this.node.position.y)
          }
          //web页面DOM的屏幕比例小于16/9时,为ipad
          if (winSize.width / winSize.height < 16 / 9) {
              this.node.setPosition(this.node.position.x, (-winSize.height / 2) / (winSize.width / CanvasSize.width) + 20)
          } */
        let widget = this.getComponent(cc.Widget);
        widget.target = cc.find('Canvas')
        widget.right = 20;
        widget.bottom = 20;
        widget.updateAlignment();
       
    },

    init(callFunc) {
        this.fitScreen();
        this.node.opacity = 0;
        this.node.active = true;
        this._touchCallFunc = callFunc;
        this.text_bg = this.node.getChildByName('text_bg');
        this.grid = this.node.getChildByName('grid');
        this.grid.children.forEach((btn) => {
            btn._canHandle = true
            btn.getComponent('key').init(this.touchKeyHandle.bind(this));
        });
        this.setBtn();
        //this.hideKeyBoard();
        console.log(this.node)

    },

    setKeyBoard(label) {
        this.in_put_label = label
        this.setBtn();
    },

    showKeyBoard() {
        this.node.opacity = 255;
        this.setBtn();
        this.node.active = true;
    },

    setKey(key) {
        this.in_put_label.string = key;
    },

    hideKeyBoard() {
        this.node.active = false;
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
        let isShow = false
        let del = this.grid.getChildByName('delete_nor').getComponent('key')
        //let enter = this.grid.getChildByName('confirm_nor').getComponent('key')
        if (_numLabel) {
            isShow = _numLabel.string != '' && _numLabel.string != '?';
        }

        /*   if (enter) {
              enter.setBtn(isShow);
          } */
        if (del) {
            del.setBtn(isShow);
        }
    },

    getKey() {
        return this.in_put_label.node;
    },

    touchKeyHandle(key) {
        let _numLabel = this.in_put_label
        if (!key.getCanHandle() || !_numLabel) {
            return
        }
        let keyMes = key.getKeys();
        //target.setScale(1)

        if (keyMes == 'del') {
            if (_numLabel.string.length <= 1) {
                _numLabel.string = ''
            } else {
                _numLabel.string = _numLabel.string.split('').shift()
            }
        } else if (keyMes == 'enter') {
            //点击确认键 判断正误
            //this._touchCallFunc && this._touchCallFunc(_numLabel.string);
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
        this._touchCallFunc(_numLabel.string)
        this.setBtn();
    },

});
