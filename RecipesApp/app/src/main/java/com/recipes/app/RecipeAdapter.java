package com.recipes.app;

import android.content.Intent;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;
import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;
import java.util.List;

public class RecipeAdapter extends RecyclerView.Adapter<RecipeAdapter.ViewHolder> {
    private List<Recipe> recipes;
    private OnRecipeClickListener listener;

    public interface OnRecipeClickListener {
        void onRecipeClick(Recipe recipe);
    }

    public RecipeAdapter(List<Recipe> recipes, OnRecipeClickListener listener) {
        this.recipes = recipes;
        this.listener = listener;
    }

    @NonNull
    @Override
    public ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext())
                .inflate(R.layout.item_recipe, parent, false);
        return new ViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull ViewHolder holder, int position) {
        Recipe recipe = recipes.get(position);
        holder.bind(recipe, listener);
    }

    @Override
    public int getItemCount() {
        return recipes.size();
    }

    public void updateRecipes(List<Recipe> newRecipes) {
        this.recipes = newRecipes;
        notifyDataSetChanged();
    }

    static class ViewHolder extends RecyclerView.ViewHolder {
        TextView nameText;
        TextView authorText;
        TextView typeText;
        TextView timeText;

        ViewHolder(View itemView) {
            super(itemView);
            nameText = itemView.findViewById(R.id.recipe_name);
            authorText = itemView.findViewById(R.id.recipe_author);
            typeText = itemView.findViewById(R.id.recipe_type);
            timeText = itemView.findViewById(R.id.recipe_time);
        }

        void bind(Recipe recipe, OnRecipeClickListener listener) {
            nameText.setText(recipe.getNome());
            authorText.setText("di " + (recipe.getAutore() != null ? recipe.getAutore() : "Anonimo"));
            typeText.setText(recipe.getTipoPiatto() != null ? recipe.getTipoPiatto() : "");
            
            String time = "";
            if (recipe.getTempoPreparazione() != null) {
                time = "Prep: " + recipe.getTempoPreparazione() + " min";
            }
            if (recipe.getTempoCottura() != null) {
                time += (time.isEmpty() ? "" : " | ") + "Cottura: " + recipe.getTempoCottura() + " min";
            }
            timeText.setText(time);
            
            itemView.setOnClickListener(v -> listener.onRecipeClick(recipe));
        }
    }
}
