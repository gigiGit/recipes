package com.recipes.app;

import android.app.Activity;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.view.View;
import android.widget.ArrayAdapter;
import android.widget.Button;
import android.widget.EditText;
import android.widget.Spinner;
import android.widget.Toast;
import androidx.appcompat.app.AlertDialog;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.content.FileProvider;
import com.google.android.material.textfield.TextInputEditText;
import java.io.File;

public class EditRecipeActivity extends AppCompatActivity {
    private TextInputEditText etNome, etIngredienti, etIstruzioni, etAutore, etData;
    private TextInputEditText etTempoPrep, etTempoCottura, etQuantita, etVini;
    private Spinner spDifficolta, spCosto, spMetodo, spTipoPiatto;
    private Button btnSalva;
    private RecipeManager recipeManager;
    private Recipe editingRecipe;
    private int recipeIndex = -1;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_edit_recipe);
        
        recipeManager = new RecipeManager(this);
        
        initViews();
        setupSpinners();
        
        // Verifica se stiamo modificando una ricetta esistente
        if (getIntent().hasExtra("recipe_index")) {
            recipeIndex = getIntent().getIntExtra("recipe_index", -1);
            loadRecipe(recipeIndex);
            setTitle("Modifica Ricetta");
        } else {
            setTitle("Nuova Ricetta");
        }
        
        btnSalva.setOnClickListener(v -> saveRecipe());
    }
    
    private void initViews() {
        etNome = findViewById(R.id.et_nome);
        etIngredienti = findViewById(R.id.et_ingredienti);
        etIstruzioni = findViewById(R.id.et_istruzioni);
        etAutore = findViewById(R.id.et_autore);
        etData = findViewById(R.id.et_data);
        etTempoPrep = findViewById(R.id.et_tempo_prep);
        etTempoCottura = findViewById(R.id.et_tempo_cottura);
        etQuantita = findViewById(R.id.et_quantita);
        etVini = findViewById(R.id.et_vini);
        
        spDifficolta = findViewById(R.id.sp_difficolta);
        spCosto = findViewById(R.id.sp_costo);
        spMetodo = findViewById(R.id.sp_metodo);
        spTipoPiatto = findViewById(R.id.sp_tipo_piatto);
        
        btnSalva = findViewById(R.id.btn_salva);
    }
    
    private void setupSpinners() {
        // Difficoltà
        ArrayAdapter<String> difficoltaAdapter = new ArrayAdapter<>(this,
            android.R.layout.simple_spinner_item,
            new String[]{"facile", "Medio", "Difficile", "veri esperti"});
        difficoltaAdapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item);
        spDifficolta.setAdapter(difficoltaAdapter);
        
        // Costo
        ArrayAdapter<String> costoAdapter = new ArrayAdapter<>(this,
            android.R.layout.simple_spinner_item,
            new String[]{"economico", "medio", "costoso"});
        costoAdapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item);
        spCosto.setAdapter(costoAdapter);
        
        // Metodo cottura
        ArrayAdapter<String> metodoAdapter = new ArrayAdapter<>(this,
            android.R.layout.simple_spinner_item,
            new String[]{"Nessuna", "Forno", "Fornello", "Microonde", "Induzione", "Friggitrice", "tostapane"});
        metodoAdapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item);
        spMetodo.setAdapter(metodoAdapter);
        
        // Tipo piatto
        ArrayAdapter<String> tipoPiattoAdapter = new ArrayAdapter<>(this,
            android.R.layout.simple_spinner_item,
            new String[]{"Antipasto", "Primo", "Secondo", "Piatto Unico", "Contorno", "Dolce", "Liquore"});
        tipoPiattoAdapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item);
        spTipoPiatto.setAdapter(tipoPiattoAdapter);
    }
    
    private void loadRecipe(int index) {
        editingRecipe = recipeManager.getAllRecipes().get(index);
        
        etNome.setText(editingRecipe.getNome());
        etIngredienti.setText(String.join("\n", editingRecipe.getIngredienti()));
        etIstruzioni.setText(editingRecipe.getIstruzioni());
        etAutore.setText(editingRecipe.getAutore());
        etData.setText(editingRecipe.getDataInserimento());
        
        if (editingRecipe.getTempoPreparazione() != null) {
            etTempoPrep.setText(String.valueOf(editingRecipe.getTempoPreparazione()));
        }
        if (editingRecipe.getTempoCottura() != null) {
            etTempoCottura.setText(String.valueOf(editingRecipe.getTempoCottura()));
        }
        if (editingRecipe.getQuantita() != null) {
            etQuantita.setText(String.valueOf(editingRecipe.getQuantita()));
        }
        
        if (editingRecipe.getVinoPreferibile() != null) {
            etVini.setText(String.join("\n", editingRecipe.getVinoPreferibile()));
        }
        
        // Imposta spinner
        setSpinnerValue(spDifficolta, editingRecipe.getDifficolta());
        setSpinnerValue(spCosto, editingRecipe.getCosto());
        setSpinnerValue(spMetodo, editingRecipe.getMetodoCottura());
        setSpinnerValue(spTipoPiatto, editingRecipe.getTipoPiatto());
    }
    
    private void setSpinnerValue(Spinner spinner, String value) {
        if (value == null) return;
        ArrayAdapter adapter = (ArrayAdapter) spinner.getAdapter();
        for (int i = 0; i < adapter.getCount(); i++) {
            if (adapter.getItem(i).toString().equals(value)) {
                spinner.setSelection(i);
                break;
            }
        }
    }
    
    private void saveRecipe() {
        String nome = etNome.getText().toString().trim();
        if (nome.isEmpty()) {
            Toast.makeText(this, "Il nome è obbligatorio", Toast.LENGTH_SHORT).show();
            return;
        }
        
        String ingredientiText = etIngredienti.getText().toString().trim();
        if (ingredientiText.isEmpty()) {
            Toast.makeText(this, "Gli ingredienti sono obbligatori", Toast.LENGTH_SHORT).show();
            return;
        }
        
        String istruzioni = etIstruzioni.getText().toString().trim();
        if (istruzioni.isEmpty()) {
            Toast.makeText(this, "Le istruzioni sono obbligatorie", Toast.LENGTH_SHORT).show();
            return;
        }
        
        // Salva la ricetta tramite RecipeManager
        boolean success = recipeManager.saveRecipe(
            recipeIndex,
            nome,
            ingredientiText.split("\n"),
            istruzioni,
            etAutore.getText().toString(),
            etData.getText().toString(),
            spDifficolta.getSelectedItem().toString(),
            spCosto.getSelectedItem().toString(),
            parseInteger(etTempoPrep.getText().toString()),
            parseInteger(etTempoCottura.getText().toString()),
            parseInteger(etQuantita.getText().toString()),
            spMetodo.getSelectedItem().toString(),
            spTipoPiatto.getSelectedItem().toString(),
            etVini.getText().toString().split("\n")
        );
        
        if (success) {
            Toast.makeText(this, "Ricetta salvata!", Toast.LENGTH_SHORT).show();
            
            // Chiedi se inviare le modifiche via email
            new AlertDialog.Builder(this)
                .setTitle("Sincronizza modifiche")
                .setMessage("Vuoi inviare le modifiche al database principale via email?")
                .setPositiveButton("Sì, invia", (dialog, which) -> sendModificationsEmail())
                .setNegativeButton("No, dopo", (dialog, which) -> {
                    setResult(Activity.RESULT_OK);
                    finish();
                })
                .setCancelable(false)
                .show();
        } else {
            Toast.makeText(this, "Errore nel salvataggio", Toast.LENGTH_SHORT).show();
        }
    }
    
    private void sendModificationsEmail() {
        File modFile = recipeManager.getModificationsFile();
        
        if (!modFile.exists()) {
            Toast.makeText(this, "Nessuna modifica da inviare", Toast.LENGTH_SHORT).show();
            setResult(Activity.RESULT_OK);
            finish();
            return;
        }
        
        try {
            Uri fileUri = FileProvider.getUriForFile(
                this,
                "com.recipes.app.fileprovider",
                modFile
            );
            
            Intent emailIntent = new Intent(Intent.ACTION_SEND);
            emailIntent.setType("application/json");
            emailIntent.putExtra(Intent.EXTRA_EMAIL, new String[]{"famiglia.giusti2018@gmail.com"});
            emailIntent.putExtra(Intent.EXTRA_SUBJECT, "Modifiche ricette - " + new java.text.SimpleDateFormat("yyyy-MM-dd HH:mm").format(new java.util.Date()));
            emailIntent.putExtra(Intent.EXTRA_TEXT, "In allegato il file JSON con le ricette modificate o aggiunte dall'app Android.\n\nIntegra queste modifiche nel database principale.");
            emailIntent.putExtra(Intent.EXTRA_STREAM, fileUri);
            emailIntent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
            
            // Prova ad aprire direttamente Gmail se disponibile
            emailIntent.setPackage("com.google.android.gm");
            
            try {
                startActivity(emailIntent);
                Toast.makeText(this, "Email inviata automaticamente", Toast.LENGTH_SHORT).show();
            } catch (android.content.ActivityNotFoundException ex) {
                // Gmail non installato, usa il chooser standard
                emailIntent.setPackage(null);
                startActivity(Intent.createChooser(emailIntent, "Invia modifiche via email"));
                Toast.makeText(this, "Seleziona app email e completa invio", Toast.LENGTH_LONG).show();
            }
            setResult(Activity.RESULT_OK);
            finish();
            
        } catch (Exception e) {
            e.printStackTrace();
            Toast.makeText(this, "Errore nell'invio email: " + e.getMessage(), Toast.LENGTH_LONG).show();
            setResult(Activity.RESULT_OK);
            finish();
        }
    }
    
    private Integer parseInteger(String text) {
        try {
            return text.isEmpty() ? null : Integer.parseInt(text);
        } catch (NumberFormatException e) {
            return null;
        }
    }
}
