cc.Class({
    extends: cc.Component,

    properties: {
        maxOffsetAngle: { default: 10, displayName: "最大偏转角度" },
        isHorizontalDisk: { default: true, displayName: "是否有水平托盘" },
    },

    onLoad() {
        //横梁
        this.beam = this.node.getChildByName('beam');
        //秤盘
        this.disks = this.beam.getChildByName('disks');
        this.disk_arr = this.disks.children.map(x => { return x });
    },

    start() { },

    rotateBy(t, deltaAngle, cb) {
        cc.tween(this.beam)
            .by(t, { angle: deltaAngle })
            .call(() => { if (cb) cb() })
            .start();
        if (this.isHorizontalDisk) {
            this.disk_arr.forEach(disk => {
                cc.tween(disk).by(t, { angle: -deltaAngle }).start();
            })
        }
    },

    rotateTo(t, finalAngle, cb) {
        cc.tween(this.beam)
            .to(t, { angle: finalAngle })
            .call(() => { if (cb) cb() })
            .start();
        if (this.isHorizontalDisk) {
            this.disk_arr.forEach(disk => {
                cc.tween(disk).to(t, { angle: -finalAngle }).start();
            })
        }
    },

    /**
     * 
     * @param {*} maxTimes 最大摇晃次数
     * @param {*} maxAngle 最大摇晃角度
     * @param {*} maxInteval 最大摇晃间隔
     * @param {*} cb 
     */
    shake(maxTimes, maxAngle, maxInteval, cb) {
        var self = this;
        var times = 0;
        var angle = maxAngle;
        var inteval = maxInteval;
        var pA = maxAngle / maxTimes;
        var pI = maxInteval / maxTimes;
        function doShake() {
            self.rotateBy(inteval, angle, () => {
                self.rotateBy(2 * inteval, -2 * angle, () => {
                    self.rotateTo(inteval, 0, () => {
                        if (++times < maxTimes) {
                            angle -= pA;
                            inteval -= pI;
                            doShake();
                        } else {
                            if (cb) cb();
                        }
                    });
                })
            });
        }
        doShake();
    },

    /**
     * 摇晃后偏转
     * @param {*} dir 偏转方向 1：左，0：中，-1：右
     * @param {*} cb 
     */
    turnAfterShake(dir, cb) {
        this.shake(2, 0.3 * this.maxOffsetAngle, 0.2, () => {
            this.rotateTo(0.5, dir * this.maxOffsetAngle, cb);
        })
    },

    /**
     * 偏转
     * @param {*} dir 偏转方向 1：左，0：中，-1：右
     * @param {*} cb 
     */
    turn(dir, cb) {
        this.rotateTo(0.5, dir * this.maxOffsetAngle, cb);
    },
});