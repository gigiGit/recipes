import SwiftUI

struct RecipesByAuthorView: View {
    @EnvironmentObject var recipeManager: RecipeManager
    @State private var searchText = ""
    @State private var selectedAuthor: String? = nil
    @State private var showingPrintBook = false
    
    var body: some View {
        NavigationView {
            VStack {
                SearchBar(text: $searchText)
                    .onChange(of: searchText) { newValue in
                        recipeManager.searchRecipes(newValue)
                    }
                
                if recipeManager.recipes.isEmpty {
                    VStack {
                        Text("Nessuna ricetta trovata")
                            .font(.headline)
                            .foregroundColor(.gray)
                        Text("Prova a cercare con altre parole chiave")
                            .font(.caption)
                            .foregroundColor(.gray)
                    }
                    .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .center)
                } else {
                    List {
                        ForEach(recipeManager.getRecipesByAuthor(), id: \.author) { group in
                            Section(header: Text(group.author).font(.headline)) {
                                ForEach(group.recipes) { recipe in
                                    NavigationLink(destination: RecipeDetailView(recipe: recipe)) {
                                        RecipeRowView(recipe: recipe)
                                    }
                                }
                            }
                        }
                    }
                    .listStyle(.insetGrouped)
                }
            }
            .navigationTitle("Ricette per Autore")
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Menu {
                        Button(action: {
                            // Trova il primo autore con ricette (escludendo "Tutte")
                            let authors = recipeManager.getRecipesByAuthor()
                            if let firstAuthor = authors.first(where: { $0.author != "Tutte" && !$0.recipes.isEmpty }) {
                                selectedAuthor = firstAuthor.author
                                showingPrintBook = true
                            }
                        }) {
                            Label("Stampa Libro Ricette", systemImage: "doc.pdf")
                        }
                    } label: {
                        Image(systemName: "ellipsis.circle")
                    }
                }
            }
            .sheet(isPresented: $showingPrintBook) {
                if let author = selectedAuthor {
                    PrintBookView(author: author, recipesByType: recipeManager.getRecipesByAuthorGroupedByType(author))
                }
            }
        }
    }
}

#Preview {
    RecipesByAuthorView()
        .environmentObject(RecipeManager())
}
