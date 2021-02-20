cc.Class({
    extends: cc.Component,

    properties: {
        targetBox: cc.Node
    },

    // LIFE-CYCLE CALLBACKS:

    init(roundCtrl) {
        this._roundCtrl = roundCtrl;
        cc.YL.tools.registerTouch(this.node, this.touchStart.bind(this), this.touchMove.bind(this), this.touchEnd.bind(this));
        this.box = this.addComponent(cc.BoxCollider);
        this.box.size.width = this.node.width;
        this.box.size.height = this.node.height;
        this.box.tag = 111;
        this.box.enabled = false;
        this.originPos = this.node.position;
        this._opList = this.node.parent;
        this.ske = this.node.getChildByName('spine').getComponent(sp.Skeleton);
        this._state = 'init';
        this.ske.setAnimation(0, 'animation2', true);
    },

    touchStart(event) {
        this.box.enabled = true;
        this.node.position = this.node.parent.convertToNodeSpaceAR(event.touch._point);
        this.node.setScale(1);
        this.ske.setAnimation(0, 'animation3', true);
    },

    touchMove(event) {
        this.node.position = this.node.parent.convertToNodeSpaceAR(event.touch._point);
    },

    touchEnd(event) {
        this.ske.setAnimation(0, 'animation2', true);
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
        this.setCollision(false, this._collision);
        if (this._collision != new_Colll) {
            this._collision = new_Colll;
        }
        this.setCollision(true, this._collision);
    },

    onCollisionStay(other, self) {
        this.onCollisionEnter(other, self);
    },

    onCollisionExit(other, self) {
        if (other.tag != 99) {
            return;
        }
        let target = other.node;
        this.setCollision(false, target);
        cc.YL.tools.onCollisionExit(this.node, target);
        if (this._collision == target) {
            this._collision = null;
        }
    },

    //设置碰撞块的状态
    setCollision(isShow, collision) {
        let state2 = collision.getChildByName('state2');
        let door = collision.getChildByName('door').getComponent(sp.Skeleton);
        state2.active = isShow;
        door.setSkin(isShow ? 'a' : 'b');
    },

    //将节点放置在节点里
    showDown(collision) {
        let area = collision.getChildByName('area');
        this.ske.node.setParent(area);
        this.ske.node.setPosition(0, -this.ske.node.height / 4);
        this.node.parent = null;
        this.node.destroy();
    },


    showBack() {
        this.box.enabled = false;
        this._pColl = null;
        let pos = cc.YL.tools.getRelativePos(this.node, this._opList);
        this.node.parent = this._opList;
        this.node.position = pos;
        cc.tween(this.node)
            .then(cc.YL.aMgr.lineMove(this.node.position, this.originPos, 0.01))
            .then(cc.YL.aMgr.SHAKING_Y)
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
