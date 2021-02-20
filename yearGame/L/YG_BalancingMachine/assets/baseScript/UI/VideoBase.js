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
        this._prog = this.progressNode.getComponent('videoProg');
        this._state = 'init';
    },

    start() {
        this.setVideoBottom();
        this.checkVideoPlayerMatrix();
        //this.play();
        this._isLoaded = false;
        this.isVisibility = false;
    },

    init(readyCallFunc, videoCallFunc, setPoster, rounData) {
        this._readyCallFunc = readyCallFunc;
        this._videoCallFunc = videoCallFunc;
        this._setPoster = setPoster;
        this._roundData = rounData;
        this.videoPlayer = this.getComponent(cc.VideoPlayer);
        //由于视频加载完成的回调 不是所有情况都调用 为防止不调用的情况 添加长时间不响应时的处理
        //强制播放视频（ready事件无效）
        /*         var intervalTag = setInterval(() => {
                    if (this.getCurrentTime() || this.videoPlayer.isPlaying() || this.videoPlayer._currentStatus === cc.VideoPlayer.EventType.PLAYING) {
                        clearInterval(intervalTag);
                    } else {
                        this.play();
                        setTimeout(() => {
                            if (this.getCurrentTime() || this.videoPlayer.isPlaying() || this.videoPlayer._currentStatus === cc.VideoPlayer.EventType.PLAYING) {
                                clearInterval(intervalTag);
                                //准备好并播放视频
                                console.log('强播')
                                this.startGame();
                            }
                        }, 100);
                    }
                }, 2000); */

        cc.YL.emitter.on('StartGame', (data) => {
            console.log('StartGame')
            this.startGame();
        })
    },

    startGame() {
        if (GD.videoType == 'local') {
            this.videoPlayer.resourceType = cc.VideoPlayer.ResourceType.LOCAL
            this.videoPlayer.clip = GD.videoURL;
        } else if(GD.videoType == 'remote'){
            this.videoPlayer.resourceType = cc.VideoPlayer.ResourceType.REMOTE
            this.videoPlayer.remoteURL = GD.videoURL;
            console.log(this.videoPlayer, GD.videoURL)
        }


        this._prog.init(this, this._roundData);
        this._readyCallFunc();
        this.ctrlVideo(0);
        this._setPoster(false);
        this.play();
        this._isLoaded = true;
        this._state = 'playing';
        this.allowUpdateVisible = true;
        console.log('CurrentTime:  ', this.getCurrentTime())
        console.log('isPlaying:  ', this.videoPlayer.isPlaying())
        console.log('currentStatus:  ', this.videoPlayer._currentStatus)
    },

    //暂停视频 隐藏进度条
    pauseAndHideProg() {
        this._prog.setScreenTouch(false)
        this._prog.setVideoProg(false)
        this.pause()
    },

    resumeAndUnlockProg(time) {
        this.setTime(time);
        this.resume();
        this._prog.setScreenTouch(true);
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
                video0.poster = GD.main.videoPoster.getComponent(cc.Sprite).spriteFrame._texture.nativeUrl;
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

    setVideo() {
        let video0 = document.getElementsByClassName('cocosVideo')[0];
        if (video0) {
            video0.style.visibility = this.isVisibility ? 'visible' : 'hidden';
            console.log(video0.style)
            this.isVisibility = !this.isVisibility;
        }
    },

    onVideoCallback(videoPlayer, eventType, customEventData) {
        this._videoState = eventType
        switch (eventType) {
            case cc.VideoPlayer.EventType.META_LOADED:
                {
                    console.log("video-META_LOADED")
                    var t_video = Math.round(this.getDuration());
                    console.log("Video Duration：" + t_video);
                }
                break;
            case cc.VideoPlayer.EventType.READY_TO_PLAY:
                {
                    console.log("video-READY_TO_PLAY", this._isLoaded)
                    if (!this._isLoaded) {
                        console.log('自然加载')
                        /* this.play();
                        this.startGame();
                        this._setPoster(false); */
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
                    //GD.main.finishGame();
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

    checkVideoPlayerMatrix() {
        var style = this.videoPlayer._impl._video.style;
        if (style && !style.transform) {
            style.transform = this.calculateImplMatrix();
        }
    },

    calculateImplMatrix() {
        let node = this.node;
        let mat4 = cc.mat4();
        node.getWorldMatrix(mat4);
        let renderCamera = cc.Camera._findRendererCamera(node);
        if (renderCamera) {
            renderCamera.worldMatrixToScreen(mat4, mat4, cc.game.canvas.width, cc.game.canvas.height);
        }
        let mat4m = mat4.m;

        let dpr = cc.view.getDevicePixelRatio();
        let scaleX = 1 / dpr;
        let scaleY = 1 / dpr;

        let w = node._contentSize.width * scaleX;
        let h = node._contentSize.height * scaleY;

        let container = cc.game.container;
        let cw = container.clientWidth;
        let ch = container.clientHeight;
        let pScale = 1;
        if ((w / h) < (cw / ch)) {
            pScale = ch / h;
        } else {
            pScale = cw / w;
        }
        mat4m[0] = pScale;
        mat4m[5] = pScale;
        let a = mat4m[0] * scaleX, b = mat4m[1], c = mat4m[4], d = mat4m[5] * scaleY;

        let offsetX = container && container.style.paddingLeft ? parseInt(container.style.paddingLeft) : 0;
        let offsetY = container && container.style.paddingBottom ? parseInt(container.style.paddingBottom) : 0;

        let appx = (w * pScale) * node._anchorPoint.x;
        let appy = (h * pScale) * node._anchorPoint.y;

        let tx = mat4m[12] * scaleX - appx + offsetX;
        let ty = mat4m[13] * scaleY - appy + offsetY;

        a = a.toFixed(3);
        b = b.toFixed(3);
        c = c.toFixed(3);
        d = d.toFixed(3);
        tx = tx.toFixed(3);
        ty = ty.toFixed(3);
        let matrix = "matrix(" + a + "," + -b + "," + -c + "," + d + "," + tx + "," + -ty + ")";

        return matrix;
    },

    onPlaying(event) {
    },

    play(time) {
        if (!this.videoPlayer) { console.log("error:Video is not loaded!"); return; }
        this.videoPlayer.play();
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

    resume() {
        if (!this.videoPlayer) { console.log("error:Video is not loaded!"); return; }
        this.videoPlayer.resume();
        //GD.sound.resumeBgm()
    },

    ctrlVideo(progress) {
        this.setTime(this.getDuration() * progress);
    },

    getVideoState() {
        return this._videoState
    },

    getCurrentTime() {
        return this.videoPlayer._impl._video.currentTime;
    },


    getDuration() {
        if (!this.videoPlayer) {
            return 0;
        }
        let durT = this.videoPlayer.getDuration();
        return durT ? durT : 0;
    },

    setTime(time) {
        if (!time && time != 0) {
            console.log('wrongTimeData:', time)
            return;
        }
        this.videoPlayer._impl._video.currentTime = time
    },

    update(dt) {
        if (!this.videoPlayer || !this._isLoaded || !this.getCurrentTime() || this._state == 'completed') {
            return
        }
        let curTime = this.getCurrentTime();
        let durTime = this.getDuration();
        this._videoCallFunc(curTime)
        this._prog.updateProgress(curTime, durTime)

        if (durTime - curTime <= 0.2) {
            console.log("video-COMPLETED")
            this._state = 'completed';
            GD.main.finishGame();
        }

        if (this.allowUpdateVisible) {
            //重置视频可见（专治黑屏）
            var video = this.videoPlayer._impl._video;
            var currentTime = video.currentTime;
            if (currentTime > 0.1) {
                console.log('visible==================000')
                video.style.visibility = 'visible';
                this.allowUpdateVisible = false;
            } else if (currentTime > 0) {
                console.log('hidden===================000')
                video.style.visibility = 'hidden';
            }
        }
    },
});
