package importer

import "archive/zip"

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
