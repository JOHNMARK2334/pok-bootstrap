const apiUrl = 'https://pokeapi.co/api/v2/pokemon';
let currentPage = 1;
const pageSize = 21;
let totalPages = 0;

document.addEventListener('DOMContentLoaded', () => {
    fetchPokemon();

    document.getElementById('prev-page').addEventListener('click', (e) => {
        e.preventDefault();
        if (currentPage > 1) {
            currentPage--;
            fetchPokemon();
        }
    });

    document.getElementById('next-page').addEventListener('click', (e) => {
        e.preventDefault();
        if (currentPage < totalPages) {
            currentPage++;
            fetchPokemon();
        }
    });

    document.getElementById('search').addEventListener('input', (e) => {
        fetchPokemon();
    });

    document.getElementById('type-filter').addEventListener('change', (e) => {
        fetchPokemon();
    });

    document.getElementById('generation-filter').addEventListener('change', (e) => {
        fetchPokemon();
    });
});

async function fetchPokemon() {
    const searchQuery = document.getElementById('search').value.toLowerCase();
    const typeFilter = document.getElementById('type-filter').value;
    const generationFilter = document.getElementById('generation-filter').value;

    try {
        const response = await axios.get(`${apiUrl}?offset=${(currentPage - 1) * pageSize}&limit=${pageSize}`);
        let pokemonList = response.data.results;

        if (searchQuery) {
            pokemonList = pokemonList.filter(pokemon => pokemon.name.includes(searchQuery));
        }

        // Fetch additional data for filtering
        const filteredPokemonList = [];
        for (const pokemon of pokemonList) {
            const pokemonData = await axios.get(pokemon.url);
            const pokemonTypes = pokemonData.data.types.map(typeInfo => typeInfo.type.name);

            let matchesType = true;
            if (typeFilter) {
                matchesType = pokemonTypes.includes(typeFilter);
            }

            let matchesGeneration = true;
            if (generationFilter) {
                const generationData = await axios.get(`https://pokeapi.co/api/v2/generation/${generationFilter}`);
                matchesGeneration = generationData.data.pokemon_species.some(species => species.name === pokemon.name);
            }

            if (matchesType && matchesGeneration) {
                filteredPokemonList.push(pokemonData.data);
            }
        }

        displayPokemon(filteredPokemonList);
        updatePagination(response.data.count);
        updateCurrentPageDisplay();
    } catch (error) {
        console.error('Error fetching Pokemon:', error);
    }
}

function displayPokemon(pokemonList) {
    const pokemonContainer = document.getElementById('pokemon-list');
    pokemonContainer.innerHTML = '';

    for (const pokemon of pokemonList) {
        const pokemonTypes = pokemon.types.map(typeInfo => typeInfo.type.name).join(', ');

        const pokemonCard = `
            <div class="col-md-4 col-sm-6 col-12 pokemon-card">
                <div class="card" data-url="${pokemon.url}">
                    <img src="${pokemon.sprites.front_default}" class="card-img-top" alt="${pokemon.name}">
                    <div class="card-body">
                        <h5 class="card-title">${pokemon.name}</h5>
                        <p class="card-text">Type: ${pokemonTypes}</p>
                    </div>
                </div>
            </div>
        `;
        pokemonContainer.innerHTML += pokemonCard;
    }

    // Add event listeners to the cards
    const cards = document.querySelectorAll('.pokemon-card .card');
    cards.forEach(card => {
        card.addEventListener('click', async (e) => {
            const url = e.currentTarget.getAttribute('data-url');
            const pokemonData = await axios.get(url);
            showPokemonModal(pokemonData.data);
        });
    });
}

function showPokemonModal(pokemon) {
    document.getElementById('pokemonModalLabel').textContent = pokemon.name;
    document.getElementById('pokemonImage').src = pokemon.sprites.front_default;
    document.getElementById('pokemonName').textContent = pokemon.name;
    document.getElementById('pokemonType').textContent = 'Type: ' + pokemon.types.map(typeInfo => typeInfo.type.name).join(', ');
    document.getElementById('pokemonAbilities').textContent = 'Abilities: ' + pokemon.abilities.map(abilityInfo => abilityInfo.ability.name).join(', ');
    document.getElementById('pokemonStats').innerHTML = 'Stats: <br>' + pokemon.stats.map(statInfo => `${statInfo.stat.name}: ${statInfo.base_stat}`).join('<br>');
    $('#pokemonModal').modal('show');
}

function updatePagination(totalCount) {
    totalPages = Math.ceil(totalCount / pageSize);
    const paginationContainer = document.querySelector('.pagination');
    paginationContainer.innerHTML = '';

    const prevPageItem = document.createElement('li');
    prevPageItem.className = 'page-item';
    prevPageItem.innerHTML = `<a class="page-link" href="#" id="prev-page">Previous</a>`;
    paginationContainer.appendChild(prevPageItem);

    for (let i = 1; i <= 21; i++) {
        const pageItem = document.createElement('li');
        pageItem.className = `page-item ${i === currentPage ? 'active' : ''}`;
        pageItem.innerHTML = `<a class="page-link" href="#">${i}</a>`;
        pageItem.addEventListener('click', (e) => {
            e.preventDefault();
            currentPage = i;
            fetchPokemon();
        });
        paginationContainer.appendChild(pageItem);
    }

    const nextPageItem = document.createElement('li');
    nextPageItem.className = 'page-item';
    nextPageItem.innerHTML = `<a class="page-link" href="#" id="next-page">Next</a>`;
    paginationContainer.appendChild(nextPageItem);

    document.getElementById('prev-page').addEventListener('click', (e) => {
        e.preventDefault();
        if (currentPage > 1) {
            currentPage--;
            fetchPokemon();
        }
    });

    document.getElementById('next-page').addEventListener('click', (e) => {
        e.preventDefault();
        if (currentPage < totalPages) {
            currentPage++;
            fetchPokemon();
        }
    });
}

function updateCurrentPageDisplay() {
    const currentPageDisplay = document.getElementById('current-page-display');
    currentPageDisplay.textContent = `Page: ${currentPage}`;
}