import "./style.css";

interface HealthResponse {
    status: string;
    projectId: string;
    dataset: string;
}

document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
<div class="app">

    <header class="header">
        <h1>Mangile Importer</h1>

        <p>
            Komikku → Sanity İçe Aktarma Aracı
        </p>
    </header>

    <main class="content">

        <div class="card">

            <h2>Hazırlanıyor...</h2>

            <p>
                Frontend başarıyla çalışıyor.
            </p>

            <div class="status">
                Durum kontrol ediliyor...
            </div>

        </div>

    </main>

</div>
`;

const status = document.querySelector(".status")!;

async function loadHealth() {
    try {
        const response = await fetch("/api/health");

        const health: HealthResponse = await response.json();

        status.textContent =
            `🟢 Bağlandı • ${health.projectId}/${health.dataset}`;
    } catch {
        status.textContent =
            "🔴 Backend'e bağlanılamadı";
    }
}

loadHealth();