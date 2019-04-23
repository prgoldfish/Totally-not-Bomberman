window.addEventListener("load", async () => {
    let images = await loadImages();
    console.log(images);
	let canvas = document.getElementById("gameCanvas");
	canvas.width = 336;
	canvas.height = 240;
    let ctx = canvas.getContext("2d");
    //drawBackground(ctx, images);
    let level = new Level();
    level.init(lvl);
    drawLevel(ctx, images, level);
    window.setTimeout(() => {
        level.map[10][16].destroyed = true;
        drawLevel(ctx, images, level);
    }, 10000);
});

async function loadImages() {
    return {
        block : await loadImageToCanvas("block"),
        bomb : await loadBomb(),
        box : await loadImageToCanvas("box"),
        char : await loadCharacter(),
        expl : await loadExplosions(),
        ground : await loadImageToCanvas("ground"),
        stairs : await loadImageToCanvas("stairs"),
        walls : await loadWalls()
    };
}

// dessine le contenu du niveau
function drawLevel(ctx, images, level){
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    drawBackground(ctx, images);
    let blockSize = images["ground"].width; // Taille d'une case
    console.log(level.map);
    for(let y = 0; y < level.height; y++){
        for(let x = 0; x < level.width; x++){
            let posX = blockSize * (x + 1);
            let posY = blockSize * (y + 1);
            let lvlCase = level.map[y][x];
            switch (lvlCase.type){
                case caseTypes.BOX:
                    if(!lvlCase.destroyed)
                    {
                        ctx.drawImage(images["box"], posX, posY, blockSize, blockSize);
                    }
                   break;
                case caseTypes.BLOCK:
                    ctx.drawImage(images["block"], posX, posY, blockSize, blockSize);
                    break;
                case caseTypes.EXIT:
                    if(!lvlCase.destroyed)
                    {
                        ctx.drawImage(images["box"], posX, posY, blockSize, blockSize);
                    }
                    else
                    {
                        ctx.drawImage(images["stairs"], posX, posY, blockSize, blockSize);
                    }
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