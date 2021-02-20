/****************************************** 
文档，用于保存游戏中全局的数据
******************************************/
var Note = {
    /**
     * 游戏数据（手动配置）
     */
    gameData: null,

    /**
     * 根脚本
     */
    root: null,

    /**
     * 场景脚本
     */
    scene: null,

    /**
     * 喇叭脚本
     */
    trumpet: null,

    /**
     * 是否播放循环喇叭
     */
    isLoopTrumpet: false,

    /**
     * 屏幕封面（用于遮挡屏幕不让操作）
     */
    screenCover: null,

    /**
     * 无操作时间（不操作累计时间，操作置零）
     */
    t_leisure: 0,

    /**
     * 触摸对象（此对象唯一，用于全局单点触控）
     */
    touchTarget: null,

    /**
     * 游戏总时长
     */
    totalTime: 0,

    /**
     * 游戏片段时长
     */
    sliceTime: 0,

    /**
     * 星星数/积分数
     */
    starNum: 0,

    //--------------------------------------------

    /**
     * 场景Id
     */
    sceneId: null,

    /**
     * 第几轮Id
     */
    roundId: null,
}

export default Note;