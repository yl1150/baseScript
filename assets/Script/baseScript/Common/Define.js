const blockType = cc.Enum({
    Default: 0,
    yellow: 1,
    white: 2,
    red: 3,
});
const kStatusCode = cc.Enum({
    /**无状态 */
    STATUS_NONE: 0,

    /**正在游戏关卡 */
    STATUS_PLAYING: 1,

    /**播放视频 */
    STATUS_PLAYVIDEO: 2,
});

const videoStatusCode = cc.Enum({
    /**无状态 */
    STATUS_NONE: 0,

    /**正在游戏关卡 */
    STATUS_PLAYING: 1,

    /**播放视频 */
    STATUS_PLAYVIDEO: 2,
});

const GAMETYPE = cc.Enum({
    /**默认展现游戏目录 */
    default: 0,

    /**视频游戏 */
    videoGame: 1,

    /**题库 */
    questionBank: 2,

    /**播放小贴士视频 */
    videoTips: 3,

    /**习题上*/
    exercises1: 4,

    /**习题下*/
    exercises2: 5,

    /*大班游戏*/
    yearGame: 6,

    /*pk游戏*/
    pkGame: 7,

    /*小班游戏*/
    seniorGame: 8,
});

const GAMELIST = {
    /**默认展现游戏目录 */
    '0': 'default',

    /**视频游戏 */
    '1': 'videoGame',

    /**题库 */
    '2': 'questionBank',

    /**播放小贴士视频 */
    '3': 'videoTips',

    /**习题上*/
    '4': 'exercises1',

    /**习题下*/
    '5': 'exercises2',
    /*游戏*/
    '6': 'yearGame',
    /*pk游戏*/
    '7': 'pkGame',

    /*小班游戏*/
    '8': 'seniorGame',

    default: 'default',

    /**视频游戏 */
    videoGame: 'videoGame',

    /**题库 */
    questionBank: 'questionBank',

    /**播放小贴士视频 */
    videoTips: 'videoTips',

    /**习题上*/
    exercises1: 'exercises1',

    /**习题下*/
    exercises2: 'exercises2',

    /*游戏*/
    yearGame: 'yearGame',

    /*pk游戏*/
    pkGame: 'pkGame',

    /*小班游戏*/
    seniorGame: 'seniorGame',
};

const FIT_TYPE = cc.Enum({
    /**不适配 */
    NONE: 0,

    /**适配宽 */
    fitWidth: 1,

    /**缩放 */
    showALL: 2,
});

const ICONTYPE = cc.Enum({
    default: 1,
    ice: 2
});

/* const ANIMATION_DATA = cc.Class({
    name: "aniData",
    properties: {
        message: '',
        spineAni: '',
        actionType: '',
        sound:'',
        delayT: 0.0,
        aTime: 1,
        targetPoint: cc.Node,
        nArr: [cc.Node]
    }
}); */

export { blockType, kStatusCode, videoStatusCode, GAMETYPE, GAMELIST, FIT_TYPE, ICONTYPE }