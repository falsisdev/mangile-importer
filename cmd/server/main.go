package main

import (
	"log"
	"net/http"
	"os"
	"path/filepath"

	"github.com/falsisdev/mangile-importer/internal/api"
	"github.com/falsisdev/mangile-importer/internal/config"
	"github.com/falsisdev/mangile-importer/internal/sanity"
)

func main() {
	// Proje köküne geç
	err := os.Chdir(filepath.Join("..", ".."))
	if err != nil {
		log.Fatal(err)
	}

	cfg, err := config.Load()
	if err != nil {
		log.Fatal(err)
	}

	client := sanity.New(cfg)

	log.Println(client.URL("data/query/" + cfg.SanityDataset))

	log.Printf("Sanity Project: %s", cfg.SanityProjectID)

	mux := api.RegisterRoutes()

	log.Println("Sunucu Başlatıldı: http://localhost:8080")

	log.Fatal(http.ListenAndServe(":8080", mux))
}
