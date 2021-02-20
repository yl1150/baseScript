
const pType = cc.Enum({
    ZHUI: 0,//棱锥
    ZHU: 1,//棱柱
});

cc.Class({
    extends: cc.Component,

    properties: {
        opType: {
            default: pType.ZHUI,
            type: pType,
            displayName: '棱锥还是棱柱',
        },
        denglongFrame: cc.SpriteFrame
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

    lockOption() {
        cc.YL.tools.unRegisterTouch(this.node);
        this.box.enabled = false;
    },


    touchStart(event) {
        cc.YL.emitter.emit('setXuxian', true);
        this.node.stopAllActions();
        this.box.enabled = true;
        this.node.position = this.node.parent.convertToNodeSpaceAR(event.touch._point);
        this.node.setScale(1.2);
    },

    touchMove(event) {
        this.node.position = this.node.parent.convertToNodeSpaceAR(event.touch._point);
    },

    touchEnd(event) {
        this.node.setScale(1);
        if (!this._collision) {
            this.showBack();
            cc.YL.emitter.emit('setXuxian', false);
            return;
        }
        if (this._collision.getComponent('box').getType() != this.opType) {
            GD.sound.playSound('blank');
            this.showBack();
            cc.YL.emitter.emit('setError');

        } else {
            GD.root.showStar(this._collision);
            this.showDown(this._collision);
            GD.sound.playSound('right');
            cc.YL.emitter.emit('check');
        }
        cc.YL.emitter.emit('setXuxian', false);
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
        //collision.getComponent('box').setCollision(isShow);
    },

    checkIsPutDown() {
        return this._state == 'putDown'
    },

    //将节点放置在节点里
    showDown(collision) {
        let dl = new cc.Node('dl');
        dl.addComponent(cc.Sprite).spriteFrame = this.denglongFrame;
        dl.setParent(collision);
        dl.setAnchorPoint(0.5, 1);
        dl.setPosition(0, 190);
        this.node.active = false;
        this.node.destroy();
    },


    showBack() {
        this._state = 'init';
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
});
