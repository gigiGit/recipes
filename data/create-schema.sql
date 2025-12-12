CREATE TABLE IF NOT EXISTS ricette (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    autore TEXT,
    data_inserimento TEXT,
    difficolta TEXT,
    costo TEXT,
    tempo_preparazione INTEGER,
    tempo_cottura INTEGER,
    quantita INTEGER,
    metodo_cottura TEXT,
    tipo_piatto TEXT,
    istruzioni TEXT,
    immagine1 TEXT,
    immagine2 TEXT,
    immagine3 TEXT
);

CREATE TABLE IF NOT EXISTS ingredienti (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ricetta_id INTEGER,
    ingrediente TEXT,
    FOREIGN KEY (ricetta_id) REFERENCES ricette(id)
);

CREATE TABLE IF NOT EXISTS vini (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ricetta_id INTEGER,
    vino TEXT,
    FOREIGN KEY (ricetta_id) REFERENCES ricette(id)
);

CREATE INDEX idx_ricette_nome ON ricette(nome);
CREATE INDEX idx_ricette_tipo ON ricette(tipo_piatto);
CREATE INDEX idx_ricette_autore ON ricette(autore);
