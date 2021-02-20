cc.Class({
    extends: cc.Component,

    properties: {},

    onLoad() {
        cc.origin.Script[this.__classname__] = this;
        this.base = this.node.getChildByName('base');
        this.base.active = false;
    },

    onDestroy() {
        cc.origin.Script[this.__classname__] = null;
    },

    start() { },

    /**
     * 添加键盘
     * @param {cc.Node} keyBox 键盘父节点
     * @param {*} self 
     */
    addKeyboard(keyBox, self = this) {
        //创建键盘
        var keyboardSample = this.base.getChildByName('keyboard');
        var keyboard = cc.instantiate(keyboardSample);
        keyboard.setParent(keyBox);
        var widgetCom_keyboard = keyboard.getComponent(cc.Widget);
        if (widgetCom_keyboard) {
            widgetCom_keyboard.target = cc.find('Canvas');
            widgetCom_keyboard.updateAlignment();
        } else {
            keyboard.setPosition(cc.v2(0, 0));
        }
        self.script_keyboard = keyboard.getComponent('Keyboard');
    },

    /**
     * 添加星星效果
     * @param {*} pNode 
     * @param {*} scaleValue 
     */
    addStarEffect(pNode, scaleValue = 1) {
        //星星
        var pStar = pNode.getChildByName('pStar');
        if (!pStar) {
            var sample_pStar = this.base.getChildByName('pStar');
            pStar = cc.instantiate(sample_pStar);
            pStar.setParent(pNode);
            pStar.setPosition(cc.v2(0, 0));
        }
        pStar.active = true;
        pStar.setScale(2 * scaleValue, 2 * scaleValue);
        var particle = pStar.getChildByName('particle');
        particle.active = true;
        var particleCom_star = particle.getComponent(cc.ParticleSystem);
        particleCom_star.resetSystem();
    },

    /**
     * 添加确认键
     * @param {*} pNode 
     * @param {*} cb 
     */
    addOkButton(pNode, cb) {
        var sample_ok = this.base.getChildByName('ok');
        var ok = cc.instantiate(sample_ok);
        ok.setParent(pNode);
        ok.active = true;
        var widget_ok = ok.getComponent(cc.Widget);
        widget_ok.target = cc.find('Canvas');
        widget_ok.updateAlignment();
        var script_ok = ok.getComponent('Ok');
        if (script_ok) script_ok.setOkCallback(cb);

        return ok;
    },
});