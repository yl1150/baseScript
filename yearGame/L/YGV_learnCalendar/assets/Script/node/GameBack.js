cc.Class({
    extends: cc.Component,

    properties: {},

    onLoad() {
        cc.origin.Note.script_gameback = this;
        //初始化
        this.base = this.node.getChildByName('base');
        this.base.active = false;
    },

    start() { },

    clickBack(event) {
        // history.go(-1);
        //清除声音
        cc.origin.AudioBase.stopAll();
        //清除延时
        cc.origin.ScheduleBase.removeAllTimeout();
        //清除循环
        cc.origin.ScheduleBase.removeAllInterval();
        //返回主界面
        cc.origin.Note.script_home.initUI();
        cc.origin.AudioBase.play('click');
    },

    setVisible(isVisible = true) {
        //如单个圆内游戏，则不显示主界面
        if (cc.origin.Note.script_gameContent && cc.origin.Note.script_gameContent.gameIndex > 0) return;

        this.base.active = isVisible;
    },
});