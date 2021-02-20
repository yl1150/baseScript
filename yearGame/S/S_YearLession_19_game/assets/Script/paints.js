cc.Class({
    extends: cc.Component,

    properties: {
        radius: 100,
        finshPercent: 0.8,
        tips: cc.String,
    },

    // LIFE-CYCLE CALLBACKS:

    init(finshcb) {
        this.finshcb = finshcb;
        this.tx = this.node.getChildByName('tx');
        this.graCom = this.node.getChildByName('draw').getComponent(cc.Graphics);
        this.pointPoolNode = this.node.getChildByName('pointPool');
        this.pointPool = this.pointPoolNode.children;
        this.touchPoint = this.node.getChildByName('touchPoint');
        this.touchPoint.point_box = this.touchPoint.getComponent(cc.BoxCollider);
        this.maxPointCount = this.pointPool.length;
        cc.YL.tools.registerTouch(this.node, this.touchStart.bind(this), this.touchMove.bind(this), this.touchEnd.bind(this));
    },

    getPoint(tPoint) {
        let arr = [];
        let pos = cc.YL.tools.getRelativePos(this.touchPoint, this.pointPoolNode);
        this.pointPool.forEach((point) => {
            var touchLoc = point.convertToWorldSpaceAR(cc.v2(0, 0));
            if (cc.Intersection.pointInPolygon(touchLoc, tPoint.point_box.world.points)) {
                arr.push(point);
            }
        });

        arr.forEach((point) => {
            point.setParent(null);
            point.destroy();
        });

        if (this.pointPool.length / this.maxPointCount < (1 - this.finshPercent)) {
            //完成
            console.log('success');
            this.showfinishPainting();
        }
    },

    touchStart(event) {
        cc.YL.emitter.emit('setHand', false);
        this.touchPoint.setPosition(this.node.convertToNodeSpaceAR(event.touch._point));
    },

    touchMove(event) {
        this.getPoint(this.touchPoint);
        let touchPos = this.node.convertToNodeSpaceAR(event.touch._point);
        this.touchPoint.setPosition(touchPos);
        this.graCom.circle(touchPos.x, touchPos.y, this.radius);
        this.graCom.fill();
    },

    touchEnd(event) {
    },

    showfinishPainting() {
        cc.YL.lockTouch();
        cc.YL.tools.unRegisterTouch(this.node);

        this.graCom.clear();
        this.graCom.node.active = false;
        this.tx.getComponent(cc.Sprite).enabled = false;
        this.touchPoint.active = false;
        let ske = this.tx.getChildByName('success').getComponent(sp.Skeleton);
        ske.node.active = true;
        ske.setAnimation(0, 'animation2', false);
        this.getComponent(cc.Mask).enabled = false;


        GD.sound.playSound('right');
        GD.root.showStar(this.node, () => {
            ske.setAnimation(0, 'animation4', true);
            GD.sound.playTips(this.tips,()=>{
                ske.setAnimation(0, 'animation5', false);
                cc.tween(ske.node)
                    .by(2, { x: cc.winSize.width / 2 })
                    .call(() => {
                        this.finshcb && this.finshcb();
                    })
                    .start()
            })
        });
    },
});
