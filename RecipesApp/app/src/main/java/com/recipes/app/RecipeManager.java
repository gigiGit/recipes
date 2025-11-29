package com.recipes.app;

import android.content.Context;
import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;
import java.io.IOException;
import java.io.InputStream;
import java.lang.reflect.Type;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

public class RecipeManager {
    private List<Recipe> recipes;
    private Context context;

    public RecipeManager(Context context) {
        this.context = context;
        loadRecipes();
    }

    private void loadRecipes() {
        try {
            InputStream is = context.getAssets().open("recipes.json");
            int size = is.available();
            byte[] buffer = new byte[size];
            is.read(buffer);
            is.close();
            
            String json = new String(buffer, StandardCharsets.UTF_8);
            Gson gson = new Gson();
            Type listType = new TypeToken<List<Recipe>>(){}.getType();
            recipes = gson.fromJson(json, listType);
            
            // Ordina alfabeticamente per nome
            if (recipes != null) {
                recipes.sort((r1, r2) -> {
                    String n1 = r1.getNome() != null ? r1.getNome() : "";
                    String n2 = r2.getNome() != null ? r2.getNome() : "";
                    return n1.compareToIgnoreCase(n2);
                });
            }
        } catch (IOException e) {
            e.printStackTrace();
            recipes = new ArrayList<>();
        }
    }

    public List<Recipe> getAllRecipes() {
        return recipes;
    }

    public List<Recipe> searchRecipes(String query) {
        List<Recipe> results = new ArrayList<>();
        String lowerQuery = query.toLowerCase();
        
        for (Recipe recipe : recipes) {
            if (recipe.getNome().toLowerCase().contains(lowerQuery) ||
                recipe.getIstruzioni().toLowerCase().contains(lowerQuery) ||
                containsIngredient(recipe, lowerQuery) ||
                (recipe.getTipoPiatto() != null && recipe.getTipoPiatto().toLowerCase().contains(lowerQuery))) {
                results.add(recipe);
            }
        }
        
        // Ordina i risultati alfabeticamente
        results.sort((r1, r2) -> {
            String n1 = r1.getNome() != null ? r1.getNome() : "";
            String n2 = r2.getNome() != null ? r2.getNome() : "";
            return n1.compareToIgnoreCase(n2);
        });
        
        return results;
    }

    private boolean containsIngredient(Recipe recipe, String query) {
        if (recipe.getIngredienti() == null) return false;
        for (String ing : recipe.getIngredienti()) {
            if (ing.toLowerCase().contains(query)) {
                return true;
            }
        }
        return false;
    }
}
