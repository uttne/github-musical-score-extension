
export class PullPageExtension{
    constructor(){

    }

    _getFilePath(musicFileDiffContainerElm){
        return musicFileDiffContainerElm.dataset.tagsearchPath;
    }

    _getMusicFileDiffContainerElms(){
        const parentContainer = document.getElementsByClassName("js-diff-progressive-container");
        if(!parentContainer)return [];

        const children = parentContainer[0].children;

        const musicFileDiffContainers = []

        for(let i = 0;i < children.length;++i){
            const child = children[i];
            const path = this._getFilePath(child);

            console.log(path);

            const ext = path.split(".").slice(-1)[0].toLowerCase()

            if(ext !== "musicxml"){
                continue;
            }
            
            musicFileDiffContainers.push(child);
        }

        return musicFileDiffContainers;
    }

    _setButton(musicFileDiffContainerElm, prevClick, nextClick, xmlClick, scoreClick){
        const path = this._getFilePath(musicFileDiffContainerElm);
        const idSuffix = btoa(path);
        const buttonContainerId = "github-musical-score-pull-page-button-container-id-" + idSuffix;
        const prevButtonId = "github-musical-score-pull-page-prev-button-id-" + idSuffix;
        const nextButtonId = "github-musical-score-pull-page-next-button-id-" + idSuffix;
        const viewButtonId = "github-musical-score-pull-page-view-button-id-" + idSuffix;

        const acctionsContainer = musicFileDiffContainerElm.getElementsByClassName("file-actions")[0];

        if(!acctionsContainer)return false;

        let container = document.getElementById(buttonContainerId);
        if(!container){
            container = document.createElement("div");
            container.className = "d-flex";
            acctionsContainer.insertBefore(container, acctionsContainer.children[0]);
        }

        let prevButton = document.getElementById(prevButtonId);
        if(!prevButton){
            prevButton = document.createElement("a");
            prevButton.id = prevButtonId;
            prevButton.innerText = "Prev";
            prevButton.className = "btn-sm btn BtnGroup-item";
            prevButton.href = "javascript:void(0);";
            if(prevClick){
                prevButton.onclick = prevClick;
            }
        }
        
        let nextButton = document.getElementById(nextButtonId);
        if(!nextButton){
            nextButton = document.createElement("a");
            nextButton.id = nextButtonId;
            nextButton.innerText = "Next";
            nextButton.className = "btn-sm btn BtnGroup-item";
            nextButton.href = "javascript:void(0);";
            if(nextClick){
                nextButton.onclick = nextClick;
            }
        }

        
        let viewButton = document.getElementById(viewButtonId);
        if(!viewButton){
            viewButton = document.createElement("a");
            viewButton.id = viewButtonId;
            viewButton.innerText = "Xml";
            viewButton.className = "btn-sm btn BtnGroup-item";
            viewButton.href = "javascript:void(0);";
            viewButton.onclick = () => {
                const text = viewButton.innerText;
                if (text !== "Score") {
                    // Xml という表示をクリックしたとき実行
                    if(xmlClick) xmlClick();
                    viewButton.innerText = "Score";
                } else {
                    // Score という表示をクリックしたとき実行
                    if(scoreClick) scoreClick();
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

    async _getBaseCommitHashAsync(){
        const match = /^\/(.+?)\/(.+?)\/pull\/(\d+)\/files/.exec(location.pathname);

        if(!match)return undefined;

        const owner = match[1];
        const repo = match[2];
        const pullNo = match[3];

        const apiUrl = `https://api.github.com/repos/${owner}/${repo}/pulls/${pullNo}`;

        const json = await fetch(apiUrl).then(r => r.json());

        return json.base.sha;
    }

    async initAsync(){

        const baseHash = await this._getBaseCommitHashAsync();
        console.log("base hash");
        console.log(baseHash);

        const musicFileDiffContainerElms = this._getMusicFileDiffContainerElms();

        for(let i = 0;i < musicFileDiffContainerElms.length; ++i){
            const elm = musicFileDiffContainerElms[i];

            this._setButton(elm);
        }
    }
}

