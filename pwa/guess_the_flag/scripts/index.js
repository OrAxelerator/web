const progressBarElement = document.getElementById("progressBar");
const playBtn = document.getElementById("play");
const areneElement = document.getElementById("arene");
const iconeContainer = document.getElementById("iconeContainer");

let points = Number(localStorage.getItem("points")) || 0;
const param = document.getElementById("param");
let level = Math.floor(points / 50) + 1;

console.log("points : ",points);
console.log("level : ",level);

let game = "random";
playBtn.addEventListener("click", function() {
    
    console.log("lancement d'une partie", game);
    window.location.href = `./jeu.html?gametype=${game}`;
})


function isPWA() {
    return window.matchMedia('(display-mode: standalone)').matches
        || window.navigator.standalone === true;
}

function showPopup(title, message) {
    if (!localStorage.getItem("popup_show")) {
        const popup = document.getElementById("popup");
        document.getElementById("popup-title").textContent = title;
        document.getElementById("popup-message").textContent = message;

        popup.style.display = "flex"; 
    }
}

document.getElementById("popup-close").onclick = () => {
    document.getElementById("popup").style.display = "none";
    localStorage.setItem("popup_show", "yes");
};

if (isPWA()) {
    console.log("Tu es dans l'app PWA");
} else {
    console.log("Tu es dans le navigateur");
    showPopup(
        "Le saviez-vous ?",
        "Dans Partager > Plus > Ajouter à l'écran d'accueil, vous pouvez installer l'app."
    );
}



function updateLevelElement (){
    
    const text = document.createElement("p");
    const img = document.createElement("img");
    
    text.textContent = "Score : "+ points;

    img.id = "profil_picture";
    text.id = "textLevel";

    areneElement.appendChild(text);
    iconeContainer.appendChild(img);
}



function updateProgressBar(n) {
    const pointsNeeded = 50;
    const currentLevelXP = n % pointsNeeded;
    const percentage = Math.floor((currentLevelXP / pointsNeeded) * 100);
    
    progressBarElement.value = percentage;
    
}

function updatePointsElements(n) {
    updateProgressBar(n);
    updateLevelElement(Math.floor((n/50) +1));
}


updatePointsElements(points);