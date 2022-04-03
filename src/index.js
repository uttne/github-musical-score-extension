const scoreViewButtonId = "score-github-view-button-id";
const scoreNextButtonId = "score-github-next-button-id";
const scorePrevButtonId = "score-github-prev-button-id";

const scoreImageDivId = "score-github-image-container-id";

function setButtons() {
    const buttonDiv = document.getElementsByClassName("BtnGroup")[1];
    if (!buttonDiv) return false;

    const viewButton = document.getElementById(scoreViewButtonId);

    if (!viewButton) {
        const a = document.createElement("a");
        a.id = scoreViewButtonId;
        a.innerText = "Xml";
        a.className = "btn-sm btn BtnGroup-item";
        a.href = "javascript:void(0);";
        a.onclick = () => {
            const text = a.innerText;
            if (text !== "Score") {
                scoreM.hideScore();
                a.innerText = "Score";
            } else {
                scoreM.showScore();
                a.innerText = "Xml";
            }
        };

        buttonDiv.insertBefore(a, buttonDiv.children[0]);
    }

    const nextButton = document.getElementById(scoreNextButtonId);

    if (!nextButton) {
        const a = document.createElement("a");
        a.id = scoreNextButtonId;
        a.innerText = "Next";
        a.className = "btn-sm btn BtnGroup-item";
        a.href = "javascript:void(0);";
        a.onclick = () => {
            scoreM.next();
        };

        buttonDiv.insertBefore(a, buttonDiv.children[0]);
    }

    const prevButton = document.getElementById(scorePrevButtonId);

    if (!prevButton) {
        const a = document.createElement("a");
        a.id = scorePrevButtonId;
        a.innerText = "Prev";
        a.className = "btn-sm btn BtnGroup-item";
        a.href = "javascript:void(0);";
        a.onclick = () => {
            scoreM.prev();
        };

        buttonDiv.insertBefore(a, buttonDiv.children[0]);
    }
    return true;
}

class scoreManager {
    constructor() {
        this.svg = "";
        this.rawUrl = "";
        this.tk = undefined;
        this.pageCount = 0;
        this.currentPage = 1;

        const imageContainerDiv = document.createElement("div");
        imageContainerDiv.id = scoreImageDivId;
        imageContainerDiv.className =
            "Box-body p-0 blob-wrapper data type-xml  gist-border-0";
        imageContainerDiv.style.backgroundColor = "white";

        this.imageContainerDiv = imageContainerDiv;
    }

    async getSvgAsync(rawUrl) {
        if (this.rawUrl !== rawUrl) {
            const xml = await fetch(rawUrl).then((r) => r.text());

            var tk = new verovio.toolkit();
            this.tk = tk;
            const svg = tk.renderData(xml, {});
            this.pageCount = tk.getPageCount();

            this.svg = svg;
            this.rawUrl = rawUrl;
        }

        this.imageContainerDiv.innerHTML = this.svg;
    }

    prev() {
        if (!this.tk) {
            return;
        }
        if (this.currentPage <= 1) {
            return;
        }
        this.currentPage--;
        const svg = this.tk.renderToSVG(this.currentPage);
        this.svg = svg;

        this.imageContainerDiv.innerHTML = this.svg;
    }
    next() {
        if (!this.tk) {
            return;
        }
        if (this.pageCount <= this.currentPage) {
            return;
        }
        this.currentPage++;
        const svg = this.tk.renderToSVG(this.currentPage);
        this.svg = svg;

        this.imageContainerDiv.innerHTML = this.svg;
    }

    showScore() {
        const codeDiv = document.getElementsByClassName(
            "Box-body blob-wrapper"
        )[0];
        if (codeDiv) {
            codeDiv.style.display = "none";
        }
        let imageContainerDiv = document.getElementById(scoreImageDivId);
        if (!imageContainerDiv) {
            imageContainerDiv = this.imageContainerDiv;

            const parent = document.getElementsByClassName(
                "Box mt-3 position-relative"
            )[0];

            parent.appendChild(imageContainerDiv);
        }
    }

    hideScore() {
        const codeDiv = document.getElementsByClassName(
            "Box-body blob-wrapper"
        )[0];
        if (codeDiv) {
            codeDiv.style.display = "";
        }
        const imageContainerDiv = document.getElementById(scoreImageDivId);
        if (imageContainerDiv) {
            imageContainerDiv.parentElement.removeChild(imageContainerDiv);
        }
    }
}

// --------------------------------------------------------------------------

const scoreM = new scoreManager();
let pathnameCache = undefined;
const observer = new MutationObserver(() => {
    if (pathnameCache === location.pathname) return;
    pathnameCache = location.pathname;

    if (/^\/.+?\/.+?\/blob\/.*[.]musicxml/.test(pathnameCache)) {
        const rawA = document.getElementById("raw-url");
        if (!rawA) {
            pathnameCache = undefined;
            return;
        } else {
            if (!setButtons()) {
                pathnameCache = undefined;
                return;
            }
            const rawUrl = rawA.href;
            scoreM.showScore();
            scoreM.getSvgAsync(rawUrl);
        }
    }
});
window.onload = () => {
    observer.observe(document, { childList: true, subtree: true });
};
