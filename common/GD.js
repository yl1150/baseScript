window.GD = {
    stage: 1,
    lv: 1,
    maxLv: 1,
    userToken: null,
    systemFlag: null,
    canTouch: false,
    touchPart: null,
    showTips: '',
    isShowClickAni:true,
    //全局控制句柄
    game: null,
    lvCtrl: null,
    sound: null,
    roundData:{
        passed:false, //关卡是否已经通关了
        star:0,//本次通关所获得的星星数
    },
    gameId:1,
}
