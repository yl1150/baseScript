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
        let setBlend = (pNode) => {
            if(!pNode){
                return;
            }
            let _sprite = pNode.getComponent(cc.Sprite);
            let _label = pNode.getComponent(cc.Label);
            if (_sprite) {
                _sprite.srcBlendFactor = cc.macro.BlendFactor.ONE;
            }
            if(_label){
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
    // update (dt) {},
});
