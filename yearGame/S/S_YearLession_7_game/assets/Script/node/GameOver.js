cc.Class({
    extends: cc.Component,

    properties: {
        voice_celebrate: { default: null, type: cc.AudioClip },
    },

    onLoad() {
        this.base = this.node.getChildByName("base");
        this.base.active = false;

        this.doudou = this.base.getChildByName("doudou");
        this.doudou.children.forEach(x => { x.active = false; })

        this.flowers = this.base.getChildByName('flower');
        this.flower_arr = this.flowers.children.map(x => { return x });

        this.refresh = this.base.getChildByName("refresh");
        this.refresh.active = false;//如不需要刷新，则设为false
    },

    start() {
        //处理事件
        this.handleEvent();
    },

    initUI() {
        console.log("Game Over!");
        setTimeout(() => {
            this.base.active = true;
            //voice庆祝
            cc.origin.AudioBase.play('celebrate');
            //豆豆
            this.showDoudou();
            //动画 撒花
            this.flower_arr.forEach((pFlower) => {
                let dragCom = pFlower.getComponent(dragonBones.ArmatureDisplay);
                dragCom.playAnimation("newAnimation", 0);
            });
            //结束
            cc.origin.Network.finish();
        }, 1000);
    },

    showDoudou() {
        //如0则随机豆豆动画
        var index = cc.origin.Note.gameData.overAnimationId;
        if (index <= 0 || index > this.doudou.childrenCount) index = cc.origin.MathBase.random(1, this.doudou.childrenCount, true);
        var boneAnim_doudou = this.doudou.children[index - 1];
        boneAnim_doudou.active = true;
        //豆豆动画
        switch (index) {
            case 1://豆豆和数宝跳跃
                var dragCom = boneAnim_doudou.getComponent(dragonBones.ArmatureDisplay);
                dragCom.playAnimation('newAnimation', 0);
                break;
            case 2://豆豆转圈
                var dragCom = boneAnim_doudou.getComponent(dragonBones.ArmatureDisplay);
                dragCom.playAnimation('Sprite', 0);
                break;
            case 3://豆豆坐铅笔飞
                var skeCom = boneAnim_doudou.getComponent(sp.Skeleton);
                skeCom.setAnimation(0, 'newAnimation', false);
                skeCom.addAnimation(0, 'newAnimation2', true);
                break;
            case 4://豆豆盾牌剑
                var skeCom = boneAnim_doudou.getComponent(sp.Skeleton);
                skeCom.setAnimation(0, 'newAnimation', false);
                skeCom.addAnimation(0, 'newAnimation2', true);
                break;
            case 5://豆豆吹喇叭或拿奖杯
                var skeCom = boneAnim_doudou.getComponent(sp.Skeleton);
                // var animationName = 'newAnimation';
                // if (Math.random() > 0.5) animationName += '_1';
                var animationName = 'newAnimation_1';
                skeCom.setAnimation(0, animationName, true);
                break;

            default:
                break;
        }
    },

    onClickRefresh(event) {
        console.log("[Click Refresh]");
        cc.director.loadScene("scene1");
    },

    handleEvent() {
        cc.origin.EventManager.on(cc.origin.EventDefine.COMMON.GAME_OVER, function () {
            cc.origin.EventManager.emit(cc.origin.EventDefine.COMMON.FREEZE_TIME);
            this.initUI();
            //向后端发送游戏时长
            if (cc.gameConfig.isWechatMini) {
                // var time = Math.floor(cc.origin.Note.sliceTime);
                // var columnId = cc.gameConfig.columnId;
                // if (columnId === 1) {
                //     roundId = cc.origin.Note.gameData.videoMaxRoundId + 1;
                // } else if (columnId === 2) {
                //     roundId = cc.origin.Note.script_question.roundId;
                // }
                // cc.origin.Network.sendTimeAndStar(roundId, time, 0);
                cc.origin.Network.finish();
            } else {
                var time = Math.floor(cc.origin.Note.sliceTime);
                cc.origin.Network.sendTime(time);
            }
        }, this);
    },
});