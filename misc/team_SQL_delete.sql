-- Drop existing constraints
ALTER TABLE Users DROP CONSTRAINT IF EXISTS chk_user_id_format;
ALTER TABLE Pantry DROP CONSTRAINT IF EXISTS chk_pantry_id_format;
ALTER TABLE Pantry DROP CONSTRAINT IF EXISTS chk_user_id_format;
ALTER TABLE Ingredients DROP CONSTRAINT IF EXISTS chk_ingredient_id_numeric;
ALTER TABLE PantryIngredient DROP CONSTRAINT IF EXISTS chk_pantry_id_format;
ALTER TABLE PantryIngredient DROP CONSTRAINT IF EXISTS chk_ingredient_id_numeric;
ALTER TABLE Recipes DROP CONSTRAINT IF EXISTS chk_id_uuid4_format;
ALTER TABLE RecipeIngredients DROP CONSTRAINT IF EXISTS chk_recipe_id_uuid4_format;
ALTER TABLE RecipeIngredients DROP CONSTRAINT IF EXISTS chk_ingredient_id_numeric;
ALTER TABLE UserRecipes DROP CONSTRAINT IF EXISTS chk_user_id_format;
ALTER TABLE UserRecipes DROP CONSTRAINT IF EXISTS chk_recipe_id_uuid4_format;
ALTER TABLE requests DROP CONSTRAINT IF EXISTS chk_request_id_format;
ALTER TABLE requests DROP CONSTRAINT IF EXISTS chk_user_id_format;
ALTER TABLE requests DROP CONSTRAINT IF EXISTS chk_volunteer_id_format;
ALTER TABLE RequestIngredients DROP CONSTRAINT IF EXISTS chk_request_id_format;
ALTER TABLE RequestIngredients DROP CONSTRAINT IF EXISTS chk_pantry_id_format;
ALTER TABLE RequestIngredients DROP CONSTRAINT IF EXISTS chk_ingredient_id_numeric;

-- Drop existing tables if they exist
DROP TABLE IF EXISTS RequestIngredients;
DROP TABLE IF EXISTS UserRecipes;
DROP TABLE IF EXISTS RecipeIngredients;
DROP TABLE IF EXISTS Recipes;
DROP TABLE IF EXISTS PantryIngredient;
DROP TABLE IF EXISTS Ingredients;
DROP TABLE IF EXISTS Pantry;
DROP TABLE IF EXISTS requests;
DROP TABLE IF EXISTS Users;
