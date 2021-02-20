import Note from './Note';
import ActionBase from './ActionBase'
import AudioBase from './AudioBase';
import ArrayBase from './ArrayBase';
import EventManager from './EventManager';
import EventDefine from './EventDefine';
import MathBase from './MathBase';
import Network from './Network';
import Recorder from './Recorder';
import ScreenFit from './ScreenFit';
import ShaderBase from './ShaderBase';
import SpineBase from './SpineBase';
import ScheduleBase from './ScheduleBase';
import Util from './Util';
var origin = {
    /**
     * 脚本集合
     */
    Script: {},
    /**
     * 文档
     */
    Note: Note,
    /**
     * 数组扩展
     */
    ArrayBase: ArrayBase,
    /**
     * 动作扩展
     */
    ActionBase: ActionBase,
    /**
     * 声音扩展
     */
    AudioBase: AudioBase,
    /**
     * 事件管理器
     */
    EventManager: EventManager,
    /**
     * 事件定义
     */
    EventDefine: EventDefine,
    /**
     * 数学扩展
     */
    MathBase: MathBase,
    /**
     * 网络扩展
     */
    Network: Network,
    /**
     * 录音
     */
    Recorder: Recorder,
    /**
     * 屏幕适配
     */
    ScreenFit: ScreenFit,
    /**
     * 渲染器扩展
     */
    ShaderBase: ShaderBase,
    /**
     * spine动画扩展
     */
    SpineBase: SpineBase,
    /**
     * 计划表
     */
    ScheduleBase: ScheduleBase,
    /**
     * 通用方法
     */
    Util: Util,
    init() {
        Note
        ArrayBase
        ActionBase
        AudioBase
        EventManager
        EventDefine
        MathBase
        Network
        Recorder
        ScreenFit
        ShaderBase
        SpineBase
        ScheduleBase
        Util
    },
}
cc.origin = origin;