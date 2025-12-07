#!/bin/bash
# Script per creare il progetto Xcode iOS da zero usando xcodebuild template

set -e

PROJECT_DIR="RecipesApp-iOS"
cd "$PROJECT_DIR"

# Crea la struttura delle cartelle
mkdir -p RecipesApp-iOS/Models
mkdir -p RecipesApp-iOS/Views
mkdir -p "RecipesApp-iOS/Preview Content"
mkdir -p RecipesApp-iOS.xcodeproj

# Genera il project.pbxproj usando Ruby (disponibile su macOS)
ruby << 'RUBY_SCRIPT'
require 'xcodeproj'

# Crea un nuovo progetto
project = Xcodeproj::Project.new('RecipesApp-iOS.xcodeproj')

# Configura target
target = project.new_target(:application, 'RecipesApp-iOS', :ios)
target.deployment_target = '15.0'

# Aggiungi file al progetto
group = project['RecipesApp-iOS']

# Models
models_group = group['Models'] || group.new_group('Models')
models_group.new_file('Models/Recipe.swift')
models_group.new_file('Models/RecipeManager.swift')

# Views
views_group = group['Views'] || group.new_group('Views')
views_group.new_file('Views/ContentView.swift')
views_group.new_file('Views/RecipesByTypeView.swift')
views_group.new_file('Views/RecipesByAuthorView.swift')
views_group.new_file('Views/RecipeDetailView.swift')
views_group.new_file('Views/SearchBar.swift')
views_group.new_file('Views/PrintView.swift')

# Root files
group.new_file('RecipesApp.swift')
group.new_file('recipes.json')
group.new_file('Assets.xcassets')

# Salva il progetto
project.save

puts "Progetto creato con successo!"
RUBY_SCRIPT

echo "✓ Progetto Xcode generato"
