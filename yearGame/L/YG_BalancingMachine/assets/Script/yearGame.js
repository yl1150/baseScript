cc.Class({
    extends: cc.Component,

    properties: {
        startTips: [cc.AudioClip],
        tipsNode: [cc.Node],
        delayTimes: [cc.String],
        maxLv: 4,
    },


    start() {
        this.lv = 1;
        cc.YL.lockTouch();
        GD.sound.playBGM();
        GD.sound.setTipsButton(false);
        GD.sound.playTips(this.startTips.shift(), () => {
            this.showOpeingAnimation();
        })
        this.registerEvent();
    },

    //注册事件
    registerEvent() {
        //继续下一环节游戏
        cc.YL.emitter.on('continueGame', (e, data) => {
            console.log('continueGame')
            this.continueGame();
        })
    },

    //展示开场动画
    showOpeingAnimation() {
        let icons = this.node.getChildByName('icons');
        let opNode = this.node.getChildByName('openingNode');
        let logos = opNode.getChildByName('logos');
        let kidPool = cc.YL.tools.arrCopy(logos.children);
        let arr = this.tipsNode;
        let tPool = this.delayTimes;
        let showTeach = () => {
            if (arr.length < 1) {
                let pos = cc.YL.tools.getRelativePos(icons, opNode);
                cc.tween(logos)
                    .to(0.5, { position: pos, scale: 0.45 })
                    .call(() => {
                        kidPool.forEach((kid) => {
                            kid.parent = icons;
                            kid.position = cc.v2(0, 0);
                            kid.setScale(0.45)
                        });
                    })
                    .start()
                return;
            }
            let tNode = arr.shift();
            let time = tPool.shift();
            tNode.active = true;
            cc.tween(tNode)
                .then(cc.YL.aMgr.zoomAction(2))
                .start()
            cc.YL.timeOut(() => { showTeach() }, time * 1000)
        }
        cc.YL.timeOut(() => { showTeach() }, tPool.shift() * 1000)
        GD.sound.playTips(this.startTips.shift(), () => {
            opNode.destroy();
            this.startGame();
        })
    },

    //初始化游戏场景
    startGame() {
        GD.sound.setTipsButton(true);
        GD.root.setStarBoard(false);
        this.gameLayer = this.node.getChildByName('gameLayer');
        this.gameLayer.active = true;
        this.showGameLayer();
    },

    //展示游戏场景 
    showGameLayer() {
        let plane = this.gameLayer.getChildByName('plane');
        let layer = this.gameLayer.getChildByName('layer' + this.lv);
        layer.active = true;
        layer.getComponent('gameLayer').init(plane,this.node.getChildByName('icons'));
    },

    continueGame() {
        if (this.lv >= this.maxLv) {
            cc.YL.emitter.emit('gameEnd');
        } else {
            this.lv++;
            this.showGameLayer();
        }
    },
});
