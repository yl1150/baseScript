let GAMETYPE = require('Define').GAMETYPE;
let GAMELIST = require('Define').GAMELIST;

cc.Class({
    extends: cc.Component,

    properties: {
        layerPool: [cc.Prefab],
        gameName: {
            default: GAMETYPE.default,
            type: GAMETYPE,
            displayName: '游戏目录',
        },
        isFitPhone: true,
        isShowRecord: false,
        maxRoundID: 8
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        let register = require('register');
        register.init();

        this._homeOptions = this.node.getChildByName('homeOptions');
        this._game = this.node.getChildByName('game');
        this._bg = this.node.getChildByName('bg');
        this._bgSpriteFrame = this._bg.getComponent(cc.Sprite).spriteFrame;


        if (!cc.gameConfig.gameName) cc.gameConfig.gameName = GAMELIST[this.gameName];
        if (!cc.gameConfig.maxRoundID) cc.gameConfig.maxRoundID = this.maxRoundID;

        GD.isShowRecord = this.isShowRecord && cc.gameConfig.gameName == GAMELIST.questionBank;
        if (cc.gameConfig.isWX) GD.isShowRecord = true;
        GD.isSendRoundID = cc.gameConfig.gameName == GAMELIST.questionBank;
        GD.isSetTime = true;
        switch (cc.gameConfig.gameName) {
            case GAMELIST.default:
            case GAMELIST.videoGame:
            case GAMELIST.exercises1:
            case GAMELIST.exercises2:
                GD.isPlayBgm = false;
                break;
            case GAMELIST.questionBank:
                GD.isPlayBgm = true;
                break;
            case GAMELIST.yearGame:
                GD.isSetTime = true;
                GD.isPlayBgm = true;
                break;
            case GAMELIST.pkGame:
                GD.isPlayBgm = true;
                break;
            case GAMELIST.seniorGame:
                GD.isPlayBgm = true;
                break;
            default:
                GD.isPlayBgm = false;
                break;
        }



        let versionNode = this.node.getChildByName('banben');
        if (versionNode) {
            versionNode.getComponent(cc.Label).string = this.getVersion();
        }
    },


    getVersion() {
        let version = "1.0.";
        let ex = cc.sys["isUseDomAudio"]() ? "1" : "0";
        return version + ex;
    },

    start() {
        cc.YL.startTimeCount();//计时
        GD.sound.playStartBgm();
        this.isFitPhone && cc.YL.fitPhone(this._game);
        this.initUI();
        this.initData();
        this.registerEvent();


        if (cc.gameConfig.gameName == GAMELIST.yearGame) {
            this._bg.active = true;
            return;
        }


        let hLayer = this.node.getChildByName('homeLayer');
        if (GD.isShowRecord) {
            if (hLayer) {
                hLayer.active = true;
                hLayer.getComponent('homeLayer').init();
            } else {
                cc.loader.loadRes('prefab/homeLayer', cc.Prefab, (err, _prefab) => {
                    if (err) {
                        console.log(err);
                    }
                    hLayer = cc.instantiate(_prefab);
                    this.node.addChild(hLayer);
                    hLayer.getComponent('homeLayer').init();
                });
            }
            this.loadLayer();
        } else {
            hLayer && hLayer.destroy();
            this.loadLayer('', () => {
                //加载完成后直接启动
                cc.YL.timeOut(() => {
                    cc.YL.emitter.emit('startGame');
                }, 500)
            });
        }
    },

    initData() {
        GD.canRecording = false;
        if (window.webkit || window.android) {
            cc.YL.recorder.checkPermissionSupported()
            cc.YL.emitter.on('permissions', (datas) => {
                GD.canRecording = true;
            })
        }
    },

    initUI() {
        GD.root.setStarBoard(false);
        GD.root.setQuestionBg(false);
        GD.root.reFreshStar();
        GD.root.setLoadDataUI(false);
        GD.root.setBack(false);
        this.setHomeLayer(cc.gameConfig.gameName == GAMELIST.default);
    },

    //注册事件
    registerEvent() {
        cc.YL.emitter.on('gameEnd', (data) => {
            console.log(data)
            if (cc.gameConfig.gameName == GAMELIST.default) {
                this.backHomeLayer();
            } else {
                //结束
                cc.YL.lockTouch();
                this.showEnding();
            }
        })

    },

    changeLayer(event, name) {
        this.loadLayer(name, () => {
            //加载完成后直接启动
            cc.YL.timeOut(() => {
                cc.YL.emitter.emit('startGame');
            }, 500)
        });
    },

    loadLayer(name, cb) {
        cc.YL.unLockTouch();
        GD.sound && GD.sound.stopTips();
        GD.root.setStarBoard(false);
        GD.root.setQuestionBg(false);

        if (!name) name = cc.gameConfig.gameName;
        if (name == 'default') return;
        console.log('loadGame:   ', name, '   ==============');

        let tNode = this._game.getChildByName(name);
        if (tNode) {
            //无需加载
            this._bg.active = true;
            cb && cb();
        } else {
            let prefab = null;
            for (let i in this.layerPool) {
                if (this.layerPool[i].name == name) {
                    prefab = this.layerPool[i];
                }
            }
            if (prefab) {
                let layer = cc.instantiate(prefab);
                this._game.addChild(layer);
                this._loadedLayer = layer;
                cb && cb();
            } else {
                cc.loader.loadRes('prefab/' + name, cc.Prefab, (err, _prefab) => {
                    if (err) {
                        console.log(err);
                    }
                    let layer = cc.instantiate(_prefab);
                    this._game.addChild(layer);
                    this._loadedLayer = layer;
                    cb && cb();
                });
            }
            this.setHomeLayer(false);
        }
    },

    //检测每一关关卡数据
    checkHomeData() {
        return
        this._homeOptions.children.forEach((option) => {
            let data = GD.gameData[option.name];
            if (!data) {
                console.log('no ' + option.name + 'data');
                return;
            }
            let lockState = data.lockState;//关卡是否解锁;
            option.getComponent(cc.Button).interactable = Boolean(lockState)
        });
    },

    setHomeLayer(isShow) {
        this._homeOptions && (this._homeOptions.active = isShow);
        this._bg.active = isShow;
    },

    backHomeLayer() {
        cc.YL.lockTouch();
        GD.sound && GD.sound.stopTips();
        GD.sound && GD.sound.setTipsButton(false);
        GD.sound.pauseBgm();
        this.checkHomeData();
        cc.YL.stopClock();
        cc.YL.clearAllTimeOut();
        GD.root.showLoading(
            () => {
                GD.root.setStarBoard(false);
                GD.root.setQuestionBg(false);
                this._loadedLayer.destroy();
                //this._game.destroyAllChildren();
                cc.YL.setCanvasBG(this._bgSpriteFrame);
                this.setHomeLayer(true);
            },
            () => {
                cc.YL.unLockTouch()
            }
        )

    },

    //游戏结束 撒花 发送数据
    showEnding() {
        let time = cc.YL.stopTimeCount();
        cc.YL.showSuccess();
        GD.sound.playTips('gameEnd', () => {
            GD.sound.stopTips();//手动强制停止所有音频
            GD.sound.stopBgm();
        })
        //提交数据
        if (cc.gameConfig.isWX) {
            cc.YL.net.sendTimeAndStar(cc.gameConfig.gameName == GAMELIST.questionBank ? cc.gameConfig.maxRoundID : cc.gameConfig.maxRoundID + 1, time, 0);
        } else {
            if (GD.isShowRecord && cc.gameConfig.gameName == GAMELIST.questionBank) {
                cc.YL.net.sendSeqAndTime(8, time)
            } else {
                cc.YL.net.sendTime(time)
            }
        }
        cc.YL.net.finish()//延时4s结束游戏
    },

    onDestroy() {
        cc.YL.emitter.off('gameEnd');
    },
    // update (dt) {},
});
