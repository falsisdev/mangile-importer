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

/*
(a *Archive)'in varlığı fonksiyonu methoda çevirir. Methodlar archive1.Close() gibi belirli bir arşiv üzerinde Close() methodunu çağırabilmeye yarar.
a burada self/this görevi görür. Methodun çağırıldığı şeyi (örneğin archive1) ifade eder. "a.reader.Close()" yapıldığında a ifadesi archive1'i (örnek) ifade ediyor. arhive1.reader.Close() yapıp arhive1'i okumayı kapatmayı ifade eder.
Çünkü a değişkeni, o an üzerinde işlem yapılan nesneyi temsil eder.
a demek: "Bu metodu çağıran spesifik Archive örneğine (instance) bir işaretçi (pointer) ver."
a.reader demek: "İşte bu spesifik Archive'in içindeki reader isimli alana eriş."
a.reader.Close() demek: "Bu spesifik arşivin sahip olduğu zip.ReadCloser'u kapat."
Zira Close() methodunu tanımlarken a'ya verdiğimiz Arhive türünün struchtı içinde reader'ın tipi *zip.ReaderCloser olarak tanımlanmış. Bu sayede a.reader olarak çağırdığımızda bahsettiğimiz reader isimli alanın türü *zip.ReaderCloser olduğu için Close() methodunu çağırabiliyoruz.
Methodun içerisinde çağırılan reader.Close() "archive/zip" paketine ait, bizim oluşturduğumuz methodun da Close() olması method içerisinde aynı methodu çağırdığımız anlamına gelmiyor.

Özetle: Eğer a olmasaydı, fonksiyon hangi Archive'in içindeki reader'ı kapatacağını bilemezdi.

Bu methodu neden yazdık? -|
Çünkü biz Archive yapımızın içindeki reader alanını dışarıya saklıyoruz (private - küçük harfle reader). Kullanıcı bizim paketimizi kullanırken doğrudan zip.ReadCloser ile uğraşmasın, sadece Archive üzerinden işlem yapsın diye böyle bir aracı metot yazdık. Kullanıcı arşiv.Close() dediğinde, arka planda zip kapatılıyor.

Ek: Archive tipinde pointer (*) kullanılma sebebi nesnenin orijinali üzerinden işlem yapılması gereğidir. Orijinali değil de kopyası kapanırsa saçma sapan bir şey olur ve hiç işimize yaramaz. Ayrıca kaynak sızıntısına sebep olur.
Bu yüzden dosya, bağlantı gibi kaynakları yöneten metotlarda her zaman işaretçi alıcı (*T) kullanılır.
*/
func (a *Archive) Close() error {
	return a.reader.Close()
}

func (a *Archive) OpenPage(path string) (io.ReadCloser, error) {
	for _, file := range a.reader.File {
		if file.Name == path {
			return file.Open()
		}
	}

	return nil, fmt.Errorf("Sayfa bulunamadı: %s", path)
}

//OpenPage ile alınan io.ReadCloser kullanıldıktan sonra kapatılmalıdır (örneğin defer closer.Close() ile), aksi takdirde kaynak sızıntısı olabilir.
//Archive.Close() çağrıldığında tüm arşiv kapanır, ancak OpenPage ile açılmış bireysel okuyucular hala açık olabilir; bu kullanıcının sorumluluğundadır.
//Kod, ZIP arşivini belleğe tamamen okumaz, dosyaları isteğe bağlı olarak açar; bu da büyük arşivlerde avantaj sağlar.
