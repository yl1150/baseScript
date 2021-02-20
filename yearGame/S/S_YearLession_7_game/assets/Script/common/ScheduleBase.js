/****************************************** 
计划表
******************************************/
var ScheduleBase = {
    /**
     * 延时标识数组
     */
    timeout_arr: [],
    /**
     * 循环标识数组
     */
    interval_arr: [],

    /**
     * 延时执行
     * @param {Function} cb 回调
     * @param {Number} delay 延时，秒
     */
    addTimeout(cb, delay) {
        var tag = setTimeout(() => {
            if (cb) cb();
            this.removeTimeoutByTag(tag);
        }, delay * 1000);
        this.timeout_arr.push(tag);
        return tag;
    },

    /**
     * 循环执行
     * @param {Function} cb 回调
     * @param {Number} interval 间隔时间，秒
     * @param {Number} repeat 执行次数（默认0，一直循环）
     */
    addInterval(cb, interval, repeat = 0) {
        var count = 0;
        if (cb) cb();//立即执行
        var tag = setInterval(() => {
            if (cb) cb();
            if (repeat && ((count++) < repeat)) this.removeIntervalByTag(tag);
        }, interval * 1000);
        this.interval_arr.push(tag);
        return tag;
    },

    /**
     * 清除延时
     * @param {*} tag 延时标识
     */
    removeTimeoutByTag(tag) {
        var tempIndex = this.timeout_arr.indexOf(tag);
        if (tempIndex >= 0) {
            clearTimeout(tag);
            this.timeout_arr.splice(tempIndex, 1);
        }
    },

    /**
     * 清除循环
     * @param {*} tag 循环标识
     */
    removeIntervalByTag(tag) {
        var tempIndex = this.interval_arr.indexOf(tag);
        if (tempIndex >= 0) {
            clearInterval(tag);
            this.interval_arr.splice(tempIndex, 1);
        }
    },

    /**
     * 清除所有延时（用了addTimeout方法的延时）
     */
    removeAllTimeout() {
        this.timeout_arr.forEach(tag => {
            clearTimeout(tag);
        })
        this.timeout_arr = [];
    },

    /**
     * 清除所有循环（用了addInterval方法的循环）
     */
    removeAllInterval() {
        this.interval_arr.forEach(tag => {
            clearInterval(tag);
        })
        this.interval_arr = [];
    },
}

export default ScheduleBase;