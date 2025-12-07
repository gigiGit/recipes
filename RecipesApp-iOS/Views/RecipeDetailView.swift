import SwiftUI
import PDFKit

struct RecipeDetailView: View {
    let recipe: Recipe
    @State private var showingShareSheet = false
    @State private var showingPrintOptions = false
    
    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 16) {
                // Header
                VStack(alignment: .leading, spacing: 8) {
                    Text(recipe.nome)
                        .font(.title)
                        .fontWeight(.bold)
                    
                    HStack(spacing: 12) {
                        Label(recipe.tipoPiatto, systemImage: "fork.knife")
                            .font(.caption)
                            .padding(.horizontal, 8)
                            .padding(.vertical, 4)
                            .background(Color.blue.opacity(0.2))
                            .cornerRadius(4)
                        
                        Label(recipe.autore, systemImage: "person.fill")
                            .font(.caption)
                            .padding(.horizontal, 8)
                            .padding(.vertical, 4)
                            .background(Color.green.opacity(0.2))
                            .cornerRadius(4)
                    }
                }
                
                Divider()
                
                // Info riassuntiva
                VStack(alignment: .leading, spacing: 8) {
                    Text("Informazioni")
                        .font(.headline)
                    
                    InfoRow(label: "Difficoltà", value: recipe.difficolta)
                    InfoRow(label: "Costo", value: recipe.costo)
                    InfoRow(label: "Tempo Preparazione", value: "\(recipe.tempoPreparazione) min")
                    InfoRow(label: "Tempo Cottura", value: "\(recipe.tempoCottura) min")
                    InfoRow(label: "Quantità", value: "\(recipe.quantita) porzioni")
                    InfoRow(label: "Metodo Cottura", value: recipe.metodoCottura)
                    
                    if !recipe.vinoPreferibile.isEmpty {
                        InfoRow(label: "Vino Consigliato", value: recipe.vinoPreferibile.joined(separator: ", "))
                    }
                }
                
                Divider()
                
                // Ingredienti
                VStack(alignment: .leading, spacing: 8) {
                    Text("Ingredienti")
                        .font(.headline)
                    
                    VStack(alignment: .leading, spacing: 4) {
                        ForEach(recipe.ingredienti, id: \.self) { ingrediente in
                            HStack {
                                Image(systemName: "circle.fill")
                                    .font(.system(size: 6))
                                    .foregroundColor(.blue)
                                Text(ingrediente)
                                    .font(.body)
                            }
                        }
                    }
                }
                
                Divider()
                
                // Istruzioni
                VStack(alignment: .leading, spacing: 8) {
                    Text("Istruzioni")
                        .font(.headline)
                    Text(recipe.istruzioni)
                        .font(.body)
                        .lineSpacing(4)
                }
                
                Spacer()
                    .frame(height: 20)
            }
            .padding()
        }
        .navigationTitle("Dettagli Ricetta")
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .navigationBarTrailing) {
                Menu {
                    Button(action: { showingShareSheet = true }) {
                        Label("Condividi", systemImage: "square.and.arrow.up")
                    }
                    
                    Button(action: { showingPrintOptions = true }) {
                        Label("Stampa PDF", systemImage: "doc.pdf")
                    }
                } label: {
                    Image(systemName: "ellipsis.circle")
                }
            }
        }
        .sheet(isPresented: $showingShareSheet) {
            ShareSheet(items: [generateRecipeText()])
        }
        .sheet(isPresented: $showingPrintOptions) {
            PrintView(recipe: recipe)
        }
    }
    
    private func generateRecipeText() -> String {
        """
        RICETTA: \(recipe.nome)
        
        TIPO: \(recipe.tipoPiatto)
        AUTORE: \(recipe.autore)
        
        INGREDIENTI:
        \(recipe.ingredienti.enumerated().map { "\($0.offset + 1). \($0.element)" }.joined(separator: "\n"))
        
        ISTRUZIONI:
        \(recipe.istruzioni)
        
        INFORMAZIONI:
        Difficoltà: \(recipe.difficolta)
        Costo: \(recipe.costo)
        Tempo Preparazione: \(recipe.tempoPreparazione) min
        Tempo Cottura: \(recipe.tempoCottura) min
        Quantità: \(recipe.quantita) porzioni
        Metodo Cottura: \(recipe.metodoCottura)
        \(recipe.vinoPreferibile.isEmpty ? "" : "Vino Consigliato: \(recipe.vinoPreferibile.joined(separator: ", "))")
        """
    }
}

struct InfoRow: View {
    let label: String
    let value: String
    
    var body: some View {
        HStack {
            Text(label)
                .font(.callout)
                .foregroundColor(.secondary)
                .frame(maxWidth: .infinity, alignment: .leading)
            
            Text(value)
                .font(.callout)
                .fontWeight(.semibold)
                .frame(maxWidth: .infinity, alignment: .trailing)
        }
        .padding(.vertical, 4)
    }
}

struct ShareSheet: UIViewControllerRepresentable {
    let items: [Any]
    
    func makeUIViewController(context: Context) -> UIActivityViewController {
        UIActivityViewController(activityItems: items, applicationActivities: nil)
    }
    
    func updateUIViewController(_ uiViewController: UIActivityViewController, context: Context) {}
}

#Preview {
    NavigationStack {
        RecipeDetailView(recipe: Recipe(
            id: UUID(),
            nome: "Carbonara",
            ingredienti: ["Pasta", "Guanciale", "Uova", "Pecorino"],
            istruzioni: "Cuocere la pasta, rosolare il guanciale, mescolare con uova...",
            dataInserimento: "2025-01-01",
            autore: "Internet",
            difficolta: "Facile",
            costo: "Basso",
            tempoPreparazione: 15,
            tempoCottura: 10,
            quantita: 4,
            metodoCottura: "Fornello",
            tipoPiatto: "Primo",
            vinoPreferibile: ["Pinot Grigio"]
        ))
    }
}
