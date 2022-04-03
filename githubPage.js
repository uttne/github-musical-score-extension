const test_url = "test url";

(() => {
    console.log("verovio: 1");

    const extentionId = chrome.runtime.id;
    const verovioId = extentionId + "-verovio-script";
    const indexId = extentionId + "-index-script";
    const styleId = extentionId + "-index-style";

    if (!document.getElementById(verovioId)) {
        const srcVerovioElm = document.createElement("script");
        srcVerovioElm.id = verovioId;
        var srcVerobioUrl = chrome.runtime.getURL("src/verovio-toolkit.js");
        srcVerovioElm.src = srcVerobioUrl;
        srcVerovioElm.onload = () => {
            if (!document.getElementById(indexId)) {
                const srcIndexElm = document.createElement("script");
                srcIndexElm.id = indexId;
                var srcIndexUrl = chrome.runtime.getURL("src/index.js");
                srcIndexElm.src = srcIndexUrl;
                srcIndexElm.type = "module";
                document.head.append(srcIndexElm);
            }
        };
        document.head.append(srcVerovioElm);
    }

    if (!document.getElementById(styleId)) {
        const styleElm = document.createElement("link");
        styleElm.id = styleId;
        styleElm.rel = "stylesheet";
        styleElm.type = "text/css";
        styleElm.href = chrome.runtime.getURL("src/index.css");

        document.head.append(styleElm);
    }
})();
