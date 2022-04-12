class ImageManager {
    constructor(musicFileDiffContainerElm, relativeFilePath, baseUrl, headUrl) {
        this.baseSvg = "";
        this.headSvg = "";
        this.baseUrl = baseUrl;
        this.headUrl = headUrl;
        this.baseTk = undefined;
        this.headTk = undefined;
        this.basePageCount = 0;
        this.headPageCount = 0;
        this.currentPage = 1;
        this.musicFileDiffContainerElm = musicFileDiffContainerElm;
        this.relativeFilePath = relativeFilePath;

        const idSuffix = btoa(relativeFilePath);

        this.imageRootContainerId =
            "github-musical-score-commit-page-image-root-container-id-" +
            idSuffix;

        const imageRootContainer = document.createElement("div");
        imageRootContainer.id = this.imageRootContainerId;
        imageRootContainer.className =
            "data highlight js-blob-wrapper commit-page-image-root";
        imageRootContainer.style.overflowX = "auto";

        const baseImageContainer = document.createElement("div");
        baseImageContainer.className = "commit-page-base-image";
        baseImageContainer.dataset.rawUrl = baseUrl;
        if (!baseUrl) baseImageContainer.style.backgroundColor = "transparent";
        const headImageContainer = document.createElement("div");
        headImageContainer.className = "commit-page-head-image";
        headImageContainer.dataset.rawUrl = headUrl;
        if (!headUrl) headImageContainer.style.backgroundColor = "transparent";
        imageRootContainer.appendChild(baseImageContainer);
        imageRootContainer.appendChild(headImageContainer);
        this.baseImageContainer = baseImageContainer;
        this.headImageContainer = headImageContainer;

        this.rootContainer =
            musicFileDiffContainerElm.getElementsByClassName(
                "js-file-content"
            )[0];
        this.imageRootContainer = imageRootContainer;
        this.xmlRootContainer = this.rootContainer.children[0];
    }

    _tweak() {
        // 比較画面では画像が小さくなるため音符の縦の棒が見えなくなってしまうことがある
        // そのため微調整として縦の棒の幅を大きくする
        document
            .querySelectorAll('g[id^="stem-"] rect')
            .forEach((r) => r.setAttribute("width", "40"));
    }

    async initAsync() {
        if (this.baseUrl) {
            const xml = await fetch(this.baseUrl).then((r) => r.text());

            const tk = new verovio.toolkit();
            const svg = tk.renderData(xml, {});
            this.basePageCount = tk.getPageCount();

            this.baseSvg = svg;
            this.baseTk = tk;
        }

        if (this.headUrl) {
            const xml = await fetch(this.headUrl).then((r) => r.text());

            const tk = new verovio.toolkit();
            const svg = tk.renderData(xml, {});
            this.headPageCount = tk.getPageCount();

            this.headSvg = svg;
            this.headTk = tk;
        }

        this.baseImageContainer.innerHTML = this.baseSvg;
        this.headImageContainer.innerHTML = this.headSvg;

        this.showScore();
    }

    prev() {
        if (this.currentPage <= 1) {
            return;
        }

        this.currentPage--;

        const page = this.currentPage;
        if (this.baseTk) {
            if (page <= this.basePageCount) {
                const svg = this.baseTk.renderToSVG(page);
                this.baseSvg = svg;
            }
        }

        if (this.headTk) {
            if (page <= this.headPageCount) {
                const svg = this.headTk.renderToSVG(page);
                this.headSvg = svg;
            }
        }

        this.baseImageContainer.innerHTML = this.baseSvg;
        this.headImageContainer.innerHTML = this.headSvg;

        this._tweak();
    }
    next() {
        if (
            this.basePageCount <= this.currentPage &&
            this.headPageCount <= this.currentPage
        ) {
            return;
        }

        this.currentPage++;

        const page = this.currentPage;
        if (this.baseTk) {
            if (page <= this.basePageCount) {
                const svg = this.baseTk.renderToSVG(page);
                this.baseSvg = svg;
            } else {
                this.baseSvg = "";
            }
        }

        if (this.headTk) {
            if (page <= this.headPageCount) {
                const svg = this.headTk.renderToSVG(page);
                this.headSvg = svg;
            } else {
                this.headSvg = "";
            }
        }

        this.baseImageContainer.innerHTML = this.baseSvg;
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

export class CommitPageExtension {
    constructor() {
        this.cache = new ApiCache();
    }

    _getFilePath(musicFileDiffContainerElm) {
        return musicFileDiffContainerElm.dataset.tagsearchPath;
    }

    _getMusicFileDiffContainerElms() {
        const parentContainers = document.getElementsByClassName(
            "js-diff-progressive-container"
        );
        if (!parentContainers) return [];

        const musicFileDiffContainers = [];

        for (let k = 0; k < parentContainers.length; ++k) {
            const parentContainer = parentContainers[k];
            const children = parentContainer.children ?? [];

            for (let i = 0; i < children.length; ++i) {
                const child = children[i];
                const path = this._getFilePath(child);

                console.log(path);
                if (!path) {
                    // path が取得できない場合はスキップする
                    continue;
                }

                const ext = path.split(".").slice(-1)[0].toLowerCase();

                if (ext !== "musicxml") {
                    continue;
                }

                musicFileDiffContainers.push(child);
            }
        }

        return musicFileDiffContainers;
    }

    _setButton(
        musicFileDiffContainerElm,
        prevClick,
        nextClick,
        xmlClick,
        scoreClick
    ) {
        const path = this._getFilePath(musicFileDiffContainerElm);
        const idSuffix = btoa(path);
        const buttonContainerId =
            "github-musical-score-commit-page-button-container-id-" + idSuffix;
        const prevButtonId =
            "github-musical-score-commit-page-prev-button-id-" + idSuffix;
        const nextButtonId =
            "github-musical-score-commit-page-next-button-id-" + idSuffix;
        const viewButtonId =
            "github-musical-score-commit-page-view-button-id-" + idSuffix;

        const acctionsContainer =
            musicFileDiffContainerElm.getElementsByClassName("file-actions")[0];

        if (!acctionsContainer) return false;

        let container = document.getElementById(buttonContainerId);
        if (!container) {
            container = document.createElement("div");
            container.className = "d-flex";
            acctionsContainer.insertBefore(
                container,
                acctionsContainer.children[0]
            );
        }

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
        }

        container.innerHTML = "";

        container.appendChild(prevButton);
        container.appendChild(nextButton);
        container.appendChild(viewButton);

        return true;
    }

    async _getInfoAsync() {
        const match = /^\/(.+?)\/(.+?)\/commit\/([0-9a-f]{40})/.exec(
            location.pathname
        );

        if (!match) return undefined;

        const owner = match[1];
        const repo = match[2];
        const headSha = match[3];

        const apiCommitUrl = `https://api.github.com/repos/${owner}/${repo}/commits/${headSha}`;
        let commitJson = this.cache.get(apiCommitUrl);
        if (!commitJson) {
            commitJson = await fetch(apiCommitUrl).then((r) => r.json());
            this.cache.set(apiCommitUrl, commitJson);
        }
        // MusicXML の個数をカウントする
        const fileCount = commitJson.files
            .map((x) => x.filename)
            .filter((name) => /[.]musicxml$/.test(name.toLowerCase())).length;
        console.log(`musicxml count: ${fileCount}`);

        const fileStatus = {};
        for (let i = 0; i < commitJson.files.length; ++i) {
            const file = commitJson.files[i];
            fileStatus[file.filename] = file.status;
        }

        const parents = commitJson.parents;

        let latestDate = "";
        let baseSha = "";
        for (let i = 0; i < parents.length; ++i) {
            const parent = parents[i];

            const apiParentCommitUrl = `https://api.github.com/repos/${owner}/${repo}/commits/${parent.sha}`;
            let parentCommitJson = this.cache.get(apiParentCommitUrl);
            if (!parentCommitJson) {
                parentCommitJson = await fetch(apiParentCommitUrl).then((r) =>
                    r.json()
                );
                this.cache.set(apiParentCommitUrl, parentCommitJson);
            }

            if (latestDate < parentCommitJson.commit.author.date) {
                baseSha = parent.sha;
                latestDate = parentCommitJson.commit.author.date;
            }
        }

        return {
            owner: owner,
            repo: repo,
            base: baseSha,
            head: headSha,
            fileCount: fileCount,
            fileStatus: fileStatus,
        };
    }

    async initAsync(callBack) {
        const info = await this._getInfoAsync();
        if (!info) {
            if (callBack) {
                callBack(false);
            }
        }

        console.log("base hash");
        console.log(info);

        const musicFileDiffContainerElms =
            this._getMusicFileDiffContainerElms();

        console.log(musicFileDiffContainerElms.length);

        for (let i = 0; i < musicFileDiffContainerElms.length; ++i) {
            const elm = musicFileDiffContainerElms[i];

            const relativeFilePath = this._getFilePath(elm);

            const status = info.fileStatus[relativeFilePath];

            const baseFileUrl =
                status === "added"
                    ? ""
                    : `https://raw.githubusercontent.com/${info.owner}/${info.repo}/${info.base}/${relativeFilePath}`;
            const headFileUrl =
                status === "removed"
                    ? ""
                    : `https://raw.githubusercontent.com/${info.owner}/${info.repo}/${info.head}/${relativeFilePath}`;

            const imageManager = new ImageManager(
                elm,
                relativeFilePath,
                baseFileUrl,
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
            this._setButton(elm, prevClick, nextClick, xmlClick, scoreClick);

            await imageManager.initAsync();
        }

        if (callBack) {
            callBack(musicFileDiffContainerElms.length === info.fileCount);
        }
    }
}
