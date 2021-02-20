var EventDefine = {
    /**
     * 常用
     */
    COMMON: cc.Enum({
        /**
         * 游戏开始
         */
        GAME_START: "game_start",

        /**
         * 游戏结束
         */
        GAME_OVER: "game_over",

        /**
         * 冻结时间（不可操作）
         */
        FREEZE_TIME: "freeze_time",

        /**
         * 活跃时间（可操作）
         */
        KINETIC_TIME: "kinetic_time",

        /**
         * 本轮结束
         */
        FINISH_ROUND: "finish_round",
    }),

    /**
     * 视频
     */
    VIDEO: cc.Enum({
        /**
         * 视频准备好了
         */
        READY: "video_ready",
        /**
         * 视频播放结束
         */
        END: "video_end",
    }),

    /**
     * 录音
     */
    RECORD: cc.Enum({
        /**
         * 服务器响应录音
         */
        SERVER_RESPONSE_RECORD: "server_response_record",
        /**
         * 服务器响应权限
         */
        SERVER_RESPONSE_PERMISSION: "server_response_permission",
    }),

    /**
     * 键盘
     */
    KEYBOARD: cc.Enum({
        /**
         * 键弹起
         */
        TOUCH_UP: "key_touch_up",
        /**
         * 点击确认键
         */
        CLICK_OK: "key_click_ok",
    }),
}

export default EventDefine;