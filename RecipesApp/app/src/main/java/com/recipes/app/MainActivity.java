package com.recipes.app;

import android.content.Context;
import android.content.Intent;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.Paint;
import android.graphics.pdf.PdfDocument;
import android.net.Uri;
import android.os.Bundle;
import android.print.PrintAttributes;
import android.print.PrintDocumentAdapter;
import android.print.PrintJob;
import android.print.PrintManager;
import android.util.Base64;
import android.view.Menu;
import android.view.MenuItem;
import android.view.View;
import android.webkit.WebView;
import android.widget.Toast;
import androidx.appcompat.app.AppCompatActivity;
import androidx.appcompat.widget.SearchView;
import androidx.core.content.FileProvider;
import androidx.viewpager2.widget.ViewPager2;
import com.google.android.material.tabs.TabLayout;
import com.google.android.material.tabs.TabLayoutMediator;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.text.SimpleDateFormat;
import java.util.Date;
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
            Toast.makeText(this, "Prima seleziona 'Visualizza per → Autore' per stampare il libro ricette", Toast.LENGTH_LONG).show();
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

        // Genera contenuto del libro ricette
        try {
            String bookContent = generateRecipeBookContent(selectedAuthor, recipesByType);

            // Crea il PDF direttamente
            createRecipeBookPdf(bookContent, selectedAuthor);
        } catch (IOException e) {
            Toast.makeText(this, "Errore nel caricamento delle immagini: " + e.getMessage(), Toast.LENGTH_SHORT).show();
        }
    }
    
    private String generateRecipeBookContent(String author, Map<String, List<Recipe>> recipesByType) throws IOException {
        StringBuilder content = new StringBuilder();

        String imageBase64 = getImageAsBase64("nonna-gio.jpg");

        // Carica immagini per categorie
        String antipastiBase64 = imageBase64;
        String primiBase64 = imageBase64;
        String secondiBase64 = imageBase64;
        String piattiUniciBase64 = imageBase64;
        String contorniBase64 = imageBase64;
        String dolciBase64 = imageBase64;
        String liquoriBase64 = imageBase64;

        try { antipastiBase64 = getImageAsBase64("antipasti.png"); } catch (IOException e) {}
        try { primiBase64 = getImageAsBase64("primi.png"); } catch (IOException e) {}
        try { secondiBase64 = getImageAsBase64("secondi.jpg"); } catch (IOException e) {}
        // Altri usano default

        // HTML per il libro
        content.append("<!DOCTYPE html><html><head><meta charset='UTF-8'><style>");
        content.append("body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }");
        content.append(".cover-page { text-align: center; padding: 100px 20px; page-break-after: always; }");
        content.append(".cover-page h1 { font-size: 36px; color: #2c3e50; margin-bottom: 20px; }");
        content.append(".cover-page img { max-width: 200px; height: auto; margin: 20px auto; display: block; }");
        content.append(".cover-page h2 { font-size: 24px; color: #34495e; margin-bottom: 40px; }");
        content.append(".cover-page p { font-size: 18px; margin: 20px 0; }");
        content.append(".cover-footer { margin-top: 100px; font-style: italic; color: #7f8c8d; }");
        content.append(".category-page { text-align: center; padding: 100px 20px; page-break-after: always; }");
        content.append(".category-page h1 { font-size: 32px; color: #2c3e50; margin-bottom: 20px; }");
        content.append(".category-page img { max-width: 150px; height: auto; margin: 20px auto; display: block; }");
        content.append(".page-break { page-break-after: always; }");
        content.append(".recipe { margin-bottom: 30px; border-bottom: 1px solid #ccc; padding-bottom: 20px; page-break-inside: avoid; }");
        content.append(".recipe-title { font-size: 18px; font-weight: bold; color: #2c3e50; margin-bottom: 10px; }");
        content.append(".recipe-meta { font-size: 12px; color: #7f8c8d; margin-bottom: 15px; }");
        content.append(".recipe-section { margin: 5px 0; }");
        content.append(".recipe-section strong { color: #2980b9; }");
        content.append(".ingredients { background: #f8f9fa; padding: 10px; border-left: 4px solid #f39c12; margin: 10px 0; }");
        content.append(".ingredients ul { margin: 0; padding-left: 20px; }");
        content.append(".instructions { line-height: 1.2; margin: 5px 0; font-size: 12px; }");
        content.append("</style></head><body>");

        // Copertina
        content.append("<div class='cover-page'>");
        content.append("<h1>Libro delle Ricette</h1>");
        content.append("<img src='data:image/jpeg;base64,").append(imageBase64).append("' alt='Logo'>");
        content.append("<h2>di ").append(author).append("</h2>");
        content.append("<p>Stampato il ").append(java.text.DateFormat.getDateInstance().format(new java.util.Date())).append("</p>");
        int totalRecipes = recipesByType.values().stream().mapToInt(List::size).sum();
        content.append("<p>Totale ricette: ").append(totalRecipes).append("</p>");
        content.append("<div class='cover-footer'><p>Preparato con amore</p></div>");
        content.append("</div><div class='page-break'></div>");

        // Immagini per categoria
        java.util.Map<String, String> categoryImages = new java.util.HashMap<>();
        categoryImages.put("Antipasto", "data:image/png;base64," + antipastiBase64);
        categoryImages.put("Primo", "data:image/png;base64," + primiBase64);
        categoryImages.put("Secondo", "data:image/jpeg;base64," + secondiBase64);
        categoryImages.put("Piatto Unico", "data:image/jpeg;base64," + piattiUniciBase64);
        categoryImages.put("Contorno", "data:image/jpeg;base64," + contorniBase64);
        categoryImages.put("Dolce", "data:image/jpeg;base64," + dolciBase64);
        categoryImages.put("Liquore", "data:image/jpeg;base64," + liquoriBase64);

        // Genera contenuto per ogni tipo di piatto
        for (Map.Entry<String, List<Recipe>> entry : recipesByType.entrySet()) {
            String tipoPiatto = entry.getKey();
            List<Recipe> recipes = entry.getValue();

            if (recipes.isEmpty()) continue;

            // Pagina categoria
            String imageSrc = categoryImages.getOrDefault(tipoPiatto, "data:image/jpeg;base64," + imageBase64);
            content.append("<div class='category-page'>");
            content.append("<h1>").append(tipoPiatto).append("</h1>");
            content.append("<img src='").append(imageSrc).append("' alt='Categoria ").append(tipoPiatto).append("'>");
            content.append("</div><div class='page-break'></div>");

            for (Recipe recipe : recipes) {
                content.append("<div class='recipe'>");
                content.append("<div class='recipe-title'>").append(recipe.getNome()).append("</div>");

                // Meta info
                content.append("<div class='recipe-meta'>");
                if (recipe.getAutore() != null) content.append("Autore: ").append(recipe.getAutore()).append(" | ");
                if (recipe.getDifficolta() != null) content.append("Difficoltà: ").append(recipe.getDifficolta()).append(" | ");
                if (recipe.getCosto() != null) content.append("Costo: ").append(recipe.getCosto()).append(" | ");
                if (recipe.getTempoPreparazione() != null) content.append("Tempo: ").append(recipe.getTempoPreparazione()).append(" min");
                content.append("</div>");

                // Ingredienti
                if (recipe.getIngredienti() != null && recipe.getIngredienti().length > 0) {
                    content.append("<div class='recipe-section ingredients'>");
                    content.append("<strong>Ingredienti:</strong><ul>");
                    for (String ing : recipe.getIngredienti()) {
                        content.append("<li>").append(ing).append("</li>");
                    }
                    content.append("</ul></div>");
                }

                // Istruzioni
                if (recipe.getIstruzioni() != null && !recipe.getIstruzioni().trim().isEmpty()) {
                    content.append("<div class='recipe-section instructions'>");
                    content.append("<strong>Istruzioni:</strong><br>");
                    content.append(recipe.getIstruzioni().replace("\n", "<br>"));
                    content.append("</div>");
                }

                content.append("</div>");
            }

            // Page break dopo categoria
            content.append("<div class='page-break'></div>");
        }

        content.append("</body></html>");
        return content.toString();
    }

    private String getImageAsBase64(String assetPath) throws IOException {
        InputStream inputStream = getAssets().open(assetPath);
        ByteArrayOutputStream byteArrayOutputStream = new ByteArrayOutputStream();
        byte[] buffer = new byte[1024];
        int length;
        while ((length = inputStream.read(buffer)) != -1) {
            byteArrayOutputStream.write(buffer, 0, length);
        }
        byte[] bytes = byteArrayOutputStream.toByteArray();
        inputStream.close();
        byteArrayOutputStream.close();
        return Base64.encodeToString(bytes, Base64.DEFAULT);
    }

    private void createRecipeBookPdf(String htmlContent, String author) {
        // Crea WebView invisibile per renderizzare HTML
        WebView webView = new WebView(this);
        webView.setVisibility(View.GONE);
        webView.getSettings().setJavaScriptEnabled(true);
        webView.getSettings().setDomStorageEnabled(true);
        webView.getSettings().setAllowFileAccess(true);
        webView.getSettings().setAllowFileAccessFromFileURLs(true);
        webView.getSettings().setAllowUniversalAccessFromFileURLs(true);

        // Carica il contenuto HTML
        webView.loadDataWithBaseURL(null, htmlContent, "text/html", "UTF-8", null);

        // Crea il nome del file con timestamp
        SimpleDateFormat sdf = new SimpleDateFormat("yyyyMMdd_HHmmss");
        String timestamp = sdf.format(new Date());
        String fileName = "Libro_Ricette_" + author.replaceAll("[^a-zA-Z0-9]", "_") + "_" + timestamp + ".pdf";

        // Configura PrintManager
        PrintManager printManager = (PrintManager) getSystemService(Context.PRINT_SERVICE);
        PrintDocumentAdapter printAdapter = webView.createPrintDocumentAdapter(fileName);

        // Crea job di stampa
        PrintAttributes.Builder builder = new PrintAttributes.Builder();
        builder.setMediaSize(PrintAttributes.MediaSize.ISO_A4);
        builder.setResolution(new PrintAttributes.Resolution("pdf", "pdf", 600, 600));
        builder.setMinMargins(PrintAttributes.Margins.NO_MARGINS);

        PrintJob printJob = printManager.print(fileName, printAdapter, builder.build());
    }

    private void drawWrappedText(Canvas canvas, Paint paint, String text, float x, float y, float maxWidth) {
        if (text == null || text.isEmpty()) {
            return;
        }

        String[] words = text.split(" ");
        StringBuilder currentLine = new StringBuilder();

        for (String word : words) {
            String testLine = currentLine.length() == 0 ? word : currentLine + " " + word;
            if (paint.measureText(testLine) <= maxWidth) {
                currentLine = new StringBuilder(testLine);
            } else {
                // Disegna la linea corrente se non è vuota
                if (currentLine.length() > 0) {
                    canvas.drawText(currentLine.toString(), x, y, paint);
                    y += paint.getTextSize() + 2;
                    currentLine = new StringBuilder(word);
                } else {
                    // Se una singola parola è troppo lunga, tagliala
                    String truncatedWord = truncateTextToFit(word, paint, maxWidth);
                    canvas.drawText(truncatedWord, x, y, paint);
                    y += paint.getTextSize() + 2;
                    currentLine = new StringBuilder();
                }
            }
        }

        // Disegna l'ultima linea
        if (currentLine.length() > 0) {
            canvas.drawText(currentLine.toString(), x, y, paint);
        }
    }

    private String truncateTextToFit(String text, Paint paint, float maxWidth) {
        if (paint.measureText(text) <= maxWidth) {
            return text;
        }

        StringBuilder result = new StringBuilder();
        for (char c : text.toCharArray()) {
            if (paint.measureText(result.toString() + c) <= maxWidth) {
                result.append(c);
            } else {
                break;
            }
        }
        return result.toString();
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
