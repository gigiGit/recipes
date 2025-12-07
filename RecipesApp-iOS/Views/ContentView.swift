import SwiftUI

struct ContentView: View {
    @EnvironmentObject var recipeManager: RecipeManager
    @State private var showingImporter = false
    
    var body: some View {
        TabView {
            if recipeManager.viewByAuthor {
                RecipesByAuthorView()
                    .tabItem {
                        Label("Autore", systemImage: "person.fill")
                    }
            } else {
                RecipesByTypeView()
                    .tabItem {
                        Label("Tipo Piatto", systemImage: "fork.knife")
                    }
            }
        }
        .navigationTitle("Ricette")
        .toolbar {
            ToolbarItem(placement: .navigationBarLeading) {
                Menu {
                    Button(action: {
                        recipeManager.viewByAuthor = false
                    }) {
                        Label("Tipo Piatto", systemImage: recipeManager.viewByAuthor ? "" : "checkmark")
                    }
                    Button(action: {
                        recipeManager.viewByAuthor = true
                    }) {
                        Label("Autore", systemImage: recipeManager.viewByAuthor ? "checkmark" : "")
                    }
                } label: {
                    Label("Visualizza per", systemImage: "list.bullet")
                }
            }
            
            ToolbarItem(placement: .navigationBarTrailing) {
                Button(action: { showingImporter = true }) {
                    Label("Importa", systemImage: "square.and.arrow.down")
                }
            }
        }
        .fileImporter(
            isPresented: $showingImporter,
            allowedContentTypes: [.json],
            onCompletion: { result in
                switch result {
                case .success(let url):
                    recipeManager.importRecipes(from: url) { success in
                        if !success {
                            print("Errore import JSON")
                        }
                    }
                case .failure(let error):
                    print("Errore selezione file: \(error)")
                }
            }
        )
    }
}

#Preview {
    ContentView()
        .environmentObject(RecipeManager())
}
