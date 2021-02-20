cc.Class({
    extends: cc.Component,

    properties: {
        targetBox:cc.Node
    },

    // LIFE-CYCLE CALLBACKS:

    init(roundCtrl, targetBox) {
        targetBox && (this.targetBox = targetBox);
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

    touchStart(event) {
        this.box.enabled = true;
        this.node.position = this.node.parent.convertToNodeSpaceAR(event.touch._point);

        this.node.setScale(1);
    },

    touchMove(event) {
        this.node.position = this.node.parent.convertToNodeSpaceAR(event.touch._point);
    },

    touchEnd(event) {
        this.node.setScale(1);
        if (!this._collision) {
            this.showBack();
            return;
        }
        if (this.targetBox == this._collision) {
            GD.sound.playSound('right');
            GD.root.showStar(this.targetBox);
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
        this.node.destroy();
        //collision.getComponent(cc.Sprite).enabled = true;
        collision.getComponent(cc.BoxCollider).enabled = false;
        collision._state = 'lock';
        let q_frame = collision.getChildByName('frame');
        q_frame.active = true;
        let xuxian = collision.getChildByName('xuanxuxian');
        xuxian.active = false;
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
