cc.Class({
    extends: cc.Component,
    properties: {
        keyType: 'num_gKeyboard',
    },

    onLoad() {
    },

    //锁定键 禁止点击操作
    lockKey() {
        cc.YL.tools.unRegisterTouch(this.node);
    },

    init(touchCB) {
        this.label = this.getComponent(cc.Label);
    },

    initKey() {
        this.label.string = '';
        this.label.node.y = 0;
    },

    setKey(key) {
        if (key == 'del') {
            if (this.label.string.length <= 1) {
                this.label.string = ''
            } else {
                this.label.string = this.label.string.split('').shift()
            }
        } else if (key == 'enter') {
            //点击确认键 判断正误
            //this.hideKeyBoard()
        } else if (key == '') {
            //初始化
            this.label.string == '?' && (this.label.string = key);
        } else if (key == '?') {
            //重置
            this.label.string = key;
        } else {
            //当不为数字键盘时 不会出现二位字符
            if (this.keyType != 'num_gKeyboard') {
                this.label.string = key;
            } else if (this.label.string.length > 1) {
                GD.sound.playSound('blank2')
            } else {
                if (this.label.string == '' || this.label.string == '?') {
                    this.label.string = key
                } else {
                    this.label.string += key
                }
            }

        }

        switch (this.label.string) {
            case '-':
                this.label.node.y = -35;
                break;
            case '+':
                this.label.node.y = -9;
                break;
            default:
                this.label.node.y = 0;
                break;
        }
    },

    getKeysState() {
        return this.label.string != '' && this.label.string != '?';
    },

    getKeys() {
        return this.label.string;
    },
});
