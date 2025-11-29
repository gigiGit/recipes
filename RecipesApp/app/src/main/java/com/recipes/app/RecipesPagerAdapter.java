package com.recipes.app;

import androidx.annotation.NonNull;
import androidx.fragment.app.Fragment;
import androidx.fragment.app.FragmentActivity;
import androidx.viewpager2.adapter.FragmentStateAdapter;
import java.util.*;

public class RecipesPagerAdapter extends FragmentStateAdapter {
    private final List<String> tabTitles = new ArrayList<>();
    private final Map<String, List<Recipe>> recipesMap = new LinkedHashMap<>();

    public RecipesPagerAdapter(@NonNull FragmentActivity fragmentActivity, List<Recipe> allRecipes) {
        super(fragmentActivity);
        categorizeRecipes(allRecipes);
    }

    private void categorizeRecipes(List<Recipe> allRecipes) {
        // Ordine canonico delle portate italiane
        String[] ordinePortate = {"Antipasto", "Primo", "Secondo", "Piatto Unico", "Contorno", "Dolce"};
        
        // Tab "Tutte"
        tabTitles.add("Tutte");
        recipesMap.put("Tutte", new ArrayList<>(allRecipes));
        
        // Raggruppa per tipo
        Map<String, List<Recipe>> grouped = new LinkedHashMap<>();
        for (String portata : ordinePortate) {
            grouped.put(portata, new ArrayList<>());
        }
        grouped.put("Altro", new ArrayList<>());
        
        for (Recipe recipe : allRecipes) {
            String tipo = recipe.getTipoPiatto();
            if (tipo == null || tipo.trim().isEmpty()) {
                tipo = "Altro";
            }
            
            if (!grouped.containsKey(tipo)) {
                grouped.put(tipo, new ArrayList<>());
            }
            grouped.get(tipo).add(recipe);
        }
        
        // Aggiungi solo i tab che hanno ricette
        for (Map.Entry<String, List<Recipe>> entry : grouped.entrySet()) {
            if (!entry.getValue().isEmpty()) {
                tabTitles.add(entry.getKey());
                recipesMap.put(entry.getKey(), entry.getValue());
            }
        }
    }

    @NonNull
    @Override
    public Fragment createFragment(int position) {
        String tabTitle = tabTitles.get(position);
        List<Recipe> recipes = recipesMap.get(tabTitle);
        return RecipeListFragment.newInstance(recipes);
    }

    @Override
    public int getItemCount() {
        return tabTitles.size();
    }

    public String getTabTitle(int position) {
        return tabTitles.get(position);
    }

    public void updateRecipes(List<Recipe> newRecipes) {
        recipesMap.clear();
        tabTitles.clear();
        categorizeRecipes(newRecipes);
        notifyDataSetChanged();
    }
}
