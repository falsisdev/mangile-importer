package models

type Chapter struct {
	Title   string `json:"title"`
	Series  string `json:"series"`
	Number  string `json:"number"`
	Summary string `json:"summary"`

	Pages []Page `json:"pages"`
}
