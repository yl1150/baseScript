cc.Class({
    extends: cc.Component,

    properties: {
    },

    // LIFE-CYCLE CALLBACKS:

    init(roundCtrl) {
        cc.YL.tools.registerTouch(this.node, this.touchStart.bind(this), this.touchMove.bind(this), this.touchEnd.bind(this));
        this.box = this.addComponent(cc.BoxCollider);
        this.box.size.width = this.node.width;
        this.box.size.height = this.node.height;
        this.box.tag = 111;
        this.originPos = this.node.position;
        this._opList = this.node.parent;
        this.node.name = 'op';
        this._state = 'init';
        this.origonScale = this.node.scaleX;
    },

    reSet() {
        if(this.node.parent != this._opList && this._targetCollision){
            this._targetCollision.fishCount--;
        }
        let pos = cc.YL.tools.getRelativePos(this.node, this._opList);
        this.node.parent = this._opList;
        this.node.position = pos;
        this.box.enabled = true;
    },

    touchStart(event) {
        this.reSet();
        this.node.position = this.node.parent.convertToNodeSpaceAR(event.touch._point);
        this.node.setScale(this.origonScale * 1.2);
    },

    touchMove(event) {
        this.node.position = this.node.parent.convertToNodeSpaceAR(event.touch._point);
    },

    touchEnd(event) {
        this.node.setScale(this.origonScale);
        if (!this._collision) {
            this.showBack();
            return;
        }
        this.showDown(this._collision);
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

    //将节点放置在节点里
    showDown(collision) {
        let target = null;
        collision.children.forEach((pNode) => {
            if (pNode.childrenCount < 1 && !target) {
                target = pNode
            }
        });
        this._targetCollision = collision;
        collision.fishCount++;
        this.node.parent = target;
        this.node.setPosition(0, 0);
        cc.YL.emitter.emit('reFreshUI');
    },


    showBack() {
        this._pColl = null;
        let pos = cc.YL.tools.getRelativePos(this.node, this._opList);
        this.node.parent = this._opList;
        this.node.position = pos;
        cc.tween(this.node)
            .then(cc.YL.aMgr.lineMove(this.node.position, this.originPos, 0.01))
            .call(() => {
                cc.YL.emitter.emit('reFreshUI');
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
