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
        node.color = cc.color(0, 0, 0, 180);
        node.opacity = 180;
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

        var self = this;
        function checkPlaying() {
            var result = false;
            var currentTime = self.videoPlayer._impl._video.currentTime;
            var isPlaying = self.videoPlayer.isPlaying();
            var isPlayStatus = (self.videoPlayer._currentStatus === cc.VideoPlayer.EventType.PLAYING);
            if (currentTime || isPlaying || isPlayStatus) result = true;
            return result;
        }

        this.showMessage('努力加载中。。。');

        var intervalTag = setTimeout(() => {
            console.log('checkPlaying-----1')
            if (checkPlaying()) {
                this.startGame();
                this.showMessage('');
                clearTimeout(intervalTag);
            } else {
                this.showMessage('视频加载超时,重新加载中。。。');
                this.play();
                setTimeout(() => {
                    if (checkPlaying()) {
                        this.startGame();
                        this.showMessage('');
                    } else {
                        this.showMessage('视频加载失败,请重启游戏或者点击屏幕。。。');
                    }
                }, 1000);
            }
        }, 10000);

        this.timeTag = intervalTag;
        cc.YL.tools.registerTouch(this._poster, () => { }, null, () => {
            clearTimeout(intervalTag);
            this.showMessage('努力加载中。。。。');
            this.play();
            setTimeout(() => {
                if (checkPlaying()) {
                    this.startGame();
                    this.showMessage('');
                } else {
                    this.showMessage('视频加载失败,请重启游戏或者点击屏幕。。。');
                }
            }, 1000);
        });


    },

    showMessage(mes) {
        this._poster.mes_label.node.active = mes != '';
        this._poster.mes_label.string = mes
    },

    startGame() {
        //限定时间内 不响应 强行调用
        this.showMessage('');
        clearTimeout(this.timeTag);
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
                {
                    console.log('META_LOADED')
                }
                break;
            case cc.VideoPlayer.EventType.READY_TO_PLAY:
                {
                    console.log('READY_TO_PLAY')
                    this.startGame();
                }
                break;
            case cc.VideoPlayer.EventType.CLICKED:
                {
                    console.log('CLICKED')
                }
                break;
            case cc.VideoPlayer.EventType.COMPLETED:
                {
                    console.log('COMPLETED')
                }
                break;
            case cc.VideoPlayer.EventType.PLAYING:
                {
                    console.log('PLAYING')
                }
                break;
            case cc.VideoPlayer.EventType.STOPPED:
                {
                    console.log('STOPPED')
                }
                break;
            case cc.VideoPlayer.EventType.PAUSED:
                {
                    console.log('PAUSED')
                }
                break;
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
        console.log('setTime:', time);
        this.videoPlayer._impl._video.currentTime = time
    },


    update(dt) {
        let currentTime = this.getCurrentTime();
        if (!this.videoPlayer || !this._isLoaded || !currentTime) {
            return
        }
        this._videoCallFunc(currentTime)
        this._prog.updateProgress(currentTime, this.videoPlayer.getDuration())

        if (this.allowUpdateVisible) {
            //重置视频可见（专治黑屏）
            var video = this.videoPlayer._impl._video;
            if (currentTime > 0.1) {
                video.style.visibility = 'visible';
                this.allowUpdateVisible = false;
            } else if (currentTime > 0) {
                video.style.visibility = 'hidden';
            }
        }
        if (this.allowUpdateCheckEnd) {
            //检测视频结束
            var totalTime = this.getDuration();
            if (currentTime && totalTime && (totalTime - currentTime < 0.2)) {
                this.allowUpdateCheckEnd = false;
                //视频结束
                cc.YL.emitter.emit('finishGame');
            }
        }
    },
});
