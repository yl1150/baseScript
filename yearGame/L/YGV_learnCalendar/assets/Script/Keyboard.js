/**
 * 键盘类型
 */
const KeyboardType = cc.Enum({
    /**
     * 混合
     */
    TYPE_ALL: 0,
    /**
     * 数字
     */
    TYPE_NUMBER: 1,
    /**
     * 符号
     */
    TYPE_SYMBOL: 2
})
cc.Class({
    extends: cc.Component,

    properties: {},

    onLoad() {
        this.base = this.node.getChildByName('base');
        this.base.active = false;
        this.contents = this.base.getChildByName('contents');
        this.contents.children.forEach(x => { x.active = false })
        //数字节点样本
        this.sampleNumNode = this.base.getChildByName('numNode');
        this.sampleNumNode.getComponent(cc.Label).string = '';
        this.sampleNumNode.active = false;
        //封面，用于覆盖整个键盘，不让点击
        this.cover = this.base.getChildByName("cover");
        this.cover.active = false;
        //输入框
        this.inputBox = null;
        //数字节点
        this.numNode = null;
        //初始化字体
        this.labelCom = null;
        //最多的数字位数
        this.maxFigureCount = 0;
        //确认键回调
        this.okCallback = null;
        //键弹起回调（除了确认键）
        this.touchUpCallback = null;
        //键数组
        this.key_arr = [];
        //设置键盘
        this.setKeyboard();
    },

    start() { },

    registerKeyTouch(pNode) {
        var temp_arr = [];
        if (pNode) {
            temp_arr.push(pNode);
        } else {
            temp_arr = this.key_arr;
        }
        temp_arr.forEach(pItem => {
            pItem.$canTouch = true;
            pItem.on(cc.Node.EventType.TOUCH_START, function (event) {
                if (cc.origin.Note.touchTarget) return;
                if (!event.target.$canTouch) return;
                cc.origin.Note.touchTarget = event.target;
                cc.origin.EventManager.emit(cc.origin.EventDefine.COMMON.FREEZE_TIME);
                cc.origin.AudioBase.play('click');
                //按下效果
                var key = cc.origin.Note.touchTarget;
                if (key.name === '-1' || key.name === '10') {
                    key.getComponent(cc.Sprite).spriteFrame = key.$pressedSpriteFrame;
                } else {
                    var bg_key = key.getChildByName('bg');
                    bg_key.getChildByName('1').active = false;
                    bg_key.getChildByName('2').active = true;
                    // key.getChildByName('num').color=cc.color(255, 252, 169,255);
                }
                //喇叭停止循环
                cc.origin.Note.isLoopTrumpet = false;
            }, this)
            pItem.on(cc.Node.EventType.TOUCH_MOVE, function (event) { }, this)
            pItem.on(cc.Node.EventType.TOUCH_END, touchUp, this)
            pItem.on(cc.Node.EventType.TOUCH_CANCEL, touchUp, this)
            function touchUp(event) {
                if (!cc.origin.Note.touchTarget) return;
                cc.origin.EventManager.emit(cc.origin.EventDefine.COMMON.KINETIC_TIME);
                //弹起状态
                var key = cc.origin.Note.touchTarget;
                if (key.name === '-1' || key.name === '10') {
                    key.getComponent(cc.Sprite).spriteFrame = key.$normalSpriteFrame;
                } else {
                    var bg_key = key.getChildByName('bg');
                    bg_key.getChildByName('1').active = true;
                    bg_key.getChildByName('2').active = false;
                    // key.getChildByName('num').color = cc.color(113, 55, 23, 255);
                }
                //按钮回调
                this.onClickButton(event);
                //重置触摸对象
                cc.origin.Note.touchTarget = null;
            }
        })
    },

    unregisterKeyTouch(pNode) {
        var temp_arr = [];
        if (pNode) {
            temp_arr.push(pNode);
        } else {
            temp_arr = this.key_arr;
        }
        temp_arr.forEach(pItem => {
            pItem.off(cc.Node.EventType.TOUCH_START)
            pItem.off(cc.Node.EventType.TOUCH_MOVE)
            pItem.off(cc.Node.EventType.TOUCH_END)
            pItem.off(cc.Node.EventType.TOUCH_CANCEL)
        })
    },

    /**
     * 设置键盘
     * @param {cc.Node} inputBox 输入框
     * @param {Number} keyboardType 键盘类型（0：混合，1：数字，2：符号+-）
     * @param {Number} maxFigureCount 可输入最多位数
     * @param {Function} okCallback 确认回调
     * @param {Function} touchUpCallback 键弹起回调（除了确认键）
     */
    setKeyboard(inputBox = this.node.parent, keyboardType = KeyboardType.TYPE_NUMBER, maxFigureCount = 0, okCallback, touchUpCallback) {
        //确定键盘类型
        this.contents.children.forEach(x => { x.active = false })
        this.content = this.contents.getChildByName('' + keyboardType);
        this.content.active = true;
        //注册键触摸
        this.unregisterKeyTouch();//先注销原键触摸
        this.key_arr = this.content.children.map(x => { return x });
        this.registerKeyTouch();
        //确认键
        this.okButton = this.content.getChildByName("10");
        this.sprite_okButton = this.okButton.getComponent(cc.Sprite);
        //输入框
        this.inputBox = inputBox;
        //数字节点
        this.numNode = this.inputBox.getChildByName("numNode");
        if (!this.numNode) {
            this.numNode = cc.instantiate(this.sampleNumNode);
            this.numNode.setParent(this.inputBox);
            this.numNode.active = true;
            this.numNode.name = 'numNode';
            this.numNode.setPosition(cc.v2(0, 0));
        }
        //初始化字体
        this.labelCom = this.numNode.getComponent(cc.Label);
        if (!this.labelCom) {
            this.labelCom = this.numNode.addComponent(cc.Label);
            this.labelCom.font = this.sampleNumNode.getComponent(cc.Label).font;
            if (this.labelCom.font) {
                //设置字体高度
                var fontHeight = 0;
                var fontDict = this.labelCom.font._fntConfig.fontDefDictionary;
                for (let i in fontDict) {
                    fontHeight = fontDict[i].rect.height;
                    break;
                }
                this.labelCom.lineHeight = fontHeight;
                //设置字体尺寸
                this.labelCom.fontSize = this.labelCom._bmFontOriginalSize;
            }
        }
        //最多的数字位数
        this.maxFigureCount = maxFigureCount;
        //如是符号键盘，并且未设置输入位数，则默认最多输入一位
        if (keyboardType === KeyboardType.TYPE_SYMBOL && maxFigureCount === 0) this.maxFigureCount = 1;
        //确认键回调
        if (okCallback) this.okCallback = okCallback;
        //键弹起回调（除了确认键）
        if (touchUpCallback) this.touchUpCallback = touchUpCallback;
        //确认和删除图片记录
        var del = this.content.getChildByName('-1');
        del.$normalSpriteFrame = del.getComponent(cc.Sprite).spriteFrame;
        del.$pressedSpriteFrame = del.getChildByName('pressed').getComponent(cc.Sprite).spriteFrame;
        var ok = this.content.getChildByName('10');
        ok.$normalSpriteFrame = ok.getComponent(cc.Sprite).spriteFrame;
        ok.$pressedSpriteFrame = ok.getChildByName('pressed').getComponent(cc.Sprite).spriteFrame;
        //如果输入框有值，那么可以触摸删除和确认键
        this.setDelAndOK(this.labelCom.string.length);
        //缩放输入框问号
        this.scaleQuest(this.labelCom.string.length === 0);
    },

    /**
     * 设置可见
     * @param {Boolean} isVisible 是否可见
     */
    setVisible(isVisible = true) {
        this.base.active = isVisible;
    },

    /**
     * 设置键盘是否可触摸
     * @param {Boolean} canTouch 是否可触摸
     */
    setTouch(canTouch = true) {
        this.cover.active = canTouch;
    },

    /**
     * 设置删除键和确认键触摸
     * @param {Boolean} canTouch 是否可触摸
     */
    setDelAndOK(canTouch = true) {
        var del = this.content.getChildByName('-1');
        del.$canTouch = canTouch;
        del.getComponent(cc.Sprite).spriteFrame = del.$normalSpriteFrame;
        if (del.$canTouch) {
            cc.origin.ShaderBase.setSpriteShader(del, cc.origin.ShaderBase.ShaderType.Default);
        } else {
            cc.origin.ShaderBase.setSpriteShader(del, cc.origin.ShaderBase.ShaderType.Gray);
        }
        var ok = this.content.getChildByName('10');
        ok.$canTouch = canTouch;
        ok.getComponent(cc.Sprite).spriteFrame = ok.$normalSpriteFrame;
        if (ok.$canTouch) {
            cc.origin.ShaderBase.setSpriteShader(ok, cc.origin.ShaderBase.ShaderType.Default);
        } else {
            cc.origin.ShaderBase.setSpriteShader(ok, cc.origin.ShaderBase.ShaderType.Gray);
        }
    },

    /**
     * 缩放输入框问号
     * @param {Boolean} canScale 是否可缩放
     */
    scaleQuest(canScale = true) {
        if (!this.inputBox) return;
        var quest = this.inputBox.getChildByName('quest');
        if (!quest) return;
        quest.active = canScale;
        quest.stopAllActions();
        quest.setScale(1, 1);
        if (canScale) {
            cc.tween(quest)
                .repeatForever(cc.tween().to(1, { scale: 1.3 }).to(1, { scale: 1 }))
                .start();
        }
    },

    /**
     * 设置数字间距
     * @param {number} pWidth 
     */
    setNumInterval(pWidth) {
        if (pWidth != null) { this.labelCom.spacingX = pWidth; }
    },

    getInput() {
        if (!this.labelCom.string) { return; }
        return this.labelCom.string;
    },

    onClickButton(event) {
        // cc.origin.AudioBase.play('click');
        let pKey = event.target;
        let pNum = Number(pKey.name);
        switch (pNum) {
            case -1:/*删除键*/
                // pKey.getComponent(cc.Sprite).spriteFrame = pKey.getComponent(cc.Button).normalSprite;
                this.onClickDel();
                break;
            case 10:/*确认键*/
                // pKey.getComponent(cc.Sprite).spriteFrame = pKey.getComponent(cc.Button).normalSprite;
                this.onClickOk();
                break;
            case 11: case 12:/*加减符号*/
                this.onClickSymbol(pNum);
                //如果输入是符号，那么直接确认
                this.onClickOk();
                break;
            case 0: case 1: case 2: case 3: case 4: case 5: case 6: case 7: case 8: case 9:
                this.onClickNum(pNum);
                break;
            default:
                break;
        }
        //执行弹起回调
        if (pNum !== 10 && this.touchUpCallback) this.touchUpCallback();
        //如果输入框有值，那么可以触摸删除和确认键
        this.setDelAndOK(this.labelCom.string.length);
        //缩放输入框问号
        if (pNum === 10 || pNum === 11 || pNum === 12) {
            this.scaleQuest(false);//对于点击后就判定正误的键，不缩放问号，待错误语音后需主动缩放问号
        } else {
            this.scaleQuest(this.labelCom.string.length === 0);
        }
    },

    onClickDel() {
        if (!this.labelCom.string) { return; }
        this.deleteNum();
    },

    onClickOk() {
        if (!this.labelCom.string) { return; }
        //存储数字
        let finalInput = this.getInput();
        let data = { inputBox: this.inputBox, inputValue: finalInput };
        cc.origin.EventManager.emit(cc.origin.EventDefine.KEYBOARD.CLICK_OK, data);
        //确认键回调
        if (this.okCallback) this.okCallback();
    },

    onClickSymbol(pNum) {
        var symbol = '';
        if (pNum === 11) {
            symbol = '+';
        } else if (pNum === 12) {
            symbol = '-';
        }
        //如果最多一位数，则覆盖书写
        if (this.maxFigureCount === 1) {
            this.labelCom.string = symbol;
        } else {
            if (this.labelCom.string.length >= this.maxFigureCount && this.maxFigureCount > 0) {
                cc.origin.AudioBase.play('blank');
                return;
            }
            this.labelCom.string += symbol;
        }
        //确认键换成醒目的图片，提示点击确认
        // var spt_disabled = this.okButton.getComponent(cc.Button).disabledSprite;
        // if (spt_disabled) this.sprite_okButton.spriteFrame = spt_disabled;
    },

    onClickNum(pNum) {
        //如果最多一位数，则覆盖书写
        if (this.maxFigureCount === 1) {
            this.labelCom.string = '';
            this.writeNum(pNum);
        } else {
            if (this.labelCom.string.length >= this.maxFigureCount && this.maxFigureCount > 0) {
                cc.origin.AudioBase.play('blank');
                return;
            }
            this.writeNum(pNum);
        }
    },

    writeNum(pNum) {
        this.labelCom.string += pNum;
        //确认键换成醒目的图片，提示点击确认
        // var spt_disabled = this.okButton.getComponent(cc.Button).disabledSprite;
        // if (spt_disabled) this.sprite_okButton.spriteFrame = spt_disabled;
        //将高位的0删除
        let num_str = this.labelCom.string;
        if (num_str[0] === '0' && parseInt(num_str[1]) >= 0) { this.labelCom.string = "" + parseInt(num_str); }
    },

    deleteNum(deleteCount = 1) {
        let len = this.labelCom.string.length;
        if (len < deleteCount) { deleteCount = len; }
        this.labelCom.string = this.labelCom.string.slice(0, len - deleteCount);
        //判断醒目的确认键是否要换回普通图
        if (!this.labelCom.string) {
            // var spt_normal = this.okButton.getComponent(cc.Button).normalSprite;
            // if (spt_normal) this.sprite_okButton.spriteFrame = spt_normal;
        }
    },

    clearNum() {
        //清除所有输入
        this.labelCom.string = '';
    },

    destroySelf() {
        //注销确认键盘事件
        cc.origin.EventManager.off(cc.origin.EventDefine.KEYBOARD.CLICK_OK);
        //停止缩放问号
        this.scaleQuest(false);
        //销毁
        if (this.node) {
            this.node.removeFromParent();
            this.node.destroy();
        }
    },
});