package com.recipes.app;

import android.content.Intent;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.Paint;
import android.graphics.pdf.PdfDocument;
import android.net.Uri;
import android.os.Bundle;
import android.view.Menu;
import android.view.MenuItem;
import android.widget.Toast;
import androidx.appcompat.app.AppCompatActivity;
import androidx.appcompat.widget.SearchView;
import androidx.core.content.FileProvider;
import androidx.viewpager2.widget.ViewPager2;
import com.google.android.material.tabs.TabLayout;
import com.google.android.material.tabs.TabLayoutMediator;
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
        String bookContent = generateRecipeBookContent(selectedAuthor, recipesByType);

        // Crea il PDF direttamente
        createRecipeBookPdf(bookContent, selectedAuthor);
    }
    
    private String generateRecipeBookContent(String author, Map<String, List<Recipe>> recipesByType) {
        StringBuilder content = new StringBuilder();

        // Titolo del libro
        content.append("LIBRO DELLE RICETTE\n");
        content.append("di ").append(author).append("\n\n");

        // Genera contenuto per ogni tipo di piatto
        for (Map.Entry<String, List<Recipe>> entry : recipesByType.entrySet()) {
            String tipoPiatto = entry.getKey();
            List<Recipe> recipes = entry.getValue();

            if (recipes.isEmpty()) continue;

            content.append("\n").append(tipoPiatto.toUpperCase()).append("\n");
            content.append("=".repeat(tipoPiatto.length())).append("\n\n");

            for (Recipe recipe : recipes) {
                content.append(recipe.getNome()).append("\n");
                content.append("-".repeat(recipe.getNome().length())).append("\n\n");

                // Info generali
                StringBuilder info = new StringBuilder();
                if (recipe.getDifficolta() != null && !recipe.getDifficolta().isEmpty())
                    info.append("Difficoltà: ").append(recipe.getDifficolta()).append(" | ");
                if (recipe.getCosto() != null && !recipe.getCosto().isEmpty())
                    info.append("Costo: ").append(recipe.getCosto()).append(" | ");
                if (recipe.getTempoPreparazione() != null && recipe.getTempoPreparazione() > 0)
                    info.append("Prep: ").append(recipe.getTempoPreparazione()).append(" min | ");
                if (recipe.getTempoCottura() != null && recipe.getTempoCottura() > 0)
                    info.append("Cottura: ").append(recipe.getTempoCottura()).append(" min | ");
                if (recipe.getQuantita() != null && recipe.getQuantita() > 0)
                    info.append("Porzioni: ").append(recipe.getQuantita()).append(" | ");
                if (recipe.getMetodoCottura() != null && !recipe.getMetodoCottura().isEmpty())
                    info.append("Metodo: ").append(recipe.getMetodoCottura());

                if (info.length() > 0) {
                    content.append(info.toString().trim()).append("\n\n");
                }

                // Ingredienti
                if (recipe.getIngredienti() != null && recipe.getIngredienti().length > 0) {
                    content.append("INGREDIENTI:\n");
                    for (String ing : recipe.getIngredienti()) {
                        content.append("• ").append(ing).append("\n");
                    }
                    content.append("\n");
                }

                // Istruzioni
                if (recipe.getIstruzioni() != null && !recipe.getIstruzioni().isEmpty()) {
                    content.append("PREPARAZIONE:\n");
                    content.append(recipe.getIstruzioni()).append("\n\n");
                }

                // Vini consigliati
                if (recipe.getVinoPreferibile() != null && recipe.getVinoPreferibile().length > 0) {
                    content.append("VINI CONSIGLIATI:\n");
                    content.append(String.join(", ", recipe.getVinoPreferibile())).append("\n\n");
                }

                content.append("\n");
            }
        }

        return content.toString();
    }

    private void createRecipeBookPdf(String content, String author) {
        try {
            // Crea il nome del file con timestamp
            SimpleDateFormat sdf = new SimpleDateFormat("yyyyMMdd_HHmmss");
            String timestamp = sdf.format(new Date());
            String fileName = "Libro_Ricette_" + author.replaceAll("[^a-zA-Z0-9]", "_") + "_" + timestamp + ".pdf";

            // Usa la directory esterna privata dell'app (non richiede permessi speciali)
            File downloadsDir = new File(getExternalFilesDir(null), "Downloads");
            if (!downloadsDir.exists()) {
                downloadsDir.mkdirs();
            }
            File pdfFile = new File(downloadsDir, fileName);

            // Crea il documento PDF
            PdfDocument document = new PdfDocument();
            Paint paint = new Paint();
            paint.setColor(Color.BLACK);
            paint.setTextSize(12);

            // Dimensioni pagina A4
            int pageWidth = 595; // A4 width in points (72 DPI)
            int pageHeight = 842; // A4 height in points (72 DPI)
            int margin = 50;
            int contentWidth = pageWidth - (margin * 2);

            String[] lines = content.split("\n");
            int currentLine = 0;
            int pageNumber = 1;

            while (currentLine < lines.length) {
                // Crea una nuova pagina
                PdfDocument.PageInfo pageInfo = new PdfDocument.PageInfo.Builder(pageWidth, pageHeight, pageNumber).create();
                PdfDocument.Page page = document.startPage(pageInfo);
                Canvas canvas = page.getCanvas();

                int yPosition = margin + 20;

                // Disegna le linee per questa pagina
                while (currentLine < lines.length && yPosition < pageHeight - margin) {
                    String line = lines[currentLine];

                    // Gestisci linee vuote
                    if (line.trim().isEmpty()) {
                        yPosition += 15;
                        currentLine++;
                        continue;
                    }

                    // Verifica se la linea è un titolo (tutto maiuscolo)
                    if (line.equals(line.toUpperCase()) && line.length() > 3) {
                        paint.setTextSize(16);
                        paint.setFakeBoldText(true);
                    } else if (line.contains("-") && line.replace("-", "").trim().isEmpty()) {
                        // Linea di separazione
                        paint.setTextSize(12);
                        paint.setFakeBoldText(false);
                    } else {
                        paint.setTextSize(12);
                        paint.setFakeBoldText(false);
                    }

                    // Gestisci il text wrapping in modo sicuro
                    drawWrappedText(canvas, paint, line, margin, yPosition, contentWidth);
                    yPosition += paint.getTextSize() + 5;

                    currentLine++;

                    // Se non c'è più spazio per almeno una riga, interrompi
                    if (yPosition + 20 > pageHeight - margin) {
                        break;
                    }
                }

                document.finishPage(page);
                pageNumber++;
            }

            // Salva il documento
            FileOutputStream fos = new FileOutputStream(pdfFile);
            document.writeTo(fos);
            document.close();
            fos.close();

            // Mostra messaggio di successo con percorso relativo
            String relativePath = "Android/data/com.recipes.app/files/Downloads/" + fileName;
            Toast.makeText(this, "PDF salvato in: " + relativePath, Toast.LENGTH_LONG).show();

            // Apri il file con un visualizzatore PDF
            Intent intent = new Intent(Intent.ACTION_VIEW);
            Uri uri = FileProvider.getUriForFile(this, "com.recipes.app.fileprovider", pdfFile);
            intent.setDataAndType(uri, "application/pdf");
            intent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
            startActivity(intent);

        } catch (Exception e) {
            Toast.makeText(this, "Errore nella generazione del PDF: " + e.getMessage(), Toast.LENGTH_LONG).show();
            e.printStackTrace();
        }
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
