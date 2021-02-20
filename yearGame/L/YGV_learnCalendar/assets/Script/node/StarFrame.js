cc.Class({
    extends: cc.Component,

    properties: {},

    onLoad() {
        cc.origin.Note.script_star = this;
        //初始化
        this.base = this.node.getChildByName('base');
        this.base.active = true;
        this.base.children.forEach(x => { x.active = false })

        this.frame = this.base.getChildByName('frame');
        this.frame.getComponent(cc.Widget).updateAlignment();
        this.starIcon = this.frame.getChildByName('starIcon');
        this.starNum = this.frame.getChildByName('starNum');
        this.labelCom_starNum = this.starNum.getComponent(cc.Label);

        this.sample = this.base.getChildByName('sample');

        this.grey = this.base.getChildByName('grey');

        this.winSpines = this.base.getChildByName('winSpines');
        this.winSpines.children.forEach(x => { x.active = false })
        this.setVisible(false);
    },

    start() {
        //设置星星个数
        this.setStarNum(cc.origin.Network.integral);
    },

    setVisible(isVisible = true) {
        if (cc.gameConfig.isWechatMini && isVisible) return;
        this.frame.active = isVisible;
    },

    setStarNum(num = 0) {
        this.labelCom_starNum.string = num;
        cc.origin.Note.starNum = num;
    },

    /**
     * 获得星星
     * @param {Vec2} starWorldpos 世界坐标
     * @param {Number} count 星星数
     * @param {Function} cb 完成后回调
     */
    earnStar(starWorldpos, count, cb) {
        this.setVisible(true);
        cc.origin.Note.starNum += count;//刷新星星保存数据
        cc.origin.AudioBase.play('earnStar');//散开音效
        if (cc.gameConfig.isWechatMini) {
            //刷新星星数显示
            this.labelCom_starNum.string = cc.origin.Note.starNum;
            //向后端发送添加星星数
            var roundId = cc.origin.Note.roundId;
            var time = Math.floor(cc.origin.Note.sliceTime);
            var starNum = count;
            cc.origin.Network.sendTimeAndStar(roundId, time, starNum);
            cc.origin.Note.sliceTime = 0;//重置时间
        } else {
            //飞星星
            var maxLength = 150;
            var deltaAngle = 72;
            var starPos = this.base.convertToNodeSpaceAR(starWorldpos);
            var endworldpos = this.starIcon.convertToWorldSpaceAR(cc.v2(0, 0));
            var endPos = this.base.convertToNodeSpaceAR(endworldpos);
            var angle_arr = cc.origin.ArrayBase.createWithContinueNumber(0, Math.floor(360 / deltaAngle) - 1);
            angle_arr = cc.origin.ArrayBase.randomOrder(angle_arr);
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
                newStar.setParent(this.base);
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
                        if (i === '0') {
                            skeCom.setAnimation(0, 'newAnimation_2', false);
                            setTimeout(() => {
                                cc.origin.Util.destroySync(newStar);
                                if (cb) cb();
                            }, 500);
                            //刷新星星数显示
                            this.labelCom_starNum.string = cc.origin.Note.starNum;
                        } else {
                            cc.origin.Util.destroySync(newStar);
                        }
                    })
                    .start();
            }
            cc.origin.Network.sendStarNum(count);
        }
    },

    /**
     * 显示胜利动画
     * @param {Number} spineId 动画id
     * @param {Function} cb 结束回调
     */
    showWin(spineId = 0, cb) {
        this.winSpines.active = true;
        this.grey.active = true;
        //位置
        var widgetCom_win = this.winSpines.getComponent(cc.Widget);
        // widgetCom_win.target = cc.find('Canvas');
        widgetCom_win.target = cc.find('Root');
        widgetCom_win.updateAlignment();
        //动画
        if (spineId <= 0 || spineId > this.winSpines.childrenCount) {
            spineId = cc.origin.MathBase.random(1, this.winSpines.childrenCount);
        }
        var ske = this.winSpines.getChildByName('' + spineId);
        ske.active = true;
        var skeCom = ske.getComponent(sp.Skeleton);
        skeCom.setAnimation(0, 'newAnimation', false);
        setTimeout(() => {
            ske.active = false;
            this.grey.active = false;
            if (cb) cb();
        }, 2000);
    },

    /**
     * 获取星星数，根据错误次数
     * @param {Number} mistakeCount 错误次数
     * @param {Boolean} canPlayVoice 可以播语音
     */
    getStarNumByMistakeCount(mistakeCount, canPlayVoice = true) {
        var starNum = 0;
        if (mistakeCount === 0) {
            starNum = 3;
            // if (canPlayVoice) cc.origin.AudioBase.play('correct' + cc.origin.MathBase.random(1, 2));
        } else if (mistakeCount >= 3) {
            starNum = 1;
            // if (canPlayVoice) cc.origin.AudioBase.play('correct5');
        } else {
            starNum = 2;
            // if (canPlayVoice) cc.origin.AudioBase.play('correct' + cc.origin.MathBase.random(3, 4));
        }

        return starNum;
    },
});