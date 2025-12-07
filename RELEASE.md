# 📱 Come Fare una Release

## Automatico con GitHub Actions

### 1. Crea un tag
```bash
git tag v1.0.0
git push origin v1.0.0
```

### 2. Trigger automatico
GitHub Actions compila automaticamente:
- ✅ APK Android Release
- ✅ Build iOS
- ✅ Crea una Release su GitHub con i file

### 3. Scarica da GitHub Releases
Vai su: `https://github.com/gigiGit/recipes/releases`

Tutti gli artifact saranno disponibili per il download!

---

## Manuale (se preferisci)

### Android
```bash
cd RecipesApp
./gradlew clean assembleRelease
# Troverai l'APK in: app/build/outputs/apk/release/
```

### iOS
1. Apri Xcode
2. Product → Archive
3. Distribuisci via App Store o TestFlight

---

## Versionamento Semantic

Usa questo schema per i tag:
- `v1.0.0` - Release stabile (major.minor.patch)
- `v1.0.0-beta` - Beta/Pre-release
- `v1.0.0-alpha` - Alpha testing

---

## Note Release

La release automatica include:
- APK Android firmato (require keystore in CI/CD)
- Build iOS compilato (require firma per distribuzione)
- Changelog automatico dai commit
- Link diretti ai file per il download

**Prossimi step**: Configurare keystore Android per APK firmato in CI/CD
