import SwiftUI
import PDFKit
import UIKit
import CoreText

struct PrintView: UIViewControllerRepresentable {
    let recipe: Recipe
    @Environment(\.dismiss) var dismiss

    func makeUIViewController(context: Context) -> UIViewController {
        let viewController = UIViewController()
        viewController.view.backgroundColor = .systemBackground

        // Questo view è stato sostituito dalla generazione diretta di PDF
        // Mostra un messaggio informativo
        let label = UILabel()
        label.text = "La generazione PDF è ora diretta.\nUsa il menu 'Stampa Libro Ricette'."
        label.textAlignment = .center
        label.numberOfLines = 0
        label.translatesAutoresizingMaskIntoConstraints = false

        viewController.view.addSubview(label)

        NSLayoutConstraint.activate([
            label.centerXAnchor.constraint(equalTo: viewController.view.centerXAnchor),
            label.centerYAnchor.constraint(equalTo: viewController.view.centerYAnchor),
            label.leadingAnchor.constraint(equalTo: viewController.view.leadingAnchor, constant: 20),
            label.trailingAnchor.constraint(equalTo: viewController.view.trailingAnchor, constant: -20)
        ])

        // Chiudi automaticamente dopo 2 secondi
        DispatchQueue.main.asyncAfter(deadline: .now() + 2) {
            dismiss()
        }

        return viewController
    }

    func updateUIViewController(_ uiViewController: UIViewController, context: Context) {}
}

struct PrintBookView: UIViewControllerRepresentable {
    let author: String
    let recipesByType: [String: [Recipe]]
    @Environment(\.dismiss) var dismiss

    func makeUIViewController(context: Context) -> UIViewController {
        do {
            let pdfData = try createPDFData()
            let fileName = "Libro_Ricette_\(author.replacingOccurrences(of: " ", with: "_")).pdf"
            
            // Salva il PDF nella cartella Documenti
            let fileManager = FileManager.default
            let documentsURL = fileManager.urls(for: .documentDirectory, in: .userDomainMask)[0]
            let fileURL = documentsURL.appendingPathComponent(fileName)
            
            try pdfData.write(to: fileURL)
            
            // Mostra alert di successo
            DispatchQueue.main.async {
                showSuccessAlert(fileURL: fileURL, fileName: fileName)
            }
            
            return UIViewController()
        } catch {
            DispatchQueue.main.async {
                showErrorAlert(error: error)
            }
            return UIViewController()
        }
    }

    func updateUIViewController(_ uiViewController: UIViewController, context: Context) {}

    private func createPDFData() -> Data {
        let pdfMetaData = [
            kCGPDFContextCreator: "Recipes App",
            kCGPDFContextAuthor: author
        ]
        let format = UIGraphicsPDFRendererFormat()
        format.documentInfo = pdfMetaData as [String: Any]

        // Dimensioni A4
        let pageWidth = 595.2
        let pageHeight = 841.8
        let pageRect = CGRect(x: 0, y: 0, width: pageWidth, height: pageHeight)

        let renderer = UIGraphicsPDFRenderer(bounds: pageRect, format: format)

        let data = renderer.pdfData { (context) in
            let textContent = generateBookText()

            // Suddividi il contenuto in pagine
            let attributedString = NSAttributedString(string: textContent, attributes: [
                .font: UIFont.systemFont(ofSize: 12),
                .foregroundColor: UIColor.black
            ])

            let framesetter = CTFramesetterCreateWithAttributedString(attributedString)
            var currentRange = CFRangeMake(0, 0)
            var currentPage = 1

            while currentRange.location < attributedString.length {
                context.beginPage()

                // Margini
                let margin: CGFloat = 50
                let textRect = CGRect(x: margin, y: margin, width: pageWidth - (margin * 2), height: pageHeight - (margin * 2))

                let frame = CTFramesetterCreateFrame(framesetter, currentRange, CGPath(rect: textRect, transform: nil), nil)

                let frameRange = CTFrameGetVisibleStringRange(frame)
                currentRange = CFRangeMake(frameRange.location + frameRange.length, 0)

                CTFrameDraw(frame, context.cgContext)

                currentPage += 1
            }
        }

        return data
    }

