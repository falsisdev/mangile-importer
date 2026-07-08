package sanity

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
)

func (c *Client) GetUser(logtoId string) (*SanityUser, error) {
	query := fmt.Sprintf(`*[_type == "auth" && logtoId == "%s"]{
	roles,
	logtoId,
	avatar,
	name,
	username
	}`, logtoId)

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

	var response QueryResponse[SanityUser]

	err = json.NewDecoder(res.Body).Decode(&response)
	if err != nil {
		return nil, err
	}

	if len(response.Result) == 0 {
		return nil, fmt.Errorf("'%s' logtoId'ye sahip bir kullanıcı bulunamadı", logtoId)
	}

	return &response.Result[0], nil
}
func (c *Client) FindManga(title string) (*Manga, error) { //method

	query := `*[_type == "manga" && title == $title]{
	_id,
	_type,
	"banner": bannerImage.asset->url,
	"chapters": chapters[]->{
		_key,
		chapterNumber,
		"pages": pages.asset->url,
	},
	"cover": coverImage.asset->url,
	description,
	tags,
	title,
	myAnimeListId,
	"slug": slug.current,
	}`

	u := c.URL("data/query/" + c.config.SanityDataset)

	params := url.Values{}
	params.Set("query", query)

	quoutedTitle, err := json.Marshal(title)
	if err != nil {
		return nil, err
	}

	params.Set("$title", string(quoutedTitle))

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
