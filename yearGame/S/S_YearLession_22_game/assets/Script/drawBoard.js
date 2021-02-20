const pType = cc.Enum({
    ROUND: 0,//圆形
    SEQ: 1,//正方形
    TRIANGLE: 2//三角形
});
let Line = cc.Class({
    name: "Line",
    properties: {
        sPoint: cc.v2(0, 0),
        ePoint: cc.v2(0, 0)
    }
})
cc.Class({
    extends: cc.Component,

    properties: {
        drawType: {
            default: pType.ROUND,
            type: pType,
            displayName: '画的图形类型',
        },
        linePool: {
            default: [],
            type: [Line],
            displayName: '多边形的所有边',
        },
    },

    // LIFE-CYCLE CALLBACKS:

    init(finshcb) {
        this.finshcb = finshcb;
        this.tx = this.node.getChildByName('tx');
        this.point = this.node.getChildByName('point');
        this.point_box = this.point.getComponent(cc.BoxCollider);
        cc.YL.tools.registerTouch(this.node, this.touchStart.bind(this), this.touchMove.bind(this), this.touchEnd.bind(this));

        this.startPos = this.point.position;
        this.point.active = true;
        //初始化绘制组件
        this.progress = this.node.getChildByName('progress').getComponent(cc.ProgressBar);
        this.drawPercent = 0;
    },

    touchStart(event) {
        //隐藏手
        this.point.active = true;
        this._touchPoint = null;

        //检测是否点击到了目标点
        let touchLoc = event.getLocation();
        if (!cc.Intersection.pointInPolygon(touchLoc, this.point_box.world.points)) {
            console.log("notHit!");
            return;
        }
        this._tStartP = this.node.parent.convertToNodeSpaceAR(event.touch._point);
        this._touchPoint = this.point;
    },

    touchMove(event) {
        if (!this._touchPoint) {
            return;
        }

        let pos = this.node.convertToNodeSpaceAR(event.touch._point);
        let angle = this.calculate(this._tStartP, pos);

        if (!this.checkIsClockwiseRotate(this._tStartP, pos)) {
            // 禁止逆时针
            return
        }

        pos = this.getPoint(this.node.position, pos, this.tx.width / 2);
        if (!pos) {
            return;
        }

        let percent = this.CalcAngle(this.startPos, cc.v2(0, 0), pos) / 360;
        if (percent > this.drawPercent + 0.5) {
            return;
        }

        this._touchPoint.setPosition(pos);
        this._tStartP = pos;
        this.setPercent(percent);
        this.drawPercent = percent;
    },

    touchEnd(event) {
        if (!this._touchPoint) {
            return;
        }
        this._touchPoint.setScale(1);
        this._touchPoint = null;
        return;
    },

    setPercent(percent) {
        this.progress.progress = percent;
        if (percent >= 0.98) {
            //画圆结束
            this.point.setPosition(this.startPos);
            this._touchPoint = null;
            this.progress.progress = 1;
            this.finshcb && this.finshcb();
        }
    },

    //获得圆上的点
    CalcQieDian(ptCenter, ptOutside, dbRadious) {
        //2点距离
        let dis = cc.YL.tools.getDisTance(ptCenter, ptOutside);
        //比例
        let t = dis / dbRadious;
        return cc.v2(ptOutside.x / t, ptOutside.y / t);
    },

    segmentIntersect(p0, p1, p2, p3) {
        var A1 = p1.y - p0.y,
            B1 = p0.x - p1.x,
            C1 = A1 * p0.x + B1 * p0.y,
            A2 = p3.y - p2.y,
            B2 = p2.x - p3.x,
            C2 = A2 * p2.x + B2 * p2.y,
            denominator = A1 * B2 - A2 * B1;

        // 如果分母为0 则平行或共线, 不相交  
        if (denominator == 0) {
            return null;
        }

        var intersectX = (B2 * C1 - B1 * C2) / denominator,
            intersectY = (A1 * C2 - A2 * C1) / denominator,
            rx0 = (intersectX - p0.x) / (p1.x - p0.x),
            ry0 = (intersectY - p0.y) / (p1.y - p0.y),
            rx1 = (intersectX - p2.x) / (p3.x - p2.x),
            ry1 = (intersectY - p2.y) / (p3.y - p2.y);

        /** 2 判断交点是否在两条线段上 **/
        // 交点在线段1上且交点也在线段2上  
        if (((rx0 >= 0 && rx0 <= 1) || (ry0 >= 0 && ry0 <= 1)) && ((rx1 >= 0 && rx1 <= 1) || (ry1 >= 0 && ry1 <= 1))) {
            return cc.v2(intersectX, intersectY)
        }
        else {
            return null;
        }
    },

    getPoint(ptCenter, ptOutside, width) {
        if (this.drawType == pType.ROUND) return this.CalcQieDian(ptCenter, ptOutside, width);

        //为了防止出现在矩形内的情况 手动放大直线
        ptOutside = cc.v2(ptOutside.x * 100, ptOutside.y * 100);
        //检测所有边是否和直线产生相交
        for (let i in this.linePool) {
            let point = this.segmentIntersect(this.linePool[i].sPoint, this.linePool[i].ePoint, ptCenter, ptOutside);
            if (point) {
                //有交点
                return point;
            }
        }
        return null;
    },

    CalcAngle(first, cen, second) {
        let dx1, dx2, dy1, dy2;
        let angle;

        dx1 = first.x - cen.x;
        dy1 = first.y - cen.y;

        dx2 = second.x - cen.x;

        dy2 = second.y - cen.y;

        let c = Math.sqrt(dx1 * dx1 + dy1 * dy1) * Math.sqrt(dx2 * dx2 + dy2 * dy2);

        if (c == 0) return -1;

        angle = Math.acos((dx1 * dx2 + dy1 * dy2) / c);
        angle = angle / Math.PI * 180;

        if (second.x < 0) {
            angle = 360 - angle
        }
        return angle;
    },

    //检测顺逆时针
    checkIsClockwiseRotate(sPoint, ePoint) {
        let rePoint = cc.v2(0, 0);
        let _isClockwiseRotate = (sPoint.x - rePoint.x) * (ePoint.y - rePoint.y) - (sPoint.y - rePoint.y) * (ePoint.x - rePoint.x);
        return _isClockwiseRotate < 0
    },


    calculate(p1, p2, p3 = cc.v2(0, 0)) {
        let a = cc.YL.tools.getDisTance(p2, p3);
        let b = cc.YL.tools.getDisTance(p1, p3);
        let c = cc.YL.tools.getDisTance(p1, p2);
        //console.log(a + "   " + b + "   " + c);


        let angleA = Math.acos((b * b + c * c - a * a) / (2 * b * c)) * 180 / Math.PI;
        let angleB = Math.acos((a * a + c * c - b * b) / (2 * a * c)) * 180 / Math.PI;
        let angleC = Math.acos((a * a + b * b - c * c) / (2 * a * b)) * 180 / Math.PI;

        //console.log(angleA + "   " + angleB + "   " + angleC);
        return angleC;
    },
});
