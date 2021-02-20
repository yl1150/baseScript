cc.Class({
    extends: cc.Component,

    properties: {
        showPoint: { default: true, tooltip: '是否显示进度条上的点' },
        showIcon: { default: true, tooltip: '是否显示进度条上的图标' },
    },

    onLoad() {
        cc.origin.Note.script_videoProgress = this;
        //初始化
        this.base = this.node.getChildByName('base');
        this.base.active = true;
        this.base.opacity = 0;

        this.touchNode = this.base.getChildByName('touchNode');

        this.progressBg = this.base.getChildByName('progressBg');
        this.progressBar = this.progressBg.getChildByName('progressBar');
        this.progressCom = this.progressBar.getComponent(cc.ProgressBar);
        this.progressCom.progress = 0;
        this.bar = this.progressBar.getChildByName('bar');
        this.handle = this.bar.getChildByName('handle');
        //widget
        var pCanvas = cc.find('Canvas');
        var widgetCom_touchNode = this.touchNode.getComponent(cc.Widget);
        widgetCom_touchNode.target = pCanvas;
        widgetCom_touchNode.updateAlignment();
        var widgetCom_progressBg = this.progressBg.getComponent(cc.Widget);
        widgetCom_progressBg.target = pCanvas;
        widgetCom_progressBg.updateAlignment();
        //进度条触摸盒子
        this.touchBox_progressBar = this.progressBar.getChildByName('touchBox');
        //时间标签
        this.timeTag = this.progressBg.getChildByName('timeTag');
        this.labelCom_time = this.timeTag.getComponent(cc.Label);
        //总时间标签
        this.totaltimeTag = this.progressBg.getChildByName('totaltimeTag');
        this.labelCom_totaltime = this.totaltimeTag.getComponent(cc.Label);
        //按键
        this.key = this.progressBg.getChildByName('key');
        this.key.children.forEach(x => { x.active = false })
        this.key.getChildByName('img_pause').active = true;
        //视频操作点
        this.points = this.progressBar.getChildByName('points');
        this.pointSample = this.progressBg.getChildByName('pointSample');
        this.pointSample.setPosition(cc.v2(0, 0));
        this.pointSample.active = false;
        //初始化参数
        this.isTouching = false; //正在触摸
        this.isTouchingProgressBar = false; //再在触摸进度条
        this.t_NoTouchScreen = 0; //未触摸屏幕时长
        this.canTouchScreen = true; //可触摸屏幕
        this.canTouchBarAndKey = false; //可触摸进度条和键
    },

    onDestroy() {
        cc.origin.Note.script_videoProgress = null;
    },

    start() {
        //视频准备好
        cc.origin.EventManager.once(cc.origin.EventDefine.VIDEO.READY, function () {
            //初始化进度条
            if (cc.origin.Note.script_video.getTotalTime()) {
                this.initUI();
            } else {
                var intervalTag = setInterval(() => {
                    if (cc.origin.Note.script_video.getTotalTime()) {
                        clearInterval(intervalTag);
                        this.initUI();
                    }
                }, 100);
            }
        }, this)
        //视频结束
        cc.origin.EventManager.once(cc.origin.EventDefine.VIDEO.END, function () {
            //隐藏进度条
            this.showUI(false);
        }, this)
    },

    update(dt) {
        if (!cc.origin.Note.script_video) return;
        //n秒不触摸屏幕自动隐藏进度条
        if (this.canTouchScreen && !this.isTouching) {
            this.t_NoTouchScreen += dt;
            if (this.t_NoTouchScreen > 2) this.showProgress(false);
        } else {
            this.t_NoTouchScreen = 0;
        }
        //刷新进度条
        if (this.base.active) {
            var totalTime = cc.origin.Note.script_video.getTotalTime();
            var currentTime = cc.origin.Note.script_video.getCurrentTime();
            if (totalTime >= 0 && currentTime >= 0) this.setProgressByRatio(currentTime / totalTime);
        }
    },

    initUI() {
        if (this.isVideoReady) return;
        this.isVideoReady = true;
        //进度条组件长度和进度条长度一致
        this.progressCom.totalLength = this.progressBar.width;
        this.touchBox_progressBar.width = this.progressBar.width;
        //创建游戏点
        this.createPoint();
        //注册屏幕触摸
        this.registerScreenTouch();
        //注册进度条触摸
        this.registerProgressTouch();
        //注册键触摸
        this.registerKeyTouch();
    },

    showUI(canShow = true) {
        this.base.stopAllActions();
        this.base.opacity = 0;
        this.base.active = canShow;
        this.progressBar.active = false;
        this.key.active = false;
        this.isShow = false;
    },

    showProgress(canShow = true) {
        if (this.isShow === canShow) return;
        this.isShow = canShow;
        this.base.stopAllActions();
        if (canShow) {
            //可触摸进度条和键
            this.canTouchBarAndKey = true;
            //渐显
            this.progressBar.active = true;
            this.key.active = true;
            this.base.opacity = 255;
            // cc.tween(this.base).to(0.5,{opacity:255}).start();
            this.progressBg.getComponent(cc.Widget).updateAlignment();
        } else {
            //不可触摸进度条和键
            this.canTouchBarAndKey = false;
            //渐隐
            this.base.opacity = 0;
            this.progressBar.active = false;
            this.key.active = false;
            // cc.tween(this.base)
            //     .to(0.5,{opacity:0})
            //     .call(()=>{
            //         this.progressBar.active=false;
            //         this.key.active=false;
            //     })
            //     .start();
        }
    },

    setProgressByTouch(worldpos_touch) {
        var pos_touch = this.progressBar.convertToNodeSpaceAR(worldpos_touch);
        var ratio = (pos_touch.x - this.bar.x) / this.progressBar.width;
        cc.origin.Note.script_video.setProgressPercent(ratio);
        //根据比例设置进度条
        this.setProgressByRatio(ratio);
    },

    setProgressByRatio(ratio) {
        //设置进度条
        this.progressCom.progress = ratio;
        //设置时间标签
        function changeTwoBitStr(num) {
            let str = num.toString();
            while (str.length < 2) {
                str = '0' + str;
            }
            return str;
        }

        function sec2Str(sec) {
            var str = '';
            var h = Math.floor(sec / 3600);
            var m = Math.floor((sec % 3600) / 60);
            var s = Math.floor(sec % 60);
            if (h > 0) str += (changeTwoBitStr(h) + ':');
            str += (changeTwoBitStr(m) + ':');
            str += changeTwoBitStr(s);
            return str;
        }
        var totalTime = cc.origin.Note.script_video.getTotalTime();
        var currentTime = cc.origin.Note.script_video.getCurrentTime();
        // this.labelCom_time.string = sec2Str(currentTime) + '/' + sec2Str(totalTime);
        this.labelCom_time.string = sec2Str(currentTime);
        this.labelCom_totaltime.string = sec2Str(totalTime);
    },

    setProgressByTime(currentTime) {
        //设置视频时间
        cc.origin.Note.script_video.setCurrentTime(currentTime);
        //设置进度条
        var totalTime = cc.origin.Note.script_video.getTotalTime();
        var ratio = currentTime / totalTime;
        this.setProgressByRatio(ratio);
    },

    registerScreenTouch() {
        this.touchNode.on(cc.Node.EventType.TOUCH_START, function (event) {
            if (cc.origin.Note.touchTarget) return;
            if (!this.canTouchScreen) return;
            this.isTouching = true;
            cc.origin.Note.touchTarget = event.target;
            cc.origin.EventManager.emit(cc.origin.EventDefine.COMMON.FREEZE_TIME);
        }, this)
        this.touchNode.on(cc.Node.EventType.TOUCH_MOVE, function (event) { }, this)
        this.touchNode.on(cc.Node.EventType.TOUCH_END, touchUp, this)
        this.touchNode.on(cc.Node.EventType.TOUCH_CANCEL, touchUp, this)
        function touchUp(event) {
            if (!cc.origin.Note.touchTarget) return;
            cc.origin.EventManager.emit(cc.origin.EventDefine.COMMON.KINETIC_TIME);
            this.isTouching = false;
            //显示进度条
            // this.showProgress(true);
            this.showProgress(!this.isShow);
            //重置触摸对象
            cc.origin.Note.touchTarget = null;
        }
    },

    unregisterScreenTouch() {
        this.touchNode.off(cc.Node.EventType.TOUCH_START)
        this.touchNode.off(cc.Node.EventType.TOUCH_MOVE)
        this.touchNode.off(cc.Node.EventType.TOUCH_END)
        this.touchNode.off(cc.Node.EventType.TOUCH_CANCEL)
    },

    registerProgressTouch() {
        this.touchBox_progressBar.on(cc.Node.EventType.TOUCH_START, function (event) {
            if (cc.origin.Note.touchTarget) return;
            if (!this.canTouchBarAndKey) return;
            this.isTouching = true;
            this.isTouchingProgressBar = true;
            cc.origin.Note.touchTarget = event.target;
            cc.origin.EventManager.emit(cc.origin.EventDefine.COMMON.FREEZE_TIME);
            //暂停视频
            cc.origin.Note.script_video.pause();
            //显示暂停键
            this.key.getChildByName('img_play').active = false;
            this.key.getChildByName('img_pause').active = true;
            //设置进度
            this.setProgressByTouch(event.getLocation());
        }, this)
        this.touchBox_progressBar.on(cc.Node.EventType.TOUCH_MOVE, function (event) {
            if (!cc.origin.Note.touchTarget) return;
            //设置进度
            this.setProgressByTouch(event.getLocation());
        }, this)
        this.touchBox_progressBar.on(cc.Node.EventType.TOUCH_END, touchUp, this)
        this.touchBox_progressBar.on(cc.Node.EventType.TOUCH_CANCEL, touchUp, this)
        function touchUp(event) {
            if (!cc.origin.Note.touchTarget) return;
            cc.origin.EventManager.emit(cc.origin.EventDefine.COMMON.KINETIC_TIME);
            this.isTouching = false;
            this.isTouchingProgressBar = false;
            //继续视频
            cc.origin.Note.script_video.resume();
            //重置触摸对象
            cc.origin.Note.touchTarget = null;
        }
    },

    unregisterProgressTouch() {
        this.touchBox_progressBar.off(cc.Node.EventType.TOUCH_START)
        this.touchBox_progressBar.off(cc.Node.EventType.TOUCH_MOVE)
        this.touchBox_progressBar.off(cc.Node.EventType.TOUCH_END)
        this.touchBox_progressBar.off(cc.Node.EventType.TOUCH_CANCEL)
    },

    registerKeyTouch() {
        this.key.on(cc.Node.EventType.TOUCH_START, function (event) {
            if (cc.origin.Note.touchTarget) return;
            if (!this.canTouchBarAndKey) return;
            this.isTouching = true;
            cc.origin.Note.touchTarget = event.target;
            cc.origin.EventManager.emit(cc.origin.EventDefine.COMMON.FREEZE_TIME);
        }, this)
        this.key.on(cc.Node.EventType.TOUCH_MOVE, function (event) { }, this)
        this.key.on(cc.Node.EventType.TOUCH_END, touchUp, this)
        this.key.on(cc.Node.EventType.TOUCH_CANCEL, touchUp, this)
        function touchUp(event) {
            if (!cc.origin.Note.touchTarget) return;
            cc.origin.EventManager.emit(cc.origin.EventDefine.COMMON.KINETIC_TIME);
            this.isTouching = false;
            //暂停/播放视频
            var img_play = this.key.getChildByName('img_play');
            var img_pause = this.key.getChildByName('img_pause');
            if (img_play.active) {
                cc.origin.Note.script_video.resume();
                img_play.active = false;
                img_pause.active = true;
            } else {
                cc.origin.Note.script_video.pause();
                img_play.active = true;
                img_pause.active = false;
            }
            //重置触摸对象
            cc.origin.Note.touchTarget = null;
        }
    },

    unregisterKeyTouch() {
        this.key.off(cc.Node.EventType.TOUCH_START)
        this.key.off(cc.Node.EventType.TOUCH_MOVE)
        this.key.off(cc.Node.EventType.TOUCH_END)
        this.key.off(cc.Node.EventType.TOUCH_CANCEL)
    },

    createPoint() {
        this.point_arr = [];
        var timePoint_arr = cc.origin.Note.gameData.videoTimePoint.map(x => { return x });
        var totalTime = cc.origin.Note.script_video.getTotalTime();
        var width_points = this.points.width;
        var visibleIconCount = 0;//可见图标计数
        for (let i = 0, len = timePoint_arr.length; i < len; i++) {
            let timePoint = timePoint_arr[i];
            let time = timePoint.time;
            let tp = time[0] * 3600 + time[1] * 60 + time[2];
            let ratio = tp / totalTime;
            let posX = width_points * ratio;
            let newPoint = cc.instantiate(this.pointSample);
            newPoint.setParent(this.points);
            newPoint.name = i.toString();
            newPoint.active = true;
            newPoint.x = posX;
            newPoint.y = 0;
            //根据需要显示点与否
            newPoint.getChildByName('dot').active = this.showPoint;
            //根据需要显示图标与否
            let icon = newPoint.getChildByName('icon');
            icon.children.forEach(x => { x.active = false })
            let type = timePoint.type;
            let img_icon = icon.getChildByName(type);
            if (!img_icon) img_icon = icon.getChildByName('normal');
            img_icon.active = true;
            icon.width = img_icon.width;
            icon.height = img_icon.height;
            icon.active = this.showIcon;
            let y_icon = (this.progressBar.height + img_icon.height) / 2;
            icon.y = y_icon;
            //如果类型是空的，虽创建点，但是隐藏
            if (type === 'null') newPoint.active = false;
            //奇偶图标上下错开
            if (newPoint.active) {
                if (visibleIconCount % 2 === 0) {
                    icon.y = y_icon;
                } else {
                    icon.y = -y_icon;
                    img_icon.scaleY = -1;
                    if (type === 'tip') img_icon.scaleY = 1;
                }
                visibleIconCount++;
            }

            this.point_arr.push(newPoint);
        }
        //给点注册触摸
        this.registerPointTouch();
    },

    registerPointTouch(pNode) {
        var temp_arr = [];
        if (pNode) {
            temp_arr.push(pNode);
        } else {
            temp_arr = this.point_arr;
        }
        var gameId = 0;
        temp_arr.forEach(pItem => {
            let icon = pItem.getChildByName('icon');
            icon.on(cc.Node.EventType.TOUCH_START, function (event) {
                if (cc.origin.Note.touchTarget) return;
                if (!this.canTouchBarAndKey) return;
                this.isTouching = true;
                this.isTouchingProgressBar = true;
                cc.origin.Note.touchTarget = event.target;
                cc.origin.EventManager.emit(cc.origin.EventDefine.COMMON.FREEZE_TIME);
                cc.origin.AudioBase.play('click');
                //放大图标
                cc.origin.Note.touchTarget.setScale(1.2, 1.2);
                //暂停视频
                cc.origin.Note.script_video.pause();
                //显示暂停键
                this.key.getChildByName('img_play').active = false;
                this.key.getChildByName('img_pause').active = true;
                //获取游戏id
                var point = cc.origin.Note.touchTarget.parent;
                gameId = parseInt(point.name);
                //设置进度
                var currentTime = cc.origin.Note.script_videoCtrl.getTimePointByGameId(gameId);
                this.setProgressByTime(currentTime);
            }, this)
            icon.on(cc.Node.EventType.TOUCH_MOVE, function (event) { }, this)
            icon.on(cc.Node.EventType.TOUCH_END, touchUp, this)
            icon.on(cc.Node.EventType.TOUCH_CANCEL, touchUp, this)
            function touchUp(event) {
                if (!cc.origin.Note.touchTarget) return;
                cc.origin.EventManager.emit(cc.origin.EventDefine.COMMON.KINETIC_TIME);
                //还原图标
                cc.origin.Note.touchTarget.setScale(1, 1);
                //开始对应游戏
                cc.origin.Note.script_videoCtrl.startGame(gameId);
                //未在触摸
                this.isTouching = false;
                this.isTouchingProgressBar = false;
                //重置触摸对象
                cc.origin.Note.touchTarget = null;
            }
        })
    },

    unregisterPointTouch(pNode) {
        var temp_arr = [];
        if (pNode) {
            temp_arr.push(pNode);
        } else {
            temp_arr = this.point_arr;
        }
        temp_arr.forEach(pItem => {
            let icon = pItem.getChildByName('icon');
            icon.off(cc.Node.EventType.TOUCH_START)
            icon.off(cc.Node.EventType.TOUCH_MOVE)
            icon.off(cc.Node.EventType.TOUCH_END)
            icon.off(cc.Node.EventType.TOUCH_CANCEL)
        })
    },
});