const namesResponse = await fetch("./names.json");
if (!namesResponse.ok) {
    throw new Error(`Failed to load names.json: ${namesResponse.status} ${namesResponse.statusText}`);
}
const names = await namesResponse.json();

const species = {
    // Common species
    human: { title: "Human", chance_percentage: 11.2 },
    dwarf: { title: "Dwarf", chance_percentage: 11.2 },
    gnome: { title: "Gnome", chance_percentage: 11.2 },
    halfling: { title: "Halfling", chance_percentage: 11.2 },
    half_elf: { title: "Half-Elf", chance_percentage: 11.2 },
    // Uncommon species
    elf: { title: "Elf", chance_percentage: 6 },
    tiefling: { title: "Tiefling", chance_percentage: 6 },
    goliath: { title: "Goliath", chance_percentage: 6 },
    dragonborn: { title: "Dragonborn", chance_percentage: 6 },
    half_orc: { title: "Half-Orc", chance_percentage: 6 },
    // Rare species
    orc: { title: "Orc", chance_percentage: 3 },
    aarakocra: { title: "Aarakocra", chance_percentage: 3 },
    // Very rare species
    goblin: { title: "Goblin", chance_percentage: 2 },
    bugbear: { title: "Bugbear", chance_percentage: 2 },
    hobgoblin: { title: "Hobgoblin", chance_percentage: 2 },
    changeling: { title: "Changeling", chance_percentage: 2 },
};

const speciesButtons = document.querySelector("#species-buttons");
const randomButton = document.querySelector("#generate-random");
const allButton = document.querySelector("#generate-all");
const resultsSection = document.querySelector(".results-section");
const results = document.querySelector("#results");
const statusMessage = document.querySelector("#status-message");

const choose = (items) => items[Math.floor(Math.random() * items.length)];

const getSelectedGender = () => document.querySelector('input[name="gender"]:checked').value;

const generateNpc = (speciesKey, gender) => {
    const pool = names[speciesKey];
    if (!pool?.[gender]?.length || !pool.lastnames?.length) {
        throw new Error(`No ${gender} names are available for ${species[speciesKey].title}.`);
    }

    return {
        firstName: choose(pool[gender]),
        lastName: choose(pool.lastnames),
        species: species[speciesKey].title,
        gender: gender === "male" ? "Male" : "Female",
    };
};

const pickRandomSpeciesKey = () => {
    const roll = Math.random() * 100;
    let cumulativeChance = 0;
    const keys = Object.keys(species);
    return keys.find((key) => {
        cumulativeChance += species[key].chance_percentage;
        return roll < cumulativeChance;
    }) ?? keys[0];
};

const createNpcCard = (npc, featured) => {
    const card = document.createElement("article");
    card.className = featured ? "npc-card featured-card" : "npc-card";

    const name = document.createElement("h3");
    name.textContent = `${npc.firstName} ${npc.lastName}`;

    const details = document.createElement("p");
    details.textContent = `${npc.gender} ${npc.species}`;

    card.append(name, details);
    return card;
};

const showNpcs = (npcs) => {
    const featured = npcs.length === 1;
    results.classList.toggle("results-grid", !featured);
    results.replaceChildren(...npcs.map((npc) => createNpcCard(npc, featured)));
    resultsSection.hidden = false;
};

const run = (generate) => {
    try {
        statusMessage.hidden = true;
        showNpcs(generate(getSelectedGender()));
    } catch (error) {
        statusMessage.textContent = error.message;
        statusMessage.hidden = false;
    }
};

for (const [key, { title, chance_percentage }] of Object.entries(species)) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "species-button";
    button.dataset.species = key;

    const label = document.createElement("span");
    label.textContent = title;
    const chance = document.createElement("small");
    chance.textContent = `${chance_percentage}%`;

    button.append(label, chance);
    speciesButtons.append(button);
}

speciesButtons.addEventListener("click", (event) => {
    const button = event.target.closest(".species-button");
    if (button) {
        run((gender) => [generateNpc(button.dataset.species, gender)]);
    }
});

randomButton.addEventListener("click", () => {
    run((gender) => [generateNpc(pickRandomSpeciesKey(), gender)]);
});

allButton.addEventListener("click", () => {
    run((gender) => Object.keys(species).map((key) => generateNpc(key, gender)));
});
