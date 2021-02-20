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
        let winSize = cc.view.getFrameSize()

        let canvas = cc.find('Canvas').getComponent(cc.Canvas);
        let CanvasSize = canvas.designResolution ;


        //web页面DOM的屏幕比例大于16/9时,为全面屏手机
        if (winSize.width / winSize.height > 16 / 9) {
            this.caidai.setPosition(this.caidai.position.x, this.caidai.position.y+150);
            this.caidai2.setPosition(this.caidai2.position.x, this.caidai2.position.y+150);
        }
        //web页面DOM的屏幕比例小于16/9时,为ipad
        if (winSize.width / winSize.height <= 16 / 9) {
            this.caidai.setPosition(this.caidai.position.x+200, (-winSize.height / 2) / (winSize.width / CanvasSize.width) + 200)
            this.caidai2.setPosition(this.caidai2.position.x-200, (-winSize.height / 2) / (winSize.width / CanvasSize.width) + 200)
        }



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
