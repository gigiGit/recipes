package com.recipes.app;

import android.content.Intent;
import android.os.Bundle;
import android.view.Menu;
import android.view.MenuItem;
import android.widget.TextView;
import androidx.appcompat.app.AppCompatActivity;

public class RecipeDetailActivity extends AppCompatActivity {
    
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_recipe_detail);
        
        Intent intent = getIntent();
        String nome = intent.getStringExtra("recipe_name");
        
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
        } else if (item.getItemId() == R.id.action_share) {
            shareRecipe();
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
}
