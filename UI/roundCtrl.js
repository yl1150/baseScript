cc.Class({
    extends: cc.Component,

    properties: {
        rightOp: cc.Node,
        tips: {
            type: cc.AudioClip,
            default: null
        },
        isPlayTips: false,
        touchColor: {
            type: [cc.Color],
            default: [],
            displayName: '点击转换颜色  0为正常 1触摸'
        },
        isShowTouchImg: true,
    },

    onLoad() {
        this._errorCount = 0;
        GD.sound.setTipsButton(true)
        cc.YL.addClock(this.tips);
        GD.sound.setShowTips(this.tips, this.isPlayTips || GD.jumpModel)
        this.node.children.forEach((option) => {
            this.isShowTouchImg && GD.root.setTouchImg(option, 3);
            let num = option.getChildByName('num');
            num && (option._numLabel = num.getComponent(cc.Label));
            cc.YL.tools.registerTouch(
                option,
                (e) => {
                    e.target.setScale(1.2);
                    this.setTouch(e.target, true);
                },
                null,
                (e) => {
                    e.target.setScale(1);
                    this.setTouch(e.target, false);
                    e.target == this.rightOp ? this.showRight(e.target) : this.showError(e.target);
                },
            )
        })
    },

    setTouch(target, isShow) {
        if (!this.isShowTouchImg) {
            return;
        }
        target._touchImg && (target._touchImg.active = isShow);
        this.touchColor.length > 0 && target._numLabel && (target._numLabel.node.color = (isShow ? this.touchColor[1] : this.touchColor[0]))
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
        GD.sound.playSound('wrong');
        GD.sound.playSound('blank');
        cc.tween(option)
            .then(cc.YL.aMgr.shakeAction(1))
            .start()
        this.setError();
    },

    setError() {
        this._errorCount++;
        let maxErrCount = 3
        if (this._errorCount >= maxErrCount) {
            cc.YL.lockTouch();
            setTimeout(() => {
                GD.sound.playTips('tips_start', () => {
                    GD.root.showStar(this.rightOp, () => {
                        GD.root.setStarBoard(true);
                        GD.root.showAddStar(1, () => {
                            GD.root.setStarBoard(false);
                            this.node.active = false;
                            this.node.destroy();
                            cc.YL.emitter.emit('continueGame');
                        })
                    });
                })
            }, 1000);
        }
    },
    // update (dt) {},
});
