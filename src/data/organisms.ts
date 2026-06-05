export type Difficulty = "Mudah" | "Sedang" | "Sulit";

export interface Organism {
  id: string;
  nama: string;
  namaIlmiah: string;
  emoji: string;
  gambar: string;
  warna: string;
  difficulty: Difficulty;
  kingdom: string;
  filum: string;
  kelas: string;
  ordo: string;
  famili: string;
  genus: string;
  spesies: string;
  habitat: string;
  makanan: string;
  reproduksi: string;
  statusKonservasi: string;
  deskripsi: string;
  faktaUnik: string;
  peranEkosistem: string;
  karakteristik: string[]; // traits used by dichotomous key matching
}

// Image: emoji-rendered SVG data URLs for offline-friendly visuals
const emojiCard = (emoji: string, bg: string) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 400'>
      <defs><radialGradient id='g' cx='50%' cy='40%' r='70%'>
        <stop offset='0%' stop-color='${bg}' stop-opacity='0.9'/>
        <stop offset='100%' stop-color='#0F172A' stop-opacity='1'/>
      </radialGradient></defs>
      <rect width='400' height='400' fill='url(#g)'/>
      <text x='50%' y='58%' font-size='220' text-anchor='middle' dominant-baseline='middle'>${emoji}</text>
    </svg>`
  )}`;

const o = (
  id: string, nama: string, namaIlmiah: string, emoji: string, warna: string,
  difficulty: Difficulty,
  tax: { kingdom: string; filum: string; kelas: string; ordo: string; famili: string; genus: string; spesies: string },
  rest: Omit<Organism, "id"|"nama"|"namaIlmiah"|"emoji"|"warna"|"difficulty"|"gambar"|"kingdom"|"filum"|"kelas"|"ordo"|"famili"|"genus"|"spesies">
): Organism => ({
  id, nama, namaIlmiah, emoji, warna, difficulty,
  gambar: emojiCard(emoji, warna),
  ...tax, ...rest,
});

const MAMMAL_TRAITS = ["bertulang belakang", "berambut", "menyusui", "bernapas dengan paru-paru", "berdarah panas"];
const BIRD_TRAITS = ["bertulang belakang", "berbulu", "bertelur", "bersayap", "berparuh", "bernapas dengan paru-paru", "berdarah panas"];
const REPTILE_TRAITS = ["bertulang belakang", "bersisik", "bertelur", "bernapas dengan paru-paru", "berdarah dingin"];
const AMPHI_TRAITS = ["bertulang belakang", "berkulit lembab", "bertelur", "metamorfosis", "berdarah dingin"];
const FISH_TRAITS = ["bertulang belakang", "bersisik", "bernapas dengan insang", "hidup di air", "berdarah dingin"];
const INSECT_TRAITS = ["tidak bertulang belakang", "berkaki enam", "memiliki antena", "tubuh tiga bagian", "bertelur"];
const ARACHNID_TRAITS = ["tidak bertulang belakang", "berkaki delapan", "tubuh dua bagian"];
const PLANT_TRAITS = ["autotrof", "berklorofil", "berfotosintesis"];

