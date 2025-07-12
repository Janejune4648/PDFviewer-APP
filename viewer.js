const fileInput = document.getElementById("file-input");
const canvas = document.getElementById("pdf-canvas");
const ctx = canvas.getContext("2d");
const bookmarkSelect = document.getElementById("bookmark-select");

let pdfDoc = null;

fileInput.addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const fileReader = new FileReader();
  fileReader.onload = async function () {
    const typedArray = new Uint8Array(this.result);
    const loadingTask = pdfjsLib.getDocument({ data: typedArray });

    pdfDoc = await loadingTask.promise;
    renderPage(1);
    loadBookmarks(pdfDoc);
  };
  fileReader.readAsArrayBuffer(file);
});

async function renderPage(pageNumber) {
  const page = await pdfDoc.getPage(pageNumber);
  const viewport = page.getViewport({ scale: 1.5 });

  canvas.height = viewport.height;
  canvas.width = viewport.width;

  await page.render({ canvasContext: ctx, viewport }).promise;
}

async function loadBookmarks(pdf) {
  const outline = await pdf.getOutline();
  bookmarkSelect.innerHTML = `<option value="">-- Select Bookmark --</option>`;

  if (outline) {
    outline.forEach((item, index) => {
      const option = document.createElement("option");
      option.textContent = item.title;
      option.value = index;
      bookmarkSelect.appendChild(option);
    });

    // Save outlines globally
    bookmarkSelect.outlines = outline;
  }
}

bookmarkSelect.addEventListener("change", async () => {
  const index = bookmarkSelect.value;
  if (!index) return;

  const outlineItem = bookmarkSelect.outlines[index];
  if (!outlineItem) return;

  let dest = outlineItem.dest;

  if (typeof dest === "string") {
    dest = await pdfDoc.getDestination(dest);
  }

  if (Array.isArray(dest)) {
    const [ref] = dest;
    const pageNumber = await pdfDoc.getPageIndex(ref);
    renderPage(pageNumber + 1);
  } else if (dest && dest.num !== undefined) {
    // fallback if direct reference
    const pageNumber = await pdfDoc.getPageIndex(dest);
    renderPage(pageNumber + 1);
  } else {
    alert("Unable to determine destination page");
  }
});


  const destination = await pdfDoc.getDestination(dest);
  const pageIndex = await pdfDoc.getPageIndex(destination[0]);
  renderPage(pageIndex + 1);
});
