package config

import (
	"fmt"
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	SanityProjectID  string
	SanityDataset    string
	SanityToken      string
	SanityAPIVersion string
}

// (*Config, error) return'de dönecek tipleri belirtiyor.
func Load() (*Config, error) {

	godotenv.Load()

	cfg := &Config{
		SanityProjectID:  os.Getenv("SANITY_PROJECT_ID"),
		SanityDataset:    os.Getenv("SANITY_DATASET"),
		SanityToken:      os.Getenv("SANITY_TOKEN"),
		SanityAPIVersion: os.Getenv("SANITY_API_VERSION"),
	}

	if cfg.SanityProjectID == "" {
		return nil, fmt.Errorf("SANITY_PROJECT_ID is not set")
	}

	if cfg.SanityDataset == "" {
		return nil, fmt.Errorf("SANITY_DATASET is not set")
	}

	if cfg.SanityToken == "" {
		return nil, fmt.Errorf("SANITY_TOKEN is not set")
	}

	if cfg.SanityAPIVersion == "" {
		cfg.SanityAPIVersion = "2025-02-19"
	}

	return cfg, nil //*Config, error
}
