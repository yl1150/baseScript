cc.Class({
    extends: cc.Component,

    properties: {},

    onLoad() {
        this.base = this.node.getChildByName("base");
        this.bg = this.base.getChildByName("bg");
        this.startButton = this.base.getChildByName("startButton");
        this.ske = this.startButton.getChildByName('ske');
        this.skeCom = this.ske.getComponent(sp.Skeleton);
    },

    start() {
        if (cc.origin.Note.root.showStartPanel) {
            //隐藏喇叭
            cc.origin.Note.trumpet.setVisible(false);
            //显示启动按钮
            this.showStartButton();
        } else {
            //游戏开始
            cc.origin.EventManager.emit(cc.origin.EventDefine.COMMON.GAME_START);
        }
    },

    showStartButton() {
        this.base.active=true;
        this.zoomButton();
        //给开始按钮注册触摸事件
        this.startButton.targetOff(this);
        this.startButton.on("touchstart", function () {
            cc.origin.AudioBase.play('click');
            this.zoomButton(false);
        }, this);
        this.startButton.on("touchend", function () {
            this.zoomButton(false);
            //游戏开始
            this.base.active = false;
            cc.origin.EventManager.emit(cc.origin.EventDefine.COMMON.GAME_START);
        }, this);
        this.startButton.on("touchcancel", function () {
            this.zoomButton();
        }, this);
    },

    zoomButton(canZoom = true) {
        // //按钮缩放
        // this.startButton.stopAllActions();
        // this.startButton.setScale(1, 1);
        // if (!canZoom) return;
        // cc.origin.ActionBase.scaleRepeat(this.startButton, 0, 0.5, 1.3);
        if (canZoom) {
            this.skeCom.setAnimation(0, 'newAnimation_1', true);
        } else {
            this.skeCom.setAnimation(0, 'newAnimation_2', true);
        }
    },

    onClickStartButton(event) {
        this.base.active = false;
        this.startButton.stopAllActions();
        //游戏开始
        cc.origin.EventManager.emit(cc.origin.EventDefine.COMMON.GAME_START);
    },
});