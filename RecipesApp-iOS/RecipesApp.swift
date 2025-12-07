import SwiftUI

@main
struct RecipesApp: App {
    @StateObject private var recipeManager = RecipeManager()
    
    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(recipeManager)
        }
    }
}
