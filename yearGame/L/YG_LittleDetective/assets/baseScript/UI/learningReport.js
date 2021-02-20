cc.Class({
    extends: cc.Component,

    properties: {

    },


    // onLoad () {},

    start() {
        let canvasBG = cc.YL.setCanvasBG(this.node.getChildByName('bj').getComponent(cc.Sprite).spriteFrame);
        canvasBG.active = true;
        canvasBG.angle = 90;
        canvasBG.setContentSize(cc.winSize.height,cc.winSize.width);
        
        let date = new Date();
        let year = date.getFullYear();
        let month = date.getMonth();
        let day = date.getDate();

        let timeCount = this.node.getChildByName('timeCount').getComponent(cc.Label);
        let monthLabel = this.node.getChildByName('month').getComponent(cc.Label);
        let target = this.node.getChildByName('target').getComponent(cc.Label);

    },

    // update (dt) {},
});
