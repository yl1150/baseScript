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
        camera.getComponent(cc.Camera).backgroundColor = cc.color(0, 0, 0, 0);

        this._poster = this.node.getChildByName('videoPoster');
        this._isloaded = false;

        let node = new cc.Node();
        node.color = cc.color(0, 0, 0, 120);
        node.opacity = 120;
        let mes_label = node.addComponent(cc.Label);
        mes_label.fontSize = 20;
        node.parent = this._poster;
        this._poster.mes_label = mes_label;
        node.active = false;

        this.videoPlayer = this.getComponent(cc.VideoPlayer);
        //播放器
        cc.gameConfig.videoURL && (this.videoPlayer.remoteURL = cc.gameConfig.videoURL);
        this._prog = this.progressNode.getComponent('videoProg');
    },

    start() {
        this.setVideoBottom();
        this.setPoster(true);
        this._isLoaded = false;
    },

    init(readyCallFunc, videoCallFunc, rounData) {
        this._readyCallFunc = readyCallFunc;
        this._videoCallFunc = videoCallFunc;
        this._roundData = rounData;
        //由于视频加载完成的回调 不是所有情况都调用 为防止不调用的情况 添加长时间不响应时的处理
        //强制播放视频（ready事件无效）
        let checkID = setTimeout(() => {
            let video0 = document.getElementsByClassName('cocosVideo')[0];
            let networkState = video0.networkState;
            let readyState = video0.readyState;
            let mes = '正在加载视频。。。。'
            console.log('networkState:----', networkState);
            console.log('readyState----', readyState);
            /* 
            networkState --表示音频 / 视频元素的当前网络状态：
            0 = NETWORK_EMPTY - 音频 / 视频尚未初始化
            1 = NETWORK_IDLE - 音频 / 视频是活动的且已选取资源，但并未使用网络
            2 = NETWORK_LOADING - 浏览器正在下载数据
            3 = NETWORK_NO_SOURCE - 未找到音频 / 视频来源 

            readyState--表示音频/视频元素的就绪状态：
            0 = HAVE_NOTHING - 没有关于音频/视频是否就绪的信息
            1 = HAVE_METADATA - 关于音频/视频就绪的元数据
            2 = HAVE_CURRENT_DATA - 关于当前播放位置的数据是可用的，但没有足够的数据来播放下一帧/毫秒
            3 = HAVE_FUTURE_DATA - 当前及至少下一帧的数据是可用的
            4 = HAVE_ENOUGH_DATA - 可用数据足以开始播放
            */
            if (networkState == 0 || readyState == 0 || networkState == 3) {
                //未加载成功???
                if (!self._isloaded) {
                    self._isloaded = true;
                    video0.load()//重新加载视频
                }
                console.log('视频未加载成功，重新加载');
                if (networkState == 0) {
                    mes = '网络信号弱。。。。'
                }
                if (readyState == 0) {
                    mes = '视频加载失败。。。。'
                }
                if (networkState == 3) {
                    mes = '未检测到视频源。。。。'
                }

                self._poster.mes_label.string = mes;
                self._poster.mes_label.node.active = true;
                return false;
            }
        }, 2000);
        var self = this;
        function checkPlaying() {
            var result = false;
            var currentTime = self.videoPlayer._impl._video.currentTime;
            var isPlaying = self.videoPlayer.isPlaying();
            var isPlayStatus = (self.videoPlayer._currentStatus === cc.VideoPlayer.EventType.PLAYING);
            if (currentTime || isPlaying || isPlayStatus) result = true;
            return result;
        }



        var intervalTag = setInterval(() => {
            if (checkPlaying()) {
                this.startGame();
                this._poster.mes_label.node.active = false;
                clearInterval(intervalTag);
                clearTimeout(checkID);
            } else {
                this.play();
            }
        }, 500);

        cc.YL.tools.registerTouch(this._poster, () => { }, null, () => {
            clearInterval(intervalTag);
            this.startGame();
        });


    },

    startGame() {
        //限定时间内 不响应 强行调用
        this.videoDuration = this.videoPlayer.getDuration();
        this._prog.init(this, this._roundData);
        this._readyCallFunc();
        this.setPoster(false);
        this.play();
        this._isLoaded = true;
        this.allowUpdateVisible = true;
        this.allowUpdateCheckEnd = true;
    },

    setPoster(isShow) {
        this._poster.active = isShow;
    },

    //暂停视频 隐藏进度条
    pauseAndHideProg() {
        this.setPoster(false);
        this._prog.setScreenTouch(false)
        this._prog.setVideoProg(false)
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
                video0.poster = this._poster.getComponent(cc.Sprite).spriteFrame._texture.nativeUrl;
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
                { }
                break;
            case cc.VideoPlayer.EventType.READY_TO_PLAY:
                {

                }
                break;
            case cc.VideoPlayer.EventType.CLICKED:
                {
                }
                break;
            case cc.VideoPlayer.EventType.COMPLETED:
                {
                }
            case cc.VideoPlayer.EventType.PLAYING:
                {
                }
            case cc.VideoPlayer.EventType.STOPPED:
                {
                }
            case cc.VideoPlayer.EventType.PAUSED:
                {
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
        time && this.setTime(time);
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
        time && this.setTime(time);
    },

    ctrlVideo(progress) {
        this.setTime(this.videoPlayer.getDuration() * progress);
    },

    getVideoState() {
        return this._videoState
    },

    getCurrentTime() {
        return this.videoPlayer._impl._video.currentTime;
    },

    getDuration() {
        return this.videoPlayer.getDuration();
    },

    setTime(time) {
        if (!time) {
            return
        }
        this.videoPlayer._impl._video.currentTime = time
    },


    update(dt) {
        if (!this.videoPlayer || !this._isLoaded || !this.getCurrentTime()) {
            return
        }
        this._videoCallFunc(this.getCurrentTime())
        this._prog.updateProgress(this.getCurrentTime(), this.videoPlayer.getDuration())

        if (this.allowUpdateVisible) {
            //重置视频可见（专治黑屏）
            var video = this.videoPlayer._impl._video;
            var currentTime = video.currentTime;
            if (currentTime > 0.1) {
                video.style.visibility = 'visible';
                this.allowUpdateVisible = false;
            } else if (currentTime > 0) {
                video.style.visibility = 'hidden';
            }
        }
        if (this.allowUpdateCheckEnd) {
            //检测视频结束
            var currentTime = this.getCurrentTime();
            var totalTime = this.getDuration();
            if (currentTime && totalTime && (totalTime - currentTime < 0.2)) {
                this.allowUpdateCheckEnd = false;
                //视频结束
                cc.YL.emitter.emit('finishGame');
            }
        }
    },
});
