cc.Class({
    extends: cc.Component,

    properties: {
        roundID:0,
        tips: {
            type: cc.AudioClip,
            default: null
        },
        isPlayTips: true,
    },

    onLoad() {
        GD.roundID = this.roundID;
        cc.YL.addClock(this.tips);
        GD.sound.setTipsButton(true);
        GD.sound.setShowTips(this.tips, this.isPlayTips || GD.jumpModel)
        this.enterBtn = this.node.getChildByName('queren')
        this.refreshBtn = this.node.getChildByName('refresh')
        this.recordBtn = this.node.getChildByName('luyin')
        this.recordBtn._spine = this.recordBtn.getComponent(sp.Skeleton)
        this.yuyin = this.node.getChildByName('yuyin').getComponent(sp.Skeleton)
        this.yuyin.setAnimation(0, 'newAnimation', true)

        let self = this
        cc.YL.emitter.on('recordStates', (datas) => {
            console.log(datas)
            switch (parseInt(datas)) {
                case 0: return "无状态";
                case 1: return "正在播放";
                case 2: {
                    self.yuyin.setAnimation(0, 'newAnimation', true); self.rState = 'stop';
                } break;//"停止播放"
                case 3: return "正在录制";
                case 4: return "停止录制";
                default: return "不支持的状态";
            }
        })
        var recorder = cc.YL.recorder
        cc.YL.tools.registerTouch(
            this.recordBtn,
            (e) => {
                if (!GD.canRecording) {
                    return
                }
                GD.sound.stopTips()
                e.target.setScale(1.2)
                e.target._spine.setAnimation(0, 'newAnimation_1', true)
                recorder.startRecord()
                this.count = 0;
                this._state = 'starts'
                this.callback = () => {
                    if (this.count > 60) {
                        // 在超过60s时取消这个计时器
                        this._state = 'overTime'
                        this.setRecordBtn(false)
                        this.setUI(true)
                        recorder.stopRecord()
                        this.unschedule(this.callback)
                    }
                    this.count++;
                }
                this.schedule(this.callback, 1);
            },
            null,
            (e) => {
                if (!GD.canRecording) {
                    return
                }
                e.target._spine.setAnimation(0, 'newAnimation', true)
                e.target.setScale(1)
                this.unschedule(this.callback)
                this.setUI(this.count >= 1)
                if (this.count < 1) {
                    this._state = 'shortTime'
                } else {
                    this.setRecordBtn(false)
                    recorder.stopRecord()
                }
            },
        )
    },

    setUI(isShow) {
        this.enterBtn.active = isShow
        this.refreshBtn.active = isShow
        this.yuyin.node.active = isShow
    },

    setRecordBtn(isShow) {
        this.recordBtn.active = isShow
    },

    enterRecord() {
        cc.YL.lockTouch();
        cc.YL.emitter.off('recordStates')
        this.setUI(false)
        this.setRecordBtn(false)

        //录音环节稳定3颗星
        GD.root.showAddStar(3, () => {
            let name = 'tipsListen'
            GD.sound.playTips(name)
            let time = GD.sound.getDuringTime(name) + 0.5
            cc.YL.timeOut(() => {
                GD.root.setStarBoard(false);
                this.node.active = false
                this.node.destroy()
                cc.YL.emitter.emit('continueGame');
            }, time * 1000)
        })
    },

    refreshRecord() {
        this.setUI(false)
        this.setRecordBtn(true)
    },

    playRecord() {
        if (this.rState == 'play') {
            this.rState = 'pause'
            this.yuyin.setAnimation(0, 'newAnimation', true)
            cc.YL.recorder.stopPlay()
        } else {
            GD.sound.stopTips()
            this.rState = 'play'
            this.yuyin.setAnimation(0, 'newAnimation_1', true)
            cc.YL.recorder.playRecord()
        }
    },
});
