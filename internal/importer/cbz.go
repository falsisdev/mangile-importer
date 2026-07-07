package importer

import (
	"encoding/xml"
	"path/filepath"
	"regexp"
	"sort"
	"strconv"
	"strings"

	"github.com/falsisdev/mangile-importer/internal/models"
)

type comicInfo struct {
	Title   string `xml:"Title"`
	Series  string `xml:"Series"`
	Number  string `xml:"Number"`
	Summary string `xml:"Summary"`
}

func (a *Archive) Read() (*models.Chapter, error) {

	chapter := &models.Chapter{}

	for _, file := range a.reader.File {

		name := strings.ToLower(file.Name)

		if name == "comicinfo.xml" {

			rc, err := file.Open()
			if err != nil {
				return nil, err
			}

			var info comicInfo

			err = xml.NewDecoder(rc).Decode(&info)
			defer rc.Close()

			if err != nil {
				return nil, err
			}

			chapter.Title = info.Title
			chapter.Series = info.Series
			chapter.Number = info.Number
			chapter.Summary = info.Summary

			continue //sonraki for döngüsüne geip buradan sonrakini comicinfo.xml için yapmamayı sağlıyor. eğer kullanılmasaydı comicinfo.xml de diğer içerikler gibi (hepsi görsel) görsel işlemlerine tabi tutulacaktı.
		}

		ext := strings.ToLower(filepath.Ext(file.Name)) //büyük/küçük harfe duyarsız, dosyanın uzantısı alınır (örn: .jpg)

		switch ext {

		case ".jpg", ".jpeg", ".png", ".webp":

			chapter.Pages = append(chapter.Pages, models.Page{
				Index: len(chapter.Pages) + 1,   //Bu sayfanın indeksi (sıra numarası) atanır. len(chapter.Pages) ekleme öncesindeki mevcut sayfa sayısıdır, +1 ile yeni sayfanın indeksi olur. Geçici bir indeksleme, ileride yeniden sıralama yapılacak.
				Name:  filepath.Base(file.Name), //Dosyanın yalnızca adını alır (path bilgisi olmadan), örneğin "sayfa1.jpg".
				Path:  file.Name,
			})

		}
	}

	sort.Slice(chapter.Pages, func(i, j int) bool {
		numI := extractNumber(chapter.Pages[i].Name) //burdan dosya adındaki ilk rakamı aldık
		numJ := extractNumber(chapter.Pages[j].Name) //aynı şey bueda da
		if numI != numJ {
			return numI < numJ
		}
		// dönen sayı aynıysa (mesela 11 ve 12 için ilk rakam 1) o zaman alfabetik karşılaştır / yani normal 11 12 diye sırala
		return chapter.Pages[i].Name < chapter.Pages[j].Name
	})

	for i := range chapter.Pages {
		chapter.Pages[i].Index = i + 1
	}

	return chapter, nil
}

// extractNumber dosya adındaki ilk sayıyı döndürür, yoksa 0 döner.
func extractNumber(filename string) int {
	base := strings.TrimSuffix(filename, filepath.Ext(filename)) //uzantıyı dosyanın adından ayırmak için
	re := regexp.MustCompile(`\d+`)                              //dosya adından rakamları seçmek için
	numStr := re.FindString(base)
	if numStr == "" {
		return 0
	}
	num, _ := strconv.Atoi(numStr)
	return num
}
