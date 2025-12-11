package com.recipes.app;

import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.print.PrintAttributes;
import android.print.PrintDocumentAdapter;
import android.print.PrintManager;
import android.view.Menu;
import android.view.MenuItem;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Toast;
import androidx.appcompat.app.AppCompatActivity;
import androidx.appcompat.widget.SearchView;
import androidx.viewpager2.widget.ViewPager2;
import com.google.android.material.tabs.TabLayout;
import com.google.android.material.tabs.TabLayoutMediator;
import java.io.InputStream;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;

public class MainActivity extends AppCompatActivity {
    private static final int REQUEST_EDIT_RECIPE = 1;
    private static final int REQUEST_IMPORT_JSON = 2;
    private boolean viewByAuthor = false;
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
                pagerAdapter = new RecipesPagerAdapter(MainActivity.this, filteredRecipes, viewByAuthor);
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
    public boolean onPrepareOptionsMenu(Menu menu) {
        MenuItem printBookItem = menu.findItem(R.id.action_print_book);
        if (printBookItem != null) {
            printBookItem.setVisible(viewByAuthor);
            printBookItem.setEnabled(viewByAuthor);
            android.util.Log.d("MainActivity", "Menu item visibility set to: " + viewByAuthor);
        }
        return super.onPrepareOptionsMenu(menu);
    }
    
