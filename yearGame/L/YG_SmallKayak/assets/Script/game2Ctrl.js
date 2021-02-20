const E_ClickPosType = {
    None: 0,
    TopRight: 1,
    TopLeft: 2,
    DownLeft: 3,
    DownRight: 4,
}
let _isClockwiseRotate
cc.Class({
    extends: cc.Component,

    properties: {
        tips: {
            displayName: '问题语音',
            type: cc.AudioClip,
            default: null
        },
        answerTips: {
            displayName: '答案语音',
            type: cc.AudioClip,
            default: null
        },
        time: {
            displayName: '初始时间',
            type: [cc.Integer],
            default: []
        },
        right_time: {
            displayName: '最终时间',
            type: [cc.Integer],
            default: []
        },
        eggSkin: 'qiu_a',
        isShowScale: true
    },

    // LIFE-CYCLE CALLBACKS:

    init(clock, eggSke, boxs) {
        clock.node.active = false;
        eggSke.node.active = false;

        cc.YL.addClock(this.tips);
        GD.sound.setShowTips(this.tips, true);
        cc.YL.unLockTouch();

        this.hour = 0;
        this.minute = 0;
        this.clockBoard = this.node.getChildByName('clock');
        this.hHand = this.node.getChildByName('hHand');
        this.mHand = this.node.getChildByName('mHand');

        this.handArr = [this.hHand, this.mHand];
        cc.YL.tools.registerTouch(this.clockBoard, this.touchStart.bind(this), this.touchMove.bind(this), this.touchEnd.bind(this));
    },


    touchStart(event) {
        this._tStartP = this.node.parent.convertToNodeSpaceAR(event.touch._point);
        this._touchHand = null;
        for (let i in this.handArr) {
            let box = this.handArr[i].getComponent(cc.BoxCollider);
            if (cc.Intersection.pointInPolygon(event.touch.getLocation(), box.world.points)) {
                this._touchHand = this.handArr[i];
                return;
            }
        }
    },

    touchMove(event) {
        if (!this._touchHand) {
            return;
        }

        let pos = this.node.parent.convertToNodeSpaceAR(event.touch._point);
        let angle = this.calculate(this._tStartP, pos);

        this.checkIsClockwiseRotate(this._tStartP, pos) && (angle = -angle)
        this._tStartP = pos;
        this._touchHand.angle += angle;

        if (this._touchHand.name == 'mHand') {
            //分针
            let per = angle / 360;
            this.hHand.angle += per * 30;
        }
    },

    touchEnd(event) {
        if (!this._touchHand) {
            return;
        }
    },

    //检测顺逆时针
    checkIsClockwiseRotate(sPoint, ePoint) {
        let centerPos = this.clockBoard.position;
        let leftPos = cc.v2(centerPos.x - this.clockBoard.width / 2, centerPos.y);
        let UpPos = cc.v2(centerPos.x, centerPos.y + this.clockBoard.height / 2)
        let rightPos = cc.v2(centerPos.x + this.clockBoard.width / 2, centerPos.y);
        let downPos = cc.v2(centerPos.x, centerPos.y - this.clockBoard.height / 2);

        let _curretClickType = this.ChangePosType(ePoint, centerPos, leftPos, UpPos, rightPos, downPos);
        switch (_curretClickType) {
            case E_ClickPosType.TopLeft:
                if (ePoint.x > sPoint.x && ePoint.y > sPoint.y) {
                    _isClockwiseRotate = true;
                }
                else if (ePoint.x <= sPoint.x && ePoint.y <= sPoint.y) {
                    _isClockwiseRotate = false;
                }
                break;
            case E_ClickPosType.TopRight:
                if (ePoint.x > sPoint.x && ePoint.y < sPoint.y) {
                    _isClockwiseRotate = true;
                }
                else if (ePoint.x < sPoint.x && ePoint.y > sPoint.y) {
                    _isClockwiseRotate = false;
                }

                break;
            case E_ClickPosType.DownLeft:

                if (ePoint.x < sPoint.x && ePoint.y > sPoint.y) {
                    _isClockwiseRotate = true;
                }
                else if (ePoint.x >= sPoint.x && ePoint.y < sPoint.y) {
                    _isClockwiseRotate = false;
                }

                break;
            case E_ClickPosType.DownRight:

                if (ePoint.x < sPoint.x && ePoint.y < sPoint.y) {
                    _isClockwiseRotate = true;
                }
                else if (ePoint.x > sPoint.x && ePoint.y > sPoint.y) {
                    _isClockwiseRotate = false;
                }

                break;
        }
        return _isClockwiseRotate ? true : false
    },

    ChangePosType(pos, centerPos, leftPos, UpPos, rightPos, downPos) {
        let clickType = E_ClickPosType.None;
        if (pos.x >= centerPos.x && pos.x <= rightPos.x && pos.y >= centerPos.y && pos.y <= UpPos.y) {
            clickType = E_ClickPosType.TopRight;
        }
        else if (pos.x < centerPos.x && pos.x > leftPos.x && pos.y > centerPos.y && pos.y < UpPos.y) {
            clickType = E_ClickPosType.TopLeft;
        }
        else if (pos.x <= centerPos.x && pos.x >= leftPos.x && pos.y <= centerPos.y && pos.y >= downPos.y) {
            clickType = E_ClickPosType.DownLeft;
        }
        else if (pos.x > centerPos.x && pos.x < rightPos.x && pos.y < centerPos.y && pos.y > downPos.y) {
            clickType = E_ClickPosType.DownRight;
        }
        return clickType;
    },

    calculate(p1, p2, p3 = cc.v2(0, 0)) {
        let a = cc.YL.tools.getDisTance(p2, p3);
        let b = cc.YL.tools.getDisTance(p1, p3);
        let c = cc.YL.tools.getDisTance(p1, p2);
        //console.log(a + "   " + b + "   " + c);


        let angleA = Math.acos((b * b + c * c - a * a) / (2 * b * c)) * 180 / Math.PI;
        let angleB = Math.acos((a * a + c * c - b * b) / (2 * a * c)) * 180 / Math.PI;
        let angleC = Math.acos((a * a + b * b - c * c) / (2 * a * b)) * 180 / Math.PI;

        //console.log(angleA + "   " + angleB + "   " + angleC);
        return angleC;
    },

    //初始化时针
    initHour(h, m) {
        let hHand = this.node.getChildByName('hHand');
        let mHand = this.node.getChildByName('mHand');

        let perAngel = -360 / 12;
        let hAngel = h * perAngel;

        perAngel = -360 / 60;
        let mAngel = perAngel * m;
        hHand.angle = hAngel;
        mHand.angle = mAngel;
        this.hour = h;
        this.minute = m;
    },

    setTime(h, m, timeScale = 1, cb) {
        let now_totalT = h * 60 + m;
        let totalT = this.hour * 60 + this.minute;
        let disT = now_totalT >= totalT ? (now_totalT - totalT) : (disT = 12 * 60 - totalT + now_totalT);

        this.hour = h;
        this.minute = m;

        h = disT / 60;
        m = disT - h * 60;

        let hHand = this.node.getChildByName('hHand');
        let mHand = this.node.getChildByName('mHand');

        let perAngel = -360 / 60;
        let mAngel = perAngel * m;

        let time = timeScale * 1;

        //分针每转一圈 时针转1格
        let action = cc.tween()
            .by(time, { angle: -360 })
            .call(() => {
                cc.tween(hHand)
                    .by(time / 10, { angle: -30 })
                    .start()
            })

        cc.tween(mHand)
            .repeat(h, action)
            .by(time / 2, { angle: mAngel })
            .call(() => {
                cb && cb();
            })
            .start()

    },
});
