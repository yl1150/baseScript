cc.Class({
    extends: cc.Component,

    properties: {
        bgmVolume: {
            default: 1,
            tooltip: '背景音量,0~1'
        },
        bgm: {
            type: cc.AudioClip,
            default: null,
            tooltip: '背景音乐'
        },
        showStartPanel: {
            default: false,
            tooltip: '显示开始面板'
        },
        fitMode: {
            type: cc.origin.ScreenFit.FitMode,
            default: cc.origin.ScreenFit.FitMode.AUTO_SCALE,
            tooltip: '屏幕适配模式'
        },
        gameDataJson: {
            type: cc.JsonAsset,
            default: null,
            tooltip: '游戏数据'
        },
        gameConfigJson: {
            type: cc.JsonAsset,
            default: null,
            tooltip: '游戏默认配置'
        }
    },

    onLoad() {
        cc.origin.Note.root = this;
        console.log("[Root]");
        cc.game.addPersistRootNode(this.node);
        this.node.setSiblingIndex(1000);
        //初始化数据
        this.initData();
        //初始化UI
        this.initUI();
    },

    start() {
        //处理事件
        this.handleEvent();
    },

    update(dt) {
        //累计游戏总时长
        cc.origin.Note.totalTime += dt;
    },

    initData() {
        //同步游戏数据和游戏配置
        cc.origin.Note.gameData = this.gameDataJson.json;
        if (!cc.hasOwnProperty('gameConfig')) {
            cc.gameConfig = this.gameConfigJson.json;
        }
        //获取用户数据（通过url）
        cc.origin.Network.getUserToken();
    },

    initUI() {
        //适配方式
        cc.origin.ScreenFit.fitScreen(this.fitMode);
        //保持与scene尺寸
        this.keepRootSameWithSceneSize();
        //背景音乐
        cc.origin.AudioBase.setBgm(this.bgm, this.bgmVolume);
        // cc.origin.AudioBase.playBgm();
    },

    handleEvent() {
        //屏幕适配(新场景)
        cc.director.on(cc.Director.EVENT_AFTER_SCENE_LAUNCH, function () {
            //保持与scene尺寸
            this.keepRootSameWithSceneSize();
            //适配
            cc.origin.ScreenFit.fitScreen();
        }, this);
        //屏幕尺寸改变时
        cc.view.on('canvas-resize', function () {
            console.log('winSize change!');
            //保持与scene尺寸
            this.keepRootSameWithSceneSize();
        }, this);
    },

    keepRootSameWithSceneSize() {
        //刷新Root尺寸，与场景尺寸保持一致（对适配组件有用！！！）
        var currentCanvas = cc.director.getScene().getChildByName('Canvas');
        this.node.setPosition(currentCanvas.position);
        this.node.width = cc.winSize.width;
        this.node.height = cc.winSize.height;
    },
});