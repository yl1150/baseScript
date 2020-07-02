const _GAMELIST = {
    /**默认展现游戏目录 */
    '0': 'default',

    /**视频游戏 */
    '1': 'videoGame',

    /**题库 */
    '2': 'questionBank',

    /**播放小贴士视频 */
    '3': 'videoTips',

    /**习题上*/
    '4': 'exercises1',

    /**习题下*/
    '5': 'exercises2',
};
const GAMELIST = cc.Enum({
    /**默认展现游戏目录 */
    default: 0,

    /**视频游戏 */
    videoGame: 1,

    /**题库 */
    questionBank: 2,

    /**播放小贴士视频 */
    videoTips: 3,

    /**习题上*/
    exercises1: 4,

    /**习题下*/
    exercises2: 5,
});

cc.Class({
    extends: cc.Component,

    properties: {
        layerPool: [cc.Prefab],
        gameName: {
            default: GAMELIST.default,
            type: GAMELIST,
            displayName: '游戏目录',
        },
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        let register = require('register');
        register.init();
        this.showLayerName = cc.gameConfig.gameName || _GAMELIST[this.gameName];
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
            if (this.showLayerName == 'default') {
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
        if (this.showLayerName == 'default') {
            cc.YL.unLockTouch();
            this.setHomeLayer(true);
            this._bg.active = true;
        } else {
            this.changeLayer(null, this.showLayerName);
        }
        GD.root.setStarBoard(false);
        GD.root.setQuestionBg(false);
        GD.root.setLoadDataUI(true);
        GD.root.reFreshStar();
        GD.root.setLoadDataUI(false);
        GD.root.setBack(false);
        this.startGame();
    },

    changeLayer(event, name) {
        console.log('loadGame:   ', name, '   ==============');
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
        cc.YL.net.sendTime(parseInt(time))//提交数据
        cc.YL.net.finish()//延时4s结束游戏
    },

    touch() {
        console.log('touch')
    },
    // update (dt) {},
});
