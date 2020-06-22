cc.Class({
    extends: cc.Component,

    properties: {
        layerPool: [cc.Prefab],
        isDemo: {
            default: true,
            displayName: '是否是demo展示',
        },
        layerName: {
            default: '',
            displayName: 'prefab名',
        },
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        let register = require('register');
        register.init();
    },
///xxxxxxxxxxxx

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
            if (this.isDemo) {
                this.backHomeLayer();
            } else {
                //结束
                cc.YL.lockTouch();
                this.showEnding();
            }
        })
        this.setHomeLayer(false);
        this.loadingData();
    },

    startGame() {
        this.checkHomeData();
        cc.YL.startTimeCount();
    },

    loadingData() {
        if(this.isDemo){
            cc.YL.unLockTouch();
            this.setHomeLayer(true);
            this._bg.active = true;
        }else{
            this.changeLayer(this.layerName);
        }
        GD.root.setStarBoard(false);
        GD.root.setQuestionBg(false);
        GD.root.setLoadDataUI(true);
        GD.root.reFreshStar();
        GD.root.setLoadDataUI(false);
        this.startGame();
    },

    changeLayer( name) {
        GD.sound && GD.sound.stopTips();
        GD.root.setStarBoard(false);
        GD.root.setQuestionBg(false);
        cc.YL.unLockTouch();
        for (let i in this.layerPool) {
            if (this.layerPool[i].name == name) {
                let layer = cc.instantiate(this.layerPool[i]);
                this._game.addChild(layer);
                this._loadedLayer = layer;
            }
        }
        this.setHomeLayer(false);
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
        let time = cc.YL.stopTimeCount();
        cc.YL.showSuccess();
        cc.YL.net.sendTimeAndStar(parseInt(time), 0)//提交数据
        cc.YL.net.finish()//延时4s结束游戏
    },

    touch(){
        console.log('touch')
    },
    // update (dt) {},
});
