const LIST = cc.Enum({
    /**默认切换预乘方式 */
    default: 0,

    /**更改子节点名 */
    setName: 1,

    /**更改子节点Frame */
    setFrame: 2,
});

cc.Class({
    extends: cc.Component,

    editor: {
        executeInEditMode: true
    },
    properties: {
        setName: {
            default: LIST.default,
            type: LIST,
            displayName: '目录',
        },
        sptAtlas: { default: null, type: cc.SpriteAtlas, displayName: "合图", visible: false },
    },


    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start() {
        cc.Layout
        switch (this.setName) {
            case LIST.default:
                this.setTreeBlend(this.node);
                break;
            case LIST.setName:
                this.setTreeName(this.node);
                break;
                case LIST.setFrame:
                this.setTreeFrame(this.node);
                break;
            default:
                break;
        }

        //this.destroy();
    },

    setTreeBlend(nTree) {
        console.log(nTree);
        let setBlend = (pNode) => {
            if (!pNode) {
                return;
            }
            let _sprite = pNode.getComponent(cc.Sprite);
            let _label = pNode.getComponent(cc.Label);
            if (_sprite) {
                _sprite.srcBlendFactor = cc.macro.BlendFactor.ONE;
            }
            if (_label) {
                _label.srcBlendFactor = cc.macro.BlendFactor.ONE;
            }
        }
        let findChild = (pNode) => {
            pNode.children.forEach((kid) => {
                setBlend(kid);
                kid.childrenCount > 0 && findChild(kid);
            });
        }
        setBlend(nTree);
        nTree.children.forEach((kid) => {
            setBlend(kid);
            kid.childrenCount > 0 && findChild(kid);
        });
    },

    setTreeName(nTree) {
        Editor.log('setTreeName:');
        let count = 1
        nTree.children.forEach((kid) => {
           
            kid.name = kid.getComponent(cc.Sprite).spriteFrame.name

        });
    },

    setTreeFrame(nTree) {
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
        changeChildren(nTree);
    },
    // update (dt) {},
});
