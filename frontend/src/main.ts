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

const selectedFiles: File[] = [];

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
                        Bir veya birden fazl .cbz dosyası seç veya sürükle-bırak
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
                <span class="drop-zone-title">CBZ dosyalarini buraya birak</span>
                <span class="drop-zone-description">
                    veya dosya seçmek için tıkla
                </span>
            </label>

            <div id="emptyFiles" class="empty-files">
                Henuz dosya seçilmedi.
            </div>

            <ul id="fileList" class="file-list" aria-label="Seçilen CBZ Dosyaları"></ul>

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
        status.textContent = "Sanity'e bağlanılamadı";
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
        option.textContent = "Mangalar yüklenemedi";

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

function addFiles(files: FileList | File[]) {
    const existingFileKeys = new Set(selectedFiles.map(getFileKey));
    const incomingFiles = Array.from(files).filter(isCbzFile);

    incomingFiles.forEach((file) => {
        const fileKey = getFileKey(file);

        if (!existingFileKeys.has(fileKey)) {
            selectedFiles.push(file);
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

    selectedFiles.forEach((file, index) => {
        const item = document.createElement("li");
        const fileInfo = document.createElement("div");
        const fileName = document.createElement("span");
        const fileSize = document.createElement("span");
        const removeButton = document.createElement("button");

        item.className = "file-item";
        fileInfo.className = "file-info";
        fileName.className = "file-name";
        fileSize.className = "file-size";
        removeButton.className = "remove-file";

        fileName.textContent = file.name;
        fileSize.textContent = formatFileSize(file.size);
        removeButton.type = "button";
        removeButton.textContent = "Kaldır";
        removeButton.setAttribute("aria-label", `${file.name} dosyasını kaldır`);

        removeButton.addEventListener("click", () => {
            selectedFiles.splice(index, 1);
            renderFiles();
        });

        fileInfo.append(fileName, fileSize);
        item.append(fileInfo, removeButton);
        fileList.appendChild(item);
    });
}

function preventDefaultDrag(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
}

loadHealth();
loadMangas();
renderFiles();

mangaSelect.addEventListener("change", () => {
    console.log("Seçilen Manga:", mangaSelect.value);
});

cbzInput.addEventListener("change", () => {
    if (cbzInput.files) {
        addFiles(cbzInput.files);
        cbzInput.value = "";
    }
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
