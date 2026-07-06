import "./style.css";

interface HealthResponse {
    status: string;
    projectId: string;
    dataset: string;
}

interface Manga {
    _id: string;
    title: string;
    slug: string;
    myAnimeListId: number;
}

interface Page {
    index: number;
    name: string;
    path: string;
}

interface Chapter {
    title: string;
    series: string;
    number: string;
    summary: string;
    pages: Page[] | null;
}

type UploadStatus = "idle" | "loading" | "success" | "error";

interface SelectedFile {
    key: string;
    file: File;
    status: UploadStatus;
    chapter?: Chapter;
    error?: string;
}

const selectedFiles: SelectedFile[] = [];

document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
<div class="app">

    <header class="header">

        <div>
            <h1>Mangile Importer</h1>
            <p>Komikku -> Sanity Manga İçe Aktarma Aracı</p>
        </div>

        <div id="status" class="status loading">
            Bağlantı kontrol ediliyor...
        </div>

    </header>

    <main class="content">

        <section class="card">

            <h2>Manga</h2>

            <p class="description">
                ComicInfo.xml otomatik algılanacaktır. İstersen aşağıdan farklı
                bir manga seçebilirsin.
            </p>

            <select id="mangaSelect">

                <option value="">
                    Otomatik Algıla (ComicInfo.xml)
                </option>

            </select>

        </section>

        <section class="card">

            <div class="section-heading">
                <div>
                    <h2>CBZ Dosyaları</h2>
                    <p class="description">
                        Bir veya birden fazla .cbz dosyası seç veya sürükle-bırak
                    </p>
                </div>

                <span id="fileCount" class="file-count">
                    0 dosya
                </span>
            </div>

            <label id="dropZone" class="drop-zone" for="cbzInput">
                <input
                    id="cbzInput"
                    type="file"
                    accept=".cbz,application/vnd.comicbook+zip,application/zip"
                    multiple
                />

                <span class="drop-zone-icon">+</span>
                <span class="drop-zone-title">CBZ dosyalarını buraya bırak</span>
                <span class="drop-zone-description">
                    veya dosya secmek icin tikla
                </span>
            </label>

            <div id="emptyFiles" class="empty-files">
                Henüz dosya seçilmedi.
            </div>

            <ul id="fileList" class="file-list" aria-label="Secilen CBZ dosyalari"></ul>

            <div class="actions">
                <button id="previewButton" class="primary-action" type="button" disabled>
                    Onizle
                </button>
            </div>

        </section>

    </main>

