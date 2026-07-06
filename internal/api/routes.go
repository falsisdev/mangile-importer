package api

import (
	"encoding/json"
	"log"
	"net/http"
	"os"

	"github.com/falsisdev/mangile-importer/internal/config"
	"github.com/falsisdev/mangile-importer/internal/importer"
	"github.com/falsisdev/mangile-importer/internal/sanity"
)

func RegisterRoutes() *http.ServeMux {

	mux := http.NewServeMux()

	mux.Handle("/", http.FileServer(http.Dir("web")))
	mux.HandleFunc("/api/upload", UploadCBZ)
	mux.HandleFunc("/api/health", Health)

	return mux
}

func UploadCBZ(w http.ResponseWriter, r *http.Request) {

	if r.Method != http.MethodPost {
		http.Error(w, "Sadece POST isteğine izin verilmektedir.", http.StatusMethodNotAllowed)
		return
	}

	err := r.ParseMultipartForm(1024 << 20)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	file, header, err := r.FormFile("cbz")
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	defer file.Close()

	temp, err := os.CreateTemp("", "mangile-*.cbz")
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer os.Remove(temp.Name())
	defer temp.Close()

	_, err = temp.ReadFrom(file)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	log.Printf("CBZ yüklendi: %s", header.Filename)

	archive, err := importer.Open(temp.Name())
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer archive.Close()

	chapter, err := archive.Read()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	cfg, err := config.Load()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	client := sanity.New(cfg)

	manga, err := client.FindManga(chapter.Series)
	if err != nil {
		http.Error(w, err.Error(), http.StatusNotFound)
		return
	}

	log.Printf("Manga bulundu: %s (%s)", manga.Title, manga.ID)

	w.Header().Set("Content-Type", "application/json")

	err = json.NewEncoder(w).Encode(chapter)
	if err != nil {
		log.Println("JSON cevabı gönderilemedi:", err)
	}
}
