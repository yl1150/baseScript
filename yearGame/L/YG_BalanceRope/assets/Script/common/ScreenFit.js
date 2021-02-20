/**
 * 屏幕适配
 */
const kFitMode = cc.Enum({
    /**
     * 自动缩放
     */
    AUTO_SCALE: 1,
    /**
     * 不缩放
     */
    NO_SCALE: 2,
})

var ScreenFit = {
    /**
     * 适配方式
     */
    FitMode: kFitMode,

    /**
     * 屏幕适配模式
     */
    _fitMode: kFitMode.NO_SCALE,

    /**
     * 适配屏幕
     */
    fitScreen(fitMode) {
        if (fitMode) this._fitMode = fitMode;
        switch (this._fitMode) {
            case kFitMode.AUTO_SCALE:
                this.autoScale();
                break;
            case kFitMode.NO_SCALE:
                this.noScale();
                break;

            default:
                break;
        }
    },

    /**
     * 自动缩放
     * @param {cc.Node} pNode 目标节点（如空，默认是当前场景的base缩放）
     */
    autoScale(pNode) {
        if (!pNode) pNode = cc.director.getScene().getChildByName('Canvas');
        var winRatio = cc.winSize.width / cc.winSize.height;
        var pBase = pNode.getChildByName('base');
        if (pBase) {
            var baseRatio = pBase.width / pBase.height;
            var pScale = 1;
            if (winRatio >= baseRatio) pScale = baseRatio / winRatio;
            pBase.setScale(pScale, pScale);
        }
    },

    /**
     * 不缩放
     * @param {cc.Node} pNode 目标节点（如空，默认是当前场景的base缩放）
     */
    noScale(pNode) {
        if (!pNode) pNode = cc.director.getScene().getChildByName('Canvas');
        var pBase = pNode.getChildByName('base');
        if (pBase) pBase.setScale(1, 1);
    },
}

export default ScreenFit;