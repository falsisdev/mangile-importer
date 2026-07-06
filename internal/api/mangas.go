package api

import (
	"encoding/json"
	"net/http"

	"github.com/falsisdev/mangile-importer/internal/config"
	"github.com/falsisdev/mangile-importer/internal/sanity"
)

func GetMangas(w http.ResponseWriter, r *http.Request) {

	cfg, err := config.Load()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	client := sanity.New(cfg)

	mangas, err := client.ListMangas()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")

	json.NewEncoder(w).Encode(mangas)
}
