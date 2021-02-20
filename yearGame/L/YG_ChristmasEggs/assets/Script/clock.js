cc.Class({
    extends: cc.Component,

    properties: {

    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        let widget = this.getComponent(cc.Widget);
        widget.target = cc.find('Canvas');
        widget.updateAlignment();

        this.hour = 0;
        this.minute = 0;
    },

    //初始化时针
    init(h, m) {
        let hHand = this.node.getChildByName('hHand');
        let mHand = this.node.getChildByName('mHand');

        let perAngel = -360 / 12;
        let hAngel = h * perAngel;

        perAngel = -360 / 60;
        let mAngel = perAngel * m;
        hHand.angle = hAngel;
        mHand.angle = mAngel;
        this.hour = h;
        this.minute = m;
    },

    setTime(h, m, timeScale = 1, cb) {
        let now_totalT = h * 60 + m;
        let totalT = this.hour * 60 + this.minute;
        let disT = now_totalT >= totalT ? (now_totalT - totalT) : (disT = 12 * 60 - totalT + now_totalT);

        this.hour = h;
        this.minute = m;

        h = disT / 60;
        m = disT - h * 60;

        let hHand = this.node.getChildByName('hHand');
        let mHand = this.node.getChildByName('mHand');

        let perAngel = -360 / 60;
        let mAngel = perAngel * m;

        let time = timeScale;

        GD.sound.playSound('clock');
        //分针每转一圈 时针转1格
        let action = cc.tween()
            .by(time, { angle: h >= 1 ? -360 : -360 * h })
            .call(() => {
                cc.tween(hHand)
                    .by(time / 10, { angle: h >= 1 ? -30 : h * -30 })
                    .start()
            })

        cc.tween(mHand)
            .repeat(h >= 1 ? h : 1, action)
            .by(time / 2, { angle: mAngel })
            .call(() => {
                GD.sound.stopEffect('clock');
                cb && cb();
            })
            .start()
    },
});
