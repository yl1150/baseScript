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
    this.imgAssets = []
    cc.loader.loadResDir("img", cc.SpriteFrame, function (err, assets, urls) {
        if (err) {
            console.log(err)
            return
        }
        //console.log(assets)
        self.imgAssets = assets
    });
    cc.loader.loadResDir("sound", cc.AudioClip, function (err, assets, urls) {
        if (err) {
            console.log(err)
            return
        }
        //console.log(assets)
        self.soundAssets = assets
    });

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
    /*    cc.loader.loadRes('sound/' + name, cc.AudioClip, (err, url) => {
           if (err) {
               console.log(err);
               return;
           }
           this.soundAssets[name] = url;
           cb && cb(url);
       }) */

    cc.resources.load("sound/" + name, cc.AudioClip, (err, clip) => {
        if (err) {
            console.log(err);
            return
        }
        this.soundAssets[name] = clip;
        cb && cb(clip);
    })
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