    private func generateBookText() -> String {
        var content = "LIBRO DELLE RICETTE\ndi \(author)\n\n"

        // Genera contenuto per ogni tipo di piatto
        for (type, recipes) in recipesByType {
            content += "\n\(type.uppercased())\n"
            content += String(repeating: "=", count: type.count) + "\n\n"

            for recipe in recipes {
                content += "\(recipe.nome)\n"
                content += String(repeating: "-", count: recipe.nome.count) + "\n\n"

                // Info generali
                var infoParts: [String] = []
                if !recipe.difficolta.isEmpty { infoParts.append("Difficoltà: \(recipe.difficolta)") }
                if !recipe.costo.isEmpty { infoParts.append("Costo: \(recipe.costo)") }
                if recipe.tempoPreparazione > 0 { infoParts.append("Prep: \(recipe.tempoPreparazione) min") }
                if recipe.tempoCottura > 0 { infoParts.append("Cottura: \(recipe.tempoCottura) min") }
                if recipe.quantita > 0 { infoParts.append("Porzioni: \(recipe.quantita)") }
                if !recipe.metodoCottura.isEmpty { infoParts.append("Metodo: \(recipe.metodoCottura)") }

                if !infoParts.isEmpty {
                    content += infoParts.joined(separator: " | ") + "\n\n"
                }

                // Ingredienti
                if !recipe.ingredienti.isEmpty {
                    content += "INGREDIENTI:\n"
                    for ingrediente in recipe.ingredienti {
                        content += "• \(ingrediente)\n"
                    }
                    content += "\n"
                }

                // Istruzioni
                if !recipe.istruzioni.isEmpty {
                    content += "PREPARAZIONE:\n\(recipe.istruzioni)\n\n"
                }

                // Vini consigliati
                if !recipe.vinoPreferibile.isEmpty {
                    content += "VINI CONSIGLIATI:\n\(recipe.vinoPreferibile.joined(separator: ", "))\n\n"
                }

                content += "\n"
            }
        }

        return content
    }

    private func showSuccessAlert(fileURL: URL, fileName: String) {
        guard let windowScene = UIApplication.shared.connectedScenes.first as? UIWindowScene,
              let window = windowScene.windows.first,
              let rootViewController = window.rootViewController else {
            return
        }

        let alert = UIAlertController(
            title: "PDF Salvato",
            message: "Il libro ricette è stato salvato come '\(fileName)' nella cartella Documenti.",
            preferredStyle: .alert
        )

        alert.addAction(UIAlertAction(title: "Apri PDF", style: .default) { _ in
            let documentController = UIDocumentInteractionController(url: fileURL)
            documentController.presentPreview(animated: true)
        })

        alert.addAction(UIAlertAction(title: "Condividi", style: .default) { _ in
            let activityViewController = UIActivityViewController(activityItems: [fileURL], applicationActivities: nil)
            rootViewController.present(activityViewController, animated: true)
        })

        alert.addAction(UIAlertAction(title: "OK", style: .cancel) { _ in
            self.dismiss()
        })

        rootViewController.present(alert, animated: true)
    }

    private func showErrorAlert(error: Error) {
        guard let windowScene = UIApplication.shared.connectedScenes.first as? UIWindowScene,
              let window = windowScene.windows.first,
              let rootViewController = window.rootViewController else {
            return
        }

        let alert = UIAlertController(
            title: "Errore",
            message: "Errore durante il salvataggio del PDF: \(error.localizedDescription)",
            preferredStyle: .alert
        )

        alert.addAction(UIAlertAction(title: "OK", style: .default) { _ in
            self.dismiss()
        })

        rootViewController.present(alert, animated: true)
    }
}

extension UIDocumentInteractionController: @retroactive UIAdaptivePresentationControllerDelegate {
    // Estensione per supportare il preview dei PDF
}
