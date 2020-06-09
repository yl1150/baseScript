cc.Class({
    extends: cc.Component,

    properties: {
    },

    init() {
        cc.audioEngine.stopAllEffects()
        cc.loader.loadRes('sound/gameEnd', cc.AudioClip, (err, audio) => {
            if (err) {
                console.log(err)
            }
            cc.audioEngine.play(audio, false, 1)
        })
        this.caidai = this.node.getChildByName("caidai1")
        this.caidai2 = this.node.getChildByName("caidai2")
        this.dd = this.node.getChildByName('dd')
        this.dd.children.forEach((ddNode) => {
            ddNode.active = false
            ddNode._db = ddNode.getComponent(dragonBones.ArmatureDisplay) || ddNode.getComponent(sp.Skeleton)
        });
        this.show()
    },

    show() {
        this.node.active = true
        var array = this.node.children
        for (var i = 0; i < array.length; i++) {
            var db = array[i].getComponent(dragonBones.ArmatureDisplay)
            db && db.playAnimation("newAnimation", 0)
        }
        this.caidai.y = -cc.winSize.height / 2 + 180
        this.caidai2.y = -cc.winSize.height / 2 + 180
        setTimeout(() => {
            let ddNum = cc.YL.tools.randomNum(1, 3)
            let dd = this.dd.getChildByName('dd' + ddNum)
            dd.active = true
            switch (ddNum) {
                case 1:
                    dd._db.playAnimation('newAnimation')
                    break;
                case 2:
                    dd._db.playAnimation('Sprite', 1)
                    break;
                case 3:
                    dd._db.setAnimation(0, 'newAnimation_1', false)
                    break;
                default:
                    break;
            }
        }, 500);
    },
    // update (dt) {},
});
