cc.Class({
    extends: cc.Component,

    properties: {
  
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    setIcon(isShow,maxNum = 6){
        this._seqType.getChildByName('max_num').getComponent(cc.Label).string = maxNum;
        this.node.active = isShow;
    /*     if(this._seqType.name == '1'&& isShow){
            let widget = this._seqType.getComponent(cc.Widget);
            widget.target = cc.find('Canvas');
            //widget.bottom = 40;
            cc.YL.timeOut(()=>{
                widget.updateAlignment();
            },100)
        } */

      /*   if(this._seqType.name == '2'&& isShow && cc.YL.tools.checkIsphone()){
            let widget = this._seqType.getComponent(cc.Widget);
            widget.target = cc.find('Canvas');
            widget.enabled = true;
            //widget.bottom = 40;
            cc.YL.timeOut(()=>{
                widget.updateAlignment();
            },100)
        } */
    },

    setType (type = 1) {
        this._seqType = this.node.getChildByName(type.toString());
        this._seqType.active = true;

        this.registerEvent();
    },

      //注册事件
      registerEvent() {
        cc.YL.emitter.on('refreshSeqID', (roundID) => {
           this._seqType.getChildByName('num').getComponent(cc.Label).string = roundID;
        })
    },

    // update (dt) {},
});
