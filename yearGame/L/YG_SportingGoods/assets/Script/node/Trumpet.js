cc.Class({
    extends: cc.Component,

    properties: {},

    onLoad() {
        cc.origin.Note.trumpet = this;
        //初始化
        this.base = this.node.getChildByName('base');
        //封面（用于覆盖屏幕不让操作）
        this.cover = this.base.getChildByName("cover");
        this.cover.active = false;
        //按钮组件
        this.btn = this.base.getChildByName('btn');
        this.btnCom = this.btn.getComponent(cc.Button);
        //初始化喇叭
        this.initTrumpet();
    },

    /**
     * 初始化喇叭
     */
    initTrumpet() {
        if (this.trumpetId === undefined) {
            this.trumpetId = cc.origin.Note.gameData.trumpetId;
            var drags = this.btn.getChildByName("drags");
            drags.children.forEach(x => { x.active = false });
            //如0则随机喇叭动画
            if (this.trumpetId <= 0 || this.trumpetId > drags.childrenCount) this.trumpetId = cc.origin.MathBase.random(1, drags.childrenCount, true);
            this.drag = drags.children[this.trumpetId - 1];
            this.drag.active = true;
            //静态
            this.playTrumpetEffect(false);
            //根据喇叭大小调整按钮尺寸和位置
            var widgetCom_btn = this.btn.getComponent(cc.Widget);
            if (widgetCom_btn) {
                this.btn.width = this.drag.width * this.drag.scaleX;
                this.btn.height = this.drag.height * this.drag.scaleY;
                widgetCom_btn.updateAlignment();
            }
        }
        //音效Id数组
        this.audioId_arr = [];
        //喇叭声音资源
        this.audio_clip = null;
        //允许覆盖
        this.allowCover = false;
        //正在播放音效
        this.isPlaying = false;
        //是否循环
        this.isLoopPlay = false;
        //循环间隔
        this.loopInterval = 20;
        //喇叭开始播放音效时的回调
        this.beginCallback = null;
        //喇叭结束播放音效时的回调
        this.endCallback = null;
        //停止喇叭
        this.stopTrumpet();
    },

    start() {
        //不可点击
        this.setTouch(false);
        //处理事件
        this.handleEvent();
        //视频游戏喇叭初始不可见
        if (cc.origin.Note.script_video) this.setVisible(false);
    },

    update(dt) {
        //s无操作则循环
        if (this.isLoopPlay && cc.origin.Note.t_leisure > this.loopInterval) {
            cc.origin.Note.trumpet.playTrumpet();
        }
    },

    onClickTrumpet(event) {
        console.log("Click Trumpet!");
        this.playTrumpet(this.audio_clip, this.allowCover);
    },

    playTrumpetEffect(canPlay = true) {
        switch (this.trumpetId) {
            case 1: case 2: case 3:
                var dragCom = this.drag.getComponent(dragonBones.ArmatureDisplay);
                var animationName = canPlay ? 'newAnimation_1' : 'newAnimation';
                dragCom.playAnimation(animationName, 0);
                break;

            case 4:
                var spineCom = this.drag.getComponent(sp.Skeleton);
                if (canPlay) {
                    if (spineCom.animation === 'newAnimation_3' || spineCom.animation === 'newAnimation_1') {
                        //正在播动画的时候，不需要再播一次
                    } else {
                        spineCom.setAnimation(0, 'newAnimation_3', false);
                        spineCom.addAnimation(0, 'newAnimation_1', true);
                    }
                } else {
                    if (spineCom.animation === 'newAnimation_2' || spineCom.animation === 'newAnimation') {
                        //正在停动画的时候，不需要再播一次
                    } else {
                        spineCom.setAnimation(0, 'newAnimation_2', false);
                        spineCom.addAnimation(0, 'newAnimation', true);
                    }
                }
                break;

            default:
                break;
        }
    },

    /**
     * 设置触摸（true可以点击，false不可点击）
     * @param {boolean} canTouch 
     */
    setTouch(canTouch) {
        this.btnCom.interactable = canTouch;
    },

    /**
     * 设置喇叭是否可见
     * @param {boolean} isVisible 喇叭是否可见
     */
    setVisible(isVisible = true) {
        this.base.active = isVisible;
    },

    /**
     * 设置喇叭（音效、是否遮罩屏幕）
     * @param {cc.AudioClip} clip 音效，如果是字符串则认定为resources/Audio/下的音效名
     * @param {boolean} allowCover 覆盖屏幕，不让操作
     * @param {Function} beginCallback 喇叭开始播放音效时的回调
     * @param {Function} endCallback 喇叭结束播放音效时的回调
     */
    setTrumpet(clip, allowCover = true, beginCallback, endCallback) {
        this.audio_clip = clip;
        this.allowCover = allowCover;
        if (beginCallback) this.beginCallback = beginCallback;
        if (endCallback) this.endCallback = endCallback;
    },

    /**
     * 播放喇叭（默认遮罩屏幕不让操作）
     * @param {cc.AudioClip} clip 音效(可以是字符串、数组)，如果是字符串则认定为resources/Audio/下的音效名
     * @param {boolean} allowCover 覆盖屏幕，不让操作(默认true，遮罩)
     * @param {Function} endCallback 完成后回调
     */
    playTrumpet(clip = this.audio_clip, allowCover = this.allowCover, endCallback) {
        if (!clip) return;
        var _clip = clip;
        var audioId;
        if (Array.isArray(_clip)) {
            //是数组，顺序播放
            cc.origin.AudioBase.sequencePlay(_clip, () => {
                this.isPlaying = false;
                //停掉喇叭播放的所有音效
                if (Array.isArray(this.audio_clip)) {
                    cc.origin.AudioBase.stopAll();
                } else {
                    this.audioId_arr.forEach(x => { cc.origin.AudioBase.stop(x); })
                    this.audioId_arr = [];
                }
                //结束语音回调
                if (endCallback) {
                    endCallback();
                } else if (this.endCallback) {
                    this.endCallback();
                }
                //静态动画
                this.playTrumpetEffect(false);
                this.cover.active = false;
            }, () => {
                //是否遮挡屏幕，根据参数
                this.cover.active = allowCover;
                //停掉喇叭播放的所有音效
                cc.origin.AudioBase.stopAll();
                //动态动画
                this.playTrumpetEffect(true);
                //开始播放回调
                if (this.beginCallback) this.beginCallback();
                //播放音效
                this.isPlaying = true;
                //设置喇叭
                this.setTrumpet(_clip, allowCover);
            })
        } else {
            _clip = cc.origin.AudioBase.checkAudio(_clip);
            if (_clip) {
                play.call(this, _clip);
            } else {
                //到此说明暂时没有此音效，如果clip是字符串就再加载抢救一下
                _clip = clip;
                if (typeof _clip === 'string') {
                    cc.origin.AudioBase.loadVoice(_clip, () => {
                        _clip = cc.origin.AudioBase.checkAudio(_clip);
                        if (_clip) {
                            console.log(_clip.name, '由加载后播放');
                            play.call(this, _clip);
                        }
                    })
                }
            }
        }

        function play(tmpClip) {
            //是否遮挡屏幕，根据参数
            this.cover.active = allowCover;
            //停掉喇叭播放的所有音效
            this.audioId_arr.forEach(x => { cc.origin.AudioBase.stop(x); })
            this.audioId_arr = [];
            //动态动画
            this.playTrumpetEffect(true);
            //开始播放回调
            if (this.beginCallback) this.beginCallback();
            //播放音效
            this.isPlaying = true;
            audioId = cc.origin.AudioBase.play(tmpClip, () => {
                if (endCallback) {
                    this.stopTrumpet(false);
                    endCallback();
                } else {
                    this.stopTrumpet(true);
                }
            });
            //设置喇叭
            this.setTrumpet(tmpClip, allowCover);

            this.audioId_arr.push(audioId);
        }

        return audioId;
    },

    /**
     * 设置循环播放
     * @param {Boolean} canLoop 可以循环
     * @param {Number} loopInterval 循环间隔（秒）
     * @param {*} loopClip 循环音效
     */
    setLoopPlay(canLoop = true, loopInterval = this.loopInterval, loopClip = this.audio_clip) {
        this.isLoopPlay = canLoop;
        this.loopInterval = loopInterval;
        this.audio_clip = loopClip;
        //重置不操作时长
        cc.origin.Note.t_leisure = 0;
    },

    /**
     * 播放音效并遮罩屏幕(默认遮罩屏幕不让操作)
     * @param {cc.AudioClip} clip 音效(可以是字符串、数组)，如果是字符串则认定为resources/Audio/下的音效名
     * @param {boolean} allowCover 覆盖屏幕，不让操作(默认true，遮罩)
     * @param {Function} endCallback 完成后回调
     */
    playAndCover(clip, allowCover = true, endCallback) {
        var _clip = clip;
        var audioId;
        if (Array.isArray(_clip)) {
            //是数组，顺序播放
            cc.origin.AudioBase.sequencePlay(_clip, () => {
                this.isPlaying = false;
                this.cover.active = false;
                if (endCallback) { endCallback(); }
            }, () => {
                //停掉喇叭
                this.stopTrumpet(this.isPlaying);
                //是否遮挡屏幕，根据参数
                this.cover.active = allowCover;
                //播放音效
                this.isPlaying = true;
            })
        } else {
            _clip = cc.origin.AudioBase.checkAudio(_clip);
            if (_clip) {
                play.call(this, _clip);
            } else {
                //到此说明暂时没有此音效，如果clip是字符串就再加载抢救一下
                _clip = clip;
                if (typeof (_clip) === 'string') {
                    cc.origin.AudioBase.loadVoice(_clip, () => {
                        _clip = cc.origin.AudioBase.checkAudio(_clip);
                        if (_clip) {
                            console.log(_clip.name, '由加载后播放');
                            play.call(this, _clip);
                        }
                    })
                }
            }
        }

        function play(tmpClip) {
            //停掉喇叭
            this.stopTrumpet(this.isPlaying);
            //是否遮挡屏幕，根据参数
            this.cover.active = allowCover;
            //播放音效
            this.isPlaying = true;
            audioId = cc.origin.AudioBase.play(tmpClip, () => {
                this.isPlaying = false;
                this.cover.active = false;
                if (endCallback) { endCallback(); }
            });
            this.audioId_arr.push(audioId);
        }

        return audioId;
    },

    /**
     * 停止喇叭播放（默认调用喇叭结束回调）
     * @param {boolean} isInvokeEnd 是否调用喇叭结束回调，默认true
     */
    stopTrumpet(isInvokeEnd = true) {
        this.isPlaying = false;
        //停掉喇叭播放的所有音效
        if (Array.isArray(this.audio_clip)) {
            cc.origin.AudioBase.stopAll();
        } else {
            this.audioId_arr.forEach(x => { cc.origin.AudioBase.stop(x); })
            this.audioId_arr = [];
        }
        //结束语音回调
        if (isInvokeEnd && this.endCallback) { this.endCallback(); }
        //静态动画
        this.playTrumpetEffect(false);
        this.cover.active = false;
    },

    handleEvent() {
        cc.origin.EventManager.on(cc.origin.EventDefine.COMMON.FREEZE_TIME, function () {
            //冻结时间，不可触摸
            this.setTouch(false);
        }, this);
        cc.origin.EventManager.on(cc.origin.EventDefine.COMMON.KINETIC_TIME, function () {
            //活跃时间，可以触摸
            this.setTouch(true);
        }, this);
    },
});