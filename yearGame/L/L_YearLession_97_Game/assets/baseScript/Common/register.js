let register = {
    init() {
        cc.YL.tools = require("tools");
        cc.YL.aMgr = require('ActionMgr');
        cc.YL.net = require('Network');
        cc.YL.recorder = require('testRecorder');
        cc.YL.audioEditor = require('AudioEditorer');
        var Loader = require("loader");
        var Emitter = require("emitter");

        if (!cc.gameConfig) {
            cc.gameConfig = {
                isOfficial: false,
                videoURL: "",
                isWX: false,
                gameID: 0,
                gameName: '',
                roundID: 1,
            }
        }
        //注册按钮点击事件 用于添加点击音效
        cc.Button.prototype._onTouchBegan = function (event) {
            if (!GD.canTouch) {
                return;
            }
            if (!this.interactable || !this.enabledInHierarchy) return;
            this._pressed = true;
            this._updateState();
            event.stopPropagation();
        }
        cc.Button.prototype._onTouchEnded = function (t) {
            if (!GD.canTouch) {
                return;
            }
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
        !cc.YL.emitter && (cc.YL.emitter = new Emitter());

        !cc.YL.loader && (cc.YL.loader = new Loader(), cc.YL.loader.init(), cc.YL.loader.loadResByTier());
        !GD.timePool && (GD.timePool = []);

        let scene = cc.director.getScene();
        /*  let touchLocker = cc.find('Canvas/touchLocker');
          cc.YL.tools.registerTouch(
             touchLocker,
             (e) => {
                 e.stopPropagation()
             },
             (e) => {
                 e.stopPropagation()
             },
             (e) => {
                 e.stopPropagation()
             }
         ); 
         touchLocker.zIndex = 9999;
         touchLocker.active = false;
         cc.YL.touchLocker = touchLocker; */

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

        if (cc.sys.os === cc.sys.OS_IOS) {
            cc.game.on(cc.game.EVENT_GAME_INITED, () => {
                cc.game.on(cc.game.EVENT_SHOW, () => {
                    //cc.audioEngine.resumeAll();
                    cc.Director.resume()
                });

                cc.game.on(cc.game.EVENT_HIDE, () => {
                    cc.Director.pause();
                    //cc.audioEngine.pauseAll();
                });
            })
        }
    },

    lockTouch() {
        //屏蔽所有触摸
        console.log('lock');
        GD.canTouch = false;
        //cc.YL.touchLocker.active = true;
    },

    unLockTouch() {
        console.log('unlock');
        GD.canTouch = true;
        //cc.YL.touchLocker.active = false;
        //console.log(cc.find('Canvas'))
    },


    fitPhone(fitNode) {
        //适配
        var pCanvas = cc.director.getScene().getChildByName('Canvas').getComponent(cc.Canvas);
        var scale = cc.winSize.height / pCanvas.designResolution.height
        var pw = cc.winSize.width;
        var ph = cc.winSize.height;
        //宽高比低于视频比，即屏幕太窄就缩放
        var winRatio = pw / ph;
        var videoRatio = 16 / 9;
        if (winRatio >= videoRatio) {
            var pScale = videoRatio / winRatio;
            fitNode.setScale(pScale > 1 ? 1 : pScale);
            //GD.root.node.setScale(pScale > 1 ? 1 : pScale);
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
        //bg.setContentSize(cc.winSize.width, cc.winSize.height);
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
            success.getComponent('success') ? success.getComponent('success').init() : success.addComponent("success").init();
            success.parent = cc.find('Canvas/Root');
            success.zIndex = 999;
            cc.YL.timeOut(() => {
                callFunc && callFunc();
            }, 3000);
        });

    },

    //添加语音闹钟 当满足条件时取消
    addClock(tipsName, clockTime = 20) {
        //注册触摸事件 当发生点击时 注销闹钟
        if (GD.isLockClock) {
            return;
        }
        clockTime += GD.sound.getDuringTime(tipsName);
        cc.YL.emitter.on('tips_touchStart', cc.YL.stopClock.bind(this));
        this.intervalID = setInterval(() => {
            this.intervalID && GD.sound.playTips(tipsName);
        }, clockTime * 1000);
    },

    stopClock() {
        if (GD.isLockClock) {
            return;
        }
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
    startTimeCount() {
        GD.timeCount = 0
        GD.timeCountID = setInterval(() => {
            GD.timeCount++;
        }, 1000);
    },

    stopTimeCount() {
        clearInterval(GD.timeCountID)
        return GD.timeCount;
    },
}
cc.YL = register;
module.exports = register;

