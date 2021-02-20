cc.Class({
    extends: cc.Component,

    properties: {
        targetBox: cc.Node,
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
        this.node.name = 'op'
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

  
    touchStart(event) {
        this.box.enabled = true;
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
        if(this.targetBox == this._collision){
            GD.sound.playSound('right');
            GD.root.showStar(this.targetBox);
            this.showDown(this._collision);
        }else{
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

    //将节点放置在节点里
    showDown(collision) {
        let  img = this.node.getChildByName('img');
        img.setScale(1);
        img.parent = collision;
        img.position = cc.v2(0,0);
        collision.getComponent(cc.Sprite).enabled = false;
        collision.getComponent(cc.BoxCollider).enabled = false;
        collision._state = 'lock';
        this._roundCtrl.checkIsAllRight();
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
        if(!this.targetBox){
            return;
        }
        let pos = cc.YL.tools.getRelativePos(this.targetBox,this.node.parent);
        cc.tween(this.node)
        .then(cc.YL.aMgr.lineMove(this.node.position, pos, 0.01))
        .call(() => {
            this.showDown(this.targetBox);
        })
        .start()
        
    },
    // update (dt) {},
});
