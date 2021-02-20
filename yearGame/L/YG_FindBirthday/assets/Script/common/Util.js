/****************************************** 
通用方法
******************************************/
var Util = {
    /**
     * 销毁自身，同步
     * @param {cc.Node} pNode
     */
    destroySync(pNode) {
        pNode.removeFromParent();
        pNode.destroy();
    },

    /**
     * 销毁所有子节点，同步
     * @param {cc.Node} pNode
     */
    destroyAllChildrenSync(pNode) {
        var tmpChildren = pNode.children.map(x => { return x });
        tmpChildren.forEach(pChild => {
            pChild.removeFromParent();
            pChild.destroy();
        })
    },

    /**
     * 添加按钮，代码添加和编辑器添加效果一样
     * @param {cc.Node} pNode 
     * @param {String} funcName 
     * @param {String} codeName 
     * @param {cc.Node} codeNode 
     */
    addButtonEvent(pNode, funcName, codeName, codeNode) {
        var clickEventHandler = new cc.Component.EventHandler();
        clickEventHandler.target = codeNode;
        clickEventHandler.component = codeName;
        clickEventHandler.handler = funcName;
        //clickEventHandler.customEventData="";
        pNode.removeComponent(cc.Button);
        pNode.addComponent(cc.Button).clickEvents.push(clickEventHandler);
    },

    /**
     * 开启碰撞
     */
    openCollision() {
        var manager = cc.director.getCollisionManager();
        manager.enabled = true;
        //manager.enabledDebugDraw=true;
        //manager.enabledDrawBoundingBox=true;
    },

    /**
     * 初始化文本组件label的字体
     * @param {cc.Label} label 文本组件
     * @param {cc.Font} font 字体
     */
    initLabelFont(label, font) {
        //初始化字体
        font && (label.font = font)
        if (!label.font) return;
        //设置字体高度
        var fontHeight = 0;
        var fontDict = label.font._fntConfig.fontDefDictionary;
        for (let i in fontDict) {
            fontHeight = fontDict[i].rect.height;
            break;
        }
        label.lineHeight = fontHeight;
        //设置字体尺寸
        label.fontSize = label._bmFontOriginalSize;
    },

    /**
     * 限制范围在屏幕内，即不超出屏幕
     * @param {cc.Node} pNode 节点
     */
    limitRangeWithinScreen(pNode) {
        //获取此节点的实际尺寸
        var scale = this.getWorldScale(pNode);
        // var tmpNode = pNode;
        // var scale = cc.v2(pNode.scaleX, pNode.scaleY);
        // do {
        //     tmpNode = tmpNode.parent;
        //     if (tmpNode) {
        //         scale.x *= tmpNode.scaleX;
        //         scale.y *= tmpNode.scaleY;
        //     }
        // } while (tmpNode);
        //屏幕尺寸
        var pw = cc.winSize.width;
        var ph = cc.winSize.height;
        //获取节点极限坐标值
        var x_max = pw - pNode.width * (1 - pNode.anchorX) * scale.x;
        var x_min = pNode.width * pNode.anchorX * scale.x;
        var y_max = ph - pNode.height * (1 - pNode.anchorY) * scale.y;
        var y_min = pNode.height * pNode.anchorY * scale.y;
        var max = pNode.parent.convertToNodeSpaceAR(cc.v2(x_max, y_max));
        var min = pNode.parent.convertToNodeSpaceAR(cc.v2(x_min, y_min));
        x_max = max.x;
        x_min = min.x;
        y_max = max.y;
        y_min = min.y;
        //限制在屏幕内
        if (pNode.x > x_max) { pNode.x = x_max }
        if (pNode.x < x_min) { pNode.x = x_min }
        if (pNode.y > y_max) { pNode.y = y_max }
        if (pNode.y < y_min) { pNode.y = y_min }
    },

    /**
     * 获取世界尺寸
     * @param {cc.Node} pNode 节点
     */
    getWorldScale(pNode) {
        var tmpNode = pNode;
        var scale = cc.v2(pNode.scaleX, pNode.scaleY);
        do {
            tmpNode = tmpNode.parent;
            if (tmpNode) {
                scale.x *= tmpNode.scaleX;
                scale.y *= tmpNode.scaleY;
            }
        } while (tmpNode);
        return scale;
    },
}

export default Util;