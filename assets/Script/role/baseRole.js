cc.Class({
    extends: cc.Component,

    properties: {
        holeAtlas: cc.SpriteAtlas
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start() {
        this.animation = this.node.addComponent(cc.Animation);
        this.animation.on("finished", this.onAnimEndListener, this);
        console.log(this.holeAtlas)
    },

    /**
       * 创建动画帧
       * @param {*} name 动画名字
       * @param {*} WrapMode 动画循环模式（单次循环）
       */
    createAnimation(name, WrapMode = cc.WrapMode.Loop) {
        let getFrames = function (atlas, name) {
            let arr = [];
            if (!atlas) {
                console.log('atlas:', atlas);
                return arr;
            }
            for (let i = 0; i < 999; i++) {
                let frame = atlas.getSpriteFrame(name + '_' + i);//获取动画集合下的第一个动画plist文件，并以动画名称依次播放
                if (frame) {
                    arr.push(frame); //添加动画帧到数组
                } else {
                    return arr;
                }
            }
        }

        let frames = getFrames(this.holeAtlas, name);
        if (!frames || frames.length <= 0) {
            console.log('create ', name, 'failed!!!!!');
            return false;
        }

        let clip = cc.AnimationClip.createWithSpriteFrames(frames, frames.length);//创建一组动画剪辑
        clip.wrapMode = WrapMode;//设置播放模式
        clip.name = name;//设置名字
        this.animation.addClip(clip);//添加动画帧到动画组件中
        return true;
    },

    /**
     * 按钮点击播放切换动画
     */
    onClickBtn(event, customData) {
        let name = 'runfast';

        //检测是否含有对应动画
        let clip = this.animation.getClips().map((pclip) => {
            if (pclip.name == name) return pclip;
        });
        if (!clip || clip.length <= 0) {
            console.log('当前不含有此动画，-----手动加载中');
            if (!this.createAnimation(name)) {
                return;
            }
            console.log('手动加载成功');
        }
        this.animation.play(name);//播放指定的动画名字
    },

    /**
     * 动画结束回调
     */
    onAnimEndListener() {
        cc.log("动画播放完成");

    },

    showAni(state) {

    }

    // update (dt) {},
});
