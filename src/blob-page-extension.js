class ImageManager {
    constructor(musicFileContainerElm, headUrl) {
        this.headSvg = "";
        this.headUrl = headUrl;
        this.headTk = undefined;
        this.headPageCount = 0;
        this.currentPage = 1;
        this.musicFileContainerElm = musicFileContainerElm;

        this.imageRootContainerId =
            "github-musical-score-blob-page-image-root-container-id";

        const imageRootContainer = document.createElement("div");
        imageRootContainer.id = this.imageRootContainerId;
        imageRootContainer.className =
            "Box-body p-0 blob-wrapper data type-xml gist-border-0 blob-page-image-root";

        const headImageContainer = document.createElement("div");
        headImageContainer.className = "blob-page-head-image";
        imageRootContainer.appendChild(headImageContainer);
        this.headImageContainer = headImageContainer;

        this.rootContainer = musicFileContainerElm;
        this.imageRootContainer = imageRootContainer;
        this.xmlRootContainer = this.rootContainer.getElementsByClassName(
            "Box-body blob-wrapper"
        )[0];
    }

    _tweak() {
        // 比較画面では画像が小さくなるため音符の縦の棒が見えなくなってしまうことがある
        // そのため微調整として縦の棒の幅を大きくする
        document
            .querySelectorAll('g[id^="stem-"] rect')
            .forEach((r) => r.setAttribute("width", "30"));
    }

    async initAsync() {
        {
            const xml = await fetch(this.headUrl).then((r) => r.text());

            const tk = new verovio.toolkit();
            const svg = tk.renderData(xml, {});
            this.headPageCount = tk.getPageCount();

            this.headSvg = svg;
            this.headTk = tk;
        }

        this.headImageContainer.innerHTML = this.headSvg;

        this.showScore();
    }

    prev() {
        if (this.currentPage <= 1) {
            return;
        }

        this.currentPage--;

        const page = this.currentPage;
        if (this.headTk) {
            if (page <= this.headPageCount) {
                const svg = this.headTk.renderToSVG(page);
                this.headSvg = svg;
            }
        }

        this.headImageContainer.innerHTML = this.headSvg;

        this._tweak();
    }
    next() {
        if (this.headPageCount <= this.currentPage) {
            return;
        }

        this.currentPage++;

        const page = this.currentPage;

        if (this.headTk) {
            if (page <= this.headPageCount) {
                const svg = this.headTk.renderToSVG(page);
                this.headSvg = svg;
            } else {
                this.headSvg = "";
            }
        }

        this.headImageContainer.innerHTML = this.headSvg;

        this._tweak();
    }

    showScore() {
        if (this.xmlRootContainer) {
            this.xmlRootContainer.style.display = "none";
        }

        let imageRootContainer = document.getElementById(
            this.imageRootContainerId
        );
        if (!imageRootContainer) {
            imageRootContainer = this.imageRootContainer;
            this.rootContainer.appendChild(imageRootContainer);
        }

        this._tweak();
    }

    hideScore() {
        if (this.xmlRootContainer) {
            this.xmlRootContainer.style.display = "";
        }
        const imageRootContainer = document.getElementById(
            this.imageRootContainerId
        );
        if (imageRootContainer) {
            imageRootContainer.parentElement.removeChild(imageRootContainer);
        }
    }
}

class ApiCache {
    constructor() {
        this._cache = {};
    }

    get(key) {
        return this._cache[key];
    }

    set(key, data) {
        this._cache[key] = data;
        return data;
    }
}

export class BlobPageExtension {
    constructor() {
        this.cache = new ApiCache();
    }

    _getRawUrl() {
        const rawUrl = document.getElementById("raw-url");
        if (!rawUrl) {
            return undefined;
        }
        return rawUrl.href;
    }

    _getMusicFileContainerElm() {
        const parentContainer = document.getElementsByClassName(
            "Box mt-3 position-relative"
        )[0];
        if (!parentContainer) return undefined;

        return parentContainer;
    }

