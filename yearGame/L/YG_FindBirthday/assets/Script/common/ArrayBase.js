/**
 * 数组扩展
 */
var ArrayBase = {
    /**
     * 数组去重（不改变原数组）
     * @param {cc.Array} arr 
     */
    removeRepeat(arr) {
        var result = [];
        for (var i = 0; i < arr.length; i++) {
            if (result.indexOf(arr[i]) < 0) result.push(arr[i]);
        }
        return result;
    },

    /**
     * 随机排序（不改变原数组）
     * @param {cc.Array} arr 
     */
    randomOrder(arr) {
        var result = arr.map((x) => { return x });
        result = result.sort(() => Math.random() - 0.5);
        return result;
    },

    /**
     * 调元素位置（不改变原数组）
     * @param {cc.Array} arr 
     * @param {number} index1 
     * @param {number} index2 
     */
    swapOrder(arr, index1, index2) {
        var result = arr.map(x => { return x });
        result[index1] = result.splice(index2, 1, result[index1])[0];
        return result;
    },

    /**
     * 从小排序，根据因子（不改变原数组）
     * @param {cc.Array} arr 数组(元素必须是对象)
     * @param {string} factor 排序的因素(该因素对应的值必须是数字)
     * @example arr=[node1,node2];node1[factor]=13;node2[factor]=6;结果就是[node2,node1]
     */
    reorderFromMin(arr, factor) {
        var result = arr.map((x) => { return x });
        result.sort((a, b) => a[factor] - b[factor]);
        return result;
    },

    /**
     * 从大排序，根据因子（不改变原数组）
     * @param {cc.Array} arr 数组(元素必须是对象)
     * @param {string} factor 排序的因素(该因素对应的值必须是数字)
     * @example arr=[node1,node2];node1[factor]=13;node2[factor]=6;结果就是[node1,node2]
     */
    reorderFromMax(arr, factor) {
        var result = this.reorderFromMin(arr, factor);
        result.sort((a, b) => b[factor] - a[factor]);
        return result;
    },

    /**
     * 创建连续数字的数组
     * @param {number} start 
     * @param {number} end 
     */
    createWithContinueNumber(start, end) {
        var tmp = null;
        if (start > end) {
            tmp = start;
            start = end;
            end = tmp;
        }
        var result = Array.from(new Array(end + 1).keys()).slice(start);
        if (tmp) result.reverse();
        return result;
    },
}

export default ArrayBase;