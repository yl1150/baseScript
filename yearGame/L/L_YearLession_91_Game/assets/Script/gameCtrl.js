//选择选项对应的脚本 
cc.Class({
    extends: cc.Component,

    properties: {
        tips: cc.String,
        isShowSHAKING_X: false,
        isTransition: false,
        options: cc.Node,
        rightNodes: [cc.Node],
        endAni: ''
    },

    // LIFE-CYCLE CALLBACKS:

    init(asset) {
        this._errorCount = 0;
        this.registerEvent();
    },


    //注册事件
    registerEvent() {
        cc.YL.emitter.on('startGame', (e) => {
            this.showGame();
        })
    },

    unregisterEvent() {
        cc.YL.emitter.off('startGame');
    },

    setTouch(target, isShow) {
        let touchImg = target.getChildByName('touchImg');
        if (!touchImg) {
            target.getComponent(cc.Sprite).enabled = isShow;
            return;
        }
        touchImg.active = isShow;
    },

    showGame() {
        //展示对应动画
        this.options.active = true;
        let getTouchPoint = (touch, arr) => {
            let touchLoc = touch.getLocation();
            for (let i in arr) {
                let box = arr[i].getComponent(cc.BoxCollider) || arr[i].getComponent(cc.PolygonCollider);
                if (box && cc.Intersection.pointInPolygon(touchLoc, box.world.points)) {
                    console.log("Hit!");
                    return arr[i];
                }
            }

        }

        let touchPoint = null;
        this.options.children.forEach((kid) => {
            kid._isSelected = false;
        });

        cc.YL.tools.registerTouch(
            this.options,
            (e) => {
                // e.target.setScale(1.2);
                let point = getTouchPoint(e, e.target.children);
                if (point) {
                    touchPoint = point;
                    this.setTouch(point, true);
                }
            },
            null,
            (e) => {
                if (!touchPoint) {
                    return;
                }
                //e.target.setScale(1);
                //检测是否是正确答案
                for (let i in this.rightNodes) {
                    if (this.rightNodes[i] == touchPoint) {
                        touchPoint._isSelected = true;
                        this.setTouch(touchPoint, true);
                        GD.sound.playSound('right');
                        GD.root.showStar(touchPoint);
                        this.isTransition && cc.YL.emitter.emit('showTX', touchPoint.name);

                        //判断是否选完全部答案
                        this.checkIsAllSelect();
                        return;
                    }
                }

                GD.sound.playSound('wrong');
                GD.sound.playSound('blank');
                this.setError();
                this.setTouch(touchPoint, false);
                this.isShowSHAKING_X && cc.tween(touchPoint)
                    .then(cc.YL.aMgr.SHAKING_X)
                    .start()

            },
        );
        GD.sound.setTipsButton(true);
        GD.sound.setShowTips(this.tips, true);
        cc.YL.unLockTouch();
    },

    checkIsAllSelect() {
        let arr = [];
        this.options.children.forEach((kid) => {
            kid._isSelected && arr.push(kid);
        });

        if (cc.YL.tools.checkArrIsSame(arr, this.rightNodes)) {
            //全部选完
            cc.YL.lockTouch();
            cc.YL.timeOut(() => {
                GD.root.showAddStar(GD.root.getStarNum(this._errorCount), () => {
                    this.showFinishLayer();
                })
            }, 1000)
        }
    },

    setError() {
        this._errorCount++;
        let maxErrCount = 3
        if (this._errorCount >= maxErrCount) {
            cc.YL.lockTouch();
            cc.YL.timeOut(() => {
                GD.sound.playTips('tipsWatch', () => {
                    this.showRightAnswer();
                })
            }, 1000);
        }
    },

    showRightAnswer() {
        //展示正确答案
        this.rightNodes.forEach((kid) => {
            this.setTouch(kid, true);
            GD.root.showStar(kid);
        });

        if (this.endAni != '') {
            this.isTransition && cc.YL.emitter.emit('showTX', this.endAni);
        }

        cc.YL.timeOut(() => {
            GD.root.showAddStar(GD.root.getStarNum(this._errorCount), () => {
                this.showFinishLayer();
            })
        }, 2000);
        cc.YL.lockTouch();
    },

    showFinishLayer() {
        //此环节完成 注销所有事件
        this.unregisterEvent();
        this.options.active = false;
        cc.YL.emitter.emit('continueGame');
        this.node.destroy();
    },
});
