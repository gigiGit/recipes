package com.recipes.app;

import android.content.Intent;
import android.os.Bundle;
import android.view.Menu;
import android.view.MenuItem;
import androidx.appcompat.app.AppCompatActivity;
import androidx.appcompat.widget.SearchView;
import androidx.viewpager2.widget.ViewPager2;
import com.google.android.material.tabs.TabLayout;
import com.google.android.material.tabs.TabLayoutMediator;
import java.util.List;

public class MainActivity extends AppCompatActivity {
    private static final int REQUEST_EDIT_RECIPE = 1;
    private ViewPager2 viewPager;
    private TabLayout tabLayout;
    private RecipesPagerAdapter pagerAdapter;
    private RecipeManager recipeManager;
    private List<Recipe> allRecipes;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        recipeManager = new RecipeManager(this);
        allRecipes = recipeManager.getAllRecipes();
        
        viewPager = findViewById(R.id.view_pager);
        tabLayout = findViewById(R.id.tab_layout);
        
        pagerAdapter = new RecipesPagerAdapter(this, allRecipes);
        viewPager.setAdapter(pagerAdapter);
        
        new TabLayoutMediator(tabLayout, viewPager, 
            (tab, position) -> tab.setText(pagerAdapter.getTabTitle(position))
        ).attach();
        
        setTitle("Ricette (" + allRecipes.size() + ")");
    }

    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        getMenuInflater().inflate(R.menu.main_menu, menu);
        
        MenuItem addItem = menu.findItem(R.id.action_add);
        MenuItem searchItem = menu.findItem(R.id.action_search);
        SearchView searchView = (SearchView) searchItem.getActionView();
        
        searchView.setOnQueryTextListener(new SearchView.OnQueryTextListener() {
            @Override
            public boolean onQueryTextSubmit(String query) {
                return false;
            }

            @Override
            public boolean onQueryTextChange(String newText) {
                List<Recipe> filteredRecipes;
                if (newText.isEmpty()) {
                    filteredRecipes = allRecipes;
                } else {
                    filteredRecipes = recipeManager.searchRecipes(newText);
                }
                
                // Ricrea il pager adapter con i risultati filtrati
                pagerAdapter = new RecipesPagerAdapter(MainActivity.this, filteredRecipes);
                viewPager.setAdapter(pagerAdapter);
                
                new TabLayoutMediator(tabLayout, viewPager,
                    (tab, position) -> tab.setText(pagerAdapter.getTabTitle(position))
                ).attach();
                
                return true;
            }
        });
        
        return true;
    }
    
    @Override
    public boolean onOptionsItemSelected(MenuItem item) {
        if (item.getItemId() == R.id.action_add) {
            Intent intent = new Intent(this, EditRecipeActivity.class);
            startActivityForResult(intent, REQUEST_EDIT_RECIPE);
            return true;
        }
        return super.onOptionsItemSelected(item);
    }
    
    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (requestCode == REQUEST_EDIT_RECIPE && resultCode == RESULT_OK) {
            // Ricarica le ricette
            recipeManager = new RecipeManager(this);
            allRecipes = recipeManager.getAllRecipes();
            pagerAdapter = new RecipesPagerAdapter(this, allRecipes);
            viewPager.setAdapter(pagerAdapter);
            new TabLayoutMediator(tabLayout, viewPager,
                (tab, position) -> tab.setText(pagerAdapter.getTabTitle(position))
            ).attach();
            setTitle("Ricette (" + allRecipes.size() + ")");
        }
    }
}
