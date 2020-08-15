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
    /*游戏*/
    '6': 'yearGame'
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

    /*游戏*/
    yearGame: 6
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
        isFitPhone:true
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        let register = require('register');
        register.init();
        this.showLayerName = cc.gameConfig.gameName || _GAMELIST[this.gameName];
        GD.isSendRoundID = this.showLayerName == 'questionBank';
    },

    start() {
        GD.sound.playStartBgm();
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
        this.isFitPhone && cc.YL.fitPhone(this._game);
        this.initUI();
        this.registerEvent();
        if (cc.gameConfig.isWX) {
            //当前为微信包
            this.initHomeLayer();
        } else {
            this.changeLayer(null, this.showLayerName);
        }
    },

    initUI() {
        /*  switch (this.showLayerName) {
             case _GAMELIST[GAMELIST.default]:
                 GD.setTimeDataEachRound = false;
                 break;
             case _GAMELIST[GAMELIST.videoGame]:
                 GD.setTimeDataEachRound = false;
                 break;
             case _GAMELIST[GAMELIST.questionBank]:
                 GD.setTimeDataEachRound = true;
                 break;
             default:
                 GD.setTimeDataEachRound = false;
                 break;
         } */
        GD.root.setStarBoard(false);
        GD.root.setQuestionBg(false);
        GD.root.setLoadDataUI(true);
        GD.root.reFreshStar();
        GD.root.setLoadDataUI(false);
        GD.root.setBack(false);
        this.setHomeLayer(false);
        if (this.showLayerName == _GAMELIST[GAMELIST.default]) {
            this.setHomeLayer(true);
            this._bg.active = true;
            cc.YL.unLockTouch();
        }
    },

    //注册事件
    registerEvent() {
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
    },

    initHomeLayer() {
        let homeLayer = this.node.getChildByName('homeLayer');
        homeLayer.active = true;

        let isUpdateRoundID = true;
        let id = setTimeout(() => {
            isUpdateRoundID = false;
            showButton();
        }, 1000);
        cc.YL.net.getLearningProcess((GameData) => {
            console.log(GameData);
            if (!GameData || !isUpdateRoundID) {
                return
            }
            clearTimeout(id);//清理延时
            /*
                | 参数名称 | 类型   | 说明                     |
                | -------- | ------ | ------------------------ |
                | code     | int    | 状态码 0：成功           |
                | msg      | String |                          |
                | data     | int    | 当前模块的续播的练习序号 |
            */
            cc.gameConfig.roundID = GameData.data;
            showButton();
        })

        let registerTouch = (targetBtn) => {
            cc.YL.tools.registerTouch(
                targetBtn,
                (e) => {
                    console.log('click')
                    GD.sound.playSound('click');
                    e.target.setScale(0.8);
                },
                null,
                (e) => {
                    if (e.target.name == 'reStart_Icon') {
                        GD.iRoundID = 1;
                    }
                    e.target.setScale(1);
                    this.changeLayer(null, this.showLayerName);
                    homeLayer.active = false;
                }
            );
        }

        let showButton = () => {
            cc.YL.unLockTouch();
            switch (this.showLayerName) {
                case _GAMELIST[GAMELIST.default]:
                //展示界面 仅显示开始界面 
                case _GAMELIST[GAMELIST.videoGame]:
                    //当前为视频游戏环节 仅显示开始界面
                    let uiNode = homeLayer.getChildByName('noRecordedUI');
                    uiNode.active = true;
                    //重置roundID
                    GD.iRoundID = 1;
                    registerTouch(uiNode.getChildByName('start_Icon'));
                    break;
                case _GAMELIST[GAMELIST.questionBank]:
                    console.log(cc.gameConfig, '========')
                    if (cc.gameConfig.roundID > 1) {
                        //有学习记录
                        //设置关卡为对应关卡
                        GD.iRoundID = cc.gameConfig.roundID;
                        GD.sound.playSound('homeTips');
                        let uiNode = homeLayer.getChildByName('recordedUI');
                        uiNode.active = true;
                        registerTouch(uiNode.getChildByName('reStart_Icon'));//重新开始按钮
                        registerTouch(uiNode.getChildByName('start_Icon'));//继续游戏按钮
                    } else {
                        let uiNode = homeLayer.getChildByName('noRecordedUI');
                        uiNode.active = true;
                        GD.iRoundID = 1;

                        registerTouch(uiNode.getChildByName('start_Icon'));
                    }
                    break;
                default:
                    break;
            }
        }
    },

    changeLayer(event, name) {
        if (name == 'default') {
            return;
        }
        if (event) {
            GD.iRoundID = 1;
        }
        cc.YL.unLockTouch();
        console.log('loadGame:   ', name, '   ==============');
        cc.YL.startTimeCount();//计时
        GD.sound && GD.sound.stopTips();
        GD.root.setStarBoard(false);
        GD.root.setQuestionBg(false);
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
        //提交数据
        if (cc.gameConfig.isWX) {
            cc.YL.net.sendTimeAndStar(this.showLayerName == 'questionBank' ? cc.gameConfig.maxRoundID : cc.gameConfig.maxRoundID + 1, time, 0);
        } else {
            cc.YL.net.sendTime(parseInt(time))
        }
        cc.YL.net.finish()//延时4s结束游戏
    },

    // update (dt) {},
});