    @Override
    public boolean onOptionsItemSelected(MenuItem item) {
        if (item.getItemId() == R.id.action_add) {
            Intent intent = new Intent(this, EditRecipeActivity.class);
            startActivityForResult(intent, REQUEST_EDIT_RECIPE);
            return true;
        } else if (item.getItemId() == R.id.action_import) {
            openFilePicker();
            return true;
        } else if (item.getItemId() == R.id.view_by_type) {
            viewByAuthor = false;
            reloadRecipes();
            Toast.makeText(this, "Visualizzazione per Tipo Piatto", Toast.LENGTH_SHORT).show();
            return true;
        } else if (item.getItemId() == R.id.view_by_author) {
            viewByAuthor = true;
            android.util.Log.d("MainActivity", "Switching to author view: " + viewByAuthor);
            reloadRecipes();
            Toast.makeText(this, "Visualizzazione per Autore - Ora puoi stampare il libro ricette!", Toast.LENGTH_LONG).show();
            return true;
        } else if (item.getItemId() == R.id.action_print_book) {
            printRecipeBook();
            return true;
        }
        return super.onOptionsItemSelected(item);
    }
    
    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (requestCode == REQUEST_EDIT_RECIPE && resultCode == RESULT_OK) {
            reloadRecipes();
        } else if (requestCode == REQUEST_IMPORT_JSON && resultCode == RESULT_OK && data != null) {
            Uri uri = data.getData();
            if (uri != null) {
                importJsonFile(uri);
            }
        }
    }
    
    private void openFilePicker() {
        Intent intent = new Intent(Intent.ACTION_OPEN_DOCUMENT);
        intent.addCategory(Intent.CATEGORY_OPENABLE);
        intent.setType("application/json");
        startActivityForResult(intent, REQUEST_IMPORT_JSON);
    }
    
    private void importJsonFile(Uri uri) {
        try {
            InputStream inputStream = getContentResolver().openInputStream(uri);
            if (inputStream != null) {
                boolean success = recipeManager.importFromInputStream(inputStream);
                inputStream.close();
                
                if (success) {
                    Toast.makeText(this, "Ricette importate con successo!", Toast.LENGTH_SHORT).show();
                    reloadRecipes();
                } else {
                    Toast.makeText(this, "Errore durante l'importazione", Toast.LENGTH_SHORT).show();
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
            Toast.makeText(this, "Errore: " + e.getMessage(), Toast.LENGTH_LONG).show();
        }
    }
    
    private void printRecipeBook() {
        if (!viewByAuthor) {
            Toast.makeText(this, "Passa prima alla visualizzazione per Autore", Toast.LENGTH_SHORT).show();
            return;
        }
        
        int currentTab = tabLayout.getSelectedTabPosition();
        if (currentTab <= 0) {
            Toast.makeText(this, "Seleziona un autore dalla lista per stampare il libro ricette", Toast.LENGTH_SHORT).show();
            return;
        }
        
        String selectedAuthor = pagerAdapter.getTabTitle(currentTab);
        List<Recipe> authorRecipes = recipeManager.getRecipesByAuthor(selectedAuthor);
        
        if (authorRecipes.isEmpty()) {
            Toast.makeText(this, "Nessuna ricetta trovata per l'autore selezionato", Toast.LENGTH_SHORT).show();
            return;
        }
        
        Toast.makeText(this, "Generando libro ricette per " + selectedAuthor + "...", Toast.LENGTH_SHORT).show();
        
        // Ordina le ricette per tipo di piatto
        Map<String, List<Recipe>> recipesByType = new TreeMap<>();
        String[] ordinePortate = {"Antipasto", "Primo", "Secondo", "Piatto Unico", "Contorno", "Dolce", "Liquore"};
        
        // Inizializza le categorie nell'ordine corretto
        for (String portata : ordinePortate) {
            recipesByType.put(portata, new java.util.ArrayList<>());
        }
        
        // Raggruppa le ricette per tipo
        for (Recipe recipe : authorRecipes) {
            String tipo = recipe.getTipoPiatto();
            if (tipo == null || tipo.trim().isEmpty()) {
                tipo = "Liquore";
            }
            
            if (!recipesByType.containsKey(tipo)) {
                recipesByType.put(tipo, new java.util.ArrayList<>());
            }
            recipesByType.get(tipo).add(recipe);
        }
        
        // Genera HTML per il libro ricette
        String html = generateRecipeBookHTML(selectedAuthor, recipesByType);
        
        // Crea WebView per la stampa
        WebView webView = new WebView(this);
        webView.setWebViewClient(new WebViewClient() {
            @Override
            public void onPageFinished(WebView view, String url) {
                createPrintJob(view, selectedAuthor + " - Libro Ricette");
            }
        });
        
        webView.loadDataWithBaseURL(null, html, "text/html", "UTF-8", null);
    }
    
    private String generateRecipeBookHTML(String author, Map<String, List<Recipe>> recipesByType) {
        StringBuilder html = new StringBuilder();
        html.append("<html><head><style>");
        html.append("body { font-family: 'Times New Roman', serif; margin: 40px; line-height: 1.6; }");
        html.append("h1 { text-align: center; font-size: 28px; margin-bottom: 30px; border-bottom: 3px double #333; padding-bottom: 20px; }");
        html.append("h2 { font-size: 20px; margin-top: 40px; margin-bottom: 20px; page-break-before: always; border-bottom: 2px solid #666; padding-bottom: 10px; }");
        html.append("h3 { font-size: 16px; margin-top: 25px; margin-bottom: 15px; color: #333; }");
        html.append(".recipe { margin-bottom: 30px; page-break-inside: avoid; }");
        html.append(".info { background-color: #f9f9f9; padding: 15px; margin: 15px 0; border-radius: 8px; border-left: 4px solid #ccc; }");
        html.append("ul { list-style-type: none; padding: 0; margin: 0; }");
        html.append("li { margin-bottom: 5px; padding-left: 20px; position: relative; }");
        html.append("li:before { content: '•'; position: absolute; left: 0; color: #666; font-weight: bold; }");
        html.append(".instructions { margin-top: 15px; text-align: justify; }");
        html.append(".page-break { page-break-before: always; }");
        html.append("@media print { .no-print { display: none; } body { margin: 20px; } }");
        html.append("</style></head><body>");
        
        // Titolo del libro
        html.append("<h1>Libro delle Ricette</h1>");
        html.append("<h1 style='font-size: 24px; margin-top: -20px;'>di ").append(author).append("</h1>");
        
        // Genera contenuto per ogni tipo di piatto
        for (Map.Entry<String, List<Recipe>> entry : recipesByType.entrySet()) {
            String tipoPiatto = entry.getKey();
            List<Recipe> recipes = entry.getValue();
            
            if (recipes.isEmpty()) continue;
            
            html.append("<h2>").append(tipoPiatto).append("</h2>");
            
            for (Recipe recipe : recipes) {
                html.append("<div class='recipe'>");
                html.append("<h3>").append(recipe.getNome()).append("</h3>");
                
                // Info generali
                html.append("<div class='info'>");
                if (recipe.getDifficolta() != null && !recipe.getDifficolta().isEmpty())
                    html.append("<strong>Difficoltà:</strong> ").append(recipe.getDifficolta()).append(" | ");
                if (recipe.getCosto() != null && !recipe.getCosto().isEmpty())
                    html.append("<strong>Costo:</strong> ").append(recipe.getCosto()).append(" | ");
                if (recipe.getTempoPreparazione() != null && recipe.getTempoPreparazione() > 0)
                    html.append("<strong>Prep:</strong> ").append(recipe.getTempoPreparazione()).append(" min | ");
                if (recipe.getTempoCottura() != null && recipe.getTempoCottura() > 0)
                    html.append("<strong>Cottura:</strong> ").append(recipe.getTempoCottura()).append(" min | ");
                if (recipe.getQuantita() != null && recipe.getQuantita() > 0)
                    html.append("<strong>Porzioni:</strong> ").append(recipe.getQuantita());
                if (recipe.getMetodoCottura() != null && !recipe.getMetodoCottura().isEmpty())
                    html.append(" | <strong>Metodo:</strong> ").append(recipe.getMetodoCottura());
                html.append("</div>");
                
                // Ingredienti
                if (recipe.getIngredienti() != null && recipe.getIngredienti().length > 0) {
                    html.append("<h4>Ingredienti</h4>");
                    html.append("<ul>");
                    for (String ing : recipe.getIngredienti()) {
                        html.append("<li>").append(ing).append("</li>");
                    }
                    html.append("</ul>");
                }
                
                // Istruzioni
                if (recipe.getIstruzioni() != null && !recipe.getIstruzioni().isEmpty()) {
                    html.append("<h4>Preparazione</h4>");
                    String istruzioni = recipe.getIstruzioni().replace("\n", "<br>");
                    html.append("<div class='instructions'>").append(istruzioni).append("</div>");
                }
                
                // Vini consigliati
                if (recipe.getVinoPreferibile() != null && recipe.getVinoPreferibile().length > 0) {
                    html.append("<h4>Vini Consigliati</h4>");
                    html.append("<p>").append(String.join(", ", recipe.getVinoPreferibile())).append("</p>");
                }
                
                html.append("</div>");
            }
        }
        
        html.append("</body></html>");
        return html.toString();
    }
    
    private void createPrintJob(WebView webView, String jobName) {
        PrintManager printManager = (PrintManager) getSystemService(PRINT_SERVICE);
        
        PrintDocumentAdapter printAdapter = webView.createPrintDocumentAdapter(jobName);
        
        PrintAttributes.Builder builder = new PrintAttributes.Builder();
        builder.setMediaSize(PrintAttributes.MediaSize.ISO_A4);
        builder.setResolution(new PrintAttributes.Resolution("pdf", "pdf", 600, 600));
        builder.setMinMargins(PrintAttributes.Margins.NO_MARGINS);
        
        printManager.print(jobName, printAdapter, builder.build());
        
        Toast.makeText(this, "Libro ricette inviato alla stampante", Toast.LENGTH_SHORT).show();
    }
    
    private void reloadRecipes() {
        recipeManager = new RecipeManager(this);
        allRecipes = recipeManager.getAllRecipes();
        pagerAdapter = new RecipesPagerAdapter(this, allRecipes, viewByAuthor);
        viewPager.setAdapter(pagerAdapter);
        new TabLayoutMediator(tabLayout, viewPager,
            (tab, position) -> tab.setText(pagerAdapter.getTabTitle(position))
        ).attach();
        setTitle("Ricette (" + allRecipes.size() + ")");
        
        // Aggiorna la visibilità del menu "Stampa Libro Ricette"
        android.util.Log.d("MainActivity", "Invalidating options menu, viewByAuthor: " + viewByAuthor);
        supportInvalidateOptionsMenu();
    }
}
