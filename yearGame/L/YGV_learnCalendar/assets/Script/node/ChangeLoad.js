cc.Class({
    extends: cc.Component,

    properties: {},

    onLoad() {
        cc.origin.Note.script_changeLoad = this;
        //初始化
        this.base = this.node.getChildByName('base');
        this.base.active = false;

        this.ske = this.base.getChildByName('ske');
        this.ske.active = true;

        this.skeCom = this.ske.getComponent(sp.Skeleton);
    },

    start() { },

    /**
     * 显示加载动画
     * @param {Function} changeStageFunc 换舞台
     * @param {Function} endFunc 结束
     */
    showLoading(changeStageFunc, endFunc) {
        //加载界面
        this.base.active = true;
        this.skeCom.setAnimation(0, 'newAnimation', false);
        setTimeout(() => {
            //换舞台
            if (changeStageFunc) changeStageFunc();
        }, 1500);
        setTimeout(() => {
            //隐藏加载界面
            this.base.active = false;
            //加载后
            if (endFunc) endFunc();
        }, 3000);
    },
});