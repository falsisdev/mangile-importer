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
