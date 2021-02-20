//选择选项对应的脚本 
cc.Class({
    extends: cc.Component,

    properties: {
        tips: {
            displayName: '问题语音',
            type: cc.AudioClip,
            default: null
        },
        teachTips: {
            displayName: '演示语音',
            type: cc.AudioClip,
            default: null
        },
        conclusionTips: {
            displayName: '总结语音',
            type: cc.AudioClip,
            default: null
        },
        rightAnswer: 1,
        skinName: '',
        spineNum: 1,
        box: cc.Node,
        wenhao: cc.Node,
        isShowConclusion: false,
        tipsNode: [cc.Node],
        delayTimes: [cc.String],
    },

    // LIFE-CYCLE CALLBACKS:

    init(plane, icons) {
        cc.YL.addClock(this.tips);
        GD.sound.setShowTips(this.tips, true);

        let gKeyboard = this.node.getChildByName('gKeyboard').getComponent('keyBoardCtrl');
        gKeyboard.init((keys) => {
            //判断正误
            if (keys == this.rightAnswer) {
                cc.YL.lockTouch();
                GD.sound.playSound('right');
                GD.root.showStar(this._gKeyBoard.getKey(), () => {
                    gKeyboard.hideKeyBoard();
                    this.showEnding();
                })
            } else {
                GD.sound.playSound('wrong');
                GD.sound.playSound('blank');
                gKeyboard.clearKeyBoard();
                this.setError();
            }
        })
        this._gKeyBoard = gKeyboard;

        let nBalance = this.node.getChildByName('balance');
        nBalance.active = true;
        this._balance = nBalance.getComponent('balance');
        this._balance.init();
        this._balance.showBalance(1, () => {
            cc.YL.unLockTouch();
            gKeyboard.showKeyBoard();
        });
        this._errorCount = 0;
        this.plane = plane;
        this.icons = icons;
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
        this._gKeyBoard.setKey(this.rightAnswer);
        GD.root.showStar(this._gKeyBoard.getKey(), () => {
            this._gKeyBoard.hideKeyBoard();
            this.showEnding();
        });
    },

    showEnding() {
        this.wenhao.active = false;
        let arr = this.box.children;

        //飞行至目标位置
        let time = 0.5;
        for (let i in arr) {
            let _plane = cc.instantiate(this.plane);
            _plane.parent = this.node;

            let _pSke = _plane.getComponent(sp.Skeleton);
            _plane._ske = _pSke;
            _pSke.setAnimation(0, 'newAnimation_1', true);
            _pSke.setSkin(this.skinName);
            _plane.position = cc.v2(cc.winSize.width / 2 + _plane.width, cc.winSize.height / 2 + _plane.height);
            arr[i]._plane = _plane;
            let pos = cc.YL.tools.getRelativePos(arr[i], this.node);
            cc.tween(_plane)
                .to(time, { position: pos })
                .start()

        }

        //放下货物
        cc.YL.timeOut(() => {
            for (let i in arr) {
                let _plane = arr[i]._plane;
                _plane._ske.setAnimation(0, 'newAnimation_2', false);
            }
        }, time * 1000)

        time += 0.5;
        //无人机飞走
        cc.YL.timeOut(() => {
            this._balance.turnAfterShake(0);
            this.box.active = true;
            for (let i in arr) {
                let _plane = arr[i]._plane;
                arr[i].active = true
                _plane._ske.setAnimation(0, 'newAnimation_3', true);
                cc.tween(_plane)
                    .to(0.5, { position: cc.v2(cc.winSize.width / 2 + _plane.width, cc.winSize.height / 2 + _plane.height) })
                    .start()
            }
        }, time * 1000)

        GD.sound.playTips(this.teachTips, () => {
            //起重机上移
            this._balance.hideBalance();
            cc.YL.timeOut(this.isShowConclusion ? this.showConclusion.bind(this) : this.showFinishLayer.bind(this), 1000)
        })
    },

    showConclusion() {
        let icons = this.icons;
        let pool = cc.YL.tools.arrCopy(icons.children);
        pool.forEach((kid) => {
            kid.parent = null;
            kid.destroy();
        });


        let logos = this.node.getChildByName('logos');
        let kidPool = cc.YL.tools.arrCopy(logos.children);
        let arr = this.tipsNode;
        let tPool = this.delayTimes;
        logos.active = true;
        let showTeach = () => {
            if (arr.length < 1) {
                let pos = cc.YL.tools.getRelativePos(icons, logos.parent);
                cc.tween(logos)
                    .to(0.5, { position: pos, scale: 0.45 })
                    .call(() => {
                        kidPool.forEach((kid) => {
                            kid.parent = icons;
                            kid.position = cc.v2(0, 0);
                            kid.setScale(0.45)
                        });
                    })
                    .start()
                return;
            }
            let tNode = arr.shift();
            let time = tPool.shift();
            tNode.active = true;
            cc.tween(tNode)
                .then(cc.YL.aMgr.zoomAction(2))
                .start()
            cc.YL.timeOut(() => { showTeach() }, time * 1000)
        }
        cc.YL.timeOut(() => { showTeach() }, tPool.shift() * 1000)
        GD.sound.playTips(this.conclusionTips,this.showFinishLayer.bind(this))
    },

    showFinishLayer() {
        //此环节完成 注销所有事件
        this.node.destroy();
        cc.YL.emitter.emit('continueGame');
    },
});
