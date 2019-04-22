window.addEventListener("load", async () => {
    let images = await loadImages();
    console.log(images);
	let canvas = document.getElementById("gameCanvas");
	canvas.width = 320;
	canvas.height = 240;
    let ctx = canvas.getContext("2d");
    drawBackground(ctx, images);
    let level = new Level();
    drawLevel(ctx, images, level);
});

async function loadImages() {
    return {
        block : await loadImageToCanvas("block"),
        bomb : await loadBomb(),
        box : await loadImageToCanvas("box"),
        char : await loadCharacter(),
        expl : await loadExplosions(),
        ground : await loadImageToCanvas("ground"),
        walls : await loadWalls()
    };
}

// dessine le contenu du niveau
function drawLevel(ctx, images, level){
    let blockSize = images["ground"].width; // Taille d'une case
    for(let y = 0; y < 13; y++){
        for(let x = 0; x < 19; x++){
            let posX = blockSize * (x + 0.5);
            let posY = blockSize * (y + 1);
            switch (level.map[y][x]){
                case 1:
                    ctx.drawImage(images["box"], posX, posY, blockSize, blockSize);
                    break;
                case 2:
                ctx.drawImage(images["block"], posX, posY, blockSize, blockSize);
                    break;
            }
        }
    }
}

//dessine le sol et les murs
function drawBackground(ctx, images){
    let walls = images["walls"];
    let width = ctx.canvas.width; // Largeur du canvas
    let height = ctx.canvas.height; // Hauteur du canvas
    let blockSize = images["ground"].width; // Taille d'une case

    ctx.fillStyle = ctx.createPattern(images["ground"], "repeat");
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = walls.pattern(ctx, "topDown", 0, "repeat");
    ctx.fillRect(0, 0, width, blockSize);
    ctx.fillStyle = walls.pattern(ctx, "left", 0, "repeat");
    ctx.fillRect(0, 0, blockSize, height);
    ctx.fillStyle = walls.pattern(ctx, "right", 0, "repeat");
    ctx.fillRect(width - blockSize, 0, blockSize, height);
    ctx.fillStyle = walls.pattern(ctx, "topDown", 0, "repeat");
    ctx.fillRect(0, height - blockSize, width, blockSize);
    walls.draw(ctx, 0, 0, "cornerLeft", 0);
    walls.draw(ctx, width - blockSize, 0, "cornerRight", 0);
}