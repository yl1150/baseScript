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

    addKeyboard(keyBox) {
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
        this.script_keyboard = keyboard.getComponent('Keyboard');
    },

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

    /**数字团簇动画 */
    addNumSpAni(pNode, num, scaleValue = 1) {
        //星星
        var pNum = pNode.getChildByName('numGroup');
        if (!pNum) {
            var sample_num = this.base.getChildByName('numGroup');
            pNum = cc.instantiate(sample_num);
            pNum.setParent(pNode);
            pNum.setPosition(cc.v2(0, 0));
        }
        pNum.active = true;
        pNum.setScale(scaleValue, scaleValue);
        var skeleton = pNum.getChildByName('sp');
        skeleton.active = true;
        var skeleton_num = skeleton.getComponent(sp.Skeleton);
        skeleton_num.setSkin("shu" + num);
        skeleton_num.setCompleteListener(() => {
            skeleton_num.destroy();
        });
    },
});