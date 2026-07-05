package importer

import (
	"archive/zip"
	"fmt"
	"io"
)

type Archive struct {
	reader *zip.ReadCloser
}

func Open(path string) (*Archive, error) {
	reader, err := zip.OpenReader(path)
	if err != nil {
		return nil, err
	}

	return &Archive{
		reader: reader,
	}, nil
}

func (a *Archive) Close() error {
	return a.reader.Close()
}

func (a *Archive) OpenPage(path string) (io.ReadCloser, error) {
	for _, file := range a.reader.File {
		if file.Name == path {
			return file.Open()
		}
	}

	return nil, fmt.Errorf("page not found: %s", path)
}
