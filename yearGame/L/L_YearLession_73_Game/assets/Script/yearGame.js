cc.Class({
    extends: cc.Component,

    properties: {
        maxLv: 4,
        aniPool: [cc.String]
    },


    start() {
        this.lv = 1;
        cc.YL.yearGame = this;
        cc.YL.unLockTouch();
        this.tree = this.node.getChildByName('tree');
        this.treeSke = this.tree.getComponent(sp.Skeleton);
        this.gameLayer = this.node.getChildByName('gameLayer');
        //this.tree.box = this.tree.getComponent(cc.PolygonCollider);
        this.touchLayer = this.node.getChildByName('touchLayer');
        this.gquan = this.node.getChildByName('quan').getComponent(sp.Skeleton);


        GD.sound.playBGM();
        GD.sound.setTipsButton(false);
        this.registerEvent();


        cc.YL.timeOut(() => {
            //树长大
            this.tree.active = true;
            this.treeSke.setAnimation(0, 'animation2', false);
            GD.sound.playTips('startTips', () => {
                this.showOpening();
            })
        }, 1000)
    },

    //注册事件
    registerEvent() {
        //继续下一环节游戏
        cc.YL.emitter.on('continueGame', (gift) => {
            this.continueGame();
        })
    },

    touchTree(touch) {
        let box = this.tree.getComponent(cc.PolygonCollider)
        if (cc.Intersection.pointInPolygon(touch.getLocation(), box.world.points)) {
            console.log("Hit!");
            //展示红包树摇动
            this.touchLayer.active = false;
            this.gquan.node.position = this.gquan.node.parent.convertToNodeSpaceAR(touch.getLocation());
            this.gquan.setAnimation(0, 'newAnimation_1', false);
            this.startGameLayer();
        } else {
            console.log("No hit");
        }
    },

    //开场动画
    showOpening() {
        //豆豆数宝进场
        let sb = this.node.getChildByName('shubao').getComponent(sp.Skeleton);
        let dd = this.node.getChildByName('doudou').getComponent(sp.Skeleton);
        let pos = sb.node.position;
        sb.node.x = -1500;
        sb.node.y+=200;
        sb.node.active = true;

        dd.setAnimation(0, 'animation2', true);
        sb.setAnimation(0, 'animation2', true);

        let time = 2;
        cc.tween(sb.node)
            .by(time, { x: 1000 })
            .start()

        cc.tween(dd.node)
            .by(time, { x: 1000 })
            .start()


        cc.YL.timeOut(() => {
            //豆豆说话
            dd.setAnimation(0, 'animation4', true);
            GD.sound.playTips('startTips2', () => {
                dd.setAnimation(0, 'animation3', true);
                //数宝摇树
                GD.sound.playTips('startTips3');
                cc.tween(sb.node)
                    .to(0.5, { position: pos })
                    .call(() => {
                        sb.setAnimation(0, 'animation4', false);
                        this.treeSke.setAnimation(0, 'animation3', false);
                    })
                    .delay(1)
                    .call(() => {
                        sb.setAnimation(0, 'animation2', true);
                        cc.tween(sb.node)
                            .by(0.5, { x: -500 })
                            .start()
                        this.initGameLayer();
                        this.showPassLvAni(() => {
                            this.startGameLayer();
                        })
                    })
                    .start()

            })
            sb.setAnimation(0, 'animation2', true);
        }, time * 1000)
    },

    //展示过场动画
    showPassLvAni(func) {
        //初始化
        cc.YL.unLockTouch();
        this.touchLayer.active = true;
        GD.sound.setShowTips('touchTree', true);

    },


    //展示游戏场景
    initGameLayer() {
        //初始化
        let layer = this.gameLayer.getChildByName('layer' + this.lv);
        let ctrl = null;
        layer.active = true;
        for (let i in layer._components) {
            if (layer._components[i].init) {
                ctrl = layer._components[i];
                layer._components[i].init();
            }
        }
    },

    startGameLayer() {
        this.treeSke.setAnimation(0, this.aniPool.shift(), false);
        this.treeSke.setCompleteListener(() => {
            this.treeSke.setCompleteListener(null);
            GD.root.setStarBoard(false);
            cc.YL.emitter.emit('startGame');
        })

    },

    //展示结束时的动画
    showEnding(cb) {
        cb && cb();
    },

    continueGame() {
        if (this.lv >= this.maxLv) {
            cc.YL.emitter.emit('gameEnd');
        } else {
            this.lv++;
            this.initGameLayer();
            this.showPassLvAni(() => {
                this.startGameLayer();
            })
        }
    },
});
