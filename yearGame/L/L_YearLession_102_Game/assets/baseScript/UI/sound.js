cc.Class({
    extends: cc.Component,
    properties: {
    },


    onLoad() {
        // this.node.zIndex = 99;
        GD.sound = this
        this.soundAni = this.getComponent(sp.Skeleton)
        this.button = this.getComponent(cc.Button)
        this.sIDPool = [];
        this.button.interactable = false;
        this.node.opacity = 0;
        this.bindSkeArr = [];
        this.isShowBindAni = true;
    },

    setTipsButton(canTouch) {
        this.button.interactable = canTouch;
        this.node.opacity = 0;
        cc.tween(this.node)
            .to(0.5, { opacity: canTouch ? 255 : 0 })
            .start();
    },

    //绑定spine节点
    bindSpine(spine, norAni, speakAni) {
        if (!spine) {
            return;
        }
        let skeData = {
            ske: spine,
            nAni: norAni,
            sAni: speakAni
        }
        this.bindSkeArr.push(skeData);
    },

    unbundlingSpine(spine) {
        if (!spine) {
            return;
        }
        for (let i in this.bindSkeArr) {
            if (this.bindSkeArr[i].ske == spine) {
                this.bindSkeArr.splice(i, 1);
                return;
            }
        };
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
        this.button.interactable = !isShow;
    },

    setBindAni(isShow) {
        if (!this.isShowBindAni) {
            return
        }
        for (let i in this.bindSkeArr) {
            let skeData = this.bindSkeArr[i];
            skeData.ske.setAnimation(0, isShow ? skeData.sAni : skeData.nAni, true);
        }
    },

    setBindAniIsLock(isShow) {
        this.isShowBindAni = isShow;
    },

    callFunc() {
        this.playTips(GD.showTips);
    },

    /**
 * 设置音量
 * @param {number} audioId 音效Id
 * @param {number} volume 音量，0~1
 */
    setVolume(audioId, volume) {
        cc.audioEngine.setVolume(audioId, volume);
    },

    playStartBgm() {
        if (!GD.isPlayBgm) {
            return;
        }

        console.log('playStartBgm===============')
        /*   this.bgm && cc.audioEngine.playMusic(this.bgm, true);
          cc.audioEngine.setMusicVolume(0.001); */
    },

    playBGM() {
        if (!GD.isPlayBgm) {
            return;
        }
        cc.YL.loader.getSound('bgm', (url) => {
            if (url) cc.audioEngine.playMusic(url, true);
        });
        cc.audioEngine.setMusicVolume(GD.bgMusicVolume/2);
    },

    pauseBgm() {
        console.log('pauseBgm')
        cc.audioEngine.pauseMusic();
    },

    resumeBgm() {
        cc.audioEngine.resumeMusic();
    },

    stopBgm() {
        cc.audioEngine.stopMusic();
    },

    uncache(clip) {
        cc.audioEngine.uncache(clip)
    },

    //音效 如按钮点击的声音等
    playSound(name, volume = 1) {
        if (name == 'wrong' || name == 'right') {
            this.stopTips();
            name += cc.YL.tools.randomNum(1, 3);
        }
        cc.YL.loader.getSound(name, (url) => {
            if (url) this.play(url);
        });
    },

    play(url) {
        if (!url) {
            return
        }
        if (cc.audioEngine.AudioState.PLAYING == cc.audioEngine.getState(this.sIDPool[url.name])) {
            console.log('禁止同时播放同一个音效')
            return;
        }

        let id = cc.audioEngine.play(url);
        this.sIDPool[url.name] = id;
    },

    //解说音效
    playTips(name, callBack = null) {
        if (name == 'wrong' || name == 'right') {
            name += cc.YL.tools.randomNum(1, 3);
        }
        this.stopTips();
        this.setBindAni(true);
        this.showLabaAni(GD.showTips == name);
        if (name instanceof Object) {
            let url = name;
            this.play(url);
            let time = url._audio.duration;
            this._timeID = cc.YL.timeOut(() => {
                this.showLabaAni(false);
                this.setBindAni(false);
                callBack && callBack();
            }, time * 1000)
        } else {
            cc.YL.loader.getSound(name, (url) => {
                if (!url) return;
                this.play(url);
                let time = url._audio.duration;
                this._timeID = cc.YL.timeOut(() => {
                    this.showLabaAni(false);
                    this.setBindAni(false);
                    callBack && callBack();
                }, time * 1000)
            });
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

    stopEffect(id) {
        id && cc.audioEngine.stopEffect(id);
    },

    stopTips() {
        cc.YL.emitter.emit('stopTips');
        cc.YL.clearTimeOut(this._timeID);
        this.showLabaAni(false);
        this.setBindAni(false);
        cc.audioEngine.stopAllEffects();
        /* while (this.sIDPool.length > 0) {
            this.stopEffect(this.sIDPool.shift());
        } */
    },
});

