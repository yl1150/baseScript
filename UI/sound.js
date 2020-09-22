cc.Class({
    extends: cc.Component,
    properties: {
        bgm: {
            type: cc.AudioClip,
            default: null
        },
    },


    onLoad() {
        // this.node.zIndex = 99;
        GD.sound = this
        this.soundAni = this.getComponent(sp.Skeleton)
        this.button = this.getComponent(cc.Button)
        this.tipsIDArr = [];
        this.sIDPool = [];
        this.button.interactable = false;
        this.node.opacity = 0;
    },

    setTipsButton(canTouch) {
        this.button.interactable = canTouch;
        this.node.opacity = 0;
        cc.tween(this.node)
            .to(0.5, { opacity: canTouch ? 255 : 0 })
            .start();
    },

    showLabaAni(isShow) {
        if (isShow) {
            this.soundAni.setAnimation(0, 'newAnimation_3', false);
            this.soundAni.addAnimation(0, 'newAnimation_1', true);
        } else {
            if (this.soundAni.animation == 'newAnimation') {
                return
            }
            this.soundAni.setAnimation(0, 'newAnimation_2', false);
            this.soundAni.addAnimation(0, 'newAnimation', true);
        }
    },

    callFunc() {
        this.playTips(GD.showTips);
    },

    playStartBgm() {
        console.log('playStartBgm===============')
        this.bgm && cc.audioEngine.playMusic(this.bgm, true);
        cc.audioEngine.setMusicVolume(0.001);
    },

    playBGM() {
        this.bgm && cc.audioEngine.playMusic(this.bgm, true);
        cc.audioEngine.setMusicVolume(1 * GD.bgMusicVolume / 100);
    },

    pauseBgm() {
        cc.audioEngine.pauseMusic();
    },

    resumeBgm() {
        cc.audioEngine.resumeMusic();
    },

    stopBgm() {
        cc.audioEngine.stopMusic();
    },

    //音效 如按钮点击的声音等
    playSound(name, volume = 1) {
        if (cc.audioEngine.AudioState.PLAYING == cc.audioEngine.getState(this.sIDPool[name])) {
            console.log('禁止同时播放同一个音效')
            return;
        }
        if (name == 'wrong' || name == 'right') {
            this.stopTips();
            name += cc.YL.tools.randomNum(1, 3);
        }
        var url = cc.YL.loader.getSound(name, (url) => {
            if (url) {
                this.sIDPool[name] = cc.audioEngine.play(url, false, volume);
            }
        });
    },

    play(url, isShowLaba = false, callBack) {
        this.stopTips();
        this.button.interactable = false;
        isShowLaba && this.showLabaAni(true);
        cc.audioEngine.play(url, false, 1);
        let time = url._audio.duration;
        this._timeID = cc.YL.timeOut(() => {
            isShowLaba && this.showLabaAni(false);
            this.button.interactable = true;
            callBack && callBack();
        }, time * 1000)
    },

    //解说音效
    playTips(name, callBack = null) {
        this.stopTips();
        let isShowLaba = false;
        if (name == GD.showTips) {
            //当且仅当问题语音时 播放喇叭
            isShowLaba = true;
        }
        var url = null;
        if (name instanceof Object) {
            url = name;
        } else {
            url = cc.YL.loader.getSound(name);
        }
        if (url) {
            this.play(url, isShowLaba, callBack);
        } else {
            cc.loader.loadRes('sound/' + name, cc.AudioClip, (err, audio) => {
                if (err) {
                    console.log(err);
                    return;
                }
                this.play(audio, isShowLaba, callBack);
            })
        }

    },

    setShowTips(name, isPlaying, callBack = null) {
        GD.showTips = name
        isPlaying && this.playTips(name, callBack)
    },

    getDuringTime(name) {
        var url = null;
        if (name instanceof Object) {
            url = name;
        } else {
            url = cc.YL.loader.getSound(name);
        }
        if (url) {
            return url._audio.duration;
        } else {
            return 1;
        }
    },

    stopEffect(name) {
        this.sIDPool[name] && cc.audioEngine.stopEffect(this.sIDPool[name]);
    },

    stopTips() {
        cc.YL.emitter.emit('stopTips');
        this._timeID && clearTimeout(this._timeID);
        this.showLabaAni(false);
        this.button.interactable = true;
        cc.audioEngine.stopAllEffects();
    },
});

