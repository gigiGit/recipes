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
    private String Immagine1;
    private String Immagine2;
    private String Immagine3;

    // Getters
    public String getNome() { return Nome; }
    public String[] getIngredienti() { return Ingredienti; }
    public String getIstruzioni() { return Istruzioni; }
    public String getDataInserimento() { return DataInserimento; }
    public String getAutore() { return Autore; }
    public String getDifficolta() { return Difficolta; }
    public String getCosto() { return Costo; }
    public Integer getTempoPreparazione() { return TempoPreparazione; }
    public Integer getTempoCottura() { return TempoCottura; }
    public Integer getQuantita() { return Quantita; }
    public String getMetodoCottura() { return MetodoCottura; }
    public String[] getVinoPreferibile() { return VinoPreferibile; }
    public String getTipoPiatto() { return TipoPiatto; }
    public String getImmagine1() { return Immagine1; }
    public String getImmagine2() { return Immagine2; }
    public String getImmagine3() { return Immagine3; }
    
    public String getIngredientiAsString() {
        if (Ingredienti == null) return "";
        return String.join("\n• ", Ingredienti);
    }
    
    public String getViniAsString() {
        if (VinoPreferibile == null || VinoPreferibile.length == 0) return "Nessuno";
        return String.join(", ", VinoPreferibile);
    }
    
    // Setters
    public void setNome(String nome) { this.Nome = nome; }
    public void setIngredienti(String[] ingredienti) { this.Ingredienti = ingredienti; }
    public void setIstruzioni(String istruzioni) { this.Istruzioni = istruzioni; }
    public void setDataInserimento(String data) { this.DataInserimento = data; }
    public void setAutore(String autore) { this.Autore = autore; }
    public void setDifficolta(String difficolta) { this.Difficolta = difficolta; }
    public void setCosto(String costo) { this.Costo = costo; }
    public void setTempoPreparazione(Integer tempo) { this.TempoPreparazione = tempo; }
    public void setTempoCottura(Integer tempo) { this.TempoCottura = tempo; }
    public void setQuantita(Integer quantita) { this.Quantita = quantita; }
    public void setMetodoCottura(String metodo) { this.MetodoCottura = metodo; }
    public void setVinoPreferibile(String[] vini) { this.VinoPreferibile = vini; }
    public void setTipoPiatto(String tipo) { this.TipoPiatto = tipo; }
    public void setImmagine1(String immagine) { this.Immagine1 = immagine; }
    public void setImmagine2(String immagine) { this.Immagine2 = immagine; }
    public void setImmagine3(String immagine) { this.Immagine3 = immagine; }
}
