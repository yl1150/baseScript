cc.Class({
    extends: cc.Component,

    properties: {
        rightOp: cc.Node,
        tips: {
            type: cc.AudioClip,
            default: null
        },
        isPlayTips: false,
    },

    onLoad() {
        this._errorCount =0;
        GD.sound.setTipsButton(true)
        cc.YL.addClock(this.tips);
        GD.sound.setShowTips(this.tips, this.isPlayTips || GD.jumpModel)
        this.node.children.forEach((option) => {
            cc.YL.tools.registerTouch(
                option,
                (e) => {
                    e.target.setScale(1.2);
                },
                null,
                (e) => {
                    e.target.setScale(1);
                    e.target == this.rightOp ? this.showRight(e.target) : this.showError(e.target);
                },
            )
        })
    },

    showRight(option) {
        GD.sound.playSound('right');
        GD.root.showStar(option, () => {
            GD.root.setStarBoard(true);
            //统计星星数量
            let starNum = 3;
            if (this._errorCount == 0) {
                starNum = 3;
            } else if (this._errorCount < 3) {
                starNum = 2;
            } else {
                starNum = 1;
            }
            GD.root.showAddStar(starNum, () => {
                GD.root.setStarBoard(false);
                this.node.active = false;
                this.node.destroy();
                cc.YL.emitter.emit('continueGame');
            })

        });
    },

    showError(option) {
        option.angel = 0;
        this._errorCount++;
        GD.sound.playSound('wrong');
        GD.sound.playSound('blank');
        cc.tween(option)
            .then(cc.YL.aMgr.shakeAction(1))
            .start()
    },
    // update (dt) {},
});
