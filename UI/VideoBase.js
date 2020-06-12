cc.Class({
    extends: cc.Component,

    properties: {
        playOnLoad: {
            default: false,
            tooltip: '加载时播放'
        },

        progressNode: cc.Node
    },

    onLoad() {
        //摄像机组件透明度
        var camera = cc.find('Canvas/Main Camera');
        //var camera = GD.main.node.getChildByName("Main Camera");
        camera.getComponent(cc.Camera).backgroundColor = cc.color(0, 0, 0, 0);
        //播放器
        this.videoPlayer = null;
        this._prog = this.progressNode.getComponent('videoProg')
    },

    start() {
        this.setVideoBottom();
        this._isLoaded = false;
    },

    init(readyCallFunc, videoCallFunc, rounData) {
        this._readyCallFunc = readyCallFunc
        this._videoCallFunc = videoCallFunc
        this._roundData = rounData

        //由于视频加载完成的回调 不是所有情况都调用 为防止不调用的情况 添加长时间不响应时的处理
        cc.YL.timeOut(() => {
            if (!this._isLoaded) {
                //限定时间内 不响应 强行调用
                this._isLoaded = true;
                this.videoPlayer = this.getComponent(cc.VideoPlayer);
                this.videoDuration = this.videoPlayer.getDuration()
                this._prog.init(this, this._roundData)
                this._readyCallFunc()
            }
        }, 5000);
    },

    //暂停视频 隐藏进度条
    pauseAndHideProg() {
        this._prog.setScreenTouch(false)
        this.pause()
    },

    resumeAndUnlockProg(time) {
        this.resume(time)
        this._prog.setScreenTouch(true)
    },

    /**
     * 设置视频在底层
     */
    setVideoBottom() {
        //设置层级
        var video0 = null;
        var pInterval_video = setInterval(() => {
            video0 = document.getElementsByClassName('cocosVideo')[0];
            if (video0) {
                clearInterval(pInterval_video);
                video0.style.position = 'fixed';
                video0.style.zIndex = -1;
            }
        }, 10);
        var gCanvas = null;
        var pInterval_canvas = setInterval(() => {
            gCanvas = document.getElementsByClassName('gameCanvas')[0];
            if (gCanvas) {
                clearInterval(pInterval_canvas);
                gCanvas.style.position = 'relative';
                gCanvas.style.zIndex = 10;
            }
        }, 10);
    },

    onVideoCallback(videoPlayer, eventType, customEventData) {
        this._videoState = eventType
        switch (eventType) {
            case cc.VideoPlayer.EventType.META_LOADED:
                {
                    console.log("video-META_LOADED")
                    var t_video = Math.round(videoPlayer.getDuration());
                    console.log("Video Duration：" + t_video);
                }
                break;
            case cc.VideoPlayer.EventType.READY_TO_PLAY:
                {
                    console.log("video-READY_TO_PLAY")
                    if (!this._isLoaded) {
                        this._isLoaded = true;
                        this.videoPlayer = videoPlayer;
                        this.videoDuration = this.videoPlayer.getDuration()
                        this._prog.init(this, this._roundData)
                        this._readyCallFunc()
                    }
                }
                break;
            case cc.VideoPlayer.EventType.CLICKED:
                {
                    console.log("video-CLICKED")
                }
                break;
            case cc.VideoPlayer.EventType.COMPLETED:
                {
                    console.log("video-COMPLETED")
                    GD.main.finishGame();
                }
            case cc.VideoPlayer.EventType.PLAYING:
                {
                    console.log("video-PLAYING")
                }
            case cc.VideoPlayer.EventType.STOPPED:
                {
                    console.log("video-STOPPED")
                }
            case cc.VideoPlayer.EventType.PAUSED:
                {
                    console.log("video-PAUSED")
                }
            default:
                break;
        }
    },

    onPlaying(event) {
        console.log(event)
    },

    setTime(time) {
        this.videoPlayer.currentTime = time
    },

    play(time) {
        if (!this.videoPlayer) { console.log("error:Video is not loaded!"); return; }
        this.videoPlayer.play();
        time && (this.videoPlayer.currentTime = time)
    },

    stop() {
        if (!this.videoPlayer) { console.log("error:Video is not loaded!"); return; }
        this.videoPlayer.stop();
    },

    pause() {
        if (!this.videoPlayer) { console.log("error:Video is not loaded!"); return; }
        this.videoPlayer.pause();
        //GD.sound.pauseBgm()
    },

    resume(time) {
        if (!this.videoPlayer) { console.log("error:Video is not loaded!"); return; }
        this.videoPlayer.resume();
        //GD.sound.resumeBgm()
        time && (this.videoPlayer.currentTime = time)
    },

    ctrlVideo(progress) {
        this.videoPlayer.currentTime = this.videoPlayer.getDuration() * progress
    },

    getVideoState() {
        return this._videoState
    },

    getCurrentTime() {
        return this.videoPlayer.currentTime;
    },

    update(dt) {
        if (!this.videoPlayer) {
            return
        }
        this._videoCallFunc(this.videoPlayer.currentTime)
        this._prog.updateProgress(this.videoPlayer.currentTime, this.videoPlayer.getDuration())
    },
});
