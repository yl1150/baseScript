let register = {
    init() {
        cc.YL.tools = require("tools");
        cc.YL.aMgr = require('ActionMgr');
        cc.YL.net = require('NetWork');
        cc.YL.recorder = require('testRecorder');
        var Loader = require("loader");
        var Emitter = require("emitter");

        let url = document.URL + 'config.json';

        //注册按钮点击事件 用于添加点击音效
        cc.Button.prototype._onTouchEnded = function (t) {
            if (this.interactable && this.enabledInHierarchy) {
                if (this._pressed) {
                    cc.Component.EventHandler.emitEvents(this.clickEvents, t);
                    this.node.emit("click", this)
                    cc.YL.emitter.emit('tips_touchStart');
                }
                this._pressed = !1
                this._updateState()
                t.stopPropagation()
            }
        }
        cc.YL.net.getUserToken();

 /*        cc.loader.load(url, function (err, data) {
            if (err || !data) {
                console.log('not Found!!', err);
                GD.postURL = 'https://www.hxsup.com/api/game/addGameLog';
                cc.YL.net.getGameData(0, (data) => {
                    GD.root.reFreshStar();
                });
                return;
            }
            console.log(data)
            if (data.isDeBug) {
                console.log('当前为调试模式!!');
                GD.postURL = data.deBugURL;
            } else {
                console.log('当前为正式模式!!')
                GD.postURL = data.OfficialURL;
            }
            GD.gameId = data.gameID ? data.gameID : 0;
            cc.YL.net.getGameData(GD.gameId, () => {
                GD.root.reFreshStar();
            });
        }) */

        !cc.YL.emitter && (cc.YL.emitter = new Emitter());

        !cc.YL.loader && (cc.YL.loader = new Loader(), cc.YL.loader.loadRes());

        !GD.timePool && (GD.timePool = []);

        let scene = cc.director.getScene();

        let touchLocker = new cc.Node('touchLocker');
        touchLocker.width = 2000;
        touchLocker.height = 2000;
        touchLocker.parent = cc.find('Canvas');
        touchLocker.zIndex = 9999;
        touchLocker.addComponent(cc.Button);
        touchLocker.active = false;
        cc.YL.touchLocker = touchLocker;

        cc.macro.ENABLE_MULTI_TOUCH = false;//关闭多点触摸

        cc.director.getCollisionManager().enabled = true; //开启碰撞检测

        if (cc.sys.isNative) {
            window.__errorHandler = function (errorMessage, file, line, message, error) {
                let exception = {};
                exception.errorMessage = errorMessage;
                exception.file = file;
                exception.line = line;
                exception.message = message;
                exception.error = error;
                if (window.exception != JSON.stringify(exception)) {
                    window.exception = JSON.stringify(exception);
                    console.log(exception);
                    //TODO: 发送请求上报异常
                }
            };
        } else if (cc.sys.isBrowser) {
            window.onerror = function (errorMessage, file, line, message, error) {
                let exception = {};
                exception.errorMessage = errorMessage;
                exception.file = file;
                exception.line = line;
                exception.message = message;
                exception.error = error;
                exception.gameURL = document.URL;
                if (window.exception != JSON.stringify(exception)) {
                    window.exception = JSON.stringify(exception);
                    console.log(exception);
                    //TODO: 发送请求上报异常
                }


            };
        }
    },


    lockTouch() {
        //屏蔽所有触摸
        console.log('lock');
        cc.YL.touchLocker.active = true;
    },

    unLockTouch() {
        console.log('unlock');
        cc.YL.touchLocker.active = false;
    },


    fitPhone(fitNode) {
        //适配
        var pCanvas = cc.director.getScene().getChildByName('Canvas').getComponent(cc.Canvas);
        var scale = cc.winSize.height / pCanvas.designResolution.height
        console.log('fitCheck')
        var pw = cc.winSize.width;
        var ph = cc.winSize.height;
        //宽高比低于视频比，即屏幕太窄就缩放
        var winRatio = pw / ph;
        var videoRatio = 16 / 9;
        if (winRatio >= videoRatio) {
            console.log('fitPhone')
            var pScale = videoRatio / winRatio;
            fitNode.setScale(scale);
            // var canvasCom = pCanvas.getComponent(cc.Canvas);
            // canvasCom.fitHeight=true;
            // canvasCom.fitWidth=false;
        }
    },

    setCanvasBG(bgSpriteFrame) {
        let canvas = cc.find('Canvas');
        let bg = canvas.getChildByName('bg');
        bg.getComponent(cc.Sprite).spriteFrame = bgSpriteFrame;
        bg.angle = 0;
        bg.setContentSize(cc.winSize.width, cc.winSize.height);
        return bg;
    },


    //向cavans添加喇叭按钮
    /*  cc.loader.loadRes('prefab/laba', cc.Prefab, (err, _prefab) => {
         if (err) {
             console.log(err);
         }
         var laba = cc.instantiate(_prefab);
         laba.parent = canvas;
     }) */

    showSuccess(callFunc) {
        cc.YL.lockTouch()
        cc.loader.loadRes('prefab/success', cc.Prefab, (err, _prefab) => {
            if (err) {
                console.log(err);
            }
            var success = cc.instantiate(_prefab);
            success.addComponent("success").init();
            success.parent = cc.find('Canvas');
            success.zIndex = 999;
            cc.YL.timeOut(() => {
                callFunc && callFunc();
            }, 3000);
        });

    },

    //添加语音闹钟 当满足条件时取消
    addClock(tipsName, clockTime = 10) {
        //注册触摸事件 当发生点击时 注销闹钟
        clockTime += GD.sound.getDuringTime(tipsName);
        cc.YL.emitter.on('tips_touchStart', cc.YL.stopClock.bind(this));
        this.intervalID = setInterval(() => {
            this.intervalID && GD.sound.playTips(tipsName);
        }, clockTime * 1000);
    },

    stopClock() {
        cc.YL.emitter.off('tips_touchStart');
        this.intervalID && clearInterval(this.intervalID);
        this.intervalID = null;
    },

    changeScene(sceneName) {
        let sceneIsLoaded = false;
        let loadSpine = GD.root.loadSpine;
        let timeIsOut = false;
        loadSpine.active = true;
        loadSpine._spine.setAnimation(0, "newAnimation", false);

        let timeCount = cc.YL.timeOut(() => {
            if (sceneIsLoaded) {
                loadSpine.active = false;
                cc.director.loadScene(sceneName);
            }
        }, 4000);

        cc.director.preloadScene(sceneName, function () {
            cc.log(sceneName, " preloaded");
            if (timeIsOut) {
                loadSpine.active = false;
                cc.director.loadScene(sceneName);
            }
            sceneIsLoaded = true;
        });


    },

    timeOut(callFunc, ptime) {
        let id = setTimeout(() => {
            let index = GD.timePool.indexOf(id);
            index && GD.timePool.splice(index, 1);
            callFunc && callFunc();
        }, ptime);
        GD.timePool.push(id);
        return id;
    },

    clearTimeOut(tag) {
        tag && clearTimeout(tag);
    },

    clearAllTimeOut() {
        while (GD.timePool.length > 0) { clearTimeout(GD.timePool.pop()); }
    },

    //开始学习时长计时 注意之前的时长会清空
    startTimeCount(){
        GD.timeCount = 0
        GD.timeCountID = setInterval(() => {
            GD.timeCount++;
        }, 1000);
    },

    stopTimeCount(){
        clearInterval(GD.timeCountID)
        return GD.timeCount;
    },
}
cc.YL = register;
module.exports = register;

