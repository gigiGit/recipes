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
