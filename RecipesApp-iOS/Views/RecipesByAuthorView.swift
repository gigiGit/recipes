import SwiftUI

struct RecipesByAuthorView: View {
    @EnvironmentObject var recipeManager: RecipeManager
    @State private var searchText = ""
    
    var body: some View {
        NavigationStack {
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
        }
    }
}

#Preview {
    RecipesByAuthorView()
        .environmentObject(RecipeManager())
}
