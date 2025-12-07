import SwiftUI

struct RecipesByTypeView: View {
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
                        ForEach(recipeManager.getRecipesByType(), id: \.type) { group in
                            Section(header: Text(group.type).font(.headline)) {
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
            .navigationTitle("Ricette per Tipo")
        }
    }
}

struct RecipeRowView: View {
    let recipe: Recipe
    
    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(recipe.nome)
                .font(.headline)
            
            HStack(spacing: 12) {
                Label(recipe.tipoPiatto, systemImage: "fork.knife")
                    .font(.caption)
                    .foregroundColor(.secondary)
                
                Label(recipe.autore, systemImage: "person.fill")
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
        }
    }
}

#Preview {
    RecipesByTypeView()
        .environmentObject(RecipeManager())
}
