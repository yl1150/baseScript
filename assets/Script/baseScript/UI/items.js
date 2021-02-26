cc.Class({
    extends: cc.Component,

    properties: {
    },

    // LIFE-CYCLE CALLBACKS:

    init() {
        cc.YL.tools.registerTouch(this.node, this.touchStart.bind(this), this.touchMove.bind(this), this.touchEnd.bind(this));
        this.box = this.addComponent(cc.BoxCollider);
        this.box.size.width = this.node.width;
        this.box.size.height = this.node.height;
        this.box.tag = 111;
        this.originPos = this.node.position;
        this._opList = this.node.parent;
    },

    setTouchImg(isShow) {
        if (!this._touchImg) {
            var img = new cc.Node('img');
            img.parent = this.node;
            img.position = cc.v2(0, 0);
            this._touchImg = img;
            cc.YL.tools.setSprite(img, 'touchImg');
        }
        this._touchImg.active = isShow;
        this.node.zIndex = 999;
        this.node.rotation = 0;
    },

    copySelf() {
        let items = cc.instantiate(this.node);
        items.parent = this._opList;
        items.position = this.node.position;
        items.getComponent('items').init();
    },

    touchStart(event) {
        let pos = cc.YL.tools.getRelativePos(this.node, this._opList);
        this.node.parent = this._opList;
        this.node.position = pos;
        this.copySelf();
        this.node.zIndex = 999;
        this.node.setScale(1.2);
    },

    touchMove(event) {
        this.node.position = this.node.parent.convertToNodeSpaceAR(event.touch._point);
    },

    touchEnd(event) {
        this.node.setScale(1);
        this.checkCanDown();
    },

    onCollisionEnter(other, self) {
        other.tag == 99 && (this._collision = cc.YL.tools.onCollision(this.node, other.node));
    },

    onCollisionStay(other, self) {
        other.tag == 99 && (this._collision = cc.YL.tools.onCollision(this.node, other.node));
    },

    onCollisionExit(other, self) {
        cc.YL.tools.onCollisionExit(this.node, other.node);
        this._collision = null;
    },

    checkCanDown() {
        if (!this._collision) {
            this.showBack();
            return;
        }
        cc.YL.tools.unRegisterTouch(this.node);
        if (this._collision.name == this.node.name) {
            GD.sound.playSound('right');
            GD.root.showStar(this._collision);
            this.showDown(this._collision);
            GD.nRound.setItemsPut();
        } else {
            GD.sound.playSound('wrong');
            GD.sound.playSound('blank');
            GD.nRound.setError();
            this.showBack();
        }
    },

    //将节点放置在节点里
    showDown(collision) {
        this.node.active =  false
        this.node.destroy()
        collision._state = 'lock';
        collision.getComponent(cc.BoxCollider).enabled = false;
        collision.getComponent(cc.Sprite).spriteFrame = this.getComponent(cc.Sprite).spriteFrame
        collision.width = this.node.width;
        collision.height = this.node.height;
        collision.setScale(1)
    },


    showBack() {
        let pos = cc.YL.tools.getRelativePos(this.node, this._opList);
        this.node.parent = this._opList;
        this.node.position = pos;
        cc.tween(this.node)
            .then(cc.YL.aMgr.lineMove(this.node.position, this.originPos, 0.01))
            .call(() => {
                this.node.destroy()
            })
            .start()
    },
    // update (dt) {},
});
