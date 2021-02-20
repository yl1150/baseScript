cc.Class({
    extends: cc.Component,

    properties: {

    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        this._canUpdate = false;
        this._camera = this.getComponent(cc.Camera);
    },

    //设置镜头拉伸的效果
    setLensTensile(zoomRatio = 1) {
        this._camera.zoomRatio = zoomRatio;
    },
    
    //展示镜头拉伸的效果
    showLensTensile(zoomRatio = 1, speed = 0.01, cb) {
        this.targetZR = zoomRatio;
        this._canUpdate = true;
        this._speed = speed;
        this.cb = cb;
    },

    update(dt) {
        if (!this._canUpdate) {
            return;
        }

        this._camera.zoomRatio += this._speed;
        if (this._camera.zoomRatio >= this.targetZR) {
            this._camera.zoomRatio = this.targetZR;
            this._canUpdate = false;
            this.cb && this.cb();
            this.cb = null;
        }
    },
});
