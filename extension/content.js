// Extract page text (LinkedIn, Indeed, etc.)
function getPageText() {
  return document.body.innerText.slice(0, 8000);
}
