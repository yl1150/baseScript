/**
 * 更改混合方式（仅用于编辑器模式）
 */
cc.Class({
    extends: cc.Component,

    editor: {
        executeInEditMode: true
    },

    properties: {},

    onLoad() { },

    start() {
        function changeBlend(pNode) {
            var sptCom = pNode.getComponent(cc.Sprite);
            if (sptCom) {
                Editor.log('SpriteBlendChange:' + pNode.name);
                sptCom.srcBlendFactor = cc.macro.BlendFactor.ONE;
                sptCom.dstBlendFactor = cc.macro.BlendFactor.ONE_MINUS_SRC_ALPHA;
            }
            var labelCom = pNode.getComponent(cc.Label);
            if (labelCom) {
                Editor.log('LabelBlendChange:' + pNode.name);
                labelCom.srcBlendFactor = cc.macro.BlendFactor.ONE;
                labelCom.dstBlendFactor = cc.macro.BlendFactor.ONE_MINUS_SRC_ALPHA;
            }
        }
        function changeChildrenBlend(pNode) {
            if (pNode.childrenCount > 0) {
                pNode.children.forEach(pChild => {
                    changeBlend(pChild);
                    changeChildrenBlend(pChild);
                })
            }
        }
        changeChildrenBlend(this.node);
    },
});