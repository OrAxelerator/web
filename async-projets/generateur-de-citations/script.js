let citationsData; // variable globale
async function main() {
  const res = await fetch('./citations.json');  // attend le fetch
  citationsData = await res.json();// attend le JSON
  console.log("donnéchargé dans main");
}

(async () => { //DÉBUT
  await main(); //bloque
  //tout le code est dans fonction main
  console.log("DATA:", citationsData);

  const btnCitation = document.getElementById("buttonCitation");
  const citationElement = document.getElementById("citation");
  const auteurElement = document.getElementById("auteur");
  const auteurImg = document.getElementById("auteurImg");

  auteurImg.style.display = "none";



  function displayImg(auteur) {
    console.log(auteur+".jpg");
    auteurImg.src = "image/"+auteur+".jpg" // changer le src de img pour afficher img

  } //je gere

  function getCitationAleatoire(json){
      let nbCitation = json.citations.length;
      //console.log(nbCitation);
      let indexAleatoire = Math.floor(Math.random() * nbCitation);

      //console.log(json.citations[indexAleatoire]);
      let citation = json.citations[indexAleatoire];

      return citation;
  };


  function appliquerPoliceAleatoire(citation){ //citation la ...

  }

  function afficherCitationAleatoire(citation){

      const colors = ["rgb(255, 223, 0)", "rgba(230, 16, 16, 1)"," rgb(255, 105, 180)", "rgb(5, 243, 17)", "rgba(8, 30, 231, 1)"];

     // console.log(citation);
      
      document.querySelectorAll("span").forEach(element => element.remove()); // Afficher nouvelle citation

      let mots = citation.citation.split(" ");
      mots.forEach(element => {
          let span = document.createElement("span");
          span.textContent = element + " ";
          span.style.color =  colors[Math.floor(Math.random() * 5 )]
          citationElement.appendChild(span);
      });
      auteurElement.textContent = citation.auteur;
  };


  btnCitation.addEventListener("click", function() {
      auteurImg.style.display = "";

      let citationAleatoire;
      do {
          citationAleatoire = getCitationAleatoire(citationsData);
      } while (citationAleatoire.auteur === auteurElement.textContent && citationsData.length > 1);

      afficherCitationAleatoire(citationAleatoire);
      displayImg(citationAleatoire.auteur);
  });


})();