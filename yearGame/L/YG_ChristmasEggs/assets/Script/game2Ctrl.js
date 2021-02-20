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
        or_time: {
            displayName: '初始时间',
            type: [cc.Float],
            default: []
        },
        right_time: {
            displayName: '最终时间',
            type: [cc.Float],
            default: []
        },
        teach_time: {
            displayName: '演示时间',
            type: [cc.Float],
            default: []
        },
        isShowScale: true
    },

    // LIFE-CYCLE CALLBACKS:

    init(clock, eggSke, boxs) {
        clock.node.active = false;
        eggSke.node.active = false;

        this._eggSke = this.node.getChildByName('caidan').getComponent(sp.Skeleton);
        this._giftSke = this._eggSke.node.getChildByName('liwu').getComponent(sp.Skeleton);
        this._boxs = boxs;
        this.clockBoard = this.node.getChildByName('clock');
        this.hHand = this.node.getChildByName('hHand');
        this.mHand = this.node.getChildByName('mHand');
        this.handArr = [this.hHand, this.mHand];



        this.initUI();
        cc.YL.addClock(this.tips);
        GD.sound.setShowTips(this.tips, true);
        cc.YL.unLockTouch();
    },

    initUI() {
        this._timeLabel = this._eggSke.node.getChildByName('timeLabel');
        this._timeLabel.active = false;
        cc.tween(this._eggSke.node)
            .to(0.5, { y: 200 })
            .call(() => {
                this._timeLabel.active = true;
            })
            .start()



        let checkBtn = this.node.getChildByName('checkBtn');
        let widget = checkBtn.getComponent(cc.Widget);
        widget.target = cc.find('Canvas');
        widget.updateAlignment();

        widget = this._eggSke.node.getComponent(cc.Widget);
        widget.target = cc.find('Canvas');
        widget.updateAlignment();

        this.initClock(this.or_time[0], this.or_time[1]);
        cc.YL.tools.registerTouch(this.clockBoard, this.touchStart.bind(this), this.touchMove.bind(this), this.touchEnd.bind(this));
    },


    touchStart(event) {
        this._turnAngle = 0;
        this._tStartP = this.node.parent.convertToNodeSpaceAR(event.touch._point);
        this._touchHand = null;
        for (let i in this.handArr) {
            let box = this.handArr[i].getComponent(cc.BoxCollider);
            if (cc.Intersection.pointInPolygon(event.touch.getLocation(), box.world.points)) {
                this._touchHand = this.handArr[i];
                this._touchHand.setScale(1.2);
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
        this._turnAngle += angle;

        let absA = Math.abs(this._turnAngle);
        let symbolA = this._turnAngle / absA;

        if (this._touchHand.name == 'mHand' && absA >= 30) {
            //分针 每移动30移动一段
            let per = 30 / 360 * symbolA;
            this.hHand.angle += per * 30;
            this._touchHand.angle += symbolA * 30;
            this._turnAngle = 0;
            GD.sound.playSound('dida')
        }
        if (this._touchHand.name == 'hHand' && absA >= 15) {
            //时针 每移动15移动一段
            this._touchHand.angle += symbolA * 15;
            this._turnAngle = 0;
            GD.sound.playSound('dida')

            //对应时针的移动
            this.mHand.stopAllActions();
            this.mHand.angle = Math.abs(this._touchHand.angle % 30) ? 0 : 180;
            cc.tween(this.mHand)
                .by(0.1, { angle: symbolA * 180 })
                .start();
        }
    },

    touchEnd(event) {
        if (!this._touchHand) {
            return;
        }
        this._touchHand.setScale(1);
        //校对时针和分针角度
        let hAngle = parseInt(this.hHand.angle);
        let mAngle = parseInt(this.mHand.angle);


        if (this._touchHand.name == 'hHand') {
            let rAngle = hAngle % 15;
            hAngle = hAngle - rAngle;
            mAngle = mAngle - rAngle * 30 / 360;
            mAngle = mAngle - mAngle % 30;
        }



        this.hHand.angle = hAngle;
        this.mHand.angle = mAngle;
    },

    //检测顺逆时针
    checkIsClockwiseRotate(sPoint, ePoint) {
        /*   let centerPos = this.clockBoard.position;
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
          } */

        let rePoint = cc.v2(0, 0);

        let _isClockwiseRotate = (sPoint.x - rePoint.x) * (ePoint.y - rePoint.y) - (sPoint.y - rePoint.y) * (ePoint.x - rePoint.x);
        return _isClockwiseRotate < 0
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

    check() {
        //核对时针和分针角度
        let hAngle = -parseInt(this.hHand.angle) % 360;
        let mAngle = -parseInt(this.mHand.angle) % 360;

        let h = hAngle / 360 * 12;
        let m = mAngle / 360 * 60

        if (h < 0) {
            h += 12;
        }
        if (m < 0) {
            m += 60;
        }

        let arr = [h, m];

        for (let i in arr) {
            if (arr[i] != this.right_time[i]) {
                this.showWrong();
                return;
            }
        }

        console.log('h:', h);
        console.log('m:', m)
        this.showRight();
    },

    showRight() {
        cc.YL.lockTouch();
        GD.sound.playSound('right');
        GD.root.showStar(this.node, () => {
            this.showGetGift();
        })
    },

    showWrong() {
        GD.sound.playSound('wrong');
        GD.sound.playSound('blank');
        this.initClock(this.or_time[0], this.or_time[1]);
        this.setError();
    },

    //初始化时针
    initClock(h, m) {
        this.hHand.angle = h * -30;
        this.mHand.angle = m * -60;
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
        cc.YL.lockTouch();
        this.initClock(this.right_time[0], this.right_time[1])
        GD.root.showStar(this.clock, () => {
            this.showGetGift();
        })
    },

    setTime(h, m, timeScale = 1, cb = null) {
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

        let time = timeScale;

        GD.sound.playSound('clock');
        //分针每转一圈 时针转1格
        let action = cc.tween()
            .by(time, { angle: h >= 1 ? -360 : -360 * h })
            .call(() => {
                cc.tween(hHand)
                    .by(time / 10, { angle: h >= 1 ? -30 : h * -30 })
                    .start()
            })

        cc.tween(mHand)
            .repeat(h >= 1 ? h : 1, action)
            .by(time / 2, { angle: mAngel })
            .call(() => {
                GD.sound.stopEffect('clock');
                cb && cb();
            })
            .start()
    },


    showGetGift() {
        this.hour = parseInt(this.right_time[0]);
        this.minute = this.right_time[1];
        GD.sound.playTips(this.answerTips, () => {
            this.setTime(this.teach_time[0], this.teach_time[1],1, () => {
                //彩蛋打开
                let entry = this._eggSke.setAnimation(0, 'newAnimation_1', false);

                this._eggSke.setTrackEventListener(entry, (event) => {
                    //礼物出现
                    this._giftSke.node.active = true;
                    this._giftSke.setAnimation(0, 'newAnimation_1', false);

                    cc.YL.timeOut(() => {
                        let box = null;
                        this._boxs.children.map((kid) => { if (!kid.active && !box) box = kid })
                        let pos = cc.YL.tools.getRelativePos(box, this._giftSke.node.parent);
                        cc.tween(this._giftSke.node)
                            .to(0.5, { position: pos })
                            .call(() => {
                                this._giftSke.node.active = false;
                                box.active = true;
                                this.showFinishLayer();
                            })
                            .start()

                    }, 1000);
                })
            });

        });
        this._timeLabel.active = false;
    },

    showFinishLayer() {
        //此环节完成 注销所有事件
        cc.YL.timeOut(() => {
            this.node.destroy();
            cc.YL.emitter.emit('continueGame');
        }, 500)
    },
});
