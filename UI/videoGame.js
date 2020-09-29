const kStatusCode = cc.Enum({
    /**无状态 */
    STATUS_NONE: 0,

    /**正在游戏关卡 */
    STATUS_PLAYING: 1,

    /**播放视频 */
    STATUS_PLAYVIDEO: 2,
});
cc.Class({
    extends: cc.Component,

    properties: {
        videoPlayer: cc.Node,
        questionPool: [cc.Prefab],
        roundData: [cc.JsonAsset],
        showBGMTime: 0,
        videoPoster: cc.Node
    },

    onLoad() {
        GD.main = this;
        this.game = this.node.getChildByName('game');
        this._vPlayer = this.videoPlayer.getComponent('VideoBase')
        this._questions = this.game.getChildByName('questions');
        this._isShowBGM = true;
        this.registerEvent();
        this.setPoster(true);
    },

    //注册事件
    registerEvent() {

        cc.YL.emitter.on('finishRound', (e) => {
            console.log('finishRound')
            var data = this._roundData.json.continueTime
            var time = cc.YL.tools.setTime(data.s, data.m)
            //this._vPlayer.resume(time)
            this._vPlayer.setTime(time)
        })

        cc.YL.emitter.on('finishGame', (e, data) => {
            console.log('finishGame')
            this.finishGame();
        })

        cc.YL.emitter.on('continueGame', (e, data) => {
            console.log('continueGame')
            this.continueGame();
        })
    },

    start() {
        cc.YL.unLockTouch()
        this._time = 0
        GD.sound.setTipsButton(false);
        this._vPlayer.init(this.startGame.bind(this), this.videoCallFunc.bind(this), this.videoPoster, this.roundData);
    },

    startGame() {
        //初始化并展示出产动画
        GD.jumpModel = false
        this._isCheckTime = true
        this._state = kStatusCode.STATUS_PLAYVIDEO
        GD.sound.pauseBgm();
    },

    setPoster(isShow) {
        this.videoPoster.active = isShow;
    },

    continueGame() {
        GD.sound.pauseBgm();
        GD.root.setBack(true);
        GD.jumpModel = false;
        this._isCheckTime = false
        cc.YL.timeOut(() => {
            this._isCheckTime = true
        }, 1000)
        cc.YL.unLockTouch()
        this._state = kStatusCode.STATUS_PLAYVIDEO
        GD.sound.setTipsButton(false)
        console.log(this._roundData)
        let data = this._roundData.json.continueTime
        let time = cc.YL.tools.setTime(data.s, data.m)
        //this._vPlayer.resume(time)
        this._vPlayer.resumeAndUnlockProg()
    },

    finishGame() {
        //提交数据
        GD.sound.pauseBgm();
        cc.YL.lockTouch()
        cc.YL.emitter.off('continueGame');
        cc.YL.emitter.emit('gameEnd');
    },

    onDestroy() {
        cc.YL.emitter.off('finishRound');
        cc.YL.emitter.off('continueGame');
    },

    freezeVideoCheck() {
        this._isCheckTime = false
        this._vPlayer.pause()
    },

    reFreezeVideoCheck() {
        this._isCheckTime = true
        this._vPlayer.resume()
    },

    videoCallFunc(_currentTime) {
        _currentTime = parseInt(_currentTime * 10) / 10
        if (_currentTime > this.showBGMTime && this._isShowBGM) {
            this._isShowBGM = false
            //GD.sound.playBGM()
        }
        if (!this._isCheckTime || !this.roundData || cc.YL.tools.isTime(_currentTime, this._time)) {
            return
        }
        this._time = _currentTime
        for (let i in this.roundData) {
            let data = this.roundData[i].json.limitTime
            if (cc.YL.tools.isTime(_currentTime, cc.YL.tools.setTime(data.s, data.m))) {
                GD.lv = parseInt(i) + 1
                this.showQuestion(this.roundData[i])
                return
            }
        }
    },

    //检测当前状态
    checkState() {
        return this._state
    },

    jumpToRound(roundData) {
        GD.jumpModel = true;
        let data = roundData.json.limitTime
        this._vPlayer.setTime(cc.YL.tools.setTime(data.s, data.m));
        this.freezeVideoCheck()
    },

    showQuestion(roundData) {
        this._roundData = roundData;
        let isRecordLV = roundData.json.isRecordLV;
        let jumpTime = roundData.json.jumpTime;
        let roundLv = roundData.json.roundLv;
        if (isRecordLV) {
            if (GD.canRecording) {
                this._vPlayer.pauseAndHideProg();
            } else {
                GD.lv++;
                let data = roundData.json.continueTime;
                let time = cc.YL.tools.setTime(data.s, data.m) + jumpTime;
                this._vPlayer.resume(time);
                return;
            }
        } else {
            this._vPlayer.pauseAndHideProg();
        }
        GD.root.setBack(false);
        //GD.sound.resumeBgm();
        this._state = kStatusCode.STATUS_PLAYING;
        //GD.sound.setTipsButton(true);
        this._isCheckTime = false;
        if (this.questionPool.length < 1) {
            //手动加载
            cc.loader.loadRes('prefab/' + roundData.json.gameName, cc.Prefab, (err, _prefab) => {
                if (err) {
                    console.log(err);
                }
                cc.YL.unLockTouch();
                let question = cc.instantiate(_prefab);
                question.parent = this._questions;
            });
        } else {
            cc.YL.unLockTouch();
            let question = cc.instantiate(this.questionPool[roundLv - 1]);
            question.parent = this._questions;
        }
    },
});
