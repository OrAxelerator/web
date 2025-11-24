//direct sauv json pays pour pouvoir jouer en hors co + PWA
const progressBarElement = document.getElementById("progressBar");
const playBtn = document.getElementById("play");
const areneElement = document.getElementById("arene");

const levelText = ["Noob", "Medium", "avanced", "skill", "hacker", "god"];
const levelImg = ["compass1.png", "compass2.png", "compass3.png"];
let points = Number(localStorage.getItem("points")) || 0;
//localStorage.setItem("points", 5) // TEST
let level = Math.floor(points / 50) + 1;

console.log("points : ",points);
console.log("level : ",level);

let game = "random";
playBtn.addEventListener("click", function() {
    
    console.log("lancement d'une partie", game);
    window.location.href = `./jeu.html?gametype=${game}`;
})





function updateLevelElement (level){
    console.log("level : ", level)
    const text = document.createElement("p");
    const img = document.createElement("img");
    
    text.textContent = "points : "+ points + " | " + levelText[level - 1];
    img.src = "./assets/" + levelImg[level-1]; //TODO levelImg

    text.id = "textLevel";

    areneElement.appendChild(text);
    areneElement.appendChild(img);
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