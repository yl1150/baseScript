/**
 * 动作扩展
 */
var ActionBase = {
    /**
     * 摇一摇（默认：次数2，时间间隔0.1，角度30）
     * @param {cc.Node} pNode 动作对象
     * @param {number} count 摇晃次数（默认2）
     * @param {number} interval 时间间隔（默认0.1）
     * @param {number} degree 摇晃角度（默认30）
     * @param {function} endCallback 完成后回调
     */
    shake(pNode, count = 2, interval = 0.1, degree = 30, endCallback) {
        var mainTween = cc.tween()
            .to(interval, { angle: degree })
            .to(interval * 2, { angle: -degree })
            .to(interval, { angle: 0 });
        if (count === 0) {
            cc.tween(pNode).repeatForever(mainTween).start();
            return;
        }
        cc.tween(pNode)
            .repeat(count, mainTween)
            .call(() => { if (endCallback) { endCallback(); } })
            .start();
    },

    /**
     * 左右振动（默认：次数2，时间间隔0.05s，左右幅度10像素）
     * @param {cc.Node} pNode 动作对象
     * @param {number} count 振动次数（默认2）
     * @param {number} interval 时间间隔（默认0.05）
     * @param {number} deltaX 振动幅度（像素，默认10）
     * @param {function} endCallback 完成后回调
     */
    vibrate(pNode, count = 2, interval = 0.05, deltaX = 10, endCallback) {
        var pos = pNode.position;
        var mainTween = cc.tween()
            .by(interval, { position: cc.v2(deltaX, 0) })
            .by(interval * 2, { position: cc.v2(-2 * deltaX, 0) })
            .to(interval, { position: pos });
        if (count === 0) {
            cc.tween(pNode).repeatForever(mainTween).start();
            return;
        }
        cc.tween(pNode)
            .repeat(count, mainTween)
            .call(() => { if (endCallback) { endCallback(); } })
            .start();
    },

    /**
     * 缩放(默认：次数2次，时间间隔0.1，最大尺寸1.3)
     * @param {cc.Node} pNode 动作对象
     * @param {number} count 缩放次数（默认2）
     * @param {number} interval 间隔时间s（默认0.1）
     * @param {number} maxScale 最大尺寸（默认1.3）
     * @param {function} endCallback 完成后回调
     */
    scaleRepeat(pNode, count = 2, interval = 0.1, maxScale = 1.3, endCallback) {
        var mainTween = cc.tween()
            .to(interval, { scale: maxScale })
            .to(interval, { scale: 1 })
        if (count === 0) {
            cc.tween(pNode).repeatForever(mainTween).start();
            return;
        }
        cc.tween(pNode)
            .repeat(count, mainTween)
            .call(() => { if (endCallback) { endCallback(); } })
            .start();
    },

    /**
     * 节点跟随另一个节点（位移），即相对位置不变
     * @param {cc.Node} pNode 需要主动去跟随别人的节点
     * @param {cc.Node} target 目标节点，被跟随
     */
    follow(pNode, target) {
        var worldpos_pNode = pNode.convertToWorldSpaceAR(cc.v2(0, 0));
        var worldpos_target = target.convertToWorldSpaceAR(cc.v2(0, 0));
        var posToTarget = worldpos_pNode.sub(worldpos_target);
        target.on(cc.Node.EventType.POSITION_CHANGED, function () {
            worldpos_target = target.convertToWorldSpaceAR(cc.v2(0, 0));
            worldpos_pNode.x = worldpos_target.x + posToTarget.x;
            worldpos_pNode.y = worldpos_target.y + posToTarget.y;
            var pos_pNode = pNode.parent.convertToNodeSpaceAR(worldpos_pNode);
            pNode.setPosition(pos_pNode);
        }, this);
    },

    /**
     * 取消跟随
     * @param {cc.Node} target 目标节点，被跟随
     */
    unfollow(target) {
        target.off(cc.Node.EventType.POSITION_CHANGED);
    },
}

export default ActionBase;