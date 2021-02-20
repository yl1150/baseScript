cc.Class({
    extends: cc.Component,

    properties: {
        targetBox: cc.Node,
    },

    // LIFE-CYCLE CALLBACKS:

    init(roundCtrl) {
        this._roundCtrl = roundCtrl;
        this.box = this.getComponent(cc.PolygonCollider);
        this.originPos = this.node.position;
        this._opList = this.node.parent;
    },

    touchStart(event) {
        this.node.zIndex = 99;
        this.box.enabled = true;
        this.node.position = this.node.parent.convertToNodeSpaceAR(event.touch._point);
        this.node.setScale(1);
    },

    touchMove(event) {
        this.node.position = this.node.parent.convertToNodeSpaceAR(event.touch._point);
    },

    touchEnd(event) {
        this.node.zIndex = -1;
        this.node.setScale(1);
        if (!this._collision) {
            this.showBack();
            return;
        }
        if (this.targetBox == this._collision) {
            GD.sound.playSound('right');
            GD.root.showStar(this._collision);
            this.showDown(this._collision);
            this._roundCtrl.checkIsAllRight();
        } else {
            GD.sound.playSound('wrong');
            GD.sound.playSound('blank');
            this.showBack();
            this._roundCtrl.setError();
        }
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
    showDown(collision) {
        collision.getComponent(cc.PolygonCollider).enabled = false;
        collision.getComponent(cc.Sprite).enabled = true;
        collision._state = 'lock';
        this.node.active = false;
        this.node.setParent(null);
        this.node.destroy();
    },


    showBack() {
        this._pColl = null;
        let pos = cc.YL.tools.getRelativePos(this.node, this._opList);
        this.node.parent = this._opList;
        this.node.position = pos;
        cc.tween(this.node)
            .then(cc.YL.aMgr.lineMove(this.node.position, this.originPos, 0.01))
            .call(() => {
            })
            .start()
    },

    showRightAnswer() {
        if (!this.targetBox) {
            return;
        }
        this.targetBox._state = 'lock';
        let pos = cc.YL.tools.getRelativePos(this.targetBox, this.node.parent);
        cc.tween(this.node)
            .then(cc.YL.aMgr.lineMove(this.node.position, pos, 0.1))
            .call(() => {
                this.showDown(this.targetBox);
            })
            .start()

    },
    // update (dt) {},
});
