package com.recipes.app;

import java.io.Serializable;

public class Recipe implements Serializable {
    private String Nome;
    private String[] Ingredienti;
    private String Istruzioni;
    private String DataInserimento;
    private String Autore;
    private String Difficolta;
    private String Costo;
    private Integer TempoPreparazione;
    private Integer TempoCottura;
    private Integer Quantita;
    private String MetodoCottura;
    private String[] VinoPreferibile;
    private String TipoPiatto;

    // Getters
    public String getNome() { return Nome; }
    public String[] getIngredienti() { return Ingredienti; }
    public String getIstruzioni() { return Istruzioni; }
    public String getDataInserimento() { return DataInserimento; }
    public String getAutore() { return Autore; }
    public String getDifficolta() { return Difficolta; }
    public String getCosto() { return Costo; }
    public Integer getTempoPreparazione() { return TempoPreparazione; }
    public Integer TempoCottura() { return TempoCottura; }
    public Integer getQuantita() { return Quantita; }
    public String getMetodoCottura() { return MetodoCottura; }
    public String[] getVinoPreferibile() { return VinoPreferibile; }
    public String getTipoPiatto() { return TipoPiatto; }
    
    public String getIngredientiAsString() {
        if (Ingredienti == null) return "";
        return String.join("\n• ", Ingredienti);
    }
    
    public String getViniAsString() {
        if (VinoPreferibile == null || VinoPreferibile.length == 0) return "Nessuno";
        return String.join(", ", VinoPreferibile);
    }
}
