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
    player = new Character(level.playerSpawn, images["block"].width);
    drawLevel(ctx, images, level, player);
    //TEST: revele la sortie et fait tourner le personnage après 5 secondes
    window.setTimeout(() => {
        level.map[10][16].destroyed = true;
        player.turn(directions.EAST);
        drawLevel(ctx, images, level, player);
        console.log(level.map);
    }, 5000);
    //TEST: deplace le personnage après 6 secondes
    window.setTimeout(() => {
        player.move();
        drawLevel(ctx, images, level, player);
        console.log(level.map);
    }, 6000);
    //TEST: met a jour le personnage a intervalles reguliers
    window.setInterval(function(){
        player.update();
        drawLevel(ctx, images, level, player);
    }, 1000/60);
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
function drawLevel(ctx, images, level, character){
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    drawBackground(ctx, images);
    drawCharacter(ctx, images, character);
    let blockSize = images["block"].width; // Taille d'une case
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
    let blockSize = images["block"].width; // Taille d'une case

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

//dessine le personnage
function drawCharacter(ctx, images, character){
    let blockSize = images["block"].width; // Taille d'une case
    let step = 0;
    if(character.mov > 0){
        step = Math.floor(character.mov * 4 / blockSize);
        console.log(step);
    }
    switch(character.direction){
        case directions.NORTH:
            posX = blockSize * (character.coords[0] + 1);
            posY = blockSize * (character.coords[1] + 1) - character.mov;
            images["char"].draw(ctx, posX, posY, "north", step);
            break;
        case directions.EAST:
            posX = blockSize * (character.coords[0] + 1) + character.mov;
            posY = blockSize * (character.coords[1] + 1);
            images["char"].draw(ctx, posX, posY, "east", 3 - step);
            break;
        case directions.SOUTH:
            posX = blockSize * (character.coords[0] + 1);
            posY = blockSize * (character.coords[1] + 1) + character.mov;
            images["char"].draw(ctx, posX, posY, "south", step);
            break;
        case directions.WEST:
            posX = blockSize * (character.coords[0] + 1) - character.mov;
            posY = blockSize * (character.coords[1] + 1);
            images["char"].draw(ctx, posX, posY, "west", step);
            break;
    }
}