import Search from './models/Search'
import Recipe from './models/Recipe'
import List from './models/List'
import Likes from './models/Likes'
import * as searchView from './views/searchView'
import * as recipeView from './views/recipeView'
import * as listView from './views/listView'
import * as likesView from './views/likesView'
import { el, renderLoader, clearLoader } from './views/base'

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
        try {
            if (state.search) searchView.highlightSelected(id);
        } catch (error) {
            searchView.clearResults();
        }

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
            recipeView.renderRecipe(state.recipe, state.likes.isLiked(id));
        } catch (error) {
            console.log(error);
            alert('Error processing recipe!');
        }
    }
}


['hashchange', 'load'].forEach(event => window.addEventListener(event, controlRecipe));

const controlList = () => {
    // Create a new list if there is none yet
    if (!state.list) state.list = new List();

    // Add each ingredient to the list
    state.recipe.ingredients.forEach(el => {
        const item = state.list.addItem(el.count, el.unit, el.ingredient);
        listView.renderItem(item);
    })
}

// Handle delete and update list item events
el.shoppingList.addEventListener('click', e => {
    const itemid = e.target.closest('.shopping__item').dataset.itemid;

    //Handle delete button
    if (e.target.matches('.shopping__delete, .shopping__delete *')) {
        //Delete from state and UI
        state.list.deleteItem(itemid);
        listView.deleteItem(itemid);
    } else if (e.target.matches('.shopping__count--value')) {
        const val = parseFloat(e.target.value, 10);
        state.list.updateCount(itemid, val);
    }
});


const controlLike = () => {
    if (!state.likes) state.likes = new Likes();
    const { id, title, author, image } = state.recipe;
    // User has not yet liked the current recipe

    if (!state.likes.isLiked(id)) {
        // Add like to the state
        const newLike = state.likes.addLike(id, title, author, image)
        // Toggle the like button
        likesView.toggleLikeBtn(true);
        // Add like to UI list
        likesView.renderLike(newLike);

    } else { // User has liked the current recipe
        // Remove like from state
        state.likes.deleteLike(id);
        // Toggle the like button
        likesView.toggleLikeBtn(false);
        // Remove like from the UI list
        likesView.deleteLike(id);
    }

    likesView.toggleLikeMenu(state.likes.getNumLikes());

}

// Restore liked recipes on page load
window.addEventListener('load', () => {
    state.likes = new Likes();

    // Restore likes
    state.likes.readStorage();

    // Toggle like menu button
    likesView.toggleLikeMenu(state.likes.getNumLikes());

    // Render liked recipes in menu
    state.likes.likes.forEach(like => likesView.renderLike(like));
});


// Handling recipe button clicks 
el.recipe.addEventListener('click', e => {
    if (e.target.matches('.btn-decrease, .btn-decrease *')) {
        // Decrease button is clicked
        if (state.recipe.servings > 1) {
            state.recipe.updateServings('dec');
            recipeView.updateServingsIngredients(state.recipe);
        }

    } else if (e.target.matches('.btn-increase, .btn-increase *')) {
        state.recipe.updateServings('inc');
        recipeView.updateServingsIngredients(state.recipe);

    } else if (e.target.matches('.recipe__btn--add, .recipe__btn--add *')) {
        controlList();
    } else if (e.target.matches('.recipe__love, .recipe__love *')) {
        controlLike();
    }

});