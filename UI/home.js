cc.Class({
    extends: cc.Component,

    properties: {
        layerPool: [cc.Prefab],
        isDemo: {
            default: true,
            displayName: '是否是demo展示',
        },
        targetPrefab:{
            default:null,
            type:cc.Prefab,
            displayName:'需要展示的游戏'
        }
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        let register = require('register');
        register.init();
    },

    start() {
        this._homeOptions = this.node.getChildByName('homeOptions');
        this._game = this.node.getChildByName('game');
        this._bg = this.node.getChildByName('bg');
        this._bgSpriteFrame = this._bg.getComponent(cc.Sprite).spriteFrame;

        GD.canRecording = false;
        if (window.webkit || window.android) {
            cc.YL.recorder.checkPermissionSupported()
            cc.YL.emitter.on('permissions', (datas) => {
                GD.canRecording = true;
            })
        }
        cc.YL.fitPhone(this._game);

        cc.YL.emitter.on('gameEnd', (data) => {
            console.log(data)
            cc.YL.net.saveGameData()

            if (this.isDemo) {
                this.backHomeLayer();
            } else {
                //结束
                cc.YL.lockTouch();
                this.showEnding();
            }
        })
        this.loadingData();
    },

    startGame() {
        if(!this.isDemo){
            cc.YL.lockTouch();
            let prefab = cc.instantiate(this.targetPrefab);
            this._game.addChild(prefab);
        }else{
            this.setHomeLayer(true);
        }

        this.checkHomeData();
        cc.YL.startTimeCount();
    },

    loadingData() {
        this.setHomeLayer(false);
        GD.root.setStarBoard(false);
        GD.root.setQuestionBg(false);
        this._bg.active = true;
        GD.root.setLoadDataUI(true);
        cc.YL.net.getGameData(GD.gameId, (data) => {
            GD.gameData = data;
            GD.root.reFreshStar();
            GD.root.setLoadDataUI(false);
            this.startGame();
        });
    },

    changeLayer(event, name) {
        cc.YL.lockTouch();
        GD.sound && GD.sound.stopTips();
        GD.sound && GD.sound.playSound('click', 1);
        GD.root.setStarBoard(false);
        GD.root.setQuestionBg(false);
        GD.root.showLoading(
            () => {
                for (let i in this.layerPool) {
                    if (this.layerPool[i].name == name) {
                        let layer = cc.instantiate(this.layerPool[i]);
                        this._game.addChild(layer);
                        this._loadedLayer = layer;
                    }
                }
                this.setHomeLayer(false);
            },
            () => {
                cc.YL.unLockTouch();
            }
        )
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
        this._homeOptions.active = isShow;
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
        cc.YL.stopTimeCount();
        cc.YL.showSuccess();
        cc.YL.net.setGameEndMessage(
            () => {
                //正确回调
                cc.YL.net.closeGame();
            },
            () => {
                //发送失败回调
                cc.YL.net.setGameEndMessage();
                cc.YL.net.closeGame();
            },
        )
    },
    // update (dt) {},
});
