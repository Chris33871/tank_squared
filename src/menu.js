export function createMainMenu() {
    // INFO: Main menu container
    const menu = document.createElement("div");
    menu.id = "main-menu";

    // INFO: Welcome text container
    const title = document.createElement("div");
    title.id = "menu-title";

    // INFO: Welcome text
    const welcomeText = document.createElement("p");
    welcomeText.innerText = "Welcome to Tank Squared!";
    title.appendChild(welcomeText);
    menu.appendChild(title);

    // INFO: Character selector screen
    const characterCardsContainer = document.createElement("div");
    characterCardsContainer.id = "character-cards-container";

    const characterTitle = document.createElement("p");
    characterTitle.id = "ctitle";
    characterTitle.innerText = "Select your team";
    menu.appendChild(characterTitle);

    const characterCard1 = document.createElement("div");
    characterCard1.id = "cCard1";
    characterCard1.classList.add("cCard1");
    

    const character1Image = document.createElement("img");
    character1Image.id = "c1img";
    character1Image.src = "https://i.pinimg.com/736x/0e/99/52/0e995213e1685b6a92adc68256a4c4e4.jpg";
    characterCard1.appendChild(character1Image);

    characterCardsContainer.appendChild(characterCard1);

    const characterCard2 = document.createElement("div");
    characterCard2.id = "cCard2";
    characterCard2.classList.add("cCard2");
    

    const character2Image = document.createElement("img");
    character2Image.id = "c2img";
    character2Image.src = "https://i.pinimg.com/736x/88/95/c1/8895c11d00eb702bde5fde7d7567c3e2.jpg";
    characterCard2.appendChild(character2Image);

    characterCardsContainer.appendChild(characterCard2);


    menu.appendChild(characterCardsContainer);

    // INFO: Start game button container
    const buttonContainer = document.createElement("div");
    buttonContainer.id = "button-container";

    // INFO: Start game button
    const startButton = document.createElement("button");
    startButton.id = "start-button";
    startButton.innerText = "Start Game";
    startButton.onclick = () => {
        document.body.removeChild(menu);
        import("./main.js").then((module) => module.startGame());
    };
    buttonContainer.appendChild(startButton);

    menu.appendChild(buttonContainer);

    document.body.appendChild(menu);

    // INFO: Team selector
    const card1 = document.querySelector("#cCard1");
    const card2 = document.querySelector("#cCard2");
    card1.addEventListener("click", () => {
        card2.classList.remove("cCard2-clicked");
        card1.classList.add("cCard1-clicked");
    });
    card2.addEventListener("click", () => {
        card1.classList.remove("cCard1-clicked");
        card2.classList.add("cCard2-clicked");
    });
}
