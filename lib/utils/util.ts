export const hexToRgba = (hex) => {
    return `${parseInt("0x" + hex.slice(1, 3))},${parseInt(
        "0x" + hex.slice(3, 5)
    )},${parseInt("0x" + hex.slice(5, 7))}`;
}
export const firstUpperCase = (str) => str.charAt(0).toUpperCase() + str.slice(1)

export const timeFormat = (time) => {
    let hh: any = ~~(time / 3600);
    let mm: any = ~~((time % 3600) / 60);
    let ss: any = ~~(time % 60);
    hh = hh < 10 ? "0" + hh : hh;
    mm = mm < 10 ? "0" + mm : mm;
    ss = ss < 10 ? "0" + ss : ss;
    return `${hh}:${mm}:${ss}`;
}

export const isMobile = !!("ontouchstart" in window)

export const toggleFullScreen = (el) => {

    let documentEL = (document as any)
    let isFullscreen = documentEL.webkitIsFullScreen || documentEL.fullscreen;
    if (!isFullscreen) {
        const inFun =
            el.requestFullscreen || el.webkitRequestFullScreen;
        inFun.call(el);
    } else {
        const exitFun =
            document.exitFullscreen || documentEL.webkitExitFullScreen;
        exitFun.call(documentEL);
    }
    return !isFullscreen

}
export const requestPictureInPicture = (el: HTMLElement | Document | Window) => {
    if ((document as any).pictureInPictureElement) {
        (document as any).exitPictureInPicture().catch((error) => {
            console.log(error, "Video failed to leave Picture-in-Picture mode.");
        });

    } else {
        //开启
        (el as any).requestPictureInPicture().catch((error) => {
            console.log(error, "Video failed to enter Picture-in-Picture mode.");
        });
    }
}
