/**
 * 更改图片资源为合图中的资源（仅用于编辑器模式）
 */
cc.Class({
    extends: cc.Component,

    editor: {
        executeInEditMode: true
    },

    properties: {
        sptAtlas: { default: null, type: cc.SpriteAtlas, displayName: "合图" },
    },

    onLoad() { },

    start() {
        var sptAtlas = this.sptAtlas;
        function change(pNode) {
            var sptCom = pNode.getComponent(cc.Sprite);
            if (sptCom) {
                if (sptCom.spriteFrame) {
                    var sptName = sptCom.spriteFrame.name;
                    var newSpt = sptAtlas.getSpriteFrame(sptName);
                    if (newSpt) {
                        Editor.log('SpriteChange:' + pNode.name);
                        sptCom.spriteFrame = newSpt;
                    }
                }
            }
        }
        function changeChildren(pNode) {
            if (pNode.childrenCount > 0) {
                pNode.children.forEach(pChild => {
                    change(pChild);
                    changeChildren(pChild);
                })
            }
        }
        changeChildren(this.node);
    },
});