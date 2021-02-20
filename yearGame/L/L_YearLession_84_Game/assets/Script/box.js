
const pType = cc.Enum({
    ZHUI: 0,//棱锥
    ZHU: 1,//棱柱
});
cc.Class({
    extends: cc.Component,

    properties: {
        touchTex: cc.SpriteFrame,
        norTex: cc.SpriteFrame,
        boxType: {
            default: pType.ZHUI,
            type: pType,
            displayName: '棱锥还是棱柱',
        },
        maxKidNum:4
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    setCollision(isCollision) {
        let _sprite = this.getComponent(cc.Sprite);
        _sprite.spriteFrame = isCollision ? this.touchTex : this.norTex;
    },

    getMaxKidNum(){
        return this.maxKidNum;
    },

    getCanPut(){
        return (this.node.childrenCount < this.maxKidNum);
    },

    getType(){
        return this.boxType;
    },

    // update (dt) {},
});
