package api

import (
	"encoding/json"
	"net/http"

	"github.com/falsisdev/mangile-importer/internal/config"
	"github.com/falsisdev/mangile-importer/internal/sanity"
)

func CheckUser(w http.ResponseWriter, r *http.Request) {

	cfg, err := config.Load()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	client := sanity.New(cfg)

	user, err := client.GetUser(r.PathValue("logtoId"))
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	w.Header().Set("Content-Type", "application/json")

	json.NewEncoder(w).Encode(user)
}
