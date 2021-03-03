cc.Class({
    extends: cc.Component,
    properties: {
        anglePreDirQuadrant: 23,//每个象限的大小
        fixedPoint: cc.Node,
        movePoint: cc.Node,
        movePointMoveRadius = 100
    },

    onLoad() {
        let touchID;//触摸事件ID（多点触控）
        let touchArea;//触摸区域大小
        let joystickInputDir;

        let fixedPointMoveCenterPos;//固定点移动中心
        let fixedPointMoveRadius;//固定点移动半径
        let movePointMoveCenterPos;//移动点移动中心
        let nodeSize = this.node.getContentSize();
        this.touchArea = new cc.Vec2(nodeSize.width, nodeSize.height);


        //固定点位置范围
        this.fixedPointMoveCenterPos = this.touchArea.divƒ;
        this.fixedPointMoveRadius = this.touchArea.x / 2 - this.movePointMoveRadius;


        this.node.on(cc.Node.EventType.TOUCH_START, function (event) {
            if (this.touchID == -1) {
                //触摸位置
                let touchStartPos = event.getLocation()
                let _pos = new cc.Vec2(touchStartPos.x, touchStartPos.y)
                _pos.subSelf(this.node.position)


                //控制位置
                let pos = this.clampPos(_pos, this.fixedPointMoveCenterPos, this.fixedPointMoveRadius)
                this.movePointMoveCenterPos = pos;
                //设置固定点位置
                this.setFixedPointPos(pos)
                this.setMovePointPos(pos)
                this.touchID = event.getID()
            }
        }, this)


        this.node.on(cc.Node.EventType.TOUCH_MOVE, function (event) {
            if (this.touchID == event.getID()) {
                //触摸位置
                let nowPos = event.getLocation()
                let _pos = new cc.Vec2(nowPos.x, nowPos.y)
                _pos.subSelf(this.node.position)


                //控制位置
                let pos = this.clampPos(_pos, this.movePointMoveCenterPos, this.movePointMoveRadius)
                //设置固定点位置
                this.setMovePointPos(pos)
            }
        }, this)


        this.node.on(cc.Node.EventType.TOUCH_END, function (event) {
            this.init()
        }, this)


        this.node.on(cc.Node.EventType.TOUCH_CANCEL, function (event) {
            this.init()
        }, this)


        this.init();
    },


    /**
     * 初始化
     */
    init() {
        this.touchID = -1;
        this.joystickInputDir = new cc.Vec2()

        this.setFixedPointPos(this.fixedPointMoveCenterPos)
        this.setMovePointPos(this.fixedPointMoveCenterPos)
    },


    /**
     * 设置固定点位置
     */
    setFixedPointPos(pos) {
        this.fixedPoint.setPosition(pos)
    },


    /**
     * 获取固定点位置
     */
    getFixedPointPos() {
        return this.fixedPoint.getPosition()
    },


    /**
     * 设置移动点位置
     */
    setMovePointPos(pos) {
        this.movePoint.setPosition(pos)
    },


    /**
     * 获取移动点位置
     */
    getMovePointPos() {
        return this.movePoint.getPosition()
    },


    /**
     * 圆形限制，防止溢出
     * @param pos 需要固定位置
     * @param centerPos 限制中心位置
     * @param radius 限制半径
     */
    clampPos(pos, centerPos, radius) {
        let dpos = pos.sub(centerPos)
        if (dpos.mag() > radius) {
            return dpos.normalize().mul(radius).add(centerPos)
        } else {
            return pos;
        }
    },


    /**
     * 获取摇杆输入方向
     */
    getInputDir() {
        let dir = this.movePoint.getPosition().sub(this.fixedPoint.getPosition())
        if (dir.mag() > 0) {
            dir.normalizeSelf()
        }
        return dir;
    },


    /**
     * 获取摇杆象限输入方向（轴）
     */
    getInputQuadrantDir() {
        return this.getVec2ByQuadrant(this.getDirQuadrant(this.getInputDir()))
    },


    /**
     * 获取方向所在象限
     * @param vec 方向
     */
    getDirQuadrant(vec) {
        let dirQuadrant = null;


        if (vec.mag() > 0) {
            //非零向量
            dirQuadrant = Math.floor(this.getAngleByVec2(vec) / this.anglePreDirQuadrant)
        }


        //console.log(this.getAngleByVec2(vec),dirQuadrant)
        return dirQuadrant;
    },


    /**
     * 二维方向获取角度
     * @param vec 方向
     */
    getAngleByVec2(vec) {
        return -(Math.atan2(vec.y, vec.x) * 2 / Math.PI) + this.anglePreDirQuadrant / 2;//this.anglePreDirQuadrant/2 用于旋转坐标系
    },


    /**
     * 角度获取二位方向
     * @param angle 
     */
    getVec2ByAngle(angle) {
        let dir = new cc.Vec2()
        let rad = (this.anglePreDirQuadrant / 2 - angle) * (Math.PI / 180)//this.anglePreDirQuadrant/2 用于旋转坐标系
        dir.x = Math.cos(rad)
        dir.y = Math.sin(rad)
        return dir.normalizeSelf()
    },


    /**
     * 根据方向象限获取角度
     * @param dirQuadrant 
     */
    getVec2ByQuadrant(dirQuadrant) {
        if (dirQuadrant != null) {
            let angle = dirQuadrant * this.anglePreDirQuadrant;
            //获取象限的中心轴向
            angle += this.anglePreDirQuadrant / 2;


            return this.getVec2ByAngle(angle)
        } else {
            return cc.Vec2.ZERO;
        }
    },

})
