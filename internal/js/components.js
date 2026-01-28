export async function loadComponents() {
  const header = document.querySelector('header');
  const footer = document.querySelector('footer');

  // パスが division/ フォルダ内にあるかどうかをチェック
  const isSubDir = window.location.pathname.includes('/division/');
  const prefix = isSubDir ? '../' : '';

  if (header) {
    const res = await fetch(`${prefix}components/header.html`);
    let html = await res.text();
    // リンクをサブディレクトリ用に調整
    if (isSubDir) {
      html = html.replace(/href="index\.html/g, 'href="../index.html');
      html = html.replace(/href="diaries\.html"/g, 'href="../diaries.html"');
      html = html.replace(/href="chat\.html"/g, 'href="../chat.html"');
    }
    header.innerHTML = html;
  }

  if (footer) {
    const res = await fetch(`${prefix}components/footer.html`);
    let html = await res.text();
    // リンクをサブディレクトリ用に調整
    if (isSubDir) {
      html = html.replace(/href="index\.html/g, 'href="../index.html');
      html = html.replace(/href="login\.html"/g, 'href="../login.html"');
    }
    footer.innerHTML = html;
  }
}
