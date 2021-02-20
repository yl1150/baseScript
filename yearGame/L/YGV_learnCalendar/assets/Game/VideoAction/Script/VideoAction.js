cc.Class({
    extends: cc.Component,

    properties: {
        gamePrefabs: { default: [], type: cc.Prefab },
    },

    onLoad() {
        cc.origin.Note.script_videoAction = this;
        //初始化
        this.base = this.node.getChildByName('base');
        //设置视频链接
        var video = this.base.getChildByName('video');
        if (cc.gameConfig.videoURL) video._videoURL = cc.gameConfig.videoURL;
        //设置视频断点数组
        var videoCtrl = this.base.getChildByName('videoCtrl');
        var timePointArr = cc.origin.Note.gameData.videoTimePoint;
        if (timePointArr) videoCtrl._timePointArr = timePointArr.map(x => { return x });
        //设置断点处游戏prefab
        videoCtrl._gamePrefabs = this.gamePrefabs;
    },

    start() {
        //暂停背景音乐
        cc.origin.AudioBase.pauseBgm();
        //隐藏背景
        cc.find('Canvas/bg').active = false;
        //隐藏喇叭
        cc.origin.Note.trumpet.setVisible(false);
    },

    onDestroy() {
        cc.origin.Note.script_videoAction = null;
    },
});