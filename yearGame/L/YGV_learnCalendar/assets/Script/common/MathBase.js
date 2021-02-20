/**
 * 数学扩展
 */
var MathBase = {
    /**
     * 随机整数（默认相邻两次可重复）
     * @param {Number} pMin 
     * @param {Number} pMax 
     * @param {Boolean} canRepeat 可重复（默认true）
     * @example MathBase.random(0,10);//0~10之间整数
     */
    random(pMin, pMax, canRepeat = true) {
        if (canRepeat) this.lastRandNum = null;
        if (pMin > pMax) {//交换数值
            var tmp = pMin;
            pMin = pMax;
            pMax = tmp;
        }
        function rand(pMin, pMax) {
            var num = Math.round(pMin + Math.random() * (pMax - pMin));
            if (num < pMin) ++num;
            if (num > pMax) --num;
            return num;
        }
        var result = null;
        var delta = Math.floor(pMax) - Math.ceil(pMin);
        if (delta < 0) {
            console.log('两数之间无整数，无法随机');
        } else if (delta === 0) {
            result = Math.floor(pMax);
        } else {
            do {
                result = rand(pMin, pMax);
            } while (result === this.lastRandNum);
        }
        this.lastRandNum = result;
        return result;
    },
}

export default MathBase;