cc.Class({
    extends: cc.Component,

    properties: {
        touchTex: cc.SpriteFrame,
        norTex: cc.SpriteFrame,
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

    // update (dt) {},
});
