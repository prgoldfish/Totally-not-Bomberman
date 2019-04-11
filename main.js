window.addEventListener("load", async () => {
    let images = await loadImages();
    console.log(images);
});

async function loadImages() {
    let images = {};
    let imageNames = ["wallTopDown", 
        "wallLeft",
        "wallRight",
        "wallCornerLeft",
        "wallCornerRight"
    ];
    for (const name of imageNames) { //Essayer de voir l'utilisation de promesses pour attendre le chargement de l'image
        images[name] = await loadImage(name);
    }

    return images;
}

function loadImage(imgName)
{
    return new Promise((success, fail) => {
        let img = new Image();
        img.addEventListener("load", () => {
            success(img);
        });
        img.src = "images/" + imgName  + ".png";
    });
}