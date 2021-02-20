cc.Class({
    extends: cc.Component,

    properties: {},

    onLoad() {
        this.base = this.node.getChildByName("base");
        this.bg = this.base.getChildByName("bg");
        this.spCont = this.base.getChildByName("sp");
        this.dou = this.spCont.getChildByName('xiaodou');
        this.skeDou = this.dou.getComponent(sp.Skeleton);

        // this.btns = this.base.getChildByName('btns');
        // this.newbg = this.base.getChildByName('newbg');
        // this.btn_arr = this.btns.children.map(x => { return x });
        //给按钮注册触摸事件
        // this.registerTouch();
        //隐藏所有按钮
        // this.btn_arr.forEach(x => { x.active = false });
    },

    start() {
        if (cc.origin.Note.root.showStartPanel) {
            //隐藏喇叭
            cc.origin.Note.trumpet.setVisible(false);
            // setTimeout(this.initUI.bind(this), 1000);
            //显示开始
            this.base.active = true;
            this.showSPCont();
        } else {
            //游戏开始
            cc.origin.EventManager.emit(cc.origin.EventDefine.COMMON.GAME_START);
        }
    },

    update(dt) {
        //累计游戏片段时长
        if (!this.base.active) cc.origin.Note.sliceTime += dt;
    },

    showSPCont() {
        
        this.skeDou.setAnimation(0, 'newAnimation_1', true);
        this.skeDou.setCompleteListener(() => {
            this.skeDou.setAnimation(0, 'newAnimation_2', true);
        });
        cc.origin.AudioBase.play('title', () => {
            this.base.active = false;
            cc.origin.EventManager.emit(cc.origin.EventDefine.COMMON.GAME_START);
        });
    },

    initUI() {
        if (this.isAreadyInit) return;
        this.isAreadyInit = true;
        cc.origin.Note.roundId = 1;
        this.base.active = true;
        if (cc.gameConfig.columnId == 1) cc.origin.Note.roundId = 1;
        this.btns.getChildByName('start').active = true;
    },

    registerTouch(pNode) {
        var temp_arr = [];
        if (pNode) {
            temp_arr.push(pNode);
        } else {
            temp_arr = this.btn_arr;
        }
        temp_arr.forEach(pTouch => {
            pTouch._canTouch = true;
            pTouch.on(cc.Node.EventType.TOUCH_START, function (event) {
                if (!pTouch._canTouch) return;
                if (cc.origin.Note.touchTarget) return;
                cc.origin.EventManager.emit(cc.origin.EventDefine.COMMON.FREEZE_TIME);
                cc.origin.Note.touchTarget = pTouch;
                cc.origin.AudioBase.play('click');
                //缩小尺寸
                var img = pTouch.getChildByName('img');
                img.setScale(0.8, 0.8);
            }, this)
            pTouch.on(cc.Node.EventType.TOUCH_MOVE, function (event) { }, this)
            pTouch.on(cc.Node.EventType.TOUCH_END, touchUp, this)
            pTouch.on(cc.Node.EventType.TOUCH_CANCEL, touchUp, this)
            function touchUp(event) {
                if (!cc.origin.Note.touchTarget) return;
                cc.origin.EventManager.emit(cc.origin.EventDefine.COMMON.KINETIC_TIME);
                //重置触摸对象
                cc.origin.Note.touchTarget = null;
                //还原尺寸
                var img = pTouch.getChildByName('img');
                img.setScale(1, 1);
                //停止声音
                cc.origin.AudioBase.stopAll();
                //隐藏开始界面
                this.btn_arr.forEach(x => { x.active = false })
                this.newbg.active = false
                this.showSPCont();
                //游戏开始
                // cc.origin.EventManager.emit(cc.origin.EventDefine.COMMON.GAME_START);
            }
        })
    },
});