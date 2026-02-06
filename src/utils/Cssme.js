
export class Cssme {

    // Cssme.BG.croppedScale()
    static BG = {
        croppedScale: (imgUrl, x, y, cropW, cropH, targetW, targetH, imgOriginalW, imgOriginalH) => {
            const scaleX = targetW / cropW;
            const scaleY = targetH / cropH;
            const div = document.createElement("div");
            div.style.width = targetW + "px";
            div.style.height = targetH + "px";
            div.style.backgroundImage = `url(${imgUrl})`;
            div.style.backgroundRepeat = "no-repeat";
            div.style.backgroundSize = `${imgOriginalW * scaleX}px ${imgOriginalH * scaleY}px`;
            div.style.backgroundPosition = `${-x * scaleX}px ${-y * scaleY}px`;
            return div;
        },
        cropped: (imgUrl, x, y, width, height) => {
            const div = document.createElement("div");
            div.style.width = width + "px";
            div.style.height = height + "px";
            div.style.backgroundImage = `url(${imgUrl})`;
            div.style.backgroundRepeat = "no-repeat";
            div.style.backgroundPosition = `-${x}px -${y}px`;
            return div;
        }
    }


}