let skeMessage = cc.Class({
    name: "skeData",
    properties: {
        skinArr: [cc.String],
        skeNumArr: [cc.Integer],
        textureArr: [cc.SpriteFrame],
        cannedTexArr: [cc.SpriteFrame],
        isBalanceNum: false
    }
})

cc.Class({
    extends: cc.Component,

    properties: {
        maxLv: 4,
        skeData: {
            default: [],
            type: [skeMessage],
            displayName: '游戏数据',
        },
    },


    start() {
        this.lv = 1;
        cc.YL.yearGame = this;
        cc.YL.lockTouch();
        this._ddSke = this.node.getChildByName('doudou').getComponent(sp.Skeleton);
        this._sbSke = this.node.getChildByName('shubao').getComponent(sp.Skeleton);
        this._machineSke = this.node.getChildByName('jiqi').getComponent(sp.Skeleton);
        this.gameLayer = this.node.getChildByName('gameLayer');
        this.canneds = this.node.getChildByName('canneds');
        GD.sound.playBGM();
        GD.sound.setTipsButton(false);

        GD.sound.playTips('startTips', () => {
            this.showOpening();
        })
        this.registerEvent();
    },

    //注册事件
    registerEvent() {
        //继续下一环节游戏
        cc.YL.emitter.on('continueGame', (gift) => {
            this.continueGame();
        })
    },

    //开场动画
    showOpening() {
        //豆豆说话
        this._ddSke.setAnimation(0, 'newAnimation_4', true);
        GD.sound.playTips('startTips2', () => {
            //豆豆闭嘴
            this._ddSke.setAnimation(0, 'newAnimation_1', true);

            //数宝说话
            this._sbSke.setAnimation(0, 'newAnimation_4', true);
            GD.sound.playTips('jiujiujiu', () => {
                this.showGameLayer();
            })
        })
    },

    //展示过场动画
    showPassLvAni(isTransition, func) {
        if (!isTransition) {
            func && func();
            return;
        }

        var skeData = this.skeData.shift();
        var skinArr = skeData.skinArr;
        var skeNumArr = skeData.skeNumArr;
        var textureArr = skeData.textureArr;
        var cannedTexArr = skeData.cannedTexArr;
        this.isBalanceNum = skeData.isBalanceNum;
        var listArr = cc.YL.tools.arrCopy(this._machineSke.node.children);
        var box = this.canneds;

        let showPutFruit = (cb) => {
            if (skinArr.length < 1) {
                cb && cb();
                return;
            }
            this._sbSke.setSkin(skinArr.shift())
            this._sbSke.setAnimation(0, 'newAnimation_3', false);

            //展示水果逐个出现
            let num = skeNumArr.shift();
            let texture = textureArr.shift();
            let list = listArr.shift();
            let cTexture = cannedTexArr.shift();

            for (let i = 0; i < num; i++) {
                var pNode = new cc.Node('fruit');
                var img = new cc.Node('img');
                pNode.width = 100;
                let _sprite = img.addComponent(cc.Sprite);
                _sprite.spriteFrame = texture;
                _sprite.srcBlendFactor = cc.macro.BlendFactor.ONE;

                img.parent = pNode;
                pNode.parent = list;
                pNode.zIndex = i;

                pNode.opacity = 0;
                cc.tween(pNode)
                    .delay(i * 0.25 + 1)
                    .by(0.25, { opacity: 255 })
                    .start()


                var canned = new cc.Node('canned');
                let _psprite = canned.addComponent(cc.Sprite);
                _psprite.spriteFrame = cTexture;
                _psprite.srcBlendFactor = cc.macro.BlendFactor.ONE;
                canned.parent = this.canneds;
            }
            cc.YL.timeOut(() => {
                showPutFruit(cb);
            }, (1 + num * 0.25) * 1000)
        };
        console.log(this.canneds);
        console.log(this._machineSke.node);

        //数宝闭嘴 将水果倒入机器
        showPutFruit(() => {
            func && func();
        })

    },


    //展示游戏场景
    showGameLayer() {
        //初始化
        GD.root.setStarBoard(false);
        let layer = this.gameLayer.getChildByName('layer' + this.lv);
        let ctrl = null;
        layer.active = true;
        for (let i in layer._components) {
            if (layer._components[i].init) {
                ctrl = layer._components[i];
                layer._components[i].init();
            }
        }
        this.showPassLvAni(ctrl.isTransition, () => {
            cc.YL.emitter.emit('startGame');
        })
    },

    //展示结束时的动画
    showEnding(cb) {
        if (this.isBalanceNum) {
            //平衡水果数量
            let kidArr = [];
            this._machineSke.node.children.forEach((list) => {
                list.children.forEach((kid) => {
                    kidArr.push(kid);
                });
            });
            let perNum = parseInt(kidArr.length / this._machineSke.node.childrenCount);
            this._machineSke.node.children.forEach((list) => {
                for (let i = 0; i < perNum; i++) {
                    var kid = kidArr.shift();
                    kid.setParent(list);
                    kid.setPosition(0, 0);
                }
            });
        }




        //豆豆说话
        this._ddSke.setAnimation(0, 'newAnimation_4', true);
        GD.sound.playTips('startMachine', () => {
            //豆豆闭嘴 启动开关
            this._ddSke.setAnimation(0, 'newAnimation_3', false);
            this._ddSke.addAnimation(0, 'newAnimation_1', true);
            this._machineSke.setAnimation(0, 'newAnimation', false);
            this._machineSke.addAnimation(0, 'newAnimation_3', true);

            //展示罐头
            cc.YL.timeOut(() => {
                //清理水果
                this._machineSke.node.children.forEach((list) => {
                    list.destroyAllChildren();
                });
                GD.sound.playSound('machine');
                //展示罐头运出
                var dt = 0;
                var time = 0;
                this.canneds.active = true;
                this.canneds.children.forEach((canned) => {
                    cc.tween(canned)
                        .delay(dt)
                        .by(1, { x: cc.winSize.width / 2 + canned.width })
                        .start()
                    dt += 0.25;
                    time += 0.35;
                });


                cc.YL.timeOut(() => {
                    //清理罐头
                    this._machineSke.setAnimation(0, 'newAnimation_1', true);
                    this.canneds.active = false;
                    this.canneds.destroyAllChildren();
                }, time * 1000)

                cc.YL.timeOut(() => {
                    cb && cb();
                }, time * 1000 + 100)
            }, 1000)
        })

    },

    continueGame() {
        if (this.lv >= this.maxLv) {
            this.showEnding(() => {
                cc.YL.emitter.emit('gameEnd');
            })
        } else {
            this.lv++;
            this.showEnding(() => {
                this.showGameLayer();
            })
        }
    },
});
