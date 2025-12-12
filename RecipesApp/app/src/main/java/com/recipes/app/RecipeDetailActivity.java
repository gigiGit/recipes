package com.recipes.app;

import android.content.Intent;
import android.os.Bundle;
import android.print.PrintAttributes;
import android.print.PrintDocumentAdapter;
import android.print.PrintManager;
import android.view.View;
import android.view.MenuItem;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.ImageView;
import androidx.appcompat.app.AppCompatActivity;

public class RecipeDetailActivity extends AppCompatActivity {
    private int recipeIndex = -1;
    
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_recipe_detail);
        
        Intent intent = getIntent();
        String nome = intent.getStringExtra("recipe_name");
        recipeIndex = intent.getIntExtra("recipe_index", -1);
        
        setTitle(nome);
        getSupportActionBar().setDisplayHomeAsUpEnabled(true);
        
        // Popola i dettagli
        setText(R.id.recipe_title, nome);
        setText(R.id.recipe_author, "Autore: " + intent.getStringExtra("autore"));
        setText(R.id.recipe_date, "Inserita: " + intent.getStringExtra("data"));
        
        String info = "";
        if (intent.getStringExtra("difficolta") != null) 
            info += "Difficoltà: " + intent.getStringExtra("difficolta") + "\n";
        if (intent.getStringExtra("costo") != null) 
            info += "Costo: " + intent.getStringExtra("costo") + "\n";
        if (intent.getIntExtra("tempo_prep", 0) > 0)
            info += "Tempo preparazione: " + intent.getIntExtra("tempo_prep", 0) + " min\n";
        if (intent.getIntExtra("tempo_cottura", 0) > 0)
            info += "Tempo cottura: " + intent.getIntExtra("tempo_cottura", 0) + " min\n";
        if (intent.getIntExtra("quantita", 0) > 0)
            info += "Porzioni: " + intent.getIntExtra("quantita", 0) + "\n";
        if (intent.getStringExtra("metodo") != null)
            info += "Metodo: " + intent.getStringExtra("metodo") + "\n";
        if (intent.getStringExtra("tipo") != null)
            info += "Tipo: " + intent.getStringExtra("tipo");
            
        setText(R.id.recipe_info, info);
        
        // Ingredienti
        String[] ingredienti = intent.getStringArrayExtra("ingredienti");
        if (ingredienti != null) {
            StringBuilder sb = new StringBuilder();
            for (String ing : ingredienti) {
                sb.append("• ").append(ing).append("\n");
            }
            setText(R.id.recipe_ingredients, sb.toString());
        }
        
        // Istruzioni
        setText(R.id.recipe_instructions, intent.getStringExtra("istruzioni"));
        
        // Vini
        String[] vini = intent.getStringArrayExtra("vini");
        if (vini != null && vini.length > 0) {
            setText(R.id.recipe_wines, "Vini consigliati: " + String.join(", ", vini));
        }
        
        // Immagini
        loadImageIfPresent(intent.getStringExtra("immagine1"), R.id.recipe_image1);
        loadImageIfPresent(intent.getStringExtra("immagine2"), R.id.recipe_image2);
        loadImageIfPresent(intent.getStringExtra("immagine3"), R.id.recipe_image3);
    }
    
    private void loadImageIfPresent(String url, int imageViewId) {
        ImageView imageView = findViewById(imageViewId);
        try {
            String assetPath;
            if (url == null || url.isEmpty()) {
                assetPath = "images/placeholder.jpg";
            } else {
                assetPath = "images/" + url;
            }
            // Carica da assets
            android.content.res.AssetManager assetManager = getAssets();
            java.io.InputStream inputStream = assetManager.open(assetPath);
            android.graphics.Bitmap bitmap = android.graphics.BitmapFactory.decodeStream(inputStream);
            imageView.setImageBitmap(bitmap);
            imageView.setVisibility(View.VISIBLE);
            inputStream.close();
        } catch (Exception e) {
            imageView.setVisibility(View.GONE);
        }
    }
    
    private void setText(int id, String text) {
        TextView tv = findViewById(id);
        if (tv != null && text != null) {
            tv.setText(text);
        }
    }
    
    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        getMenuInflater().inflate(R.menu.detail_menu, menu);
        return true;
    }
    
    @Override
    public boolean onOptionsItemSelected(MenuItem item) {
        if (item.getItemId() == android.R.id.home) {
            finish();
            return true;
        } else if (item.getItemId() == R.id.action_edit) {
            Intent editIntent = new Intent(this, EditRecipeActivity.class);
            editIntent.putExtra("recipe_index", recipeIndex);
            startActivity(editIntent);
            finish(); // Chiudi dettaglio dopo aver aperto modifica
            return true;
        } else if (item.getItemId() == R.id.action_share) {
            shareRecipe();
            return true;
        } else if (item.getItemId() == R.id.action_print) {
            printRecipe();
            return true;
        }
        return super.onOptionsItemSelected(item);
    }
    
    private void shareRecipe() {
        Intent intent = getIntent();
        StringBuilder text = new StringBuilder();
        
        text.append(intent.getStringExtra("recipe_name")).append("\n\n");
        
        text.append("INGREDIENTI:\n");
        String[] ingredienti = intent.getStringArrayExtra("ingredienti");
        if (ingredienti != null) {
            for (String ing : ingredienti) {
                text.append("• ").append(ing).append("\n");
            }
        }
        
        text.append("\nISTRUZIONI:\n");
        text.append(intent.getStringExtra("istruzioni")).append("\n");
        
        if (intent.getIntExtra("tempo_prep", 0) > 0) {
            text.append("\nTempo preparazione: ").append(intent.getIntExtra("tempo_prep", 0)).append(" min");
        }
        if (intent.getIntExtra("tempo_cottura", 0) > 0) {
            text.append("\nTempo cottura: ").append(intent.getIntExtra("tempo_cottura", 0)).append(" min");
        }
        
        Intent shareIntent = new Intent(Intent.ACTION_SEND);
        shareIntent.setType("text/plain");
        shareIntent.putExtra(Intent.EXTRA_SUBJECT, intent.getStringExtra("recipe_name"));
        shareIntent.putExtra(Intent.EXTRA_TEXT, text.toString());
        startActivity(Intent.createChooser(shareIntent, "Condividi ricetta tramite"));
    }
    
    private void printRecipe() {
        Intent intent = getIntent();
        
        // Crea contenuto HTML per la stampa
        StringBuilder html = new StringBuilder();
        html.append("<html><head><style>");
        html.append("body { font-family: Arial, sans-serif; padding: 20px; }");
        html.append("h1 { color: #333; border-bottom: 2px solid #333; padding-bottom: 10px; }");
        html.append("h2 { color: #666; margin-top: 20px; }");
        html.append(".info { background-color: #f5f5f5; padding: 10px; margin: 10px 0; border-radius: 5px; }");
        html.append("ul { list-style-type: none; padding: 0; }");
        html.append("li:before { content: '• '; font-weight: bold; }");
        html.append("</style></head><body>");
        
        // Titolo
        html.append("<h1>").append(intent.getStringExtra("recipe_name")).append("</h1>");
        
        // Info generali
        html.append("<div class='info'>");
        html.append("<strong>Autore:</strong> ").append(intent.getStringExtra("autore")).append("<br>");
        if (intent.getStringExtra("difficolta") != null)
            html.append("<strong>Difficoltà:</strong> ").append(intent.getStringExtra("difficolta")).append("<br>");
        if (intent.getStringExtra("costo") != null)
            html.append("<strong>Costo:</strong> ").append(intent.getStringExtra("costo")).append("<br>");
        if (intent.getIntExtra("tempo_prep", 0) > 0)
            html.append("<strong>Tempo preparazione:</strong> ").append(intent.getIntExtra("tempo_prep", 0)).append(" min<br>");
        if (intent.getIntExtra("tempo_cottura", 0) > 0)
            html.append("<strong>Tempo cottura:</strong> ").append(intent.getIntExtra("tempo_cottura", 0)).append(" min<br>");
        if (intent.getIntExtra("quantita", 0) > 0)
            html.append("<strong>Porzioni:</strong> ").append(intent.getIntExtra("quantita", 0)).append("<br>");
        if (intent.getStringExtra("metodo") != null)
            html.append("<strong>Metodo:</strong> ").append(intent.getStringExtra("metodo")).append("<br>");
        if (intent.getStringExtra("tipo") != null)
            html.append("<strong>Tipo:</strong> ").append(intent.getStringExtra("tipo"));
        html.append("</div>");
        
        // Ingredienti
        html.append("<h2>Ingredienti</h2>");
        html.append("<ul>");
        String[] ingredienti = intent.getStringArrayExtra("ingredienti");
        if (ingredienti != null) {
            for (String ing : ingredienti) {
                html.append("<li>").append(ing).append("</li>");
            }
        }
        html.append("</ul>");
        
        // Istruzioni
        html.append("<h2>Istruzioni</h2>");
        String istruzioni = intent.getStringExtra("istruzioni");
        if (istruzioni != null) {
            // Sostituisci newline con <br>
            istruzioni = istruzioni.replace("\n", "<br>");
            html.append("<p>").append(istruzioni).append("</p>");
        }
        
        // Vini
        String[] vini = intent.getStringArrayExtra("vini");
        if (vini != null && vini.length > 0) {
            html.append("<h2>Vini consigliati</h2>");
            html.append("<p>").append(String.join(", ", vini)).append("</p>");
        }
        
        html.append("</body></html>");
        
        // Crea WebView per la stampa
        WebView webView = new WebView(this);
        webView.setWebViewClient(new WebViewClient() {
            @Override
            public void onPageFinished(WebView view, String url) {
                createPrintJob(view);
            }
        });
        
        webView.loadDataWithBaseURL(null, html.toString(), "text/html", "UTF-8", null);
    }
    
    private void createPrintJob(WebView webView) {
        PrintManager printManager = (PrintManager) getSystemService(PRINT_SERVICE);
        String jobName = getIntent().getStringExtra("recipe_name") + " - Ricetta";
        
        PrintDocumentAdapter printAdapter = webView.createPrintDocumentAdapter(jobName);
        
        PrintAttributes.Builder builder = new PrintAttributes.Builder();
        builder.setMediaSize(PrintAttributes.MediaSize.ISO_A4);
        builder.setResolution(new PrintAttributes.Resolution("pdf", "pdf", 600, 600));
        builder.setMinMargins(PrintAttributes.Margins.NO_MARGINS);
        
        printManager.print(jobName, printAdapter, builder.build());
    }
}
