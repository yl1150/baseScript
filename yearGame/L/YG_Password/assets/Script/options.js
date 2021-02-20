cc.Class({
    extends: cc.Component,

    properties: {
        targetBox: cc.Node
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
        if (this.node.parent != this._opList && this._targetCollision) {
            this._targetCollision.fishCount--;
        }
        let pos = cc.YL.tools.getRelativePos(this.node, this._opList);
        this.node.parent = this._opList;
        this.node.position = pos;
        this.box.enabled = true;
    },

    touchStart(event) {
        //this.reSet();
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
        if (this._collision == this.targetBox) {
            GD.sound.playTips('right', () => {
                cc.YL.emitter.emit('showDDAni', 'stay');
            });
            GD.root.showStar(this._collision);
            this.showDown(this._collision);
            cc.YL.emitter.emit('showDDAni', 'happy');
            cc.YL.emitter.emit('checkFinish');
        } else {
            this.showBack();
            GD.sound.playTips('wrong', () => {
                cc.YL.emitter.emit('showDDAni', 'stay');
            });
            GD.sound.playSound('blank');
            cc.YL.emitter.emit('setError');
            cc.YL.emitter.emit('showDDAni', 'sad');
        }
    },
    onCollisionEnter(other, self) {
        if (other.tag != 99 ) {
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
        collision.getComponent(cc.Sprite).enabled = false;
        collision.getComponent(cc.BoxCollider).enabled = false;
        collision.getChildByName('img').active = true;
        this.node.parent = null;
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
