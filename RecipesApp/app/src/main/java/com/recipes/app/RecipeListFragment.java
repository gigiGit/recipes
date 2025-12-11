package com.recipes.app;

import android.content.Intent;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;
import java.util.List;

public class RecipeListFragment extends Fragment {
    private static final String ARG_RECIPES = "recipes";
    private List<Recipe> recipes;
    private RecipeAdapter adapter;

    public static RecipeListFragment newInstance(List<Recipe> recipes) {
        RecipeListFragment fragment = new RecipeListFragment();
        Bundle args = new Bundle();
        args.putSerializable(ARG_RECIPES, new java.util.ArrayList<>(recipes));
        fragment.setArguments(args);
        return fragment;
    }

    @Override
    public void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        if (getArguments() != null) {
            recipes = (List<Recipe>) getArguments().getSerializable(ARG_RECIPES);
        }
    }

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container,
                             @Nullable Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_recipe_list, container, false);
        
        RecyclerView recyclerView = view.findViewById(R.id.recycler_view);
        recyclerView.setLayoutManager(new LinearLayoutManager(getContext()));
        
        adapter = new RecipeAdapter(recipes, this::openRecipeDetail);
        recyclerView.setAdapter(adapter);
        
        return view;
    }

    private void openRecipeDetail(Recipe recipe) {
        // Trova l'indice della ricetta
        RecipeManager manager = new RecipeManager(getContext());
        List<Recipe> allRecipes = manager.getAllRecipes();
        int index = -1;
        for (int i = 0; i < allRecipes.size(); i++) {
            if (allRecipes.get(i).getNome().equals(recipe.getNome())) {
                index = i;
                break;
            }
        }
        
        Intent intent = new Intent(getActivity(), RecipeDetailActivity.class);
        intent.putExtra("recipe_index", index);
        intent.putExtra("recipe_name", recipe.getNome());
        intent.putExtra("autore", recipe.getAutore());
        intent.putExtra("data", recipe.getDataInserimento());
        intent.putExtra("difficolta", recipe.getDifficolta());
        intent.putExtra("costo", recipe.getCosto());
        intent.putExtra("tempo_prep", recipe.getTempoPreparazione());
        intent.putExtra("tempo_cottura", recipe.getTempoCottura());
        intent.putExtra("quantita", recipe.getQuantita());
        intent.putExtra("metodo", recipe.getMetodoCottura());
        intent.putExtra("tipo", recipe.getTipoPiatto());
        intent.putExtra("ingredienti", recipe.getIngredienti());
        intent.putExtra("istruzioni", recipe.getIstruzioni());
        intent.putExtra("vini", recipe.getVinoPreferibile());
        
        startActivity(intent);
    }

    public void updateRecipes(List<Recipe> newRecipes) {
        if (adapter != null) {
            recipes = newRecipes;
            adapter.updateRecipes(newRecipes);
        }
    }
}
