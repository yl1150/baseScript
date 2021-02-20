cc.Class({
    extends: cc.Component,

    properties: {

    },

    init() {
        this.touchLayer = this.node.getChildByName('touchLayer');
        this.list = this.node.getChildByName('list');
        cc.YL.lockTouch();
        cc.YL.tools.registerTouch(
            this.touchLayer,
            (e) => {
            },
            null,
            (e) => {
                this.hideList();
            },
        );
    },

    showList() {
        this.touchLayer.active = false;
        cc.YL.lockTouch();
        this.node.active = true;
        cc.tween(this.node)
            .by(0.5, { y: -this.node.height })
            .call(()=>{
                this.touchLayer.active = true;
                cc.YL.unLockTouch();
            })
            .start()
    },

    hideList() {
        this.touchLayer.active = false;
        cc.YL.lockTouch();
        cc.tween(this.node)
            .by(0.5, { y: this.node.height })
            .call(() => {
                this.node.active = false;
                cc.YL.unLockTouch();
            })
            .start()
    },

    addAnswer(answer) {
        if (!answer) {
            return;
        }
        answer.setParent(this.list);
        answer.setScale(0.33);
        answer.setPosition(0,0);
    },
    // update (dt) {},
});
