package sanity

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
)

func (c *Client) FindManga(title string) (*Manga, error) { //method

	query := `*[_type == "manga" && title == $title]{_id,title,myAnimeListId,"slug":slug.current}`

	u := c.URL("data/query/" + c.config.SanityDataset)

	params := url.Values{}
	params.Set("query", query)

	quotedTitle, err := json.Marshal(title)
	if err != nil {
		return nil, err
	}

	params.Set("$title", string(quotedTitle))

	req, err := http.NewRequest(
		http.MethodGet,
		u+"?"+params.Encode(),
		nil,
	)

	if err != nil {
		return nil, err
	}

	req.Header.Set("Authorization", "Bearer "+c.config.SanityToken)

	res, err := c.http.Do(req)
	if err != nil {
		return nil, err
	}

	defer res.Body.Close()

	if res.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(res.Body)

		return nil, fmt.Errorf(
			"Sanity isteği başarısız (%d): %s",
			res.StatusCode,
			string(body),
		)
	}

	var response QueryResponse[Manga]

	err = json.NewDecoder(res.Body).Decode(&response)
	if err != nil {
		return nil, err
	}

	if len(response.Result) == 0 {
		return nil, fmt.Errorf("'%s' isminde manga bulunamadı", title)
	}

	return &response.Result[0], nil
}

func (c *Client) ListMangas() ([]Manga, error) {

	query := `*[_type == "manga"]{
		_id,
		title,
		myAnimeListId,
		"slug": slug.current
	}|order(title asc)`

	u := c.URL("data/query/" + c.config.SanityDataset)

	params := url.Values{}
	params.Set("query", query)

	req, err := http.NewRequest(
		http.MethodGet,
		u+"?"+params.Encode(),
		nil,
	)

	if err != nil {
		return nil, err
	}

	req.Header.Set("Authorization", "Bearer "+c.config.SanityToken)

	res, err := c.http.Do(req)
	if err != nil {
		return nil, err
	}

	defer res.Body.Close()

	if res.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(res.Body)

		return nil, fmt.Errorf(
			"Sanity isteği başarısız (%d): %s",
			res.StatusCode,
			string(body),
		)
	}

	var response QueryResponse[Manga]

	err = json.NewDecoder(res.Body).Decode(&response)
	if err != nil {
		return nil, err
	}

	return response.Result, nil
}
