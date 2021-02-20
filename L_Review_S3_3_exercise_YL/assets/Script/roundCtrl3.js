let tipsData = require('Define').TIPSDATA;

cc.Class({
    extends: cc.Component,

    properties: {
        tips: {
            displayName: '问题语音',
            default: ''
        },
        gameTips: {
            displayName: '解说语音',
            default: ''
        },
        finishType: '',
        gameTipsData: [tipsData],
        hand:cc.Node
    },

    // LIFE-CYCLE CALLBACKS:

    init() {
        this.sliderProgress = 0;
        this._errorCount = 0;
        this.sliders = this.node.getChildByName('sliders');
        this.questionPool = cc.YL.tools.arrCopy(this.sliders.children);

        this.showTeach();
    },

    update(dt) {
        if (!this.isShowTeach) {
            return;
        }
        this.teachSliderProgress += 0.02;
        if (this.teachSliderProgress > 1.5) {
            this.teachSlider.progress = 0;
            this.teachSliderProgress = 0;
        }
        this.teachSlider.progress = (this.teachSliderProgress > 1 ? 1 : this.teachSliderProgress);
        let bg = this.teachSlider.node.getChildByName('Background');
        bg.scaleX = this.teachSlider.progress;
    },

    showTeach() {
        let touch = this.node.getChildByName('touch');
        let slider = this.questionPool[0].getComponent(cc.Slider);
        let bg = slider.node.getChildByName('Background');

        slider.active = true;
        this.teachSlider = slider;
        this.teachSliderProgress = 0;
        this.isShowTeach = true;

        GD.sound.setTipsButton(true);
        cc.YL.addClock(this.tips);
        GD.sound.setShowTips(this.tips, true, () => {
            if(this.isShowTeach){
                this.hand.active = false;
                this.isShowTeach = false;
                this.teachSlider.progress = 0;
                bg.scaleX = 0;
                this.showGame();
            }
        })
        cc.YL.unLockTouch();
    },

    showGame() {
        if (this.questionPool.length <= 0) {
            //游戏环节结束
            this.showFinishLayer();
            return;
        }
        this.sliderProgress = 0;
        let slider = this.questionPool.shift();
        slider.active = true;
    },

    siderCallback(slider) {
        // 回调的参数是 slider
        if(this.isShowTeach){
            this.hand.active = false;
            this.isShowTeach = false;
            this.teachSlider.progress = 0;
            this.showGame();
        }
        

        let bg = slider.node.getChildByName('Background');
        if (this.sliderProgress < slider.progress) {
            this.sliderProgress = slider.progress;
        } else {
            slider.progress = this.sliderProgress;
        }
        if (slider.progress > 0.95) {
            //此轮结束 
            let handle = slider.node.getChildByName('Handle');
            slider.progress = 1;
            slider.enabled = false;
            GD.root.showStar(slider.node, () => {
                handle.active = false;
                this.showGame();
            });
        }
        bg.scaleX = slider.progress;
    },

    setTouch(target, isShow) {
        target.getComponent(cc.Sprite).enabled = isShow;
        let nor = target.getChildByName('nor');
        let touch = target.getChildByName('touch');
        if (nor) nor.active = !isShow;
        if (touch) touch.active = isShow;
    },

    setError() {
        this._errorCount++;
        let maxErrCount = 3
        if (this._errorCount >= maxErrCount) {
            cc.YL.lockTouch();
            setTimeout(() => {
                if (cc.YL.tools.getIsWrongModel()) {
                    GD.sound.playTips('tipsWatch', () => {
                        this.showRightAnswer();
                    })
                } else {
                    this.showFinishLayer();
                }
            }, 1000);
        }
    },

    showRightAnswer() {
        this.setTouch(this.rightNode, true);
        GD.root.showStar(this.rightNode, () => {
            this.showFinishLayer();
        });
        cc.YL.lockTouch();
    },

    showFinishLayer() {
        cc.YL.lockTouch();
        cc.YL.emitter.emit('addWrongMes',this._errorCount);
        if (cc.YL.tools.getIsWrongModel()) {
            //错题模式 展示解说
            this.showGameTips(() => {
                GD.root.setStarBoard(true);
                GD.root.showAddStar(GD.root.getStarNum(this._errorCount), () => {
                    GD.root.setStarBoard(false);
                    this.node.active = false;
                    this.node.destroy();
                    cc.YL.emitter.emit('PASSLV');
                })
            })
        } else {
            GD.root.setStarBoard(true);
            GD.root.showAddStar(GD.root.getStarNum(this._errorCount), () => {
                GD.root.setStarBoard(false);
                this.node.active = false;
                this.node.destroy();
                cc.YL.emitter.emit('PASSLV');
            })
        }
    },

    showGameTips(cb) {
        cc.YL.lockTouch();
        if (this.finishType == 'action') {
            GD.sound.playTips(this.gameTips);
            cc.YL.qTeach.showGameTips(this.gameTipsData, () => {
                cb && cb();
            })
        } else {
            GD.sound.playTips(this.gameTips, () => {
                cb && cb();
            });
            cc.YL.qTeach.showGameTips(this.gameTipsData)
        }
    },
});
