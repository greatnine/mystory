/**
 * app-test.js
 * 扫描 stories 目录下的子目录，检测是否包含 index.html 和 images/cover.*
 * 动态生成故事链接列表（书架版 + 封面图）
 */

(function() {
    'use strict';

    const STORIES_PATH = 'stories/';
    const CONTAINER_ID = 'app-list';
    const EMPTY_MSG = '无app可显示';
    const MISSING_MSG = '无index.html';
    const READ_MSG = '点击阅读';
    const COVER_EXTS = ['webp', 'jpg', 'jpeg', 'png'];

    async function init() {
        const container = document.getElementById(CONTAINER_ID);
        if (!container) return;

        showLoading(container);

        try {
            const dirs = await scanDirectories(STORIES_PATH);
            if (dirs.length === 0) {
                renderEmpty(container);
                return;
            }
            renderApps(container, dirs);
        } catch (err) {
            console.error('扫描目录失败:', err);
            renderError(container, err);
        }
    }

    function showLoading(container) {
        container.innerHTML = '<p class="loading">正在翻阅书卷，请稍候...</p>';
    }

    async function scanDirectories(path) {
        const response = await fetch(path);
        if (!response.ok) {
            throw new Error(`无法读取目录: ${path} (HTTP ${response.status})`);
        }

        const html = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const links = Array.from(doc.querySelectorAll('a'));

        const dirs = new Set();
        const currentDir = path.replace(/\/+$/, '').split('/').pop() || '';

        links.forEach(link => {
            const href = link.getAttribute('href');
            if (!href) return;

            if (href === '../' || href === '..' || href === './' || href === '/') return;
            if (href.startsWith('#') || href.startsWith('?')) return;

            const hrefNormalized = href.replace(/\/+$/, '');
            const lastSegment = hrefNormalized.split('/').pop() || '';
            const hasFileExt = /\.[a-zA-Z0-9]{1,8}$/.test(lastSegment);
            if (hasFileExt) return;

            const dirName = extractDirName(href);
            if (!dirName || dirName === '..' || dirName === '.') return;
            if (dirName === currentDir) return;

            dirs.add(dirName);
        });

        return Array.from(dirs).sort();
    }

    function extractDirName(href) {
        try {
            const url = new URL(href, window.location.href);
            let pathname = decodeURIComponent(url.pathname);
            pathname = pathname.replace(/\/+$/, '');
            const parts = pathname.split('/').filter(Boolean);
            return parts.length > 0 ? parts[parts.length - 1] : null;
        } catch (e) {
            let path = href.replace(/\/+$/, '');
            const parts = path.split('/').filter(p => p && p !== '..' && p !== '.');
            return parts.length > 0 ? parts[parts.length - 1] : null;
        }
    }

    async function checkApp(dirName) {
        const encodedName = encodeURIComponent(dirName);
        const indexUrl = `${STORIES_PATH}${encodedName}/index.html`;

        // 并行检测 index.html 和封面
        const [indexExists, coverUrl] = await Promise.all([
            headOk(indexUrl),
            findCover(encodedName),
        ]);

        return { name: dirName, url: indexUrl, exists: indexExists, cover: coverUrl };
    }

    async function headOk(url) {
        try {
            const res = await fetch(url, { method: 'HEAD' });
            return res.ok;
        } catch (e) {
            return false;
        }
    }

    async function findCover(encodedDirName) {
        const base = `${STORIES_PATH}${encodedDirName}/images/cover`;
        for (const ext of COVER_EXTS) {
            const url = `${base}.${ext}`;
            if (await headOk(url)) return url;
        }
        return null;
    }

    function renderEmpty(container) {
        container.innerHTML = `<p class="empty-state">${EMPTY_MSG}</p>`;
    }

    function renderError(container, err) {
        container.innerHTML = `
            <div class="error-state">
                <p>扫描目录时遇到问题。</p>
                <p class="error-detail">${escapeHtml(err.message)}</p>
                <p class="hint">提示：请通过本地服务器访问此页面（如使用 VS Code Live Server、Python <code>python -m http.server</code> 等），直接打开文件可能无法正常工作。</p>
            </div>
        `;
    }

    function renderApps(container, dirNames) {
        const grid = document.createElement('div');
        grid.className = 'app-grid';

        const cardMap = {};

        dirNames.forEach(name => {
            const encodedName = encodeURIComponent(name);
            const indexUrl = `${STORIES_PATH}${encodedName}/index.html`;

            const card = document.createElement('a');
            card.className = 'app-card pending';
            card.href = indexUrl;
            card.innerHTML = `
                <div class="book">
                    <div class="cover-veil"></div>
                    <div class="book-top"></div>
                    <h3 class="app-name">${escapeHtml(name)}</h3>
                    <p class="app-status">
                        <span class="status-badge pending">${READ_MSG}</span>
                    </p>
                </div>
            `;

            cardMap[name] = card;
            grid.appendChild(card);
        });

        container.innerHTML = '';
        container.appendChild(grid);

        // 异步检测 index.html 与封面，逐本更新
        dirNames.forEach(async (name) => {
            const result = await checkApp(name);
            const card = cardMap[name];
            if (!card) return;

            const bookEl = card.querySelector('.book');
            const badge = card.querySelector('.status-badge');

            if (result.cover && bookEl) {
                bookEl.style.backgroundImage = `url("${result.cover}")`;
                card.classList.add('has-cover');
            }

            if (result.exists) {
                card.className = `app-card${result.cover ? ' has-cover' : ''}`;
                if (badge) {
                    badge.className = 'status-badge ok';
                    badge.textContent = READ_MSG;
                }
            } else {
                card.className = `app-card missing${result.cover ? ' has-cover' : ''}`;
                card.removeAttribute('href');
                if (badge) {
                    badge.className = 'status-badge missing';
                    badge.textContent = MISSING_MSG;
                }
            }
        });
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
