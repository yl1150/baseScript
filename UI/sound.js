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
        this.tipsIDArr = []
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

    playBGM() {
        !cc.audioEngine.isMusicPlaying(this.bgm) && cc.audioEngine.playMusic(this.bgm, true);
        cc.audioEngine.setMusicVolume(0.5);
    },

    pauseBgm() {
        cc.audioEngine.pauseMusic();
    },

    resumeBgm() {
        cc.audioEngine.resumeMusic();
    },

    //音效 如按钮点击的声音等
    playSound(name, volume = 0.5) {
        if (name == 'wrong' || name == 'right') {
            this.stopTips();
            name += cc.YL.tools.randomNum(1, 3);
        }
        var url = cc.YL.loader.getSound(name);
        if (url) {
            this.soundID = cc.audioEngine.play(url, false, volume);
        } else {
            cc.loader.loadRes('sound' + name, cc.AudioClip, (err, audio) => {
                if (err) {
                    console.log(err);
                    return;
                }
                this.soundID = cc.audioEngine.play(audio, false, volume);
            })
        }
    },

    play(url, callBack) {
        this.stopTips();
        this.button.interactable = false;
        this.showLabaAni(true);
        var id = cc.audioEngine.play(url, false, 1);
        this.tipsIDArr.push(id);
        let time = url._audio.duration;
        console.log(time);
        this._timeID = setTimeout(() => {
            this.showLabaAni(false);
            this.button.interactable = true;
            callBack && callBack();
        }, time * 1000)
    },

    //解说音效
    playTips(name, callBack = null) {
        this.stopTips();
        var url = null;
        if (name instanceof Object) {
            url = name;
        } else {
            url = cc.YL.loader.getSound(name);
        }
        if (url) {
            this.play(url, callBack);
        } else {
            cc.loader.loadRes('sound' + name, cc.AudioClip, (err, audio) => {
                if (err) {
                    console.log(err);
                    return;
                }
                this.play(audio, callBack);
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

    stopTips() {
        this._timeID && clearTimeout(this._timeID);
        this.showLabaAni(false);
        this.button.interactable = true;
        cc.audioEngine.stopAllEffects();
    },
});

