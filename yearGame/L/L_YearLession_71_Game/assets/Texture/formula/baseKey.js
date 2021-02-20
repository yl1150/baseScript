cc.Class({
    extends: cc.Component,
    properties: {
        normalLbColor: cc.Color,
        touchOnLbColor: cc.Color,
        norTexture: cc.SpriteFrame,
        touchTexture: cc.SpriteFrame,
        setColor: true,
        keyType: 'num_gKeyboard'
    },

    onLoad() {
    },

    init(touchCB) {
        this.label = this.node.getChildByName('input').getComponent(cc.Label);
        this.sprite = this.getComponent(cc.Sprite);
        cc.YL.tools.registerTouch(
            this.node,
            (e) => {
                //e.target.setScale(1.2);
            },
            null,
            (e) => {
                touchCB && touchCB(this);
            },
        )
    },

    initKey() {
        this.label.string = '?';
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
            this.label.string == '' && (this.label.string = key);
        } else {
            //当不为数字键盘时 不会出现二位字符
            if (this.keyType != 'num_gKeyboard') {
                this.label.string = key;
            } else if (this.label.string.length > 1) {
                GD.sound.playSound('blank2')
            } else {
                if (this.label.string == '') {
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

    setTouch(isShow) {
        this.sprite.spriteFrame = isShow ? this.touchTexture : this.norTexture;
        if (!this.setColor) {
            return;
        }
        //this.label.node.color = isShow ? this.touchOnLbColor : this.normalLbColor;
    },

    getKeysState() {
        return this.label.string != '' && this.label.string != '?';
    },

    getKeys() {
        return this.label.string;
    },
});
