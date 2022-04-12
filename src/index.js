import { BlobPageExtension } from "./blob-page-extension.js";
import { CommitPageExtension } from "./commit-page-extension.js";
import { PullPageExtension } from "./pull-page-extension.js";

// --------------------------------------------------------------------------

const blobPage = new BlobPageExtension();
const pullPage = new PullPageExtension();
const commitPage = new CommitPageExtension();

let pathnameCache = undefined;
const observer = new MutationObserver(() => {
    if (pathnameCache === location.pathname) return;
    pathnameCache = location.pathname;

    if (/^\/.+?\/.+?\/blob\//.test(pathnameCache)) {
        // 非同期の初期化処理が失敗したときに再度処理が実行できるようにコールバックを設定する
        const callBack = (result) => {
            if (!result) {
                pathnameCache = undefined;
            }
        };
        blobPage.initAsync(callBack);
    } else if (/^\/.+?\/.+?\/pull\/(\d+)\/files/.test(pathnameCache)) {
        // 非同期の初期化処理が失敗したときに再度処理が実行できるようにコールバックを設定する
        const callBack = (result) => {
            if (!result) {
                pathnameCache = undefined;
            }
        };
        pullPage.initAsync(callBack);
    } else if (/^\/(.+?)\/(.+?)\/commit\/([0-9a-f]{40})/.test(pathnameCache)) {
        // 非同期の初期化処理が失敗したときに再度処理が実行できるようにコールバックを設定する
        const callBack = (result) => {
            if (!result) {
                pathnameCache = undefined;
            }
        };
        commitPage.initAsync(callBack);
    }
});
window.onload = () => {
    observer.observe(document, { childList: true, subtree: true });
};
