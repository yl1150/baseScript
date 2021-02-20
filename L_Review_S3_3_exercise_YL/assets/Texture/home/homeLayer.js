//断点续播控制脚本
let GAMELIST = require('Define').GAMELIST;

cc.Class({
    extends: cc.Component,

    properties: {

    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    init() {
        //从服务端获取学习数据 
        GD.lastMistakeId_arr = [];
        cc.YL.net.getQuestionMistakeData(
            (receive) => {
                console.log(receive);
                if (receive && receive.data && receive.data.mistakes) {
                    GD.lastMistakeId_arr = receive.data.mistakes.split(',').map(x => { return parseInt(x) });
                }
                this.showButton();
            },
        )
    },

    showButton() {
        let registerTouch = (targetBtn) => {
            cc.YL.tools.registerTouch(
                targetBtn,
                (e) => {
                    e.target.setScale(0.8);
                },
                null,
                (e) => {
                    e.target.setScale(1);
                    cc.YL.emitter.emit('startGame');
                    this.node.destroy();
                }
            );
        }

        let uiNode = this.node.getChildByName('noRecordedUI');
        uiNode.active = true;
        GD.iRoundID = 1;
        registerTouch(uiNode.getChildByName('start_Icon'));
        cc.YL.unLockTouch();
    }
});
