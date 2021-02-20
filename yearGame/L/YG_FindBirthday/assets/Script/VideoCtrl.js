cc.Class({
    extends: cc.Component,

    properties: {},

    onLoad() {
        cc.origin.Note.script_videoCtrl = this;
        //初始化
        this.base = this.node.getChildByName('base');
        //视频、进度条脚本
        this.script_video = this.node.parent.getChildByName('video').getComponent('VideoBase');
        this.script_videoProgress = this.node.parent.getChildByName('videoProgress').getComponent('VideoProgress');
        //设置时间点
        this.kTimePoint_arr = [];
        if (this.node._timePointArr) this.setTimePoint(this.node._timePointArr);
        //断点处游戏prefab
        this.gamePrefabs = [];
        if (this.node._gamePrefabs) this.gamePrefabs = this.node._gamePrefabs;
        //上一个时间字符
        this.lastTimeStr = '';
        //可以检测
        this.canCheckTime = true;
    },

    onDestroy() {
        cc.origin.Note.script_videoCtrl = null;
    },

    start() {
        //显示返回键
        cc.origin.Note.script_gameback.setVisible(true);
        //视频结束
        cc.origin.EventManager.once(cc.origin.EventDefine.VIDEO.END, function () {
            //跳出庆祝动画
            cc.origin.EventManager.emit(cc.origin.EventDefine.COMMON.GAME_OVER);
        }, this)
    },

    update(dt) {
        //检测时间是否进某个游戏阶段
        if (this.script_video && this.script_videoProgress && this.canCheckTime) {
            var isTouchingProgressBar = this.script_videoProgress.isTouchingProgressBar;
            if (!isTouchingProgressBar) {
                var t = this.script_video.getCurrentTime().toFixed(1);//时间保留一位小数
                this.checkVideoTime(t);
            }
        }
    },

    setTimePoint(timePoint_arr) {
        //设置时间点数组
        this.kTimePoint_arr = timePoint_arr.map(x => {
            let time = x.time;
            let sec = time[0] * 3600 + time[1] * 60 + time[2];
            let str = sec.toFixed(1).toString();
            return str;
        });
    },

    checkVideoTime(t) {
        var str = t.toString();
        if (str === this.lastTimeStr) return;//确保统一时间点仅执行一次
        this.lastTimeStr = str;
        //开始游戏阶段
        var index_game = this.kTimePoint_arr.indexOf(str);
        if (index_game >= 0) {
            this.isAutoRunGame = true;//自动运行
            this.startGame(index_game);
        }
    },

    startGame(gameId) {
        this.lastTimeStr = this.kTimePoint_arr[gameId];//专为跳游戏用的（防止跳的游戏结束后未记录，再次进入此轮游戏）
        var type = cc.origin.Note.gameData.videoTimePoint[gameId].type;
        switch (type) {
            case 'normal':
                break;
            case 'game':
                break;
            case 'tip':
                this.script_video.resume();
                return;
            case 'null':
                // this.script_video.resume();
                return;

            default:
                break;
        }
        //视频进度条隐藏
        this.script_videoProgress.showUI(false);
        //一开始不允许触摸，需主动开启
        cc.origin.EventManager.emit(cc.origin.EventDefine.COMMON.FREEZE_TIME);
        //重置触摸对象
        cc.origin.Note.touchTarget = null;
        //加载游戏游戏节点
        cc.origin.Util.destroyAllChildrenSync(this.base);
        var gameNode = cc.instantiate(this.gamePrefabs[gameId]);
        gameNode.setParent(this.base);
        gameNode.active = true;
        //记录是否是自动运行游戏
        gameNode.isAutoRunGame = this.isAutoRunGame;
        this.isAutoRunGame = false;
    },

    finishGame() {
        //隐藏喇叭
        cc.origin.Note.trumpet.setVisible(false);
        //隐藏星星框
        cc.origin.Note.script_star.setVisible(false);
        //显示返回键
        cc.origin.Note.script_gameback.setVisible(true);
        //销毁游戏节点
        cc.origin.Util.destroyAllChildrenSync(this.base);
        //继续播视频
        this.script_video.resume();
        //视频进度条显示
        this.script_videoProgress.showUI(true);
        //可触摸（主要是为了进度条）
        cc.origin.EventManager.emit(cc.origin.EventDefine.COMMON.KINETIC_TIME);
        //结束后不可立即进行自动检测时间（视频resume可能会回退，时间点前移，导致同一阶段进入两次）
        this.canCheckTime = false;
        setTimeout(() => { this.canCheckTime = true; }, 200);
    },

    getTimePointByGameId(gameId) {
        //通过游戏id获取时间点
        var t = this.kTimePoint_arr[gameId];
        return parseFloat(t);
    },
});