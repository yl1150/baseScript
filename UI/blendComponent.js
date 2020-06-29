cc.Class({
    extends: cc.Component,

    editor: {
        executeInEditMode:true
    }, 
    properties: {
        
    },

  
    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start () {
        this.setTreeBlend(this.node);
    },

    setTreeBlend(nTree) {
        console.log(nTree);
        let kidCount = 0;
        let setBlend = (pNode) => {
            kidCount++;
            if (pNode && pNode.getComponent(cc.Sprite)) {
                pNode.getComponent(cc.Sprite).srcBlendFactor = cc.macro.BlendFactor.ONE;
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
    // update (dt) {},
});
