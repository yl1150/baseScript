
const pSize = cc.Enum({
    BIG: 0,
    SMALL: 1,
    COUNT: 2
});

const pType = cc.Enum({
    TANG: 0,//汤面
    GAN: 1,//干面
    COUNT: 2
});

const SIDE_DISHES = cc.Enum({
    DRUMSTICK: 0,//鸡腿
    SAUSAGE: 1,//牛肉
    COUNT: 2
});

const EGGs = cc.Enum({
    NONE: 0,//有
    HAVE: 1,//无
    COUNT: 2
});
cc.Class({
    extends: cc.Component,

    properties: {
        noodlesSize: {
            default: pSize.BIG,
            type: pSize,
            displayName: '面的大小',
        },
        noodlesType: {
            default: pType.TANG,
            type: pType,
            displayName: '碗的颜色',
        },
        noodlesSD: {
            default: SIDE_DISHES.DRUMSTICK,
            type: SIDE_DISHES,
            displayName: '配菜',
        },
        noodlesEgg: {
            default: EGGs.NONE,
            type: EGGs,
            displayName: '有无鸡蛋',
        },
    },

    // LIFE-CYCLE CALLBACKS:

    init(roundCtrl) {
        this.node.noodlesData = [];
        this.node.noodlesData['noodlesSize'] = this.noodlesSize;
        this.node.noodlesData['noodlesType'] = this.noodlesType;
        this.node.noodlesData['noodlesSD'] = this.noodlesSD;
        this.node.noodlesData['noodlesEgg'] = this.noodlesEgg;


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
        let pos = cc.YL.tools.getRelativePos(this.node, this._opList);
        this.node.parent = this._opList;
        this.node.position = pos;
        this._roundCtrl.checkIsAllPut();
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
            return;
        }
        if (!this._collision.getComponent('box').getCanPut()) {
            GD.sound.playSound('blank');
            this.showBack();
            return;
        }
        this.showDown(this._collision);
        this._roundCtrl.checkIsAllPut();
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
        let layout = collision.getChildByName('layout');
        if (!layout) {
            return;
        }
        this._state = 'putDown';
        this.box.enabled = false;
        this.node.setScale(0.7);
        this.node.setParent(layout);
        this.node.setPosition(0, 0);
        this.setCollision(false, collision);
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
