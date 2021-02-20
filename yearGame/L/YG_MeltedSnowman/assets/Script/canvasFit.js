cc.Class({
    extends: cc.Component,

    properties: {
       
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        let canvas = this.getComponent(cc.Canvas);
        let _widget = this.getComponent(cc.Widget);
        let winSize = cc.view.getFrameSize()
        //web页面DOM的屏幕比例大于16/9时,为全面屏手机
        if (winSize.width / winSize.height > 16 / 9) {
            console.log('phone')
        }



        //web页面DOM的屏幕比例小于16/9时,为ipad
        if (winSize.width / winSize.height < 16 / 9) {
            console.log('pad')
            //当当前设备为ipad时 改变设计分辨率
            canvas.designResolution = cc.Size(1920,1440);
            _widget.updateAlignment();
        }

    },

    start () {

    },

    // update (dt) {},
});
