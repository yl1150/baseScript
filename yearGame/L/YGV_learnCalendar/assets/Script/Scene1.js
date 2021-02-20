cc.Class({
    extends: cc.Component,

    properties: {},

    onLoad() {
        cc.origin.Note.scene = this;
        cc.origin.Note.sceneId = parseInt(this.__classname__.substring(5));
        cc.origin.Note.roundId = null;
        console.log("[scene" + cc.origin.Note.sceneId + "]");
        //初始化UI---------------------------------
        this.base = this.node.getChildByName("base");
    },

    start() {
        //开启碰撞
        cc.origin.Util.openCollision();
        // //处理事件
        // this.handleEvent();
    },

    // update(dt) {
    //     //5s无操作则循环
    //     if (cc.origin.Note.isLoopTrumpet && cc.origin.Note.t_leisure > 5) {
    //         cc.origin.Note.trumpet.playTrumpet(cc.origin.Note.trumpet.audio_clip, false);
    //     }
    // },

    // setStage() {
    //     console.log("[Set Stage!]");
    //     //To布景,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    //     //开始第一部分
    //     setTimeout(() => this.startRound(1), 1000);
    // },

    // startRound(roundId) {
    //     cc.origin.Note.roundId = roundId;
    //     console.log("[Round_" + cc.origin.Note.roundId + "]-Start");
    //     //-----------------------------------------
    //     //初始化各个单位
    //     //To初始化,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    //     //voice此部分语音
    //     cc.origin.Note.trumpet.playTrumpet('round' + cc.origin.Note.roundId, false);
    //     cc.origin.Note.isLoopTrumpet = true;//喇叭循环播放
    //     cc.origin.EventManager.emit(cc.origin.EventDefine.COMMON.KINETIC_TIME);//可操作
    // },

    // finishRound() {
    //     console.log("[Round_" + cc.origin.Note.roundId + "]-Finish");
    //     //--------------------------------------------
    //     //判断继续/结束
    //     if (cc.origin.Note.roundId < cc.origin.Note.gameData.roundNum) {
    //         //To清场,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    //         //下一轮
    //         setTimeout(() => { this.startRound(cc.origin.Note.roundId + 1); }, 1000);
    //     } else {
    //         //场景结束
    //         this.finishScene();
    //     }
    // },

    // finishScene() {
    //     //游戏结束
    //     cc.origin.EventManager.emit(cc.origin.EventDefine.COMMON.GAME_OVER);
    // },

    // handleEvent() {
    //     cc.origin.EventManager.once(cc.origin.EventDefine.COMMON.GAME_START, function () {
    //         //voice标题（之后搭建舞台）
    //         cc.origin.AudioBase.loadVoice("title", () => {
    //             if (cc.origin.AudioBase.album.title) {
    //                 cc.origin.AudioBase.play('title', () => this.setStage());
    //             } else {
    //                 console.log('no title audio');
    //                 this.setStage();
    //             }
    //         });
    //     }, this);
    //     cc.origin.EventManager.on(cc.origin.EventDefine.COMMON.FINISH_ROUND, function () {
    //         cc.origin.EventManager.emit(cc.origin.EventDefine.COMMON.FREEZE_TIME);//不可操作
    //         //结束本轮
    //         setTimeout(() => this.finishRound(), 1000);
    //     }, this);
    // },
});