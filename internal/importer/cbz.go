package importer

import (
	"archive/zip"
	"encoding/xml"
	"path/filepath"
	"sort"
	"strings"

	"github.com/falsisdev/mangile-importer/internal/models"
)

type comicInfo struct {
	Title   string `xml:"Title"`
	Series  string `xml:"Series"`
	Number  string `xml:"Number"`
	Summary string `xml:"Summary"`
}

func ReadCBZ(path string) (*models.Chapter, error) {

	reader, err := zip.OpenReader(path)
	if err != nil {
		return nil, err
	}
	defer reader.Close()

	chapter := &models.Chapter{}

	for _, file := range reader.File {

		name := strings.ToLower(file.Name)

		if name == "comicinfo.xml" {

			rc, err := file.Open()
			if err != nil {
				return nil, err
			}

			var info comicInfo

			err = xml.NewDecoder(rc).Decode(&info)
			rc.Close()

			if err != nil {
				return nil, err
			}

			chapter.Title = info.Title
			chapter.Series = info.Series
			chapter.Number = info.Number
			chapter.Summary = info.Summary

			continue
		}

		ext := strings.ToLower(filepath.Ext(file.Name))

		switch ext {

		case ".jpg", ".jpeg", ".png", ".webp":

			chapter.Pages = append(chapter.Pages, models.Page{
				Index: len(chapter.Pages) + 1,
				Name:  filepath.Base(file.Name),
				Path:  file.Name,
			})
		}
	}

	sort.Slice(chapter.Pages, func(i, j int) bool {
		return chapter.Pages[i].Name < chapter.Pages[j].Name
	})

	for i := range chapter.Pages {
		chapter.Pages[i].Index = i + 1
	}

	return chapter, nil
}