</div>
`;

const status = document.querySelector<HTMLDivElement>("#status")!;
const mangaSelect =
    document.querySelector<HTMLSelectElement>("#mangaSelect")!;
const dropZone = document.querySelector<HTMLLabelElement>("#dropZone")!;
const cbzInput = document.querySelector<HTMLInputElement>("#cbzInput")!;
const fileList = document.querySelector<HTMLUListElement>("#fileList")!;
const emptyFiles = document.querySelector<HTMLDivElement>("#emptyFiles")!;
const fileCount = document.querySelector<HTMLSpanElement>("#fileCount")!;
const previewButton =
    document.querySelector<HTMLButtonElement>("#previewButton")!;

let isUploading = false;

async function loadHealth() {
    try {
        const response = await fetch("/api/health");

        if (!response.ok) {
            throw new Error();
        }

        const health: HealthResponse = await response.json();

        status.className = "status success";
        status.textContent = `✅ ${health.projectId} / ${health.dataset}`;
    } catch {
        status.className = "status error";
        status.textContent = "Sanity'e baglanilamadi";
    }
}

async function loadMangas() {
    try {
        const response = await fetch("/api/mangas");

        if (!response.ok) {
            throw new Error();
        }

        const mangas: Manga[] = await response.json();

        mangas.forEach((manga) => {
            const option = document.createElement("option");

            option.value = manga._id;
            option.textContent = manga.title;

            mangaSelect.appendChild(option);
        });
    } catch {
        const option = document.createElement("option");

        option.disabled = true;
        option.textContent = "Mangalar yuklenemedi";

        mangaSelect.appendChild(option);
    }
}

function getFileKey(file: File) {
    return `${file.name}-${file.size}-${file.lastModified}`;
}

function isCbzFile(file: File) {
    return file.name.toLowerCase().endsWith(".cbz");
}

function formatFileSize(bytes: number) {
    if (bytes === 0) {
        return "0 B";
    }

    const units = ["B", "KB", "MB", "GB"];
    const exponent = Math.min(
        Math.floor(Math.log(bytes) / Math.log(1024)),
        units.length - 1,
    );

    const size = bytes / 1024 ** exponent;

    return `${size.toFixed(size >= 10 || exponent === 0 ? 0 : 1)} ${units[exponent]}`;
}

function getPageCount(chapter: Chapter) {
    return chapter.pages?.length ?? 0;
}

function addFiles(files: FileList | File[]) {
    const existingFileKeys = new Set(selectedFiles.map((item) => item.key));
    const incomingFiles = Array.from(files).filter(isCbzFile);

    incomingFiles.forEach((file) => {
        const fileKey = getFileKey(file);

        if (!existingFileKeys.has(fileKey)) {
            selectedFiles.push({
                key: fileKey,
                file,
                status: "idle",
            });

            existingFileKeys.add(fileKey);
        }
    });

    renderFiles();
}

function renderFiles() {
    fileList.innerHTML = "";

    fileCount.textContent =
        selectedFiles.length === 1
            ? "1 dosya"
            : `${selectedFiles.length} dosya`;

    emptyFiles.hidden = selectedFiles.length > 0;
    fileList.hidden = selectedFiles.length === 0;
    previewButton.disabled = selectedFiles.length === 0 || isUploading;
    previewButton.textContent = isUploading ? "Önizleniyor..." : "Önizle";

    selectedFiles.forEach((item, index) => {
        const listItem = document.createElement("li");
        const fileRow = document.createElement("div");
        const fileInfo = document.createElement("div");
        const fileName = document.createElement("span");
        const fileMeta = document.createElement("span");
        const statusBadge = document.createElement("span");
        const removeButton = document.createElement("button");

        listItem.className = "file-item";
        fileRow.className = "file-row";
        fileInfo.className = "file-info";
        fileName.className = "file-name";
        fileMeta.className = "file-size";
        statusBadge.className = `file-status ${item.status}`;
        removeButton.className = "remove-file";

        fileName.textContent = item.file.name;
        fileMeta.textContent = formatFileSize(item.file.size);
        statusBadge.textContent = getStatusLabel(item.status);
        removeButton.type = "button";
        removeButton.textContent = "Kaldır";
        removeButton.disabled = isUploading;
        removeButton.setAttribute(
            "aria-label",
            `${item.file.name} dosyasını kaldır.`,
        );

        removeButton.addEventListener("click", () => {
            selectedFiles.splice(index, 1);
            renderFiles();
        });

        fileInfo.append(fileName, fileMeta);
        fileRow.append(fileInfo, statusBadge, removeButton);
        listItem.appendChild(fileRow);

        if (item.status === "success" && item.chapter) {
            listItem.appendChild(renderChapterPreview(item.chapter));
        }

        if (item.status === "error" && item.error) {
            const errorMessage = document.createElement("p");

            errorMessage.className = "file-error";
            errorMessage.textContent = item.error;

            listItem.appendChild(errorMessage);
        }

        fileList.appendChild(listItem);
    });
}

function getStatusLabel(uploadStatus: UploadStatus) {
    switch (uploadStatus) {
        case "loading":
            return "Okunuyor";
        case "success":
            return "Hazır";
        case "error":
            return "Hata";
        default:
            return "Bekliyor";
    }
}

function renderChapterPreview(chapter: Chapter) {
    const preview = document.createElement("dl");
    const title = chapter.title || "Başlık yok";
    const series = chapter.series || "Seri yok";
    const number = chapter.number || "Numara yok";
    const pageCount = getPageCount(chapter);

    preview.className = "chapter-preview";
    preview.append(
        createPreviewItem("Başlık", title),
        createPreviewItem("Seri", series),
        createPreviewItem("Sayı", number),
        createPreviewItem("Sayfa", `${pageCount}`),
    );

    if (chapter.summary) {
        preview.appendChild(createPreviewItem("Özet", chapter.summary));
    }

    return preview;
}

function createPreviewItem(label: string, value: string) {
    const wrapper = document.createElement("div");
    const term = document.createElement("dt");
    const detail = document.createElement("dd");

    wrapper.className = "preview-item";
    term.textContent = label;
    detail.textContent = value;

    wrapper.append(term, detail);

    return wrapper;
}

async function uploadFile(item: SelectedFile) {
    const formData = new FormData();

    formData.append("cbz", item.file);

    if (mangaSelect.value) {
        formData.append("mangaId", mangaSelect.value);
    }

    const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
    });

    if (!response.ok) {
        const message = await response.text();

        throw new Error(message || "CBZ dosyasi okunamadi.");
    }

    return response.json() as Promise<Chapter>;
}

async function previewSelectedFiles() {
    if (selectedFiles.length === 0 || isUploading) {
        return;
    }

    isUploading = true;
    renderFiles();

    for (const item of selectedFiles) {
        item.status = "loading";
        item.chapter = undefined;
        item.error = undefined;
        renderFiles();

        try {
            item.chapter = await uploadFile(item);
            item.status = "success";
        } catch (error) {
            item.status = "error";
            item.error =
                error instanceof Error
                    ? error.message.trim()
                    : "Bilinmeyen bir hata olustu.";
        }

        renderFiles();
    }

    isUploading = false;
    renderFiles();
}

function preventDefaultDrag(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
}

loadHealth();
loadMangas();
renderFiles();

mangaSelect.addEventListener("change", () => {
    console.log("Secilen Manga:", mangaSelect.value);
});

cbzInput.addEventListener("change", () => {
    if (cbzInput.files) {
        addFiles(cbzInput.files);
        cbzInput.value = "";
    }
});

previewButton.addEventListener("click", () => {
    void previewSelectedFiles();
});

dropZone.addEventListener("dragenter", (event) => {
    preventDefaultDrag(event);
    dropZone.classList.add("drag-over");
});

dropZone.addEventListener("dragover", (event) => {
    preventDefaultDrag(event);
    dropZone.classList.add("drag-over");
});

dropZone.addEventListener("dragleave", (event) => {
    preventDefaultDrag(event);
    dropZone.classList.remove("drag-over");
});

dropZone.addEventListener("drop", (event) => {
    preventDefaultDrag(event);
    dropZone.classList.remove("drag-over");

    if (event.dataTransfer?.files) {
        addFiles(event.dataTransfer.files);
    }
});
