window.addEventListener("load", () => {
    let images = loadImages();
});

function loadImages() {
    let images = {};
    let imageNames = ["wallTopDown", 
        "wallLeft",
        "wallRight",
        "wallCornerLeft",
        "wallCornerRight"
    ];
    for (const name of imageNames) { //Essayer de voir l'utilisation de promesses pour attendre le chargement de l'image
        images[name] = new Image();
        images[name].src = "images/" + name  + ".png";
    }

    return images;
}