document.getElementById('burger-btn').addEventListener('click', function() {
    const menu = document.getElementById('menu');
    menu.classList.toggle('hidden');
});

window.onload = ()=>{
    const playbtn = document.getElementById('play-btn');
    playbtn.addEventListener('click', function() {
        window.location.href = '/loading/loading.html';
    })
    const homebtn = document.getElementById('home-btn');
    homebtn.addEventListener('click', function() {
        window.location.href = '/home/homepage.html';
    })
    const barnbtn = document.getElementById('barn-btn');
    barnbtn.addEventListener('click', function() {
        window.location.href = '/barn/barn.html';
    })
    const shopbtn = document.getElementById('shop-btn');   
    shopbtn.addEventListener('click', function() {
        window.location.href = '/shop/shop.html';
    })
    document
      .getElementById("logout-btn")
      .addEventListener("click", function () {
        localStorage.removeItem("username");
        localStorage.removeItem("loggedin");
        localStorage.removeItem("coins");
        localStorage.removeItem("battleLineup");
        localStorage.removeItem("randomAnimals");
        localStorage.removeItem("lives");
        localStorage.removeItem("gamecoins");
        localStorage.removeItem("ownedAnimals");
        localStorage.removeItem("shopAnimals");
        localStorage.removeItem("currentItems");
        localStorage.removeItem("firstTime");
        localStorage.removeItem("teamName");
        window.location.href = "/login/index.html";
      });
}