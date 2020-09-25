//音频管理 WebAudio和DomAudio切换
module.exports ={
    editorAudio(audio){
        let sys = cc.sys;

        if (sys.os === sys.OS_IOS && sys.isMobile) {
            console.log('setAudio_to_Dom');
            audio.loadMode = cc.AudioClip.LoadMode.DOM_AUDIO;
        }
    },
}
