import { el } from "./base";

export const getInput = () => el.searchInput.value;
export const clearInput = () => {
    el.searchInput.value = '';
};

export const clearResults = () => {
    el.searchResultList.innerHTML = '';
    el.searchResultPages.innerHTML = '';
}

export const highlightSelected = id => {
    const resultsArr = Array.from(document.querySelectorAll('.results__link'));
    resultsArr.forEach(el => {
        el.classList.remove('results__link--active');
    });
    document.querySelector(`.results__link[href*="#${id}"]`).classList.add('results__link--active');
}

// Pasta With Tomato and Spinach
export const limitRecipeTitle = (title, limit = 17) => {
    if (title.length > limit) {
        let newTitle = title.split(' ').reduce((prev, next) => {
            return (prev + ' ' + next).length > 17 ? prev : prev + ' ' + next;
        });
        return `${newTitle} ...`;
    }
    return title;
}

const renderRecipe = recipe => {
    let html = `
    <li>
        <a class="results__link" href="#${recipe.recipe_id}">
            <figure class="results__fig">
                <img src="${recipe.image_url}" alt="${recipe.title}">
            </figure>
            <div class="results__data">
                <h4 class="results__name">${limitRecipeTitle(recipe.title)}</h4>
                <p class="results__author">${recipe.publisher}</p>
            </div>
        </a>
    </li>`

    el.searchResultList.insertAdjacentHTML('beforeend', html);
}

const createButton = (page, type) => `
    <button class="btn-inline results__btn--${type}" data-goto=${type === 'prev' ? page - 1 : page + 1}>
        <span>Page ${type === 'prev' ? page - 1 : page + 1}</span>
        <svg class="search__icon">
            <use href="img/icons.svg#icon-triangle-${type === 'prev' ? 'left' : 'right'}"></use>
        </svg>
    </button>
`;

const renderButtons = (page, numResults, resPerPage) => {
    let pageCount = Math.ceil(numResults / resPerPage);
    let button;

    if (page === 1 && pageCount > 1) {
        //Button only goes to next page
        button = createButton(page, 'next');
    } else if (page < pageCount) {
        //Two buttons going previous and next
        button = `
        ${createButton(page, 'prev')}
        ${createButton(page, 'next')}
        `;

    } else if (page === pageCount && pageCount > 1) {
        // Button only goes to previous page
        button = createButton(page, 'prev');
    }

    el.searchResultPages.insertAdjacentHTML('afterbegin', button);
}

export const renderResults = (recipes, page = 1, resPerPage = 10) => {
    const start = (page - 1) * resPerPage;
    const end = page * resPerPage;
    recipes.slice(start, end).forEach(renderRecipe);
    renderButtons(page, recipes.length, resPerPage);
}




