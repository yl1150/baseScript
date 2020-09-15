const TIME_LIMIT = 2 //3秒不操作隐藏进度条
const kStatusCode = cc.Enum({
    /**无状态 */
    STATUS_NONE: 0,

    /**正在游戏关卡 */
    STATUS_PLAYING: 1,

    /**播放视频 */
    STATUS_PLAYVIDEO: 2,
}); cc.Class({
    extends: cc.Component,

    properties: {
        curTimeLabel: cc.Label,
        durTimeLabel: cc.Label,
        quesIcon: cc.SpriteFrame,
        gameIcon: cc.SpriteFrame,
        pauseTexture: cc.SpriteFrame,
        resumeTexture: cc.SpriteFrame
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {

    },


    //初始化视频进度条 根据每个关卡节点的数据在进度条上生成对应的按钮
    init(videoBase, roundData) {
        if (!videoBase.getDuration()) {
            var intervalTag = setInterval(() => {
                if (videoBase.getDuration()) {
                    this.init(videoBase, roundData);
                    clearInterval(intervalTag);
                }
            }, 500);
            return;
        }

        if(this._isInit){
            console.log('已经初始化')
            return;
        }

        let _canvas = cc.find('Canvas')
        let widget = this.getComponent(cc.Widget)
        widget.target = _canvas
        widget.bottom = 50 / 1.5


        this.screenTouch = new cc.Node('screenTouch')
        this.screenTouch.width = 2000
        this.screenTouch.height = 2000
        this.screenTouch.parent = videoBase.node
        this.screenTouch.zIndex = -1


        this._prog = this.getComponent(cc.Slider)
        this._progBg = this.node.getChildByName('Background')
        this._progBar = this.node.getChildByName('progBar')
        this._progHandle = this.node.getChildByName('Handle')
        this._pauseBtn = this.node.getChildByName('pauseBtn')
        this.node.active = false
        this._progHandle.zIndex = 99
        cc.YL.tools.registerTouch(
            this._progBg,
            (e) => {
                console.log('_progBg')
                //e.stopPropagation()
                // 冻结 关卡时机判断
                this.stopHidingClock()
                GD.main.freezeVideoCheck()
            },
            (e) => {
                //e.stopPropagation()
                //GD.main.freezeVideoCheck()
            },
            (e) => {
                //e.stopPropagation()
                GD.main.reFreezeVideoCheck()
                this.startHidingClock()
            },
        )

        cc.YL.tools.registerTouch(
            this._progHandle,
            (e) => {
                console.log('_progHandle')
                GD.main.freezeVideoCheck()
                this.stopHidingClock()
            },
            (e) => {
            },
            (e) => {
                GD.main.reFreezeVideoCheck()
                this.startHidingClock()
            },
        )


        cc.YL.tools.registerTouch(
            this.screenTouch,
            (e) => {
                console.log('screenTouch')
                e.stopPropagation()
                this.stopHidingClock()
            },
            null,
            (e) => {
                e.stopPropagation()
                if (GD.main.checkState() == kStatusCode.STATUS_PLAYVIDEO) {
                    //当且仅当 播放视频时 可显示进度条及其相关
                    this.setBtnSprite(this._videoBase.getVideoState() == cc.VideoPlayer.EventType.PAUSED ? 'pause' : 'resume')
                    if (this.node.active) {
                        this.setVideoProg(false)
                        this.stopHidingClock()
                    } else {
                        this.setVideoProg(true)
                        this.startHidingClock()
                    }
                }
            },
        )

        cc.YL.tools.registerTouch(
            this._pauseBtn,
            (e) => {
                e.stopPropagation()
            },
            null,
            (e) => {
                e.stopPropagation()
                if (this._videoBase.getVideoState() == cc.VideoPlayer.EventType.PLAYING) {
                    //暂停视频，此时无需隐藏ui的计时
                    this._videoBase.pause()
                    this.stopHidingClock()
                    this.setVideoProg(true)
                    this.setBtnSprite('pause')
                } else if (this._videoBase.getVideoState() == cc.VideoPlayer.EventType.STOPPED) {
                    // 当前视频以及停止播放 重新播放视频
                } else if (this._videoBase.getVideoState() == cc.VideoPlayer.EventType.PAUSED) {
                    //继续播放视频 并隐藏进度条
                    this._videoBase.resume()
                    this.startHidingClock()
                    //this.setVideoProg(false)
                    this.setBtnSprite('resume')
                }
            },
        )
        this._isInit = true;
        this._videoBase = videoBase
        for (let i in roundData) {
            let json = roundData[i].json||roundData[i];

            let data = json.limitTime
            let isTipsRound = json.isTipsRound

            let percent = cc.YL.tools.setTime(data.s, data.m) / videoBase.getDuration()
            let x = this.node.width * percent - this.node.width / 2
            let icon = new cc.Node('icon')
            icon.addComponent(cc.Sprite).spriteFrame = isTipsRound ? this.quesIcon : this.gameIcon
            icon._roundData = roundData[i]
            icon.parent = this.node

            let isTurn = parseInt(i) % 2 == 0
            icon.position = (isTurn ? cc.v2(x, - (icon.height / 2) - 8) : cc.v2(x, (icon.height / 2) + 8))
            !isTipsRound && (icon.angle = isTurn ? 180 : 0)
            cc.YL.tools.registerTouch(
                icon,
                (e) => {
                    e.stopPropagation()
                    //GD.main.freezeVideoCheck()
                    this.stopHidingClock()
                    GD.main.jumpToRound(e.target._roundData)
                },
                null,
                (e) => {
                    e.stopPropagation()
                    GD.main.showQuestion(e.target._roundData)
                    //隐藏进度条 视频直接跳到对应时间 进行对应游戏
                    this.setVideoProg(false)
                    //this._videoBase.resume()
                    this.setBtnSprite('pause')
                },
            )
        }
    },

    setBtnSprite(state) {
        this._pauseBtn.getComponent(cc.Sprite).spriteFrame = (state == 'pause' ? this.pauseTexture : this.resumeTexture)
    },

    setScreenTouch(isLock) {
        this.screenTouch.active = isLock
    },

    //开启隐藏倒计时计数
    startHidingClock() {
        this.stopHidingClock()
        this._timeClock = setTimeout(() => {
            this.setVideoProg(false)
        }, TIME_LIMIT * 1000)
    },

    stopHidingClock() {
        this._timeClock && clearTimeout(this._timeClock)
    },

    setVideoProg(isShow) {
        this._pauseBtn.active = isShow
        this.node.active = isShow
    },

    sliderCallFunc(e) {
        this._videoBase.ctrlVideo(this._prog.progress)
        this._videoBase.resume()
        this.startHidingClock()
        this.setBtnSprite('resume')
    },

    updateProgress(curTime, totalTime) {
        if (!curTime || !totalTime || !this._prog) {
            console.log('updateProgress:::', curTime, totalTime, this._prog);
            return;
        }
        let m = parseInt(curTime / 60)
        let s = parseInt(curTime - m * 60)
        let curString = ((m < 10 ? '0' + m : m) + ":" + (s < 10 ? '0' + s : s))

        m = parseInt(totalTime / 60)
        s = parseInt(totalTime - m * 60)
        let durString = ((m < 10 ? '0' + m : m) + ":" + (s < 10 ? '0' + s : s))

        this.durTimeLabel.string = durString
        this.curTimeLabel.string = curString
        this._prog.progress = curTime / totalTime
        this._progBar.width = this._progHandle.x + this.node.width / 2
    },
});