export const organisms: Organism[] = [
  o("singa","Singa","Panthera leo","🦁","#d97706","Mudah",
    {kingdom:"Animalia",filum:"Chordata",kelas:"Mammalia",ordo:"Carnivora",famili:"Felidae",genus:"Panthera",spesies:"P. leo"},
    {habitat:"Sabana Afrika",makanan:"Karnivora (zebra, rusa)",reproduksi:"Vivipar (melahirkan)",statusKonservasi:"Rentan (VU)",
     deskripsi:"Singa adalah kucing besar sosial yang hidup berkelompok dalam pride.",
     faktaUnik:"Auman singa terdengar hingga 8 km.",
     peranEkosistem:"Predator puncak yang menyeimbangkan populasi herbivora.",
     karakteristik:[...MAMMAL_TRAITS,"karnivora","berkaki empat","hidup di darat","hidup berkelompok"]}),
  o("harimau","Harimau","Panthera tigris","🐅","#ea580c","Mudah",
    {kingdom:"Animalia",filum:"Chordata",kelas:"Mammalia",ordo:"Carnivora",famili:"Felidae",genus:"Panthera",spesies:"P. tigris"},
    {habitat:"Hutan tropis Asia",makanan:"Karnivora",reproduksi:"Vivipar",statusKonservasi:"Terancam (EN)",
     deskripsi:"Kucing terbesar di dunia dengan corak loreng khas.",
     faktaUnik:"Setiap loreng harimau unik seperti sidik jari.",
     peranEkosistem:"Predator puncak hutan.",
     karakteristik:[...MAMMAL_TRAITS,"karnivora","berkaki empat","hidup di darat","soliter"]}),
  o("kucing","Kucing","Felis catus","🐈","#94a3b8","Mudah",
    {kingdom:"Animalia",filum:"Chordata",kelas:"Mammalia",ordo:"Carnivora",famili:"Felidae",genus:"Felis",spesies:"F. catus"},
    {habitat:"Pemukiman manusia",makanan:"Karnivora",reproduksi:"Vivipar",statusKonservasi:"Risiko Rendah (LC)",
     deskripsi:"Mamalia domestik populer sebagai hewan peliharaan.",
     faktaUnik:"Kucing dapat membuat ~100 suara berbeda.",
     peranEkosistem:"Pengendali populasi tikus.",
     karakteristik:[...MAMMAL_TRAITS,"karnivora","berkaki empat","hidup di darat"]}),
  o("anjing","Anjing","Canis lupus familiaris","🐕","#a16207","Mudah",
    {kingdom:"Animalia",filum:"Chordata",kelas:"Mammalia",ordo:"Carnivora",famili:"Canidae",genus:"Canis",spesies:"C. l. familiaris"},
    {habitat:"Pemukiman manusia",makanan:"Omnivora",reproduksi:"Vivipar",statusKonservasi:"LC",
     deskripsi:"Hewan domestik yang dijinakkan dari serigala.",
     faktaUnik:"Indera penciuman 40x lebih kuat dari manusia.",
     peranEkosistem:"Pendamping manusia, penjaga ternak.",
     karakteristik:[...MAMMAL_TRAITS,"omnivora","berkaki empat","hidup di darat"]}),
  o("kuda","Kuda","Equus ferus caballus","🐎","#78350f","Mudah",
    {kingdom:"Animalia",filum:"Chordata",kelas:"Mammalia",ordo:"Perissodactyla",famili:"Equidae",genus:"Equus",spesies:"E. ferus"},
    {habitat:"Padang rumput",makanan:"Herbivora",reproduksi:"Vivipar",statusKonservasi:"LC",
     deskripsi:"Hewan berkuku ganjil yang dimanfaatkan sebagai transportasi.",
     faktaUnik:"Kuda dapat tidur sambil berdiri.",
     peranEkosistem:"Penyebar biji rerumputan.",
     karakteristik:[...MAMMAL_TRAITS,"herbivora","berkaki empat","hidup di darat","berkuku"]}),
  o("sapi","Sapi","Bos taurus","🐄","#fef3c7","Mudah",
    {kingdom:"Animalia",filum:"Chordata",kelas:"Mammalia",ordo:"Artiodactyla",famili:"Bovidae",genus:"Bos",spesies:"B. taurus"},
    {habitat:"Padang rumput / peternakan",makanan:"Herbivora",reproduksi:"Vivipar",statusKonservasi:"LC",
     deskripsi:"Hewan ternak ruminansia penghasil susu dan daging.",
     faktaUnik:"Sapi memiliki empat ruang lambung.",
     peranEkosistem:"Penyebar biji & sumber pangan.",
     karakteristik:[...MAMMAL_TRAITS,"herbivora","berkaki empat","hidup di darat","berkuku","memamah biak"]}),
  o("kelelawar","Kelelawar","Pteropus vampyrus","🦇","#1f2937","Sedang",
    {kingdom:"Animalia",filum:"Chordata",kelas:"Mammalia",ordo:"Chiroptera",famili:"Pteropodidae",genus:"Pteropus",spesies:"P. vampyrus"},
    {habitat:"Gua & hutan",makanan:"Frugivora",reproduksi:"Vivipar",statusKonservasi:"NT",
     deskripsi:"Satu-satunya mamalia yang dapat terbang sesungguhnya.",
     faktaUnik:"Menggunakan ekolokasi untuk navigasi.",
     peranEkosistem:"Penyerbuk dan penyebar biji.",
     karakteristik:[...MAMMAL_TRAITS,"bersayap","dapat terbang","hidup di darat"]}),
  o("lumba-lumba","Lumba-lumba","Tursiops truncatus","🐬","#0ea5e9","Sedang",
    {kingdom:"Animalia",filum:"Chordata",kelas:"Mammalia",ordo:"Cetacea",famili:"Delphinidae",genus:"Tursiops",spesies:"T. truncatus"},
    {habitat:"Laut tropis",makanan:"Karnivora (ikan)",reproduksi:"Vivipar",statusKonservasi:"LC",
     deskripsi:"Mamalia laut yang cerdas dan sangat sosial.",
     faktaUnik:"Tidur dengan setengah otak tetap terjaga.",
     peranEkosistem:"Predator laut pertengahan.",
     karakteristik:[...MAMMAL_TRAITS,"hidup di air","karnivora","bernapas dengan paru-paru"]}),
  o("paus","Paus Biru","Balaenoptera musculus","🐋","#1d4ed8","Sulit",
    {kingdom:"Animalia",filum:"Chordata",kelas:"Mammalia",ordo:"Cetacea",famili:"Balaenopteridae",genus:"Balaenoptera",spesies:"B. musculus"},
    {habitat:"Samudra",makanan:"Krill",reproduksi:"Vivipar",statusKonservasi:"EN",
     deskripsi:"Hewan terbesar yang pernah hidup di Bumi.",
     faktaUnik:"Jantungnya seberat mobil kecil.",
     peranEkosistem:"Memperkaya nutrisi laut.",
     karakteristik:[...MAMMAL_TRAITS,"hidup di air","bernapas dengan paru-paru"]}),
  o("elang","Elang Jawa","Nisaetus bartelsi","🦅","#92400e","Sedang",
    {kingdom:"Animalia",filum:"Chordata",kelas:"Aves",ordo:"Accipitriformes",famili:"Accipitridae",genus:"Nisaetus",spesies:"N. bartelsi"},
    {habitat:"Hutan pegunungan",makanan:"Karnivora",reproduksi:"Ovipar",statusKonservasi:"EN",
     deskripsi:"Burung pemangsa endemik Jawa, lambang negara Indonesia.",
     faktaUnik:"Dapat melihat mangsa dari ketinggian 1 km.",
     peranEkosistem:"Predator puncak udara.",
     karakteristik:[...BIRD_TRAITS,"dapat terbang","karnivora","predator"]}),
  o("ayam","Ayam","Gallus gallus domesticus","🐔","#f59e0b","Mudah",
    {kingdom:"Animalia",filum:"Chordata",kelas:"Aves",ordo:"Galliformes",famili:"Phasianidae",genus:"Gallus",spesies:"G. gallus"},
    {habitat:"Pemukiman",makanan:"Omnivora",reproduksi:"Ovipar",statusKonservasi:"LC",
     deskripsi:"Unggas domestik penghasil telur dan daging.",
     faktaUnik:"Ayam adalah kerabat dekat T-Rex.",
     peranEkosistem:"Pengendali serangga.",
     karakteristik:[...BIRD_TRAITS,"tidak dapat terbang jauh","omnivora"]}),
  o("merpati","Merpati","Columba livia","🕊️","#cbd5e1","Mudah",
    {kingdom:"Animalia",filum:"Chordata",kelas:"Aves",ordo:"Columbiformes",famili:"Columbidae",genus:"Columba",spesies:"C. livia"},
    {habitat:"Kota & tebing",makanan:"Granivora",reproduksi:"Ovipar",statusKonservasi:"LC",
     deskripsi:"Burung dengan kemampuan navigasi luar biasa.",
     faktaUnik:"Pernah digunakan sebagai kurir pos.",
     peranEkosistem:"Penyebar biji.",
     karakteristik:[...BIRD_TRAITS,"dapat terbang","granivora"]}),
  o("katak","Katak Sawah","Rana cancrivora","🐸","#16a34a","Sedang",
    {kingdom:"Animalia",filum:"Chordata",kelas:"Amphibia",ordo:"Anura",famili:"Ranidae",genus:"Rana",spesies:"R. cancrivora"},
    {habitat:"Sawah & rawa",makanan:"Insektivora",reproduksi:"Ovipar",statusKonservasi:"LC",
     deskripsi:"Amfibi tanpa ekor yang melompat dengan kaki belakang panjang.",
     faktaUnik:"Bernapas juga melalui kulit.",
     peranEkosistem:"Pengendali serangga.",
     karakteristik:[...AMPHI_TRAITS,"hidup di darat","hidup di air","melompat"]}),
  o("salamander","Salamander","Salamandra salamandra","🦎","#15803d","Sulit",
    {kingdom:"Animalia",filum:"Chordata",kelas:"Amphibia",ordo:"Caudata",famili:"Salamandridae",genus:"Salamandra",spesies:"S. salamandra"},
    {habitat:"Hutan lembab",makanan:"Insektivora",reproduksi:"Ovovivipar",statusKonservasi:"LC",
     deskripsi:"Amfibi berekor yang mampu meregenerasi anggota tubuh.",
     faktaUnik:"Kulitnya beracun sebagai pertahanan.",
     peranEkosistem:"Pengendali invertebrata kecil.",
     karakteristik:[...AMPHI_TRAITS,"berekor","berkaki empat","hidup di darat"]}),
  o("komodo","Komodo","Varanus komodoensis","🦖","#65a30d","Sulit",
    {kingdom:"Animalia",filum:"Chordata",kelas:"Reptilia",ordo:"Squamata",famili:"Varanidae",genus:"Varanus",spesies:"V. komodoensis"},
    {habitat:"P. Komodo & Flores",makanan:"Karnivora",reproduksi:"Ovipar",statusKonservasi:"EN",
     deskripsi:"Kadal terbesar di dunia, endemik Indonesia.",
     faktaUnik:"Air liurnya mengandung bakteri mematikan.",
     peranEkosistem:"Predator puncak pulau.",
     karakteristik:[...REPTILE_TRAITS,"berkaki empat","karnivora","hidup di darat"]}),
  o("ular","Ular Sanca","Python reticulatus","🐍","#15803d","Sedang",
    {kingdom:"Animalia",filum:"Chordata",kelas:"Reptilia",ordo:"Squamata",famili:"Pythonidae",genus:"Python",spesies:"P. reticulatus"},
    {habitat:"Hutan tropis",makanan:"Karnivora",reproduksi:"Ovipar",statusKonservasi:"LC",
     deskripsi:"Ular terpanjang di dunia, tidak berbisa, mencekik mangsa.",
     faktaUnik:"Dapat menelan mangsa lebih besar dari kepalanya.",
     peranEkosistem:"Pengendali populasi hewan kecil.",
     karakteristik:[...REPTILE_TRAITS,"tidak berkaki","karnivora","hidup di darat"]}),
  o("hiu","Hiu Putih","Carcharodon carcharias","🦈","#475569","Sulit",
    {kingdom:"Animalia",filum:"Chordata",kelas:"Chondrichthyes",ordo:"Lamniformes",famili:"Lamnidae",genus:"Carcharodon",spesies:"C. carcharias"},
    {habitat:"Laut beriklim sedang",makanan:"Karnivora",reproduksi:"Ovovivipar",statusKonservasi:"VU",
     deskripsi:"Ikan bertulang rawan predator puncak laut.",
     faktaUnik:"Memiliki ribuan gigi yang terus tumbuh.",
     peranEkosistem:"Menjaga keseimbangan rantai makanan laut.",
     karakteristik:[...FISH_TRAITS,"bertulang rawan","karnivora"]}),
  o("tuna","Tuna Sirip Biru","Thunnus thynnus","🐟","#0369a1","Sedang",
    {kingdom:"Animalia",filum:"Chordata",kelas:"Actinopterygii",ordo:"Scombriformes",famili:"Scombridae",genus:"Thunnus",spesies:"T. thynnus"},
    {habitat:"Laut terbuka",makanan:"Karnivora",reproduksi:"Ovipar",statusKonservasi:"EN",
     deskripsi:"Ikan bertulang sejati perenang cepat.",
     faktaUnik:"Mampu berenang hingga 70 km/jam.",
     peranEkosistem:"Predator pelagis pertengahan.",
     karakteristik:[...FISH_TRAITS,"bertulang sejati","karnivora"]}),
  o("kupu","Kupu-kupu Raja","Danaus plexippus","🦋","#f97316","Sedang",
    {kingdom:"Animalia",filum:"Arthropoda",kelas:"Insecta",ordo:"Lepidoptera",famili:"Nymphalidae",genus:"Danaus",spesies:"D. plexippus"},
    {habitat:"Padang bunga",makanan:"Nektar",reproduksi:"Ovipar",statusKonservasi:"EN",
     deskripsi:"Serangga bermetamorfosis sempurna dengan sayap bersisik.",
     faktaUnik:"Bermigrasi sejauh 4.000 km.",
     peranEkosistem:"Penyerbuk utama.",
     karakteristik:[...INSECT_TRAITS,"bersayap","dapat terbang","metamorfosis sempurna"]}),
  o("belalang","Belalang","Valanga nigricornis","🦗","#4d7c0f","Mudah",
    {kingdom:"Animalia",filum:"Arthropoda",kelas:"Insecta",ordo:"Orthoptera",famili:"Acrididae",genus:"Valanga",spesies:"V. nigricornis"},
    {habitat:"Padang rumput",makanan:"Herbivora",reproduksi:"Ovipar",statusKonservasi:"LC",
     deskripsi:"Serangga pelompat dengan kaki belakang kuat.",
     faktaUnik:"Dapat melompat 20x panjang tubuhnya.",
     peranEkosistem:"Konsumen tumbuhan & mangsa burung.",
     karakteristik:[...INSECT_TRAITS,"bersayap","herbivora","melompat"]}),
  o("semut","Semut Hitam","Dolichoderus thoracicus","🐜","#1f2937","Mudah",
    {kingdom:"Animalia",filum:"Arthropoda",kelas:"Insecta",ordo:"Hymenoptera",famili:"Formicidae",genus:"Dolichoderus",spesies:"D. thoracicus"},
    {habitat:"Tanah, pohon",makanan:"Omnivora",reproduksi:"Ovipar",statusKonservasi:"LC",
     deskripsi:"Serangga sosial hidup dalam koloni terorganisir.",
     faktaUnik:"Dapat mengangkat beban 50x berat tubuhnya.",
     peranEkosistem:"Pengurai & penyebar biji.",
     karakteristik:[...INSECT_TRAITS,"hidup berkoloni","omnivora","tidak bersayap"]}),
  o("lebah","Lebah Madu","Apis mellifera","🐝","#eab308","Sedang",
    {kingdom:"Animalia",filum:"Arthropoda",kelas:"Insecta",ordo:"Hymenoptera",famili:"Apidae",genus:"Apis",spesies:"A. mellifera"},
    {habitat:"Sarang di pohon",makanan:"Nektar & polen",reproduksi:"Ovipar",statusKonservasi:"LC",
     deskripsi:"Serangga sosial penghasil madu dan penyerbuk utama.",
     faktaUnik:"Berkomunikasi lewat tarian waggle.",
     peranEkosistem:"Penyerbuk paling penting di dunia.",
     karakteristik:[...INSECT_TRAITS,"bersayap","hidup berkoloni","menghasilkan madu"]}),
  o("laba","Laba-laba","Nephila pilipes","🕷️","#3f3f46","Sedang",
    {kingdom:"Animalia",filum:"Arthropoda",kelas:"Arachnida",ordo:"Araneae",famili:"Araneidae",genus:"Nephila",spesies:"N. pilipes"},
    {habitat:"Hutan & taman",makanan:"Karnivora",reproduksi:"Ovipar",statusKonservasi:"LC",
     deskripsi:"Arachnida pembuat jaring sutra penjebak mangsa.",
     faktaUnik:"Sutranya lebih kuat dari baja.",
     peranEkosistem:"Pengendali populasi serangga.",
     karakteristik:[...ARACHNID_TRAITS,"karnivora","membuat jaring"]}),
  o("mangga","Mangga","Mangifera indica","🥭","#facc15","Mudah",
    {kingdom:"Plantae",filum:"Magnoliophyta",kelas:"Magnoliopsida",ordo:"Sapindales",famili:"Anacardiaceae",genus:"Mangifera",spesies:"M. indica"},
    {habitat:"Tropis",makanan:"Autotrof",reproduksi:"Generatif (biji)",statusKonservasi:"LC",
     deskripsi:"Pohon buah tropis berbiji tunggal.",
     faktaUnik:"Satu pohon dapat berbuah ratusan tahun.",
     peranEkosistem:"Sumber pangan satwa & manusia.",
     karakteristik:[...PLANT_TRAITS,"berbiji tertutup","berbiji belah dua","berbunga","berbuah"]}),
  o("kelapa","Kelapa","Cocos nucifera","🥥","#92400e","Mudah",
    {kingdom:"Plantae",filum:"Magnoliophyta",kelas:"Liliopsida",ordo:"Arecales",famili:"Arecaceae",genus:"Cocos",spesies:"C. nucifera"},
    {habitat:"Pantai tropis",makanan:"Autotrof",reproduksi:"Generatif",statusKonservasi:"LC",
     deskripsi:"Palma serbaguna dengan buah berkulit serat tebal.",
     faktaUnik:"Bijinya dapat hanyut ribuan km tetap tumbuh.",
     peranEkosistem:"Penahan abrasi pantai.",
     karakteristik:[...PLANT_TRAITS,"berbiji tertutup","berbiji belah satu","berbunga","berbuah"]}),
  o("jagung","Jagung","Zea mays","🌽","#ca8a04","Mudah",
    {kingdom:"Plantae",filum:"Magnoliophyta",kelas:"Liliopsida",ordo:"Poales",famili:"Poaceae",genus:"Zea",spesies:"Z. mays"},
    {habitat:"Ladang",makanan:"Autotrof",reproduksi:"Generatif",statusKonservasi:"LC",
     deskripsi:"Tanaman serealia pokok dunia.",
     faktaUnik:"Setiap rambut jagung = satu biji.",
     peranEkosistem:"Sumber pangan utama.",
     karakteristik:[...PLANT_TRAITS,"berbiji tertutup","berbiji belah satu","berbunga"]}),
  o("padi","Padi","Oryza sativa","🌾","#a3a3a3","Mudah",
    {kingdom:"Plantae",filum:"Magnoliophyta",kelas:"Liliopsida",ordo:"Poales",famili:"Poaceae",genus:"Oryza",spesies:"O. sativa"},
    {habitat:"Sawah",makanan:"Autotrof",reproduksi:"Generatif",statusKonservasi:"LC",
     deskripsi:"Tanaman penghasil beras, makanan pokok Asia.",
     faktaUnik:"Telah dibudidayakan >10.000 tahun.",
     peranEkosistem:"Habitat sementara katak & ikan sawah.",
     karakteristik:[...PLANT_TRAITS,"berbiji tertutup","berbiji belah satu","berbunga"]}),
  o("pakis","Pakis","Nephrolepis biserrata","🌿","#22c55e","Sedang",
    {kingdom:"Plantae",filum:"Pteridophyta",kelas:"Polypodiopsida",ordo:"Polypodiales",famili:"Nephrolepidaceae",genus:"Nephrolepis",spesies:"N. biserrata"},
    {habitat:"Hutan lembab",makanan:"Autotrof",reproduksi:"Spora",statusKonservasi:"LC",
     deskripsi:"Tumbuhan paku tanpa bunga & biji.",
     faktaUnik:"Daun muda menggulung seperti gagang biola.",
     peranEkosistem:"Penahan erosi tanah.",
     karakteristik:[...PLANT_TRAITS,"tidak berbunga","berspora","berpembuluh"]}),
  o("lumut","Lumut Daun","Polytrichum commune","🍃","#16a34a","Sulit",
    {kingdom:"Plantae",filum:"Bryophyta",kelas:"Polytrichopsida",ordo:"Polytrichales",famili:"Polytrichaceae",genus:"Polytrichum",spesies:"P. commune"},
    {habitat:"Batu lembab & hutan",makanan:"Autotrof",reproduksi:"Spora",statusKonservasi:"LC",
     deskripsi:"Tumbuhan kecil tak berpembuluh, hidup berumpun.",
     faktaUnik:"Dapat menyerap air hingga 20x beratnya.",
     peranEkosistem:"Pelopor suksesi ekosistem.",
     karakteristik:[...PLANT_TRAITS,"tidak berbunga","berspora","tidak berpembuluh"]}),
  o("jamur","Jamur Tiram","Pleurotus ostreatus","🍄","#fef3c7","Sedang",
    {kingdom:"Fungi",filum:"Basidiomycota",kelas:"Agaricomycetes",ordo:"Agaricales",famili:"Pleurotaceae",genus:"Pleurotus",spesies:"P. ostreatus"},
    {habitat:"Kayu lapuk",makanan:"Saprofit",reproduksi:"Spora",statusKonservasi:"LC",
     deskripsi:"Fungi pengurai dengan tubuh buah berbentuk tiram.",
     faktaUnik:"Dapat mengurai plastik tertentu.",
     peranEkosistem:"Dekomposer hutan.",
     karakteristik:["tidak berklorofil","heterotrof","berspora","saprofit","tidak bergerak"]}),
];

export const getOrganism = (id: string) => organisms.find((x) => x.id === id);
