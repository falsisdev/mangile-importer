package api

import (
	"encoding/json"
	"log"
	"net/http"
	"os"

	"github.com/falsisdev/mangile-importer/internal/config"
	"github.com/falsisdev/mangile-importer/internal/importer"
)

func RegisterRoutes() *http.ServeMux {

	mux := http.NewServeMux()

	fs := http.FileServer(http.Dir(config.WebDir))

	mux.Handle("/", fs)

	mux.HandleFunc("/api/upload", UploadCBZ)

	return mux
}

func UploadCBZ(w http.ResponseWriter, r *http.Request) {

	if r.Method != http.MethodPost {
		http.Error(w, "Methoda izin verilmemektedir.", http.StatusMethodNotAllowed)
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

	log.Printf("Yüklendi: %s", header.Filename)

	chapter, err := importer.ReadCBZ(temp.Name())
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")

	json.NewEncoder(w).Encode(chapter)
}
