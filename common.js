document.addEventListener("DOMContentLoaded", () => {
    const version = "ver 1.2.0";

    const headerHtml = `
        <div class="header-inner">
            <h1 class="app-title" id="nav-title">EngLog & Praise</h1>
            <button class="hamburger-btn" id="hamburger-btn">☰</button>
        </div>
    `;
    const headerElement = document.createElement("header");
    headerElement.innerHTML = headerHtml;
    document.body.prepend(headerElement);

    const menuHtml = `
        <button class="close-btn" id="close-btn">×</button>
        <ul>
            <li><a href="guide.html" target="_blank">使い方ガイド</a></li>
            <li><a href="history.html">これまでの記録</a></li>
            <li><a href="https://forms.gle/YOUR_FORM_URL" target="_blank">お問い合わせ</a></li>
            <li><a href="release-notes.html" target="_blank">リリースノート</a></li>
        </ul>
        <hr class="menu-divider">
        <div class="spacer"></div>
        <a href="https://qcda-dev.github.io/HP/" target="_blank" style="font-weight:bold; text-decoration:none; color:#333;">QcDa Projectとは</a>
        <div class="sub-links">
            <a href="https://qcda-dev.github.io/HP/terms-of-service.html" target="_blank">利用規約</a>
            <a href="https://qcda-dev.github.io/HP/community-guidelines.html" target="_blank">コミュニティガイドライン</a>
        </div>
        <div class="version-text">${version}</div>
    `;
    const navElement = document.createElement("nav");
    navElement.classList.add("slide-menu");
    navElement.id = "slide-menu";
    navElement.innerHTML = menuHtml;
    document.body.appendChild(navElement);

    const footerHtml = `
        <p>&copy; 2025 QcDa Project. All Rights Reserved.</p>
        <div class="footer-links">
            <a href="https://qcda-dev.github.io/HP/terms-of-service.html" target="_blank">利用規約</a>
            <a href="https://qcda-dev.github.io/HP/community-guidelines.html" target="_blank">コミュニティガイドライン</a>
        </div>
    `;
    const footerElement = document.createElement("footer");
    footerElement.innerHTML = footerHtml;
    document.body.appendChild(footerElement);

    document.getElementById("nav-title").addEventListener("click", () => {
        window.location.href = "index.html"; 
    });

    const menu = document.getElementById("slide-menu");
    document.getElementById("hamburger-btn").addEventListener("click", () => {
        menu.classList.add("open");
    });

    document.getElementById("close-btn").addEventListener("click", () => {
        menu.classList.remove("open");
    });
});
