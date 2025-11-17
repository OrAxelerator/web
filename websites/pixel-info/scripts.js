// ----------------------------
//  IMPORTS FIREBASE
// ----------------------------
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";
import { getFirestore, doc, getDoc, collection, getDocs } 
  from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";

// ----------------------------
//  CONFIG FIREBASE
// ----------------------------
const firebaseConfig = {
  apiKey: "AIzaSyCpnMpb-gO9rv6nBT7LBgFPAdotr7FzcgQ",
  authDomain: "test1-5cbb5.firebaseapp.com",
  projectId: "test1-5cbb5",
  storageBucket: "test1-5cbb5.firebasestorage.app",
  messagingSenderId: "236888359569",
  appId: "1:236888359569:web:8d7a6d5583a003f5e0b530",
  measurementId: "G-983BZLBC2E"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ----------------------------
//  UTILS
// ----------------------------

function show404() {
  // Cacher les autres sections
  document.getElementById("home").style.display = "none";
  document.getElementById("article").style.display = "none";
  
  // Afficher la 404
  document.getElementById("page-404").style.display = "block";
  
  // Bouton retour à l'accueil
  document.getElementById("go-home").addEventListener("click", () => {
    window.location.href = "./"; // => home
  });
}


// Pour recherche pas besoin de tags ou icone juste titre avec id de i dans la boucle 
let articleChargePourRecherche = false;

// Charge tous les titres (concurrent)
async function loadAllTitles() {
  const nbArticles = await getArticleCount();
  const promises = [];
  for (let i = 0; i < nbArticles; i++) {
    promises.push(getTitre(String(i)));
  }
  const titles = await Promise.all(promises);
  articleChargePourRecherche = true;
  return titles; // tableau d'index correspondant aux ids 0..nbArticles-1
}

function similarity(a, b) {
  return [...a.toLowerCase()].filter(c => b.toLowerCase().includes(c)).length;
}

function findClosestList(q, list, n = 5) {
  return list
    .map(item => ({ item, score: similarity(q, item) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, n)
    .map(x => x.item);
}

async function search(texte) {   // Fonction de recherche simple
  const query = (texte || "").trim();
  
  // Si on est sur un article, revenir à la home
  const articleId = getArticleId();
  if (articleId) {
    // transmettre la recherche dans l'URL
    window.location.href = "/?search=" + encodeURIComponent(query);
    return; // STOP ici !
  }

  
  const homeList = document.getElementById("home-list");
  const titreHome = document.querySelector("#home h1");

  if (!homeList || !titreHome) return;

  titreHome.textContent = `Résultats pour : "${query}"`;
  console.log("Recherche lancée pour :", query);

  // Si chaîne vide => restaurer la home (depuis cache si possible)
  if (!query) {
    const cached = sessionStorage.getItem("homeCache");
    if (cached && cached.trim() !== "") {
      homeList.innerHTML = cached;
      return;
    }
    // pas de cache : recharger la page simple
    window.location.reload();
    return;
  }

  const nbArticles = await getArticleCount();
  console.log("Nb articles =", nbArticles);

  // Charger tous les titres si pas déjà fait
  const allTitles = await loadAllTitles(); // tableau d'index = id
  console.log("Titres chargés:", allTitles);

  // Construire liste d'items {id, title}
  const items = allTitles.map((t, i) => ({ id: String(i), title: t || "" }));

  // Chercher correspondances exactes (sous-chaîne, insensible casse)
  let matches = items.filter(it => it.title.toLowerCase().includes(query.toLowerCase()));

  // Si aucune correspondance, utiliser similarité pour proposer les plus proches
  if (matches.length === 0) {
    const topTitles = findClosestList(query, allTitles, 5);
    matches = items.filter(it => topTitles.includes(it.title)).slice(0, 5);
  } else {
    matches = matches.slice(0, 5); // limiter à 5 résultats
  }


  homeList.innerHTML = ""; // vider
  
  if (matches.length === 0) {
    homeList.innerHTML = `<p>Aucun résultat pour "${query}".</p>`;
    return;
  }


  for (const m of matches) {
    const [icone, auteur] = await Promise.all([getIcone(m.id), getAuteur(m.id)]);
    addArticle(m.title, icone, auteur, m.id);
  }

  // Ne pas écraser le cache homeCache automatiquement (recherche temporaire)
  console.log("Recherche affichée, résultats:", matches.map(m => m.id));
}


function initSearch() {
    const searchIcon = document.querySelector(".search-icon");
    const searchInput = document.getElementById("recherche");
    const searchContainer = document.querySelector(".search");
    
    // Click sur l'icône pour basculer l'affichage et focus
    searchIcon.addEventListener("click", () => {
      console.log("LOUPE CLIQUÉ");
      searchContainer.classList.toggle("show");
      if (searchContainer.classList.contains("show")) {
        searchInput.focus();
      }
    });

    // Détecte la touche Entrée
    searchInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
         

        search(searchInput.value);
      }
    });
}


function openArticle(id) {
  if (!id) return;
  window.location.href = "?articleId=" + id;
}
//openArticle()


// Récupération de l'ID de l'article depuis l'URL
function getArticleId() {
  const params = new URLSearchParams(window.location.search);
  return params.get("articleId"); // retourne null si rien
}

// ----------------------------
//  FONCTIONS FIRESTORE
// ----------------------------

