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
            // Prova prima a caricare da file importato
            java.io.File importedFile = new java.io.File(context.getFilesDir(), "recipes_imported.json");
            InputStream is;
            
            if (importedFile.exists()) {
                is = new java.io.FileInputStream(importedFile);
            } else {
                is = context.getAssets().open("recipes.json");
            }
            
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
                (recipe.getAutore() != null && recipe.getAutore().toLowerCase().contains(lowerQuery)) ||
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
    
    public boolean saveRecipe(int index, String nome, String[] ingredienti, String istruzioni,
                              String autore, String data, String difficolta, String costo,
                              Integer tempoPrep, Integer tempoCottura, Integer quantita,
                              String metodo, String tipoPiatto, String[] vini) {
        try {
            Recipe recipe = new Recipe();
            recipe.setNome(nome);
            recipe.setIngredienti(ingredienti);
            recipe.setIstruzioni(istruzioni);
            recipe.setAutore(autore);
            recipe.setDataInserimento(data);
            recipe.setDifficolta(difficolta);
            recipe.setCosto(costo);
            recipe.setTempoPreparazione(tempoPrep);
            recipe.setTempoCottura(tempoCottura);
            recipe.setQuantita(quantita);
            recipe.setMetodoCottura(metodo);
            recipe.setTipoPiatto(tipoPiatto);
            recipe.setVinoPreferibile(vini);
            
            boolean isNew = false;
            if (index >= 0 && index < recipes.size()) {
                // Modifica ricetta esistente
                recipes.set(index, recipe);
            } else {
                // Nuova ricetta
                recipes.add(recipe);
                isNew = true;
            }
            
            // Riordina alfabeticamente
            recipes.sort((r1, r2) -> {
                String n1 = r1.getNome() != null ? r1.getNome() : "";
                String n2 = r2.getNome() != null ? r2.getNome() : "";
                return n1.compareToIgnoreCase(n2);
            });
            
            // Salva su file
            saveToFile();
            
            // Registra la modifica in un file separato
            saveModificationsLog(recipe, isNew);
            
            return true;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }
    
    private void saveToFile() {
        try {
            Gson gson = new Gson();
            String json = gson.toJson(recipes);
            
            // Scrivi nel file interno dell'app
            java.io.FileOutputStream fos = context.openFileOutput("recipes_data.json", Context.MODE_PRIVATE);
            fos.write(json.getBytes());
            fos.close();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
    
    public void saveModificationsLog(Recipe recipe, boolean isNew) {
        try {
            // Leggi il file delle modifiche esistente
            List<Recipe> modifications = new ArrayList<>();
            java.io.File modFile = new java.io.File(context.getFilesDir(), "recipe_modifications.json");
            
            if (modFile.exists()) {
                java.io.FileInputStream fis = new java.io.FileInputStream(modFile);
                byte[] buffer = new byte[(int) modFile.length()];
                fis.read(buffer);
                fis.close();
                
                String json = new String(buffer, StandardCharsets.UTF_8);
                Gson gson = new Gson();
                Type listType = new TypeToken<List<Recipe>>(){}.getType();
                modifications = gson.fromJson(json, listType);
                if (modifications == null) modifications = new ArrayList<>();
            }
            
            // Aggiungi o aggiorna la ricetta modificata
            boolean found = false;
            for (int i = 0; i < modifications.size(); i++) {
                if (modifications.get(i).getNome().equals(recipe.getNome())) {
                    modifications.set(i, recipe);
                    found = true;
                    break;
                }
            }
            if (!found) {
                modifications.add(recipe);
            }
            
            // Salva il file delle modifiche
            Gson gson = new Gson();
            String json = gson.toJson(modifications);
            java.io.FileOutputStream fos = new java.io.FileOutputStream(modFile);
            fos.write(json.getBytes());
            fos.close();
            
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
    
    public java.io.File getModificationsFile() {
        return new java.io.File(context.getFilesDir(), "recipe_modifications.json");
    }
    
    public boolean importFromInputStream(InputStream inputStream) {
        try {
            // Leggi il contenuto del file
            int size = inputStream.available();
            byte[] buffer = new byte[size];
            inputStream.read(buffer);
            
            String json = new String(buffer, StandardCharsets.UTF_8);
            
            // Valida il JSON
            Gson gson = new Gson();
            Type listType = new TypeToken<List<Recipe>>(){}.getType();
            List<Recipe> importedRecipes = gson.fromJson(json, listType);
            
            if (importedRecipes == null || importedRecipes.isEmpty()) {
                return false;
            }
            
            // Salva il file importato
            java.io.File importedFile = new java.io.File(context.getFilesDir(), "recipes_imported.json");
            java.io.FileOutputStream fos = new java.io.FileOutputStream(importedFile);
            fos.write(json.getBytes());
            fos.close();
            
            // Ricarica le ricette
            recipes = importedRecipes;
            recipes.sort((r1, r2) -> {
                String n1 = r1.getNome() != null ? r1.getNome() : "";
                String n2 = r2.getNome() != null ? r2.getNome() : "";
                return n1.compareToIgnoreCase(n2);
            });
            
            return true;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }
}
