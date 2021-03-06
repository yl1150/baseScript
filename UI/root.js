let FIT_TYPE = require('Define').FIT_TYPE;
let ICONTYPE = require('Define').ICONTYPE;

cc.Class({
    extends: cc.Component,

    properties: {
        starBoard: cc.Node,
        starNumLabel: cc.Label,
        isUpdateBGWidget: false,
        seqIconType: {
            default: ICONTYPE.default,
            type: ICONTYPE,
            displayName: 'icon类型',
        },
        screenFitType:{
            default: FIT_TYPE.NONE,
            type: FIT_TYPE,
            displayName: '背景适配方式',
        }
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        GD.root = this;
        this.sample = this.node.getChildByName('sample');
        this.star = this.node.getChildByName('star');
        this.back = this.node.getChildByName('back');
        this.loadSpine = this.node.getChildByName('loadSpine');
        this.loadSpine._spine = this.loadSpine.getComponent(sp.Skeleton);

        this.winSpine = this.node.getChildByName('winSpine');
        this.winSpine._spine = this.winSpine.getComponent(sp.Skeleton);
        this._touchImgPool = this.node.getChildByName('touchImgPool');

        this.starPool = new cc.NodePool();
        this.setStarBoard(false);


        this.questionBg = cc.find('Canvas/questionBg');

        let widget = this.questionBg.getComponent(cc.Widget);
        if (widget && this.isUpdateBGWidget && cc.YL.tools.checkIsphone()) {
            this.screenFit = this.questionBg.addComponent('screenFit');
            this.screenFit.fit();
            widget.enabled = true;
            widget.target = cc.find('Canvas');
            widget.top = 60;
            widget.bottom = 60;
            widget.updateAlignment();
        }

        if(this.screenFitType == FIT_TYPE.showALL){
            this.addComponent('screenFit');
        }
    },

    setSeqIcon(isShow, maxNum = 6) {
        if (!this._seqIcon) {
            cc.loader.loadRes('seqIcon/' + 'seqIcon', cc.Prefab, (err, _prefab) => {
                if (err) {
                    console.log(err);
                }
                var icon = cc.instantiate(_prefab);
                icon.parent = this.questionBg;
                icon.zIndex = -1;
                this._seqIcon = icon.getComponent('seqIcon')
                this._seqIcon.setType(this.seqIconType);
                this._seqIcon.setIcon(isShow, maxNum);
            });
            return;
        }
        this._seqIcon.setIcon(isShow, maxNum);
    },

    setStarBoard(isShow) {
        cc.gameConfig.isWX && (isShow = false);
        this.starBoard.active = isShow;
    },

    setQuestionBg(isShow) {
        this.questionBg.active = isShow;
        this.screenFit && this.screenFit.fit();
    },

    setBack(isShow) {
        if (!this.back) {
            return
        }
        isShow = false;
        this.back.active = isShow;
        this.back.opacity = 0;
        cc.tween(this.back)
            .to(0.5, { opacity: 255 })
            .start();
    },

    reFreshStar() {
        this.starNumLabel.string = GD.integral;
    },

    //展示加载进度条
    showLoading(midCallFunc, callFunc) {
        this.time1ID && clearTimeout(this.time1ID);
        this.time2ID && clearTimeout(this.time2ID);
        let loadSpine = this.loadSpine;
        loadSpine.active = true;
        loadSpine._spine.setToSetupPose();
        loadSpine._spine.setAnimation(0, "newAnimation", false);
        this.time1ID = setTimeout(() => {
            midCallFunc && midCallFunc();
        }, 2000);

        this.time2ID = setTimeout(() => {
            loadSpine.active = false;
            callFunc && callFunc();
        }, 4000)
    },

    showStar(original, callFunc,pscale = 3) {
        if (original.constructor == cc.Node) {
            let star = this.starPool.get();
            if (!star) {
                star = cc.instantiate(this.star);
            }
            star.setScale(pscale);
            star._partice = star.getChildByName('star').getComponent(cc.ParticleSystem);
            star.zIndex = 999;
            star.active = true;
            star.parent = this.star.parent;
            star._partice.resetSystem();
            GD.sound.playSound('star');
            setTimeout(() => {
                this.starPool.put(star);
                callFunc && callFunc();
            }, 1000)
            star.position = cc.YL.tools.getRelativePos(original, this.node);

        }
        if (original.constructor == Array) {
            GD.sound.playSound('star');
            for (let i in original) {
                let star = this.starPool.get();
                if (!star) {
                    star = cc.instantiate(this.star);
                }
                star.setScale(pscale);
                star._partice = star.getChildByName('star').getComponent(cc.ParticleSystem);
                star.zIndex = 999;
                star.active = true;
                star.parent = this.star.parent;
                star._partice.resetSystem();
                setTimeout(() => {
                    this.starPool.put(star);
                }, 1000)
                star.position = cc.YL.tools.getRelativePos(original[i], this.node);
            }
            setTimeout(() => {
                callFunc && callFunc();
            }, 1000);
        }
    },

    showWinSpine(callFunc) {
        let winSpine = this.winSpine;
        winSpine.active = true;
        winSpine._spine.setAnimation(0, "newAnimation", false);
        //GD.sound.playSound('star')
        setTimeout(() => {
            winSpine.active = false;
            callFunc && callFunc();
        }, 3000)
    },

    showAddStar(starNum, callFunc) {
        if (GD.isSetTime) {
            let time = cc.YL.stopTimeCount();//结束计时
            if (cc.gameConfig.isWX) {
                cc.YL.net.sendTimeAndStar(GD.roundID, time, starNum);
                cc.YL.startTimeCount();//重新计时
                callFunc && callFunc();
                return;
            }
            if (GD.isShowRecord) {
                cc.YL.net.sendSeqAndTime(GD.roundID, time)
            } else {
                cc.YL.net.sendTime(parseInt(time))
            }
            cc.YL.startTimeCount();//重新计时
        }

        this.starBoard.active = true;
        let skePool = this.starBoard.getChildByName('ske');
        skePool.active = true;
        let ske = skePool.getChildByName(starNum.toString());
        ske.active = true;
        ske.getComponent(sp.Skeleton).setAnimation(0, 'newAnimation', false);
        var board = this.starBoard.getChildByName('kuang');
        var starIcon = board.getChildByName('starIcon');
        setTimeout(() => {
            /* switch (starNum) {
                case 3:
                    GD.sound.playSound('right' + cc.YL.tools.randomNum(1, 2));
                    break;
                case 2:
                    GD.sound.playSound('right' + cc.YL.tools.randomNum(3, 4));
                    break;
                case 1:
                    GD.sound.playSound('right5');
                    break;
                default:
                    break;
            } */
            GD.sound.playSound('getStar');
            this.earnStar(this.node, starIcon, starNum, () => {
                this.starBoard.active = false;
                skePool.active = false;
                ske.active = false;
                callFunc && callFunc();
            });
        }, 500);
    },

    /**
    * 获得星星
    * @param {Vec2} starWorldpos 世界坐标
    * @param {Number} count 星星数
    * @param {Function} cb 完成后回调
    */
    earnStar(startPoint, endPoint, count, cb) {
        cc.YL.net.sendStarNum(count);
        GD.integral += parseInt(count);
        var maxLength = 150;
        var deltaAngle = 72;
        var starPos = cc.YL.tools.getRelativePos(startPoint, this.node);
        var endPos = cc.YL.tools.getRelativePos(endPoint, this.node);
        var angle_arr = cc.YL.tools.createWithContinueNumber(0, Math.floor(360 / deltaAngle) - 1);
        angle_arr = cc.YL.tools.randomOrder(angle_arr);
        angle_arr = angle_arr.map(x => { return x * deltaAngle });
        angle_arr.splice(count);
        function getBezierData(star) {
            let p1 = star.position;
            let p3 = endPos;
            let p2 = cc.v2(p1.x, p3.y);
            return [p1, p2, p3];
        }
        for (let i in angle_arr) {
            //创建星星
            let newStar = cc.instantiate(this.sample);
            newStar.active = true;
            newStar.setParent(this.node);
            newStar.setPosition(starPos);
            //散开位置
            let pAngle = angle_arr[i];
            let pLength = (Math.random() + 1) * maxLength * 0.5;
            let deltaX = pLength * Math.sin(pAngle);
            let deltaY = pLength * Math.cos(pAngle);
            if (pAngle < 180 && deltaX > 0) deltaX *= -1;
            if (pAngle > 90 && pAngle < 270 && deltaY > 0) deltaY *= -1;
            let tempPos = cc.v2(starPos.x + deltaX, starPos.y + deltaY);
            //星星散开
            let ske = newStar.getChildByName('ske');
            let skeCom = ske.getComponent(sp.Skeleton);
            skeCom.setAnimation(0, 'newAnimation_1', true);
            cc.tween(newStar)
                .to(0.7, { position: tempPos })
                .then(cc.bezierTo(0.8, getBezierData(newStar)))
                .call(() => {
                    this.reFreshStar();
                    if (i === '0') {
                        skeCom.setAnimation(0, 'newAnimation_2', false);
                        setTimeout(() => {
                            newStar.destroy();
                            if (cb) cb();
                        }, 500);
                    } else {
                        newStar.destroy();
                    }
                })
                .start();
        }
    },

    /**
    * 设置节点 触摸效果对应的图片 
    * @param {cc.Node} target 目标节点
    * @param {Number} type 触摸效果类型
    * 1:选项选择效果
    * 2:输入框选择效果
    */
    setTouchImg(target, type) {
        let originImg = this._touchImgPool.getChildByName('touchImg' + type);
        let img = cc.instantiate(originImg);
        target.addChild(img, -1, '_touchImg');
        img.position = cc.v2(0, 0);
        img.active = false;
        target._touchImg = img;
    },

    setLoadDataUI(isShow) {
        //this.node.getChildByName('loadingData').active = isShow;
    },

    getStarNum(eCount) {
        //统计星星数量
        let starNum = 3;
        if (eCount <= 0) {
            starNum = 3;
        } else if (eCount < 3) {
            starNum = 2;
        } else {
            starNum = 1;
        }
        return starNum;
    },
    // update (dt) {},
});
