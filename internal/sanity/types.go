package sanity

type Manga struct {
	ID            string `json:"_id"`
	Title         string `json:"title"`
	Slug          string `json:"slug"`
	MyAnimeListID int    `json:"myAnimeListId"`
}

type QueryResponse[T any] struct {
	Result []T `json:"result"`
}

type SanityUser struct {
	LogtoID  string `json:"logtoId"`
	Name     string `json:"name"`
	Username string `json:"username"`
	Avatar   string `json:"avatar"`
	Roles    any    `json:"roles"` //array içinde rol idleri
}
