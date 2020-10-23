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
            return cc.tween().repeat(num, cc.tween().by(0.1, { angle: -pAngle }).by(0.1, { angle: pAngle }).by(0.1, { angle: pAngle }).by(0.1, { angle: -pAngle }))
        } else {
            return cc.tween().repeatForever(cc.tween().by(0.1, { angle: -pAngle }).by(0.1, { angle: pAngle }).by(0.1, { angle: pAngle }).by(0.1, { angle: -pAngle }))
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
        let action = cc.tween().parallel(cc.tween().by(0.1, { position: cc.v2(0, 50) }).by(0.1, { position: cc.v2(0, -50) }), cc.tween().to(0.1, { scaleX: maxX, scaleY: maxY }).to(0.1, { scaleX: midX, scaleY: midY }))
        if (num) {
            return cc.tween().repeat(num, action)
        } else {
            return cc.tween().repeatForever(action)
        }
    },

    //闪烁 1s2次
    blink() {
        let action = cc.tween().to(0.25, { opacity: 0 }).to(0.25, { opacity: 255 });
        return cc.tween().repeat(2, action)
    },

    /** 线性的位移函数，
     * 暂定为每100直线距离 默认耗时0.1秒
    */
    lineMove(startP, endP, dt = 0.1) {
        return cc.tween().to((cc.YL.tools.getDisTance(startP, endP) / 100) * dt, { position: endP })
    },

    /**上下晃动用于拖拽选项弹回*/
    SHAKING_Y: cc
        .tween()
        .by(0.1, { scaleX: 0.0265, scaleY: -0.04, y: -18 })
        .by(2 / 15, { scaleX: -0.0275, scaleY: 0.014, y: 23 })
        .by(2 / 15, { scaleX: 0.002, scaleY: -0.03, y: -9 })
        .by(4 / 15, { scaleX: -0.001, scaleY: 0.056, y: 6.2 })
        .by(11 / 30, { y: -2.2 }),

    /**左右晃动，用于点击选项错误效果*/
    SHAKING_X: cc
        .tween()
        .by(1 / 30, { x: -30.7 })
        .by(1 / 30, { x: 30.7 })
        .by(2 / 30, { x: 29 })
        .by(2 / 30, { x: -29 })
        .by(3 / 30, { x: -22.1 })
        .by(3 / 30, { x: 22.1 })
        .by(3 / 30, { x: 13.6 })
        .by(4 / 30, { x: -13.6 })
        .by(5 / 30, { x: -4.2 })
        .by(6 / 30, { x: 4.2 }),
}
