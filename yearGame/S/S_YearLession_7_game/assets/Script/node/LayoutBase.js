/**
 * Layout排列组件扩展
 */
cc.Class({
    extends: cc.Component,

    editor: CC_EDITOR && {
        executeInEditMode: true,
        requireComponent: cc.PolygonCollider,//依赖组件
    },

    properties: {
        tight: { default: true, tooltip: '内容紧凑收缩，默认自动收缩' },
    },

    onLoad() {
        this.colCom = this.node.getComponent(cc.PolygonCollider);
    },

    onEnable() {
        //开启碰撞
        cc.director.getCollisionManager().enabled = true;
        this.point_arr = this.colCom.points;
        this.posCount = this.point_arr.length;//位置数（不允许子节点个数超过这个数值）
        this.item_arr = this.node.children.map((x) => { return x });
        //位置对应放好
        for (let i in this.node.children) {
            if (this.point_arr[i]) this.node.children[i].setPosition(this.point_arr[i]);
        }
        //注册事件
        this.node.on(cc.Node.EventType.CHILD_ADDED, this._addChild, this);
        this.node.on(cc.Node.EventType.CHILD_REMOVED, this._removeChild, this);
        this.node.on(cc.Node.EventType.CHILD_REORDER, this._reorderChild, this);
    },

    onDisable() {
        //注销事件
        this.node.off(cc.Node.EventType.CHILD_ADDED);
        this.node.off(cc.Node.EventType.CHILD_REMOVED);
        this.node.off(cc.Node.EventType.CHILD_REORDER);
    },

    start() { },

    _addChild(child) {
        if (this.tight) {
            let pos = this.point_arr[this.node.childrenCount - 1];
            if (pos) child.setPosition(pos);
        } else {
            for (let i = 0; i < this.posCount; i++) {
                if (!this.item_arr[i]) {
                    this.item_arr[i] = child;
                    if (this.point_arr[i]) this.item_arr[i].setPosition(this.point_arr[i]);
                    break;
                }
            }
        }
    },

    _removeChild(child) {
        if (this.tight) {
            for (let i in this.node.children) {
                if (this.point_arr[i]) this.node.children[i].setPosition(this.point_arr[i]);
            }
        } else {
            let removeIndex = this.item_arr.indexOf(child);
            if (removeIndex > -1) { this.item_arr[removeIndex] = null; }
        }
    },

    _reorderChild(containerNode) {
        if (this.tight) {
            for (let i in this.node.children) {
                if (this.point_arr[i]) this.node.children[i].setPosition(this.point_arr[i]);
            }
        } else {
            //不收紧，位置就和index没关系了
        }
    },

    /**
     * 交换位置，参数是两个子节点
     * @param {cc.Node} node1 
     * @param {cc.Node} node2 
     */
    swapPosition(node1, node2) {
        if (node1.isChildOf(this.node) && node2.isChildOf(this.node)) {
            if (this.tight) {
                let oldIndex1 = node1.getSiblingIndex();
                let oldIndex2 = node2.getSiblingIndex();
                node1.setSiblingIndex(oldIndex2);
                node2.setSiblingIndex(oldIndex1);
            } else {
                let oldIndex1 = this.item_arr.indexOf(node1);
                let oldIndex2 = this.item_arr.indexOf(node2);
                node1.setPosition(this.point_arr[oldIndex2]);
                node2.setPosition(this.point_arr[oldIndex1]);
            }
        }
    },
});