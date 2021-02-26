cc.Class({
    extends: cc.Component,

    properties: {
    },

    onLoad() {
        //屏幕尺寸改变时
        cc.view.on('canvas-resize', function () {
            console.log('winSize change!');
            //保持scene尺寸
            this.screenAdaptation();
        }, this);

        this.screenAdaptation();
    },


    screenAdaptation() {
        // 1. 先找到 SHOW_ALL 模式适配之后，本节点的实际宽高以及初始缩放值
        let srcScaleForShowAll = Math.min(
            cc.view.getCanvasSize().width / this.node.width,
            cc.view.getCanvasSize().height / this.node.height
        );
        let realWidth = this.node.width * srcScaleForShowAll;
        let realHeight = this.node.height * srcScaleForShowAll;

        // 2. 基于第一步的数据，再做节点宽高重置
        this.node.width = this.node.width * (cc.view.getCanvasSize().width / realWidth);
        this.node.height = this.node.height * (cc.view.getCanvasSize().height / realHeight);
    },


    fit() {
        let originSize = cc.Size(1230, 600);
        let widget = this.getComponent(cc.Widget);
        if (this.node.height > originSize.height) {
            //拉伸了 
            this.node.height = originSize.height;
            widget.enabled = false;
        }
    },
});
