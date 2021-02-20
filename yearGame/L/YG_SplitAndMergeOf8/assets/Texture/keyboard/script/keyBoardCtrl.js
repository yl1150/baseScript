const { timeOut } = require("../../../baseScript/Common/register");

cc.Class({
    extends: cc.Component,

    properties: {
    },


    onLoad() {
    },

    fitScreen() {
        let winSize = cc.view.getFrameSize()
        let CanvasSize = cc.find('Canvas').getComponent(cc.Canvas).designResolution;
        //web页面DOM的屏幕比例小于16/9时,为ipad
        if (winSize.width / winSize.height < 16 / 9) {
            this.node.setScale(1.2);
        }
    },

    init(callFunc) {
        this.fitScreen();
        this.clearKeyBoard();
        this.grid_Label = this.node.getChildByName('grid_Label');
        this.grid_Frame = this.node.getChildByName('grid_Frame');
        this.grid_Frame.children.forEach((btn) => {
            btn._canHandle = true
            btn.getComponent('key').init(this.touchKeyHandle.bind(this), this.grid_Label.getChildByName(btn.name));
        });
    },

    bindCallFunc(callFunc){
        this._touchCallFunc = callFunc;
        this.clearKeyBoard();
    },

    bindTargetLabel(label) {
        let initLabel = function (pLabel, mes) {
            if (pLabel.string != '' && pLabel.string != '?') {
                return
            }
            pLabel.string = mes
        }

        if (label == this.in_put_label) {
            //原本就是选中的 清理选中 隐藏键盘
            this.hideKeyBoard();
            this.in_put_label = null;
            initLabel(label,'?')
        } else {
            if (this.in_put_label) initLabel(this.in_put_label,'?');
            this.in_put_label = label;
            initLabel(label,'')
        }
        this.setBtn();
    },

    showKeyBoard() {
        /*   if(!this.node.active ){
              this.node.x += (this.node.width + 40);
          } */
        this.node.active = true;
        this.node.opacity = 255;
        this.setBtn();
        /*   cc.tween(this.node)
              .by(0.5, { x: -this.node.width - 40 })
              .start(); */
    },

    setKey(key) {
        this.in_put_label.string = key;
    },

    hideKeyBoard() {
        this.node.active = false;
        /*  cc.tween(this.node)
             .by(0.5, { x: this.node.width + 40 })
             .start(); */
    },

    clearKeyBoard(isShowAction = false) {
        this.in_put_label = null;
    },

    setBtn() {
        let label = this.in_put_label
        let del = this.grid_Frame.getChildByName('del').getComponent('key')
        let isShow = false;
        if (label) {
            isShow = label.string != '';
        }
        if (del) {
            del.setBtn(isShow);
        }
    },

    getKey() {
        return this.in_put_label.node;
    },

    touchKeyHandle(key) {
        if (!key.getCanHandle() || !this.in_put_label) {
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
        this._touchCallFunc && this._touchCallFunc(_numLabel.string);
        this.setBtn();
    },

});