// Récupérer un document article par ID et s'occupe de 404
async function getArticleDoc(articleId) {
  const docRef = doc(db, "articles", articleId);
  const snap = await getDoc(docRef);
  if (!snap.exists()) throw new Error("Article introuvable !") ,show404();
  return snap.data();
}

// Récupérer le titre
async function getTitre(articleId) {
  const data = await getArticleDoc(articleId);
  return data.titre || "(pas de titre)";
}

// Récupérer l'auteur
async function getAuteur(articleId) {
  const data = await getArticleDoc(articleId);
  return data.auteur || "(anonyme)";
}

// Récupérer les tags
async function getTags(articleId) {
  const data = await getArticleDoc(articleId);
  return data.tags || [];
}

// Récupérer l'icône
async function getIcone(articleId) {
  const data = await getArticleDoc(articleId);
  return data.icone || null;
}

// Récupérer le markdown
async function getMarkdown(articleId) {
  const data = await getArticleDoc(articleId);
  if (!data.url_md) return null;
  const res = await fetch(data.url_md);
  return await res.text();
}

// Récupérer le nombre total d'articles
async function getArticleCount() {
  const snap = await getDocs(collection(db, "articles"));
  return snap.size;
}



// ----------------------------
//  AFFICHAGE
// ----------------------------


// Affiche preview article sur home page
function addArticle(titre, icone, auteur, id) {
  
  const homeList = document.getElementById("home-list");
  if (!homeList) return;


  // Création de la div principale de l'article
  const container = document.createElement("a");
  container.classList.add("article-card"); // classe pour ton CSS

  container.href = "?articleId="+id;
  container.innerHTML = `
  

    <img src="${icone}" 
         alt="Icône article" class="article-icon">
    <div class="article-info">
      <h3 class="article-title">${titre}</h3>
      <p class="article-meta">
        par <span class="article-author">${auteur}</span>
      </p>
    </div>
  
  `;

  // Ajout dans la home page
  homeList.appendChild(container);

  
  console.log(homeList)
}


// Charge un article complet dans la page de l'article
async function loadArticle(articleId) {
  try {
    const data = await getArticleDoc(articleId);

    document.getElementById("titre").textContent = data.titre || "(pas de titre)";
    document.getElementById("auteur").textContent = data.auteur || "(anonyme)";
    document.getElementById("tags").textContent = (data.tags || []).join(", ");
    if (data.icone) document.getElementById("icone").src = data.icone;

    if (data.url_md) {
      const md = await getMarkdown(articleId);
      document.getElementById("md-box").innerHTML = marked.parse(md);
    } else {
      document.getElementById("md-box").textContent = "Aucun fichier Markdown associé.";
    }

  } catch (err) {
    document.getElementById("md-box").textContent = "Erreur : " + err.message;
    console.error(err);
  }
}

// ------------------------------
// OPTION RECHERCHE D'ARTICLE
// ------------------------------



// ----------------------------
//  LOGIQUE PAGE + VAR
// ----------------------------

window.addEventListener("DOMContentLoaded", async () => {
  // VAR :
  let homeCache = null;
  const articleId = getArticleId();
  const count = await getArticleCount(); // nombre d'article
  const homeList = document.getElementById("home-list");

  const searchIcon = document.querySelector(".search-icon");
  const searchInput = document.getElementById("recherche");
  const BtnLoupe = document.getElementById("BtnLoupe");


  console.log("dom chargé");
  console.log("articleId : "+articleId);
  
  initSearch(); // eviter probleme SPA (reset les listeners a chaque nouvelle page)


  // Vérifier si l'URL contient ?search=...
  const params = new URLSearchParams(window.location.search);
  const autoSearchQuery = params.get("search");

  if (autoSearchQuery) {
    // Efface le cache pour ne pas réafficher les anciens articles
    sessionStorage.removeItem("homeCache");

    // Afficher la home
    document.getElementById("home").style.display = "block";
    document.getElementById("article").style.display = "none";

    // Mettre la valeur dans la barre de recherche
    document.getElementById("recherche").value = autoSearchQuery;

    // Lancer la recherche automatiquement
    search(autoSearchQuery);

    return; // Très important !
  }



  if (!articleId) { // => HOMEPAGE
    console.log("HOME PAGE");
    document.getElementById("home").style.display = "block";
    document.getElementById("article").style.display = "none";

    // Vérifier le cache
    let homeCache = sessionStorage.getItem("homeCache");

    if (homeCache && homeCache.trim() !== "") { //prend cache et affiche article
      console.log("CHARGÉ DEPUIS LE CACHE");
      homeList.innerHTML = homeCache;
      return;
    }

    console.log("PAS DANS CACHE — CHARGEMENT FIREBASE");


    for (let i = 0; i < count; i++) { // Charge tout les article de la home page (TOUS) faire fonction ?
      let id = String(i);
      let titre = await getTitre(id);
      let icone = await getIcone(id);
      let auteur = await getAuteur(id);
      addArticle(titre, icone, auteur, id);
    }

    // Enregistrer le résultat dans le cache
    sessionStorage.setItem("homeCache", homeList.innerHTML);

    console.log("Cache mis à jour");
  }else {
    // Page article
    document.getElementById("home").style.display = "none";
    document.getElementById("article").style.display = "block";
    loadArticle(articleId);
  }

  // CODE POUR HEADER

  


//je veux que quand je tappe apple sa trouve tout les articles avec le mot "apple" dans le titre commentt faire,, regarder tout les truc un par un parmi les 5 premier résultat trouvé
});
