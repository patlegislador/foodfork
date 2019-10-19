import Search from './models/Search'
import * as searchView from './views/searchView'
import * as recipeView from './views/recipeView'
import { el, renderLoader, clearLoader } from './views/base'
import Recipe from './models/Recipe'

/** GLOBAL STATE OF THE APP
    * - Search object
    * - Current recipe object
    * - Shopping list object
    * - Liked recipes
**/

const state = {};


// SEARCH CONTROLLER
const controlSearch = async () => {
    // 1) get query from view
    const query = searchView.getInput(); //TODO

    if (query) {
        // 2) new search object and add to state
        state.search = new Search(query);

        // 3) Prepare UI for results
        searchView.clearInput();
        searchView.clearResults();
        renderLoader(el.searchResults);

        try {
            // 4) Search for recipes 
            await state.search.getResults();

            // 5) Render results on UI 
            clearLoader();
            searchView.renderResults(state.search.result);
        } catch (error) {
            alert('Something went wrong with the search.');
            clearLoader();
        }

    }
}

el.searchForm.addEventListener('submit', e => {
    e.preventDefault();
    controlSearch();
});


el.searchResultPages.addEventListener('click', e => {
    const btn = e.target.closest('.btn-inline');

    if (btn) {
        const goToPage = parseInt(btn.dataset.goto, 10);
        searchView.clearResults();
        searchView.renderResults(state.search.result, goToPage);
    }
})

//RECIPE CONTROLLER
const controlRecipe = async () => {
    //get ID from URL
    const id = window.location.hash.replace('#', '');

    if (id) {
        //prepare UI for changes
        recipeView.clearResults();
        renderLoader(el.recipe);

        //highlighted selected recipe
        if (state.search) searchView.highlightedSelected(id);

        //create new Recipe object
        state.recipe = new Recipe(id);

        try {
            //get Recipe data and parse ingredients
            await state.recipe.getRecipe();
            state.recipe.parseIngredients();

            //calculate time and servings
            state.recipe.calcTime();
            state.recipe.calcServings();

            //render Recipe
            clearLoader();
            recipeView.renderRecipe(state.recipe);
        } catch (error) {
            alert('Error processing recipe!');
        }
    }


}

['hashchange', 'load'].forEach(event => window.addEventListener(event, controlRecipe));