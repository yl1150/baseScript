cc.Class({
    extends: cc.Component,

    properties: {
        maxLv: 4,
        machineSke: sp.Skeleton,
        endingAni: [cc.String]
    },


    start() {
        this.lv = 1;
        cc.YL.yearGame = this;
        cc.YL.lockTouch();
        this.gameLayer = this.node.getChildByName('gameLayer');
        this.box = this.gameLayer.getChildByName('box');
        this.moveList = this.gameLayer.getChildByName('moveList')
        GD.sound.playBGM();
        GD.sound.setTipsButton(false);
        GD.sound.playTips('startTips', () => {
            this.showOpening();
        })
        this.m_listArr = cc.YL.tools.arrCopy(this.moveList.children);
        this.t_listArr = cc.YL.tools.arrCopy(this.box.children);

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
        let opening = this.node.getChildByName('opening');
        let dd = opening.getChildByName('doudou').getComponent(sp.Skeleton);
        let sb = opening.getChildByName('shubao').getComponent(sp.Skeleton);
        dd.setAnimation(0, 'animation4', true);
        GD.sound.playTips('startTips2', () => {

            dd.setAnimation(0, 'animation3', true);
            sb.setAnimation(0, 'animation3', true);

            GD.sound.playTips('startTips3', () => {
                dd.setAnimation(0, 'animation4', true);
                sb.setAnimation(0, 'animation2', true);

                GD.sound.playTips('startTips4', () => {

                    dd.setAnimation(0, 'animation3', true);
                    sb.setAnimation(0, 'animation3', true);

                    GD.sound.playTips('startTips5', () => {
                        dd.setAnimation(0, 'animation3', true);
                        sb.setAnimation(0, 'animation2', true);
                        this.initGameLayer();
                        this.showMoveLayer(() => {
                            this.showGameLayer();
                            opening.active = false;
                            opening.destroy();
                        });
                    })
                })
            })
        })
    },

    showMoveLayer(cb) {
        cc.tween(this.node)
            .by(2, { x: -2480 })
            .call(() => {
                cb && cb();
            })
            .start()
    },

    //展示过场动画
    showPassLvAni(isTransition, func) {


    },

    initGameLayer() {
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

    //展示游戏场景
    showGameLayer() {
        //初始化
        this.machineSke.setAnimation(0, 'animation5', false);
        GD.root.setStarBoard(false);
        cc.YL.emitter.emit('startGame');
    },

    //展示结束时的动画
    showEnding(cb) {
        this.machineSke.setAnimation(0, this.endingAni.shift(), false);
        this.machineSke.setCompleteListener(() => {
            this.machineSke.setCompleteListener(null);

            this.box.active = true;
            let m_list = this.m_listArr.shift();
            let t_list = this.t_listArr.shift();

            m_list.active = true;
            t_list.active = true;

            let m_listArr = cc.YL.tools.arrCopy(m_list.children);
            let t_listArr = cc.YL.tools.arrCopy(t_list.children);;

            for (let i in m_listArr) {
                let pos = cc.YL.tools.getRelativePos(m_listArr[i], t_listArr[i]);

                m_listArr[i].setParent(t_listArr[i]);
                m_listArr[i].setPosition(pos.x, pos.y);
                cc.tween(m_listArr[i])
                    .to(0.5, { position: cc.v2(0, 0) })
                    .start()
            }
            cc.YL.timeOut(() => {
                m_list.destroy();
                t_list.destroy();
                this.box.active = false;
                cb && cb();
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
            this.initGameLayer();
            this.showEnding(() => {
                this.showGameLayer();
            })
        }
    },
});
