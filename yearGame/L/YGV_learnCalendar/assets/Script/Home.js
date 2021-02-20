cc.Class({
    extends: cc.Component,

    properties: {
        levelPrefab: { default: [], type: cc.Prefab },
    },

    onLoad() {
        cc.origin.Note.script_home = this;
        //初始化
        this.base = this.node.getChildByName('base');
        this.base.active = false;

        this.items = this.base.getChildByName('items');
        this.item_arr = this.items.children.map(x => { return x });

        this.level = 1;//关卡数
        this.maxLevel = 2;//最大关卡数
        this.gameContent = cc.find('Canvas/base/gameContent');
    },

    start() {
        //如单个圆内游戏，则不显示主界面
        if (cc.gameConfig && cc.gameConfig.columnId > 0) return;
        if (cc.origin.Note.script_gameContent && cc.origin.Note.script_gameContent.gameIndex > 0) return;
        //游戏结束后
        cc.origin.EventManager.on(cc.origin.EventDefine.COMMON.GAME_OVER, function () {
            //如果刚结束的这轮就是最大关卡，那么更新最大关卡
            if (this.level === this.maxLevel && this.level < this.levelPrefab.length) {
                this.maxLevel += 1;
            }
            setTimeout(() => {
                //隐藏结束界面
                var gameoverBase = cc.origin.Note.root.node.getChildByName('over').getChildByName('base');
                gameoverBase.active = false;
                //初始化UI
                this.initUI();
            }, 5000);
        }, this);
        //给各项按钮注册触摸
        this.registerItemTouch();
        //初始化UI
        this.initUI();
    },

    initUI() {
        //显示主界面
        this.setVisible(true);
        //清除游戏内容
        cc.origin.Util.destroyAllChildrenSync(this.gameContent);
        //设置各项触摸
        var maxLevel = this.maxLevel;
        for (let i = 0, len = this.item_arr.length; i < len; i++) {
            let item = this.item_arr[i];
            let canTouch = (i < maxLevel);
            this.setItemTouch(item, canTouch);
        }
        //可操作
        cc.origin.EventManager.emit(cc.origin.EventDefine.COMMON.KINETIC_TIME);
        //隐藏喇叭
        cc.origin.Note.trumpet.setVisible(false);
        //初始化喇叭
        cc.origin.Note.trumpet.initTrumpet(false);
        //隐藏星星框
        cc.origin.Note.script_star.setVisible(false);
        //隐藏返回按钮
        if (cc.origin.Note.script_gameback) cc.origin.Note.script_gameback.setVisible(false);
        //停止背景音乐
        cc.origin.AudioBase.stopBgm();
        //暂停视频
        if (cc.origin.Note.script_video) cc.origin.Note.script_video.pause();
    },

    setVisible(isVisible = true) {
        this.base.active = isVisible;
    },

    setItemTouch(item, canTouch = true) {
        item.$canTouch = canTouch;
        //不可点击的效果
        var img_item = item.getChildByName('img');
        var shaderType = canTouch ? cc.origin.ShaderBase.ShaderType.Default : cc.origin.ShaderBase.ShaderType.Gray;
        cc.origin.ShaderBase.setSpriteShader(img_item, shaderType);
    },

    startLevel(level = 1) {
        this.level = level;
        //隐藏主界面
        this.setVisible(false);
        //加载游戏
        cc.origin.Util.destroyAllChildrenSync(this.gameContent);
        this.gameNode = cc.instantiate(this.levelPrefab[this.level - 1]);
        this.gameNode.setParent(this.gameContent);
    },

    finishLevel() {
        //游戏节点隐藏
        this.gameNode.active = false;
        //显示主界面
        this.setVisible(true);
    },

    registerItemTouch(pNode) {
        var temp_arr = [];
        if (pNode) {
            temp_arr.push(pNode);
        } else {
            temp_arr = this.item_arr;
        }
        temp_arr.forEach(pItem => {
            pItem.on(cc.Node.EventType.TOUCH_START, function (event) {
                if (!event.target.$canTouch) return;
                if (cc.origin.Note.touchTarget) return;
                cc.origin.Note.touchTarget = event.target;
                cc.origin.EventManager.emit(cc.origin.EventDefine.COMMON.FREEZE_TIME);
                cc.origin.AudioBase.play('click');
                //放大
                cc.origin.Note.touchTarget.setScale(1.3, 1.3);
                //停止喇叭循环
                cc.origin.Note.isLoopTrumpet = false;
            }, this)
            pItem.on(cc.Node.EventType.TOUCH_MOVE, function (event) { }, this)
            pItem.on(cc.Node.EventType.TOUCH_END, touchUp, this)
            pItem.on(cc.Node.EventType.TOUCH_CANCEL, touchUp, this)
            function touchUp(event) {
                if (!cc.origin.Note.touchTarget) return;
                cc.origin.EventManager.emit(cc.origin.EventDefine.COMMON.KINETIC_TIME);
                //还原尺寸
                cc.origin.Note.touchTarget.setScale(1, 1);
                //开始关卡
                var level = parseInt(cc.origin.Note.touchTarget.name);
                this.startLevel(level);
                //重置触摸对象
                cc.origin.Note.touchTarget = null;
            }
        })
    },

    unregisterItemTouch(pNode) {
        var temp_arr = [];
        if (pNode) {
            temp_arr.push(pNode);
        } else {
            temp_arr = this.item_arr;
        }
        temp_arr.forEach(pItem => {
            pItem.off(cc.Node.EventType.TOUCH_START)
            pItem.off(cc.Node.EventType.TOUCH_MOVE)
            pItem.off(cc.Node.EventType.TOUCH_END)
            pItem.off(cc.Node.EventType.TOUCH_CANCEL)
        })
    },
});