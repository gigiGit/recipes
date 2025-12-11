import Foundation

struct Recipe: Identifiable, Codable {
    let id: UUID
    let nome: String
    let ingredienti: [String]
    let istruzioni: String
    let dataInserimento: String
    let autore: String
    let difficolta: String
    let costo: String
    let tempoPreparazione: Int
    let tempoCottura: Int
    let quantita: Int
    let metodoCottura: String
    let tipoPiatto: String
    let vinoPreferibile: [String]
    
    enum CodingKeys: String, CodingKey {
        case nome = "Nome"
        case ingredienti = "Ingredienti"
        case istruzioni = "Istruzioni"
        case dataInserimento = "DataInserimento"
        case autore = "Autore"
        case difficolta = "Difficolta"
        case costo = "Costo"
        case tempoPreparazione = "TempoPreparazione"
        case tempoCottura = "TempoCottura"
        case quantita = "Quantita"
        case metodoCottura = "MetodoCottura"
        case tipoPiatto = "TipoPiatto"
        case vinoPreferibile = "VinoPreferibile"
    }
    
    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.id = UUID()
        self.nome = try container.decode(String.self, forKey: .nome)
        self.ingredienti = try container.decode([String].self, forKey: .ingredienti)
        self.istruzioni = try container.decode(String.self, forKey: .istruzioni)
        self.dataInserimento = try container.decode(String.self, forKey: .dataInserimento)
        self.autore = try container.decode(String.self, forKey: .autore)
        self.difficolta = try container.decode(String.self, forKey: .difficolta)
        self.costo = try container.decode(String.self, forKey: .costo)
        self.tempoPreparazione = try container.decode(Int.self, forKey: .tempoPreparazione)
        self.tempoCottura = try container.decode(Int.self, forKey: .tempoCottura)
        self.quantita = try container.decode(Int.self, forKey: .quantita)
        self.metodoCottura = try container.decode(String.self, forKey: .metodoCottura)
        self.tipoPiatto = try container.decode(String.self, forKey: .tipoPiatto)
        self.vinoPreferibile = try container.decode([String].self, forKey: .vinoPreferibile)
    }
    
    init(id: UUID = UUID(),
         nome: String,
         ingredienti: [String],
         istruzioni: String,
         dataInserimento: String = "",
         autore: String = "",
         difficolta: String = "",
         costo: String = "",
         tempoPreparazione: Int = 0,
         tempoCottura: Int = 0,
         quantita: Int = 0,
         metodoCottura: String = "",
         tipoPiatto: String = "",
         vinoPreferibile: [String] = []) {
        self.id = id
        self.nome = nome
        self.ingredienti = ingredienti
        self.istruzioni = istruzioni
        self.dataInserimento = dataInserimento
        self.autore = autore
        self.difficolta = difficolta
        self.costo = costo
        self.tempoPreparazione = tempoPreparazione
        self.tempoCottura = tempoCottura
        self.quantita = quantita
        self.metodoCottura = metodoCottura
        self.tipoPiatto = tipoPiatto
        self.vinoPreferibile = vinoPreferibile
    }
    
    func encode(to encoder: Encoder) throws {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try container.encode(nome, forKey: .nome)
        try container.encode(ingredienti, forKey: .ingredienti)
        try container.encode(istruzioni, forKey: .istruzioni)
        try container.encode(dataInserimento, forKey: .dataInserimento)
        try container.encode(autore, forKey: .autore)
        try container.encode(difficolta, forKey: .difficolta)
        try container.encode(costo, forKey: .costo)
        try container.encode(tempoPreparazione, forKey: .tempoPreparazione)
        try container.encode(tempoCottura, forKey: .tempoCottura)
        try container.encode(quantita, forKey: .quantita)
        try container.encode(metodoCottura, forKey: .metodoCottura)
        try container.encode(tipoPiatto, forKey: .tipoPiatto)
        try container.encode(vinoPreferibile, forKey: .vinoPreferibile)
    }
}

// Tipologie di piatto ordinate
let dishTypes = ["Antipasto", "Primo", "Secondo", "Piatto Unico", "Contorno", "Dolce", "Liquore"]
