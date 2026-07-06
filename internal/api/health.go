package api

import (
	"encoding/json"
	"net/http"

	"github.com/falsisdev/mangile-importer/internal/config"
)

type HealthResponse struct {
	Status    string `json:"status"`
	ProjectID string `json:"projectId"`
	Dataset   string `json:"dataset"`
}

func Health(w http.ResponseWriter, r *http.Request) {

	cfg, err := config.Load()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")

	json.NewEncoder(w).Encode(HealthResponse{
		Status:    "ok",
		ProjectID: cfg.SanityProjectID,
		Dataset:   cfg.SanityDataset,
	})
}
