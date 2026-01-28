export function initMenu() {
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.getElementById('navWrapper');

  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      toggle.classList.toggle("active");
      nav.classList.toggle("open");
      const isActive = toggle.classList.contains("active");
      toggle.setAttribute("aria-expanded", isActive.toString());
    });

    // メニュー外クリックで閉じる
    document.addEventListener("click", (e) => {
      if (nav.classList.contains("open") && !nav.contains(e.target) && !toggle.contains(e.target)) {
        nav.classList.remove("open");
        toggle.classList.remove("active");
        toggle.setAttribute("aria-expanded", "false");
      }
    });

    // リンククリック時に閉じる
    nav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        nav.classList.remove("open");
        toggle.classList.remove("active");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }
}
