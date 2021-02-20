let questionData = cc.Class({
    name: "questionData",
    properties: {
        tips: cc.String,
        moneyNum: 0,
        goodsNum: 0,
        layerNum: 0,
        exampleAnswer: {
            default: [],
            type: [cc.Node],
            displayName: '示例答案',
        },
    }
})

cc.Class({
    extends: cc.Component,

    properties: {
        maxLv: 4,
        options: cc.Node,
        shoppingCart: cc.Node,
        qp: cc.Node,
        touchSke: sp.Skeleton,
        qData: {
            default: [],
            type: [questionData],
            displayName: '游戏数据',
        },
    },


    start() {
        this.lv = 1;
        cc.YL.yearGame = this;
        cc.YL.unLockTouch();
        this.gameLayer = this.node.getChildByName('gameLayer');
        this.checkBtn = this.node.getChildByName('checkBtn').getComponent(cc.Button);
        GD.sound.playBGM();
        GD.sound.setTipsButton(false);
        this.registerEvent();


        GD.sound.playTips('startTips', () => {
            this.showOpening();
        })
    },

    //注册事件
    registerEvent() {
        //继续下一环节游戏
        cc.YL.emitter.on('continueGame', (gift) => {
            this.continueGame();
        })

        this.options.children.forEach((op) => {
            op.addComponent('options').init(this.touchCB.bind(this));
        });
    },

    touchCB(op) {
        if (!op.getParentState()) {
            console.log('撤销操作');
            op.showBack();
            this.moneyCount -= parseInt(op.node.name);
            this.goodsCount--;
            this.checkBtn.interactable = this.goodsCount > 0;
            return;
        }

        let arr = this.shoppingCart.children;
        let target = null;
        for (let i = arr.length - 1; i >= 0; i--) {
            if (!target && arr[i].childrenCount < 1) target = arr[i];
        }
        if (!target) {
            GD.sound.playSound('blank2');
            return;
        }
        op.showDown(target);
        this.checkBtn.interactable = true;
        this.moneyCount += parseInt(op.name);
        this.goodsCount++;
    },

    showGoodsFly(op) {
        let arr = this.shoppingCart.children;
        let target = null;
        for (let i = arr.length - 1; i >= 0; i--) {
            if (!target && arr[i].childrenCount < 1) target = arr[i];
        }
        if (!target) {
            GD.sound.playSound('blank2');
            return;
        }
        this.checkBtn.interactable = true;
        this.moneyCount += parseInt(op.name);
        this.goodsCount++;

        /* let goods = new cc.Node('goods');
        let _sprite = goods.addComponent(cc.Sprite);
        _sprite.srcBlendFactor = cc.macro.BlendFactor.ONE;
        _sprite.spriteFrame = op.getComponent(cc.Sprite).spriteFrame;
        goods.setParent(op); */


        let goods = cc.instantiate(op);
        goods.setParent(op);
        goods.setPosition(0, 0);

        cc.YL.tools.registerTouch(
            goods,
            (e) => {
                e.target.setScale(1.2)
            },
            null,
            (e) => {
                e.target.setScale(1)

                if (e.target.parent != e.target.pNode) {
                    console.log('撤销')
                    return;
                }

                this.showGoodsFly(e.target);
            },
        );


        let pos = cc.YL.tools.getRelativePos(goods, target);
        goods.setParent(target);
        goods.position = pos;
        cc.tween(goods)
            .to(0.5, { position: cc.v2(0, 0) })
            .start()
    },

    //开场动画
    showOpening() {
        //豆豆数宝进场
        let opening = this.gameLayer.getChildByName('opening');
        let door = opening.getChildByName('door').getComponent(sp.Skeleton);
        let boshi = opening.getChildByName('boshi').getComponent(sp.Skeleton);
        let dd = opening.getChildByName('doudou').getComponent(sp.Skeleton);
        let car = opening.getChildByName('car');
        let leftBtn = this.node.getChildByName('leftBtn');
        let rightBtn = this.node.getChildByName('rightBtn');


        opening.active = true;

        door.setAnimation(0, 'animation', false);
        door.setCompleteListener(() => {
            door.setCompleteListener(null);
            dd.setAnimation(0, 'animation3', true);
            boshi.setAnimation(0, 'animation3', true);
            let time = 1;
            cc.tween(boshi.node)
                .to(time, { y: -220 })
                .start()

            cc.tween(dd.node)
                .to(time, { y: -220 })
                .call(() => {
                    dd.setAnimation(0, 'animation2', true);
                    boshi.setAnimation(0, 'animation2', true);
                })
                .start()
            this.touchSke.node.active = true;
            this.touchSke.setAnimation(0, 'newAnimation_1', true);
            GD.sound.playTips('startTips2');
            cc.YL.tools.registerTouch(
                car,
                (e) => {
                    e.target.setScale(1.2);
                },
                null,
                (e) => {
                    this.checkBtn.node.active = true;
                    leftBtn.active = true;
                    rightBtn.active = true;
                    dd.node.active = false;
                    boshi.node.active = false;
                    car.active = false;
                    this.node.getChildByName('doudou').active = true;
                    this.node.getChildByName('boshi').active = true;


                    e.target.setScale(1);
                    this.initGameLayer();
                    this.showPassLvAni(this.startGameLayer.bind(this));
                },
            );

        })
    },

    changeLayer(e, fx) {
        this.touchSke.node.active = false;
        //this.qp.active = false;
        let dd = this.node.getChildByName('doudou').getComponent(sp.Skeleton);
        let boshi = this.node.getChildByName('boshi').getComponent(sp.Skeleton);
        let time = 2;


        let maxX = 0;
        let minX = -this.maxLv * this.node.width;
        if (fx == 'left' && this.gameLayer.x >= maxX) {
            GD.sound.playSound('blank2');
            return;
        }
        if (fx == 'right' && this.gameLayer.x <= minX) {
            GD.sound.playSound('blank2');
            return;
        }



        cc.YL.lockTouch();
        //走路动画
        dd.setAnimation(0, 'animation3', true);
        boshi.setAnimation(0, 'animation3', true);


        if (fx == 'left') {
            cc.tween(this.gameLayer)
                .by(time, { x: 2480 })
                .start()

            dd.node.setScale(-1, 1);
            boshi.node.setScale(-1, 1);
        } else {
            cc.tween(this.gameLayer)
                .by(time, { x: -2480 })
                .start()
            dd.node.setScale(1, 1);
            boshi.node.setScale(1, 1);
        }



        cc.YL.timeOut(() => {
            cc.YL.unLockTouch();
            dd.setAnimation(0, 'animation2', true);
            boshi.setAnimation(0, 'animation2', true);
        }, time * 1000)
    },

    jumpLayer(layerNum, cb) {
        let dd = this.node.getChildByName('doudou').getComponent(sp.Skeleton);
        let boshi = this.node.getChildByName('boshi').getComponent(sp.Skeleton);
        let moveX = -layerNum * 2480;
        let time = 2 * Math.abs((this.gameLayer.x - moveX) / 2480);

        if (time == 0) {
            cb && cb();
            return;
        }

        //走路动画
        dd.setAnimation(0, 'animation3', true);
        boshi.setAnimation(0, 'animation3', true);


        if (this.gameLayer.x <= moveX) {
            cc.tween(this.gameLayer)
                .to(time, { x: moveX })
                .start()

            dd.node.setScale(-1, 1);
            boshi.node.setScale(-1, 1);
        } else {
            cc.tween(this.gameLayer)
                .to(time, { x: moveX })
                .start()
            dd.node.setScale(1, 1);
            boshi.node.setScale(1, 1);
        }

        cc.YL.timeOut(() => {
            dd.setAnimation(0, 'animation2', true);
            boshi.setAnimation(0, 'animation2', true);
            cb && cb();
        }, time * 1000)
    },

    //展示过场动画
    showPassLvAni(cb) {
        //初始化
        cb && cb();
    },


    //展示游戏场景
    initGameLayer() {
        //初始化
        this.shoppingCart.children.forEach((cell) => {
            cell.destroyAllChildren();
        });
        this.gameLayer.active = true;
        this.gameLayer.x = 0;
        this._errorCount = 0;
        let qData = this.qData[this.lv - 1];
        this.tips = qData.tips;
        this.moneyNum = qData.moneyNum;
        this.goodsNum = qData.goodsNum;
        this.layerNum = qData.layerNum;
        this.exampleAnswer = qData.exampleAnswer;
        this.moneyCount = 0;
        this.goodsCount = 0;

    },

    startGameLayer() {
        GD.root.setStarBoard(false);
        cc.YL.emitter.emit('startGame');
        GD.sound.setTipsButton(true);
        cc.YL.unLockTouch();
        GD.sound.setShowTips(this.tips, true, () => {
            //this.qp.active = false;
        });
        this.qp.active = true;
        this.qp.children.forEach((cell) => {
            cell.active = this.lv == cell.name;
        })
    },

    checkIsAllRight() {
        this.checkBtn.interactable = false;
        if (this.moneyCount == this.moneyNum && this.goodsCount == this.goodsNum) {
            //正确
            cc.YL.lockTouch();
            GD.sound.playSound('right');
            GD.root.showStar(this.shoppingCart, () => {
                this.showFinishLayer();
            })
        } else {
            GD.sound.playSound('wrong');
            GD.sound.playSound('blank');
            this.setError();
            this.shoppingCart.children.forEach((cell) => {
                cell.destroyAllChildren();
            });
        }
    },

    setError() {
        this._errorCount++;
        let maxErrCount = 3
        if (this._errorCount >= maxErrCount) {
            cc.YL.lockTouch();
            cc.YL.timeOut(() => {
                GD.sound.playTips('tipsWatch', () => {
                    this.showRightAnswer();
                })
            }, 1000);
        }
    },

    showRightAnswer() {
        //展示正确答案
        this.jumpLayer(this.layerNum, () => {
            cc.YL.timeOut(() => {
                this.exampleAnswer.forEach((goods) => {
                    this.showGoodsFly(goods);
                });
                this.checkBtn.interactable = false;
                GD.root.showStar(this.shoppingCart, () => {
                    this.showFinishLayer();
                });
            }, 500)
        })

        cc.YL.lockTouch();
    },

    showFinishLayer() {
        //此环节完成 注销所有事件
        GD.root.showAddStar(GD.root.getStarNum(this._errorCount), () => {
            cc.YL.emitter.emit('continueGame');
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
