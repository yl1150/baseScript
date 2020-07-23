module.exports = {

    //抛物线
    /* ParabolaTo(t, startPoint, endPoint, height = 0, angle = 60) {
        // 把角度转换为弧度
        var radian = angle * 3.14159 / 180.0;
        // 第一个控制点为抛物线左半弧的中点
        var q1x = startPoint.x + (endPoint.x - startPoint.x) / 4.0;
        var q1 = cc.v2(q1x, height + startPoint.y + Math.cos(radian) * q1x);
        // 第二个控制点为整个抛物线的中点
        var q2x = startPoint.x + (endPoint.x - startPoint.x) / 2.0;
        var q2 = cc.v2(q2x, height + startPoint.y + Math.cos(radian) * q2x);
        //曲线配置
        var cfg = [q1, q2, endPoint];
        //使用CCEaseInOut让曲线运动有一个由慢到快的变化，显得更自然
        return cc.bezierTo(t, cfg);
    }, */

    //缩放效果
    zoomAction(num = null, sx = null, sy = null) {
        if (!sx) {
            sx = 1;
        }
        if (!sy) {
            sy = sx;
        }
        let maxX = sx * 1.2;
        let minX = sx * 0.8;
        let midX = (maxX + minX) / 2;

        let maxY = sy * 1.2;
        let minY = sy * 0.8;
        let midY = (maxY + minY) / 2;

        if (num) {
            return cc.tween().repeat(
                num,
                cc.tween()
                    .to(0.1, { scaleX: maxX, scaleY: maxY })
                    .to(0.1, { scaleX: midX, scaleY: midY })
                    .to(0.1, { scaleX: minX, scaleY: minY })
                    .to(0.1, { scaleX: midX, scaleY: midY })
            )
        } else {
            return cc.tween().repeatForever(
                cc.tween()
                    .to(0.1, { scaleX: maxX, scaleY: maxY })
                    .to(0.1, { scaleX: midX, scaleY: midY })
                    .to(0.1, { scaleX: minX, scaleY: minY })
                    .to(0.1, { scaleX: midX, scaleY: midY })
            )
        }
    },

    //摇晃
    shakeAction(num, pAngle = 30) {
        if (num) {
            return cc.tween().repeat(num, cc.tween().to(0.1, { angle: -pAngle }).to(0.1, { angle: pAngle }).to(0.1, { angle: pAngle }).to(0.1, { angle: 0 }))
        } else {
            return cc.tween().repeatForever(cc.tween().to(0.1, { angle: -pAngle }).to(0.1, { angle: pAngle }).to(0.1, { angle: pAngle }).to(0.1, { angle: -pAngle }))
        }
    },

    jump(num) {
        if (num) {
            return cc.tween().repeat(num, cc.tween().by(0.1, { position: cc.v2(0, 50) }).by(0.1, { position: cc.v2(0, -50) }))
        } else {
            return cc.tween().repeatForever(cc.tween().by(0.1, { position: cc.v2(0, 50) }).by(0.1, { position: cc.v2(0, -50) }))
        }
    },

    jumpAndZoom(num, sx, sy) {
        if (!sx) {
            sx = 1;
        }
        if (!sy) {
            sy = sx;
        }
        let maxX = sx * 1.2;
        let minX = sx * 0.8;
        let midX = (maxX + minX) / 2;

        let maxY = sy * 1.2;
        let minY = sy * 0.8;
        let midY = (maxY + minY) / 2;
        let action = cc.tween().parallel(cc.tween().by(0.1, { position: cc.v2(0, 50) }).by(0.1, { position: cc.v2(0, -50) }),cc.tween().to(0.1, { scaleX: maxX, scaleY: maxY }).to(0.1, { scaleX: midX, scaleY: midY }))
        if (num) {
            return cc.tween().repeat(num,action)
        } else {
            return cc.tween().repeatForever(action)
        }
    },

    blink() {
        return cc.tween().to(2, { opacity: 0 })
    },

    /** 线性的位移函数，
     * 暂定为每100直线距离 默认耗时0.1秒
    */
    lineMove(startP, endP, dt = 0.1) {
        return cc.tween().to((cc.YL.tools.getDisTance(startP, endP) / 100) * dt, { position: endP })
    },
}
