import Foundation

class RecipeManager: ObservableObject {
    @Published var allRecipes: [Recipe] = []
    @Published var recipes: [Recipe] = []
    @Published var searchText: String = ""
    @Published var viewByAuthor: Bool = false {
        didSet {
            updateRecipes()
        }
    }
    
    private let fileManager = FileManager.default
    private var documentsPath: URL {
        fileManager.urls(for: .documentDirectory, in: .userDomainMask)[0]
    }
    
    private var importedFilePath: URL {
        documentsPath.appendingPathComponent("recipes_imported.json")
    }
    
    init() {
        loadRecipes()
    }
    
    func loadRecipes() {
        // Prova prima il file importato, poi fallback ai bundle assets
        if fileManager.fileExists(atPath: importedFilePath.path) {
            do {
                let data = try Data(contentsOf: importedFilePath)
                let decoder = JSONDecoder()
                var recipes = try decoder.decode([Recipe].self, from: data)
                recipes.sort { $0.nome < $1.nome }
                self.allRecipes = recipes
                updateRecipes()
                return
            } catch {
                print("Errore caricamento file importato: \(error)")
            }
        }
        
        // Carica dai bundle assets
        if let url = Bundle.main.url(forResource: "recipes", withExtension: "json") {
            do {
                let data = try Data(contentsOf: url)
                let decoder = JSONDecoder()
                var recipes = try decoder.decode([Recipe].self, from: data)
                recipes.sort { $0.nome < $1.nome }
                self.allRecipes = recipes
                updateRecipes()
            } catch {
                print("Errore caricamento recipes.json: \(error)")
                self.allRecipes = []
                self.recipes = []
            }
        }
    }
    
    func importRecipes(from url: URL, completion: @escaping (Bool) -> Void) {
        DispatchQueue.global(qos: .userInitiated).async {
            do {
                let data = try Data(contentsOf: url)
                let decoder = JSONDecoder()
                var recipes = try decoder.decode([Recipe].self, from: data)
                recipes.sort { $0.nome < $1.nome }
                
                // Salva il file importato
                let encoder = JSONEncoder()
                encoder.outputFormatting = .prettyPrinted
                let jsonData = try encoder.encode(recipes)
                try jsonData.write(to: self.importedFilePath)
                
                DispatchQueue.main.async {
                    self.allRecipes = recipes
                    self.updateRecipes()
                    completion(true)
                }
            } catch {
                print("Errore import: \(error)")
                DispatchQueue.main.async {
                    completion(false)
                }
            }
        }
    }
    
    func updateRecipes() {
        let filtered = allRecipes.filter { recipe in
            searchText.isEmpty || 
            recipe.nome.localizedCaseInsensitiveContains(searchText) ||
            recipe.ingredienti.joined(separator: " ").localizedCaseInsensitiveContains(searchText) ||
            recipe.istruzioni.localizedCaseInsensitiveContains(searchText) ||
            recipe.autore.localizedCaseInsensitiveContains(searchText)
        }
        self.recipes = filtered
    }
    
    func getRecipesByType() -> [(type: String, recipes: [Recipe])] {
        var groupedRecipes: [(type: String, recipes: [Recipe])] = []
        
        // Ordine fisso per tipo piatto
        for dishType in dishTypes {
            let recipesForType = recipes.filter { $0.tipoPiatto == dishType }
            if !recipesForType.isEmpty {
                groupedRecipes.append((type: dishType, recipes: recipesForType))
            }
        }
        
        // Aggiungi "Tutte" se non è ricerca attiva
        if searchText.isEmpty && !recipes.isEmpty {
            groupedRecipes.insert((type: "Tutte", recipes: recipes), at: 0)
        }
        
        return groupedRecipes
    }
    
    func getRecipesByAuthor() -> [(author: String, recipes: [Recipe])] {
        var authorDict: [String: [Recipe]] = [:]
        
        for recipe in recipes {
            let author = recipe.autore.isEmpty ? "Sconosciuto" : recipe.autore
            if authorDict[author] != nil {
                authorDict[author]?.append(recipe)
            } else {
                authorDict[author] = [recipe]
            }
        }
        
        // Ordina alfabeticamente gli autori
        let sorted = authorDict.keys.sorted()
        var result: [(author: String, recipes: [Recipe])] = []
        
        for author in sorted {
            result.append((author: author, recipes: authorDict[author]?.sorted { $0.nome < $1.nome } ?? []))
        }
        
        // Aggiungi "Tutte" se non è ricerca attiva
        if searchText.isEmpty && !recipes.isEmpty {
            result.insert((author: "Tutte", recipes: recipes), at: 0)
        }
        
        return result
    }
    
    func searchRecipes(_ text: String) {
        searchText = text
        updateRecipes()
    }
}
