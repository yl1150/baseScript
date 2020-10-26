module.exports = Loader;

/**
 * Initialize a new `Loader`.
 *
 * @api public
 */

function Loader(obj) {
    if (obj) return mixin(obj);
};

/**
将Emitter.prototype里面的所有属性都整合到obj
 */

function mixin(obj) {
    for (var key in Loader.prototype) {
        obj[key] = Loader.prototype[key];
    }
    return obj;
}

Loader.prototype.init = function () {
    this.imgAssets = [];
    this.soundAssets = [];
    this.dbAsset = [];
}

Loader.prototype.loadRes = function () {
    let self = this
    cc.loader.loadResDir("img", cc.SpriteFrame, function (err, assets, urls) {
        if (err) {
            console.log(err)
            return
        }
        //console.log(assets)
        self.imgAssets = assets
    });

    /*     cc.loader.loadResDir("sound", cc.AudioClip, function (err, assets, urls) {
            if (err) {
                console.log(err)
                return
            }
            self.soundAssets = assets;
            let prePlay = function(arr)  {
                if (arr.length < 1) {
                    return;
                }
                let clip = arr.shift();
                let _aid = cc.audioEngine.play(clip, false, 1);
                cc.audioEngine.stop(_aid);
                setTimeout(() => {
                    prePlay(arr);
                }, 16);
            }
            prePlay(cc.YL.tools.arrCopy(assets));
            console.log('音频资源加载完------',assets);
        }); */

    cc.loader.loadResDir("spineAndDB", dragonBones.ArmatureDisplayData, function (err, assets) {
        if (err) {
            console.log(err)
            return
        }
        //console.log(assets)
        self.dbAssets = assets
    });

    cc.loader.loadResDir("spineAndDB", sp.SkeletonData, function (err, data) {
        if (err) {
            console.log(err)
            return
        }
        self.spineDatas = data
    });
}

//按照梯队加载资源 仅限音频
Loader.prototype.loadResByTier = function (id) {
    let self = this
    if (cc.gameConfig.soundAssets) {
        this.soundAssets = cc.gameConfig.soundAssets;
    } else {
        console.log('为获取到soundAssets 重新加载')
        cc.assetManager.loadBundle('soundBundle', (err, bundle) => {
            bundle.loadDir("", cc.AudioClip, function (err, assets) {
                // ...
                self.soundAssets = assets;
                //cc.audioEngine.totalLoad(assets);
            });
        });
    }



}

Loader.prototype.getImg = function (name, callFunc) {
    if (!name) {
        return null
    }
    if (!this.imgAssets) {
        cc.loader.loadRes("img/" + name, cc.SpriteFrame, (err, data) => {
            if (err) {
                console.log(err);
                return;
            }
            callFunc && callFunc(data);
        });
        return;
    }
    for (var i in this.imgAssets) {
        if (this.imgAssets[i].name == name) {
            return this.imgAssets[i];
        }
    }
    return null;
}

Loader.prototype.getSpine = function (name, callFunc) {
    if (!name) {
        return null;
    }
    if (!this.spineDatas) {
        cc.loader.loadRes("spineAndDB/" + name + '/' + name, sp.SkeletonData, (err, data) => {
            if (err) {
                console.log(err);
                return;
            }
            callFunc && callFunc(data);
            //target.SkeletonData = data
        });
        return;
    }
    for (var i in this.spineDatas) {
        if (this.spineDatas[i].name == name) {
            callFunc && callFunc(this.spineDatas[i]);
            return;
        }
    }
}

Loader.prototype.getSound = function (name, cb) {
    if (!name) {
        return
    }
    if (this.soundAssets) {
        for (var i in this.soundAssets) {
            if (this.soundAssets[i].name == name) {
                cb && cb(this.soundAssets[i]);
                return this.soundAssets[i];
            }
        }
    }
    cc.assetManager.loadBundle('soundBundle', (err, bundle) => {
        bundle.load(name, cc.AudioClip, (err, clip) => {
            cb && cb(clip);
        });
    });

    return null
}

Loader.prototype.getDB = function (name, callFunc) {
    if (!this.dbAssets || !name) {
        return null
    }

    var dbData = {
        dbAsset: null,
        dbAtlasAsset: null
    }

    for (var i in this.dbAssets) {
        if (this.dbAssets[i].name == (name + '_ske')) {
            dbData.dbAsset = this.dbAssets[i];
        }
        if (this.dbAssets[i].name == (name + '_tex') && !(this.dbAssets[i] instanceof cc.SpriteFrame)) {
            dbData.dbAtlasAsset = this.dbAssets[i];
        }
    }
    if (dbData.dbAsset && dbData.dbAtlasAsset) {
        callFunc && callFunc(dbData);
    } else {
        cc.loader.loadRes('spineAndDB/' + name, (err, assets) => {
            if (err || assets.length <= 0) {
                return;
            }
            for (var i in assets) {
                if (assets[i] instanceof dragonBones.DragonBonesAsset) {
                    dbData.dbAsset = assets[i];
                }
                if (assets[i] instanceof dragonBones.DragonBonesAtlasAsset) {
                    dbData.dbAtlasAsset = assets[i];
                }
            }
            callFunc && callFunc(dbData);
        })
    }
}


