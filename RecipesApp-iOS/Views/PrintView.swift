import SwiftUI
import PDFKit

struct PrintView: UIViewControllerRepresentable {
    let recipe: Recipe
    @Environment(\.dismiss) var dismiss
    
    func makeUIViewController(context: Context) -> UIPrintInteractionController {
        let printController = UIPrintInteractionController.shared
        
        let pdfData = generatePDF()
        let printFormatter = UISimpleTextPrintFormatter(text: generateRecipeText())
        
        printController.printFormatter = printFormatter
        
        return printController
    }
    
    func updateUIViewController(_ uiViewController: UIPrintInteractionController, context: Context) {}
    
    private func generatePDF() -> Data? {
        let pdfRenderer = UIGraphicsPDFRenderer(bounds: CGRect(x: 0, y: 0, width: 612, height: 792))
        
        let pdfData = pdfRenderer.pdfData { context in
            context.beginPage()
            
            let attributes: [NSAttributedString.Key: Any] = [
                .font: UIFont.systemFont(ofSize: 24, weight: .bold)
            ]
            
            let title = NSAttributedString(string: recipe.nome, attributes: attributes)
            title.draw(at: CGPoint(x: 40, y: 40))
        }
        
        return pdfData
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
        """
    }
}

struct PrintBookView: UIViewControllerRepresentable {
    let author: String
    let recipesByType: [(type: String, recipes: [Recipe])]
    @Environment(\.dismiss) var dismiss
    
    func makeUIViewController(context: Context) -> UIPrintInteractionController {
        let printController = UIPrintInteractionController.shared
        
        let printFormatter = UIMarkupTextPrintFormatter(markupText: generateBookHTML())
        printFormatter.perPageContentInsets = UIEdgeInsets(top: 36, left: 36, bottom: 36, right: 36)
        
        printController.printFormatter = printFormatter
        
        return printController
    }
    
    func updateUIViewController(_ uiViewController: UIPrintInteractionController, context: Context) {}
    
    private func generateBookHTML() -> String {
        var html = """
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <style>
                body {
                    font-family: 'Times New Roman', serif;
                    margin: 40px;
                    line-height: 1.6;
                }
                h1 {
                    text-align: center;
                    font-size: 28px;
                    margin-bottom: 30px;
                    border-bottom: 3px double #333;
                    padding-bottom: 20px;
                }
                h2 {
                    font-size: 20px;
                    margin-top: 40px;
                    margin-bottom: 20px;
                    page-break-before: always;
                    border-bottom: 2px solid #666;
                    padding-bottom: 10px;
                }
                h3 {
                    font-size: 16px;
                    margin-top: 25px;
                    margin-bottom: 15px;
                    color: #333;
                }
                .recipe {
                    margin-bottom: 30px;
                    page-break-inside: avoid;
                }
                .info {
                    background-color: #f9f9f9;
                    padding: 15px;
                    margin: 15px 0;
                    border-radius: 8px;
                    border-left: 4px solid #ccc;
                }
                ul {
                    list-style-type: none;
                    padding: 0;
                    margin: 0;
                }
                li {
                    margin-bottom: 5px;
                    padding-left: 20px;
                    position: relative;
                }
                li:before {
                    content: '•';
                    position: absolute;
                    left: 0;
                    color: #666;
                    font-weight: bold;
                }
                .instructions {
                    margin-top: 15px;
                    text-align: justify;
                }
                @media print {
                    .no-print { display: none; }
                    body { margin: 20px; }
                }
            </style>
        </head>
        <body>
            <h1>Libro delle Ricette</h1>
            <h1 style="font-size: 24px; margin-top: -20px;">di \(author)</h1>
        """
        
        // Genera contenuto per ogni tipo di piatto
        for (type, recipes) in recipesByType {
            html += "<h2>\(type)</h2>"
            
            for recipe in recipes {
                html += """
                <div class="recipe">
                    <h3>\(recipe.nome)</h3>
                    
                    <div class="info">
                """
                
                // Info generali
                if !recipe.difficolta.isEmpty { html += "<strong>Difficoltà:</strong> \(recipe.difficolta) | " }
                if !recipe.costo.isEmpty { html += "<strong>Costo:</strong> \(recipe.costo) | " }
                if recipe.tempoPreparazione > 0 { html += "<strong>Prep:</strong> \(recipe.tempoPreparazione) min | " }
                if recipe.tempoCottura > 0 { html += "<strong>Cottura:</strong> \(recipe.tempoCottura) min | " }
                if recipe.quantita > 0 { html += "<strong>Porzioni:</strong> \(recipe.quantita)" }
                if !recipe.metodoCottura.isEmpty { html += " | <strong>Metodo:</strong> \(recipe.metodoCottura)" }
                
                html += "</div>"
                
                // Ingredienti
                if !recipe.ingredienti.isEmpty {
                    html += "<h4>Ingredienti</h4><ul>"
                    for ingrediente in recipe.ingredienti {
                        html += "<li>\(ingrediente)</li>"
                    }
                    html += "</ul>"
                }
                
                // Istruzioni
                if !recipe.istruzioni.isEmpty {
                    html += "<h4>Preparazione</h4>"
                    html += "<div class=\"instructions\">\(recipe.istruzioni.replacingOccurrences(of: "\n", with: "<br>"))</div>"
                }
                
                // Vini consigliati
                if !recipe.vinoPreferibile.isEmpty {
                    html += "<h4>Vini Consigliati</h4><p>\(recipe.vinoPreferibile.joined(separator: ", "))</p>"
                }
                
                html += "</div>"
            }
        }
        
        html += "</body></html>"
        return html
    }
}
