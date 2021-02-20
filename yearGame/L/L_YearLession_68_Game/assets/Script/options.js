cc.Class({
    extends: cc.Component,

    properties: {
    },

    // LIFE-CYCLE CALLBACKS:

    init(roundCtrl) {
        this._roundCtrl = roundCtrl;
        cc.YL.tools.registerTouch(this.node, this.touchStart.bind(this), this.touchMove.bind(this), this.touchEnd.bind(this));
        this.box = this.addComponent(cc.BoxCollider);
        this.box.size.width = this.node.width;
        this.box.size.height = this.node.height;
        this.box.tag = 111;
        this.originPos = this.node.position;
        this._opList = this.node.parent;
        this._state = 'init';
    },

    touchStart(event) {
        this._state = 'touch';
        this._roundCtrl.hideHand();
        this.node.zIndex = 99;
        this.originPos = this.node.position;
        this.node.position = this.node.parent.convertToNodeSpaceAR(event.touch._point);
        this.node.setScale(1);
    },

    touchMove(event) {
        this.node.position = this.node.parent.convertToNodeSpaceAR(event.touch._point);
    },

    touchEnd(event) {
        this._state = 'init';
        this.node.setScale(1);
        if (!this._collision) {
            this._roundCtrl.putOP(this.node);
            return;
        }
        this.showDown(this._collision);
    },

    onCollisionEnter(other, self) {
        if(this._state != 'touch'){
            //不在拖拽情况下 不处理碰撞逻辑
            return;
        }
        let new_Colll = cc.YL.tools.onCollision(this.node, other.node);
        //!this._collision && (this._collision = new_Colll);
        if (this._collision != new_Colll) {
            this._roundCtrl.moveOp(this.node, new_Colll);
            this._collision = new_Colll;
        }
    },

    onCollisionStay(other, self) {
        this.onCollisionEnter(other, self);
    },

    onCollisionExit(other, self) {
        if(this._state != 'touch'){
            //不在拖拽情况下 不处理碰撞逻辑
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
        this._roundCtrl.putOP(this.node, collision);
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
        let target = this._roundCtrl.getTargetBox(this.targetBox.name);
        if (!target) {
            return;
        }
        target._state = 'lock';
        let pos = cc.YL.tools.getRelativePos(target, this.node.parent);
        cc.tween(this.node)
            .then(cc.YL.aMgr.lineMove(this.node.position, pos, 0.01))
            .call(() => {
                this.showDown(target);
            })
            .start()

    },
    // update (dt) {},
});
