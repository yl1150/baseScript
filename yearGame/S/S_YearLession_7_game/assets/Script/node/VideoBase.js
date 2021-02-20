cc.Class({
    extends: cc.Component,

    properties: {
        playOnLoad: { default: true, tooltip: '加载时播放' },
    },

    onLoad() {
        cc.origin.Note.script_video = this;
        //摄像机组件透明度
        cc.Camera.main.backgroundColor = cc.color(0, 0, 0, 0);
        //隐藏背景
        var bg = cc.find('Canvas/bg');
        if (bg) bg.removeAllChildren();
        //封面
        this.cover = this.node.getChildByName('cover');
        if (this.cover) this.cover.active = true;
        //播放器
        this.videoPlayer = this.node.getComponent(cc.VideoPlayer);
        //视频状态
        this.videoState = null;
        //替换视频链接（如有）
        if (this.node._videoURL) this.videoPlayer.remoteURL = this.node._videoURL;
    },

    onDestroy() {
        cc.origin.Note.script_video = null;
    },

    start() {
        //初始化视频层级
        this.initVideoZIndex();

        //强制播放视频（ready事件无效）
        var self = this;
        function checkPlaying() {
            var result = false;
            var currentTime = self.videoPlayer.currentTime;
            var isPlaying = self.videoPlayer.isPlaying();
            var isPlayStatus = (self.videoPlayer._currentStatus === cc.VideoPlayer.EventType.PLAYING);
            if (currentTime || isPlaying || isPlayStatus) result = true;
            return result;
        }
        var intervalTag = setInterval(() => {
            if (checkPlaying()) {
                clearInterval(intervalTag);
            } else {
                this.videoPlayer.play();
                setTimeout(() => {
                    if (checkPlaying()) {
                        clearInterval(intervalTag);
                        //准备好并播放视频
                        this.readyAndPlay();
                    }
                }, 100);
            }
        }, 2000);
    },

    /**
     * 初始化视频层级
     */
    initVideoZIndex() {
        var video0 = null;
        var pInterval_video = setInterval(() => {
            video0 = document.getElementsByClassName('cocosVideo')[0];
            if (video0) {
                clearInterval(pInterval_video);
                video0.style.position = 'fixed';
                video0.style.zIndex = 5;
                //换视频播放器图标封面
                if (this.cover) {
                    var posterImgURL = this.cover.getComponent(cc.Sprite).spriteFrame._texture.nativeUrl;
                    video0.poster = posterImgURL;
                }
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
        return
        var video0 = document.getElementsByClassName('cocosVideo')[0];
        video0.style.position = 'fixed';
        video0.style.zIndex = 5;
        video0.setAttribute('x5-video-player-type', 'h5');
        video0.setAttribute('webkit-playsinline', true);
        video0.setAttribute('x-webkit-airplay', true);
        video0.setAttribute('x5-video-orientation', 'h5');
        video0.setAttribute('x5-video-player-fullscreen', true);
        video0.setAttribute('preload', 'auto');

        var gCanvas = document.getElementsByClassName('gameCanvas')[0];
        gCanvas.style.position = 'relative';
        gCanvas.style.zIndex = 10;
    },

    onVideoCallback(videoPlayer, eventType, customEventData) {
        this.videoState = eventType;//刷新视频状态;
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
                    //准备好并播放视频
                    this.readyAndPlay();
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
                    cc.origin.EventManager.emit(cc.origin.EventDefine.VIDEO.END);
                }
                break;
            case cc.VideoPlayer.EventType.PLAYING:
                {
                    console.log("video-PLAYING")
                }
                break;
            case cc.VideoPlayer.EventType.STOPPED:
                {
                    console.log("video-STOPPED")
                }
                break;
            case cc.VideoPlayer.EventType.PAUSED:
                {
                    console.log("video-PAUSED")
                }
                break;
            default:
                break;
        }
    },

    readyAndPlay() {
        if (this.isReadyToPlay) return;
        this.isReadyToPlay = true;
        //发射事件（视频已准备好）
        cc.origin.EventManager.emit(cc.origin.EventDefine.VIDEO.READY);
        //隐藏封面
        if (this.cover) this.cover.active = false;
        //播放视频
        if (this.playOnLoad) this.videoPlayer.play();
    },

    play(t) {
        if (t) this.videoPlayer.currentTime = t;
        this.videoPlayer.play();
    },

    pause(t) {
        this.videoPlayer.pause();
        if (t) this.videoPlayer.currentTime = t;
    },

    resume(t) {
        if (t) this.videoPlayer.currentTime = t;
        this.videoPlayer.resume();
    },

    stop() {
        this.videoPlayer.stop();
    },

    /**
     * 设置当前时间
     * @param {Number} t 大于0
     */
    setCurrentTime(t) {
        if (this.videoPlayer) this.videoPlayer.currentTime = t;
    },

    /**
     * 获取当前时间
     */
    getCurrentTime() {
        var t = 0;
        if (this.videoPlayer) t = this.videoPlayer.currentTime;
        return t;
    },

    /**
     * 获取视频总时长
     */
    getTotalTime() {
        var t = 0;
        if (this.videoPlayer) t = this.videoPlayer.getDuration();
        return t;
    },

    /**
     * 按百分比 设置视频进度
     * @param {Number} ratio 0-1
     */
    setProgressPercent(ratio) {
        var t = ratio * this.videoPlayer.getDuration();
        this.videoPlayer.currentTime = t;
    },

    /**
     * 获取视频状态
     */
    getVideoState() {
        return this.videoState;
    },

    /**
     * 跳时间（向后跳interval秒）
     * @param {Number} interval 时间间隔，单位：秒
     */
    jumpTime(interval) {
        this.videoPlayer.currentTime += interval;
    },
});