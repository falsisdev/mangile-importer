package sanity

import (
	"fmt"
	"net/http"

	"github.com/falsisdev/mangile-importer/internal/config"
)

type Client struct {
	config *config.Config
	http   *http.Client
}

func New(cfg *config.Config) *Client {
	return &Client{
		config: cfg,
		http:   &http.Client{},
	}
}

func (c *Client) URL(path string) string {
	return fmt.Sprintf(
		"https://%s.api.sanity.io/%s/%s",
		c.config.SanityProjectID,
		c.config.SanityAPIVersion,
		path,
	)
}
