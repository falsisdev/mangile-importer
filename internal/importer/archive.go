package importer

import "archive/zip"

type Archive struct {
	reader *zip.ReadCloser
}
