cc.Class({
    extends: cc.Component,

    properties: {
        targetBox: cc.Node
    },

    // LIFE-CYCLE CALLBACKS:

    init(cb) {
        cc.YL.tools.registerTouch(this.node, this.touchStart.bind(this), null, this.touchEnd.bind(this));
        this.originPos = this.node.position;
        this._opList = this.node.parent;
        this.touchCB = cb;
    },

    getParentState(){
        return this.node.parent == this._opList;
    },

    touchStart(event) {
        this.node.setScale(1);
    },

    touchEnd(event) {
        this.node.setScale(1);
        this.touchCB && this.touchCB(this);
    },

    onCollisionEnter(other, self) {
        if (other.tag != 99) {
            return;
        }
        let new_Colll = cc.YL.tools.onCollision(this.node, other.node);
        !this._collision && (this._collision = new_Colll);
        if (this._collision != new_Colll) {
            this._collision = new_Colll;
        }
    },

    onCollisionStay(other, self) {
        this.onCollisionEnter(other, self);
    },

    onCollisionExit(other, self) {
        if (other.tag != 99) {
            return;
        }
        let target = other.node
        cc.YL.tools.onCollisionExit(this.node, target);
        if (this._collision == target) {
            this._collision = null;
        }
    },

    checkIsLock() {
        if (!this.targetBox) {
            return true;
        }
        return this._state == 'lock'
    },

    //将节点放置在节点里
    showDown(target) {
        let goods = cc.instantiate(this.node);
        goods.name = this.node.name;
        goods.setParent(this._opList);
        goods.setPosition(this.originPos);
        goods.getComponent('options').init(this.touchCB);

        let pos = cc.YL.tools.getRelativePos(goods, target);
        goods.setParent(target);
        goods.position = pos;
        cc.tween(goods)
            .to(0.5, { position: cc.v2(0, 0) })
            .start()
    },


    showBack() {
        this._pColl = null;
        let pos = cc.YL.tools.getRelativePos(this.node, this._opList);
        this.node.parent = this._opList;
        this.node.position = pos;
        cc.tween(this.node)
            .then(cc.YL.aMgr.lineMove(this.node.position, this.originPos, 0.01))
            .call(() => {
                this.node.setParent(null);
                this.node.destroy();
            })
            .start()
    },

    showRightAnswer() {
        if (!this.targetBox) {
            return;
        }
        let pos = cc.YL.tools.getRelativePos(this.targetBox, this.node.parent);
        cc.tween(this.node)
            .then(cc.YL.aMgr.lineMove(this.node.position, pos, 0.05))
            .call(() => {
                this.showDown(this.targetBox);
            })
            .start()

    },
    // update (dt) {},
});
