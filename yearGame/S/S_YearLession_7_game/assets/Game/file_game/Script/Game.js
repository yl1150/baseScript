/**
 * 轮数
 */
const kRoundNum = 4;
cc.Class({
    extends: cc.Component,

    properties: {},

    onLoad() {
        cc.origin.Script[this.__classname__] = this;
        //初始化
        this.base = this.node.getChildByName('base');

        this.rounds = this.base.getChildByName('rounds');
        this.rounds.children.forEach(x => { x.active = true })
    },

    onDestroy() {
        cc.origin.Script[this.__classname__] = null;
        //
        cc.origin.EventManager.off(cc.origin.EventDefine.COMMON.FINISH_ROUND);
        cc.origin.Note.trumpet.initTrumpet();
    },

    start() {
        //开启碰撞
        cc.origin.Util.openCollision();
        //处理事件
        this.handleEvent();
        //加载界面或布置舞台
        this.loadGame();
        //开启背景音乐
        cc.origin.AudioBase.playBgm();
    },

    loadGame() {
        //显示返回键
        cc.origin.Note.script_gameback.setVisible(true);
        //显示喇叭
        cc.origin.Note.trumpet.setVisible(true);
        // //显示星星框
        // cc.origin.Note.script_star.setVisible(true);
        this.setStage();
    },

    setStage() {
        console.log("[Set Stage!]");
        //To布景,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
        //开始第一部分
        this.startRound(1);
    },

    startRound(roundId) {
        this.roundId = roundId;
        console.log("[Round_" + this.roundId + "]-Start");
        //-----------------------------------------
        //初始化各个单位
        this.script_round = cc.origin.Script[this.__classname__ + '_' + "Round" + this.roundId]; //this.roundId
        this.script_round.initRound(roundId);
    },

    finishRound() {
        console.log("[Round_" + this.roundId + "]-Finish");
        //--------------------------------------------
        //获得星星
        var starWorldpos = cc.v2(cc.winSize.width / 2, cc.winSize.height / 2);
        var starNum = cc.origin.Note.script_star.getStarNumByMistakeCount(this.script_round.mistakeCount, true);
        cc.origin.Note.script_star.earnStar(starWorldpos, starNum);
        cc.origin.Note.script_star.showWin(starNum, () => {
            //隐藏星星框
            cc.origin.Note.script_star.setVisible(false);
        });
        //判断继续or结束
        cc.origin.ScheduleBase.addTimeout(() => {
            if (this.roundId < kRoundNum) {
                //清除
                this.script_round.clearRound(() => {
                    //下一轮
                    this.startRound(this.roundId + 1);
                });
                // //下一轮
                // cc.origin.ScheduleBase.addTimeout(() => {
                //     this.startRound(this.roundId + 1);
                // }, 1);
            } else {
                //场景结束
                this.finishScene();
            }
        }, 2);
    },

    finishScene() {
        //游戏结束
        cc.origin.EventManager.emit(cc.origin.EventDefine.COMMON.GAME_OVER);
    },

    handleEvent() {
        cc.origin.EventManager.on(cc.origin.EventDefine.COMMON.FINISH_ROUND, function () {
            cc.origin.EventManager.emit(cc.origin.EventDefine.COMMON.FREEZE_TIME);//不可操作
            //结束本轮
            cc.origin.ScheduleBase.addTimeout(() => this.finishRound(), 1);
        }, this);
    },
});