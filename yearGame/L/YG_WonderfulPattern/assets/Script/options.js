cc.Class({
    extends: cc.Component,

    properties: {
        targetName: 1
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
        this.node.name = 'op';
        this._state = 'init';
    },

    copySelf() {
        let op = cc.instantiate(this.node);
        op.setParent(this._opList);
        op.setPosition(this.originPos.x, this.originPos.y);
        op.zIndex = -1;
        let op_com = op.getComponent('options');
        op_com.init(this._roundCtrl);
    },

    touchStart(event) {
        this.copySelf();
        this._state = 'init';
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
        this.showDown(this._collision);
    },

    onCollisionEnter(other, self) {
        if (other.tag != 99 || this._state == 'lock') {
            return;
        }
        let new_Colll = cc.YL.tools.onCollision(this.node, other.node);
        let xuxiandie
        !this._collision && (this._collision = new_Colll);
        if (this._collision != new_Colll) {
            xuxiandie = this._collision.getComponent(cc.Sprite);
            if (xuxiandie) xuxiandie.enabled = false;
            this._collision = new_Colll;
        }

        xuxiandie = this._collision.getComponent(cc.Sprite);
        if (xuxiandie) xuxiandie.enabled = true;
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
        let xuxiandie = other.node.getComponent(cc.Sprite);
        if (xuxiandie) xuxiandie.enabled = false;
    },

    //将节点放置在节点里
    showDown(collision) {
        if (this.node.parent != this._opList) {
            this.node.parent._opType = '';
        }
        let arr = cc.YL.tools.arrCopy(collision.children);
        for (let i in arr) {
            arr[i].setParent(null);
            arr[i].destroy();
        }
        collision._opType = this.targetName;
        collision.getComponent(cc.Sprite).enabled = false;
        this.box.enabled = false;
        this.node.setParent(collision);
        this.node.setPosition(0, 0);
        this._state = 'lock';
    },


    showBack() {
        if (this.node.parent != this._opList) {
            this.node.parent._opType = '';
        }
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
        if (!this.targetName) {
            return;
        }
        let targetBox = this._roundCtrl.getTargetBox(this.targetName);
        if (!targetBox) {
            return;
        }
        let pos = cc.YL.tools.getRelativePos(targetBox, this.node.parent);
        cc.tween(this.node)
            .then(cc.YL.aMgr.lineMove(this.node.position, pos, 0.05))
            .call(() => {
                this.showDown(targetBox);
            })
            .start()

    },
    // update (dt) {},
});
