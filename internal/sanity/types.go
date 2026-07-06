package sanity

type Manga struct {
	ID    string `json:"_id"`
	Title string `json:"title"`
}

type QueryResponse[T any] struct {
	Result []T `json:"result"`
}
