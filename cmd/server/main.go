package main

import (
	"log"
	"net/http"
	"os"
	"path/filepath"

	"github.com/falsisdev/mangile-importer/internal/api"
)

func main() {
	// Proje köküne geç
	err := os.Chdir(filepath.Join("..", ".."))
	if err != nil {
		log.Fatal(err)
	}

	mux := api.RegisterRoutes()

	log.Println("Server running at http://localhost:8080")

	log.Fatal(http.ListenAndServe(":8080", mux))
}
