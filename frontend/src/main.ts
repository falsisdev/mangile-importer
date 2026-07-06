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

document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
<div class="app">

    <header class="header">

        <div>
            <h1>Mangile Importer</h1>
            <p>Komikku → Sanity Import Tool</p>
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

    </main>

</div>
`;

const status = document.querySelector<HTMLDivElement>("#status")!;
const mangaSelect =
    document.querySelector<HTMLSelectElement>("#mangaSelect")!;

async function loadHealth() {
    try {
        const response = await fetch("/api/health");

        if (!response.ok) {
            throw new Error();
        }

        const health: HealthResponse = await response.json();

        status.className = "status success";

        status.textContent =
            `🟢 ${health.projectId} / ${health.dataset}`;

    } catch {

        status.className = "status error";

        status.textContent =
            "🔴 Backend'e bağlanılamadı";

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

loadHealth();
loadMangas();

mangaSelect.addEventListener("change", () => {

    console.log(
        "Seçilen Manga:",
        mangaSelect.value
    );

});