const scoreButtonId = "score-github-button-id";

const scoreImageDivId = "score-github-image-container-id";

function setButtons() {
    const buttonDiv = document.getElementsByClassName("BtnGroup")[1];
    if (!buttonDiv) return false;
    const button = document.getElementById(scoreButtonId);
    if (button) return true;

    const a = document.createElement("a");
    a.id = scoreButtonId;
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

class scoreManager {
    constructor() {
        this.svg = "";
        this.rawUrl = "";

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
            const svg = tk.renderData(xml, {});

            this.svg = svg;
            this.rawUrl = rawUrl;
        }

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
