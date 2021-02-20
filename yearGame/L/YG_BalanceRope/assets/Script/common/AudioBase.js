/**
 * 音效扩展
 */
var AudioBase = {
    /**
     * 音效集
     */
    album: [],

    /**
     * 背景音乐
     */
    bgm: null,

    /**
     * 背景音乐音量
     */
    bgmVolume: 1,
    /**
     * 背景音乐Id
     */
    bgmId: null,

    /**
     * 音效id数据（key:id，value：timoutId）
     */
    audioIdData: {},

    /**
     * 预加载音效资源(默认加载resources/Audio/中所有音效)
     */
    preloadAudioClip() {
        //预加载resources/Audio中全部音效资源
        cc.resources.loadDir("Audio", cc.AudioClip, (err, clip_arr) => {
            if (err) {
                console.log(err); return;
            } else {
                clip_arr.forEach((pClip) => {
                    this.album[pClip.name] = pClip;
                })
                //全部加载完成
                console.log("[Preload Audio Done!]");
            }
        })
        // cc.loader.loadResDir("Audio", cc.AudioClip, (err, clip_arr) => {
        //     if (err) {
        //         console.log(err); return;
        //     } else {
        //         clip_arr.forEach((pClip) => {
        //             this.album[pClip.name] = pClip;
        //         })
        //         //全部加载完成
        //         console.log("[Preload Audio Done!]");
        //     }
        // })
    },

    /**
     * 加载音效（此音效必须在resources/Audio/文件下）
     * @param {String} soundNameStr 
     * @param {Function} callback 
     */
    loadVoice(soundNameStr, callback) {
        cc.resources.load("Audio/" + soundNameStr, cc.AudioClip, (err, clip) => {
            if (err) {
                console.log(err);
            } else {
                this.album[soundNameStr] = clip;
            }
            callback();

            return clip;
        })
        // cc.loader.loadRes("Audio/" + soundNameStr, cc.AudioClip, (err, clip) => {
        //     if (err) {
        //         console.log(err);
        //     } else {
        //         this.album[soundNameStr] = clip;
        //     }
        //     callback();

        //     return clip;
        // })
    },

    /**
     * 检测没有又此音效
     * @param {cc.AudioClip} clip 音效，如果是字符串则认定为resources/Audio/下的音效名
     */
    checkAudio(clip) {
        var _clip = clip;
        if (typeof _clip === 'string') _clip = this.album[_clip];
        if (_clip) {
            this.album[_clip.name] = _clip;
        } else {
            console.log('error:无此音效或尚未加载', clip)
        }

        return _clip;
    },

    /**
     * 设置背景音乐
     * @param {AudioClip} bgmClip 背景音乐
     * @param {number} bgmVolume 背景音乐音量,0~1
     */
    setBgm(bgmClip, bgmVolume = this.bgmVolume) {
        this.bgm = bgmClip;
        this.bgmVolume = bgmVolume;
    },

    /**
     * 播放背景音乐
     * @param {number} volume 音量,0~1
     */
    playBgm(bgmClip = this.bgm, bgmVolume = this.bgmVolume) {
        this.bgm = bgmClip;
        this.bgmVolume = bgmVolume;
        //背景音乐
        this.bgmId = cc.audioEngine.playMusic(this.bgm, true);
        this.album.bgm = bgmClip;
        cc.audioEngine.setMusicVolume(this.bgmVolume);

        return this.bgmId;
    },

    /**
     * 暂停背景音乐
     */
    pauseBgm() {
        cc.audioEngine.pauseMusic();
    },

    /**
     * 恢复背景音乐
     */
    resumeBgm() {
        if (this.bgm) {
            cc.audioEngine.resumeMusic();
        } else {
            this.playBgm();
        }
    },

    /**
     * 清除背景音乐
     */
    stopBgm() {
        cc.audioEngine.stopMusic();
    },

    /**
     * 设置音量
     * @param {number} audioId 音效Id
     * @param {number} volume 音量，0~1
     */
    setVolume(audioId, volume) {
        cc.audioEngine.setVolume(audioId, volume);
    },

    /**
     * 播放音效
     * @param {cc.AudioClip} clip 音效，如果是字符串则认定为resources/Audio/下的音效名
     * @param {Function} callback 完成后回调
     */
    play(clip, callback) {
        var _clip = clip;
        var audioId;
        _clip = this.checkAudio(_clip);
        if (_clip) {
            doPlay.call(this, _clip);
        } else {
            //到此说明暂时没有此音效，如果clip是字符串就再加载抢救一下
            if (typeof (clip) === 'string') {
                this.loadVoice(clip, () => {
                    _clip = this.album[clip];
                    if (_clip) {
                        console.log(_clip.name, '此音效由加载后播放');
                        doPlay.call(this, _clip);
                    }
                })
            }
        }

        function doPlay(_clip) {
            audioId = cc.audioEngine.play(_clip, false);
            var t = cc.audioEngine.getDuration(audioId);
            var tag = setTimeout(() => {
                if (callback) callback();
            }, t * 1000);
            this.audioIdData[audioId] = tag;
        }

        return audioId;
    },

    /**
     * 顺序播放音效（数组）
     * @param {Array} clip_arr 音效数组（其中元素可以是AudioClip，也可以是音效名）
     * @param {Function} callback 完成后回调
     * @param {Function} beginCallback 开始播时回调（不播不调用）
     */
    sequencePlay(clip_arr, callback, beginCallback) {
        var clipNum = clip_arr.length;
        var tmpNum = clipNum;
        for (let i in clip_arr) {
            let clip = clip_arr[i];
            if (typeof clip === 'object') clip = clip.name;
            if (typeof clip === 'string') {
                this.loadVoice(clip, () => {
                    if (this.album[clip]) {
                        tmpNum--;
                        clip_arr[i] = this.album[clip];
                    }
                    if (tmpNum === 0) {
                        //可以正常播数组中所有音效
                        if (beginCallback) beginCallback();
                        doPlay.call(this);
                    }
                })
            }
        }
        function doPlay() {
            var count = 0;
            function _doPlay() {
                var audioId = cc.audioEngine.play(clip_arr[count++], false);
                var t = cc.audioEngine.getDuration(audioId);
                var tag = setTimeout(() => {
                    if (count < clipNum) {
                        _doPlay.call(this);
                    } else {
                        if (callback) callback();
                    }
                }, t * 1000);
                this.audioIdData[audioId] = tag;
            }
            _doPlay.call(this);
        }
    },

    /**
     * 停止音效
     * @param {number} audioId 音效Id
     */
    stop(audioId) {
        if (typeof audioId === 'number') {
            cc.audioEngine.stop(audioId);
            clearTimeout(this.audioIdData[audioId]);
        }
    },

    /**
     * 停止播放所有音效，除了背景音乐
     */
    stopAll() {
        cc.audioEngine.stopAllEffects();
        for (let i in this.audioIdData) {
            clearTimeout(this.audioIdData[i]);
        }
    },
}

//预加载音效（场景运行之前）
// cc.director.once(cc.Director.EVENT_BEFORE_SCENE_LAUNCH, function () {
//     AudioBase.preloadAudioClip();
// }, this);

export default AudioBase;