    _setButton(prevClick, nextClick, xmlClick, scoreClick) {
        const prevButtonId = "github-musical-score-blob-page-prev-button-id";
        const nextButtonId = "github-musical-score-blob-page-next-button-id";
        const viewButtonId = "github-musical-score-blob-page-view-button-id";

        const rawUrlButton = document.getElementById("raw-url");
        const acctionsContainer = rawUrlButton.parentElement;

        if (!acctionsContainer) return false;

        let prevButton = document.getElementById(prevButtonId);
        if (!prevButton) {
            prevButton = document.createElement("a");
            prevButton.id = prevButtonId;
            prevButton.innerText = "Prev";
            prevButton.className = "btn-sm btn BtnGroup-item";
            prevButton.href = "javascript:void(0);";
            if (prevClick) {
                prevButton.onclick = prevClick;
            }
        } else {
            acctionsContainer.removeChild(prevButton);
        }

        let nextButton = document.getElementById(nextButtonId);
        if (!nextButton) {
            nextButton = document.createElement("a");
            nextButton.id = nextButtonId;
            nextButton.innerText = "Next";
            nextButton.className = "btn-sm btn BtnGroup-item";
            nextButton.href = "javascript:void(0);";
            if (nextClick) {
                nextButton.onclick = nextClick;
            }
        } else {
            acctionsContainer.removeChild(nextButton);
        }

        let viewButton = document.getElementById(viewButtonId);
        if (!viewButton) {
            viewButton = document.createElement("a");
            viewButton.id = viewButtonId;
            viewButton.innerText = "Xml";
            viewButton.className = "btn-sm btn BtnGroup-item";
            viewButton.href = "javascript:void(0);";
            viewButton.onclick = () => {
                const text = viewButton.innerText;
                if (text !== "Score") {
                    // Xml という表示をクリックしたとき実行
                    if (xmlClick) xmlClick();
                    viewButton.innerText = "Score";
                } else {
                    // Score という表示をクリックしたとき実行
                    if (scoreClick) scoreClick();
                    viewButton.innerText = "Xml";
                }
            };
        } else {
            acctionsContainer.removeChild(viewButton);
        }

        acctionsContainer.insertBefore(
            viewButton,
            acctionsContainer.children[0]
        );
        acctionsContainer.insertBefore(
            nextButton,
            acctionsContainer.children[0]
        );
        acctionsContainer.insertBefore(
            prevButton,
            acctionsContainer.children[0]
        );

        return true;
    }

    async _getInfoAsync() {
        const match = /^\/(.+?)\/(.+?)\/blob\/(.+?)\/(.+)/.exec(
            location.pathname
        );

        if (!match) return undefined;

        const owner = match[1];
        const repo = match[2];
        const branch = match[3];
        const path = match[4];

        // MusicXML の個数をカウントする
        const isMusicXML = /[.]musicxml$/.test(path.toLowerCase());

        return {
            owner: owner,
            repo: repo,
            branch: branch,
            path: path,
            isMusicXML: isMusicXML,
        };
    }

    async initAsync(callBack) {
        const info = await this._getInfoAsync();
        if (!info) {
            if (callBack) {
                callBack(false);
            }
        }

        console.log("info");
        console.log(info);

        if (!info.isMusicXML) {
            return true;
        }

        const musicFileContainerElm = this._getMusicFileContainerElm();

        let result = false;

        if (musicFileContainerElm) {
            const headFileUrl = this._getRawUrl(musicFileContainerElm);

            const imageManager = new ImageManager(
                musicFileContainerElm,
                headFileUrl
            );

            const prevClick = () => {
                imageManager.prev();
            };
            const nextClick = () => {
                imageManager.next();
            };
            const xmlClick = () => {
                imageManager.hideScore();
            };
            const scoreClick = () => {
                imageManager.showScore();
            };
            if (this._setButton(prevClick, nextClick, xmlClick, scoreClick)) {
                result = true;
                await imageManager.initAsync();
            }
        }

        if (callBack) {
            callBack(result);
        }
    }
}
