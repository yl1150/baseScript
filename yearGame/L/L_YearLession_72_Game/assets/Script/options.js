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
        this.node.name = 'op';
        this._state = 'init';
        this.xuxian = this.node.getChildByName('baozixuxian');
    },

    setXuxian(isShow) {
        if (this.xuxian.parent == this.node) {
            this.xuxian.setParent(this._opList);
            this.xuxian.setPosition(this.originPos);
            this.xuxian.zIndex = -1;
        }
        this.xuxian.active = isShow;
    },

    touchStart(event) {
        this.setXuxian(true);
        if (this.node.parent != this._opList) {
            let pos = cc.YL.tools.getRelativePos(this.node, this._opList);
            this.node.parent = this._opList;
            this.node.position = pos;
        }
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
        if (!this._collision.getComponent('box').getCanPut()) {
            GD.sound.playSound('blank');
            this.showBack();
            return;
        }
        this.showDown(this._collision);
        this._roundCtrl.checkIsAllRight();
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
        collision.getComponent('box').setCollision(isShow);
    },

    checkIsPutDown() {
        return this._state == 'putDown'
    },

    //将节点放置在节点里
    showDown(collision) {
        this._state = 'putDown';
        this.box.enabled = false;
        this.node.setParent(collision);
        this.node.setPosition(0, 0);
        this.setCollision(false, collision);
    },


    showBack() {
        this._state = 'init';
        this.setXuxian(false);
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

    showRightAnswer(targetBox) {
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
