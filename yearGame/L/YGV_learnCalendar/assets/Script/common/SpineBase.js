/**
 * spine扩展组件
 */
var SpineBase = {
    // changeTexture(ske, slotName, texture) {
    //     console.log(ske.findSlot(slotName))
    //     //创建region
    //     let skeletonTexture = new sp.SkeletonTexture()
    //     skeletonTexture.setRealTexture(texture)
    //     let page = new sp.spine.TextureAtlasPage()
    //     page.name = texture.name
    //     page.uWrap = sp.spine.TextureWrap.ClampToEdge
    //     page.vWrap = sp.spine.TextureWrap.ClampToEdge
    //     page.texture = skeletonTexture
    //     page.texture.setWraps(page.uWrap, page.vWrap)
    //     page.width = texture.width
    //     page.height = texture.height

    //     let region = new sp.spine.TextureAtlasRegion()
    //     region.page = page
    //     region.width = texture.width
    //     region.height = texture.height
    //     region.originalWidth = texture.width
    //     region.originalHeight = texture.height

    //     region.rotate = false
    //     region.u = 0
    //     region.v = 0
    //     region.u2 = 1
    //     region.v2 = 1
    //     region.texture = skeletonTexture
    //     //换图
    //     let slot = ske.findSlot(slotName);
    //     let att = slot.getAttachment();
    //     att.region = region;
    //     att.setRegion(region);
    //     att.updateOffset();
    // },
    changeTexture(ske, slotName, tex) {
        let slot = ske.findSlot(slotName);
        let attachment = slot.attachment;
        console.log(attachment);
        //attachment
        attachment.height = tex.height;
        attachment.width = tex.width;
        let half_width = tex.width / 2;
        let half_height = tex.height / 2;
        let offset = new Float32Array([-half_width, half_height, half_width, half_height, half_width, -half_height, -half_width, -half_height]);
        attachment.offset = offset;
        //attachment-region
        let region = attachment.region;
        region.degrees = 0;
        region.width = tex.width;
        region.height = tex.height;
        region.offsetX = 0;
        region.offsetY = 0;
        region.originalWidth = tex.width;
        region.originalHeight = tex.height;
        region.u = 0;
        region.u2 = 1;
        region.v = 0;
        region.v2 = 1;
        //attachment-region-page
        let page = region.page;
        page.name = '';
        page.width = tex.width;
        page.height = tex.height;
        page.magFilter = tex._magFilter;
        page.minFilter = tex._minFilter;
        page.uWrap = tex._wrapS;
        page.vWrap = tex._wrapT;
        page.texture._image = { width: tex.width, height: tex.height };
        page.texture._texture = tex;
        //attachment-region-texture
        region.texture = page.texture;
        //attachment-region-renderObject
        region.renderObject = region;
    },
}

export default SpineBase;