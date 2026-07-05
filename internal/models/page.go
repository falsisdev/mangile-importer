package models

type Page struct {
	Index    int    `json:"index"`
	Name     string `json:"name"`
	Path     string `json:"path"`
	AssetRef string `json:"assetRef,omitempty"`
}
