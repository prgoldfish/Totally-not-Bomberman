let frames = 0; // Le nombre de frames écoulées depuis la dernière seconde
let gameStatus = 0; //0=partie en cours, 1=gagné, 2=perdu

window.addEventListener("load", async () => { // Au chargement de la page
    let images = await loadImages(); // On charge les images
	let canvas = document.getElementById("gameCanvas"); // On récupère le canvas du jeu
    let ctx = canvas.getContext("2d");
    let level = new Level(images["block"].width); // On crée le niveau


    if(await loadLevel(level, 1, ctx)) // On charge le niveau 1
    { // Si le chargement réussit

        player = new Character(level.playerSpawn, images["block"].width); // On crée le personnage
        gameStatus = 0;
        let input = new KeyManager(); // On crée le gestionnaire d'entrées clavier

        // On crée les listeners pour les entrées clavier
        document.addEventListener("keydown", (e) => {
            input.keyDown(e.key);
        });
        document.addEventListener("keyup", (e) => {
            input.keyUp(e.key);
        });

        // Boucle principale du jeu
        let loop = function(time)
        {
            frames++; // On ajoute une frame
            if(gameStatus == 0){
                player.update(); // On met à jour le joueur
                characterInput(input, level, player); // On gère les entrées clavier pour le déplacement du joueur
                updateBombs(input, level, player, time); // On met à jour l'état des bombes
                if(updateExplosions(level, player, time)) // On met à jour l'état des explosions. Renvie true si le joueur est dans une explosion
                {
                    //Partie perdue
                    gameStatus = 2;
                }
                else
                {
                    let playerCase = level.map[player.coords[1]][player.coords[0]]; // On récupère le type de case où est le joueur
                    if(playerCase.type == caseTypes.EXIT && playerCase.destroyed) // Si c'est une sortie
                    {
                        //Partie gagnée
                        gameStatus = 1;
                    }
                }
            }

            drawLevel(ctx, images, level, player); // On met à jour l'affichage du jeu (niveau, joueur, bombes, etc...)

            if(gameStatus == 1) //Si on a gagné
            {
                // Affiche l'ecran de victoire
                ctx.fillStyle = "rgba(0, 255, 0, 0.5)";
                ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
                ctx.fillStyle = "gold";
                ctx.strokeStyle = "black";
                ctx.font = "32px Comic Sans MS"; // Désolé...
                ctx.textAlign = "center";
                ctx.fillText("YOU WIN", ctx.canvas.width/2, ctx.canvas.height/2);
                ctx.strokeText("YOU WIN", ctx.canvas.width/2, ctx.canvas.height/2);
            }
            if(gameStatus == 2) // Si on a perdu
            {
                // Affiche le Game Over
                ctx.fillStyle = "rgba(255, 0, 0, 0.5)";
                ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
                ctx.fillStyle = "red";
                ctx.strokeStyle = "black";
                ctx.font = "32px Comic Sans MS"; // Désolé...
                ctx.textAlign = "center";
                ctx.fillText("GAME OVER", ctx.canvas.width/2, ctx.canvas.height/2);
                ctx.strokeText("GAME OVER", ctx.canvas.width/2, ctx.canvas.height/2);
            }

            requestAnimationFrame(loop); // On attend la frame suivante
        }

        requestAnimationFrame(loop); // On lance la boucle à la prochaine frame
    }

    // Intervalle mettant à jour le compteur de FPS toutes les secondes 
    window.setInterval(() => {
        document.getElementById("fpsCounter").innerHTML = "FPS : " + frames;
        frames = 0;
    }, 1000);

    
});

async function loadImages() { // Charge toutes les images du jeu
    return {
        block : await loadImageToCanvas("block"), // Canvas représentant l'image
        bomb : await loadBomb(), // Sprite
        box : await loadBox(), // Sprite
        char : await loadCharacter(), // Sprite
        expl : await loadExplosions(), // Sprite
        ground : await loadImageToCanvas("ground"), // Canvas représentant l'image
        stairs : await loadImageToCanvas("stairs"), // Canvas représentant l'image
        walls : await loadWalls() // Sprite
    };
}

// Dessine le jeu (Fond, niveau, personnage, bombes et explosions)
function drawLevel(ctx, images, level, character)
{
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height); // On efface tout
    drawBackground(ctx, images); // On affiche le fond du jeu (Herbe + murs)
    let blockSize = images["block"].width; // Taille d'une case
    
    for(let y = 0; y < level.height; y++)
    {
        for(let x = 0; x < level.width; x++) // Pour chaque case du niveau
        {
            let posX = level.mapToCanvas(x); //Coordonnées du canvas de la case
            let posY = level.mapToCanvas(y);
            let lvlCase = level.map[y][x];
            switch (lvlCase.type)
            {
                case caseTypes.BOX: // Les cases de type BOX affichent une caisse si elle n'est pas détruite, une caisse avec un filtre rouge si la caisse se fait détruire et de l'herbe si elle est détruite 
                    if(lvlCase.exploding && !lvlCase.destroyed)
                    {
                       images["box"].draw(ctx, posX, posY, "exploding", 0);
                    }
                    else if(!lvlCase.destroyed)
                    {
                        images["box"].draw(ctx, posX, posY, "base", 0);
                    }
                    break;
                case caseTypes.BLOCK: // Les cases de type BLOCK affichent un bloc de pierre
                    ctx.drawImage(images["block"], posX, posY, blockSize, blockSize);
                    break;
                case caseTypes.EXIT: // Les cases de type EXIT affichent une caisse si elle n'est pas détruite, une caisse avec un filtre rouge si la caisse se fait détruire et la sortie si elle est détruite 
                    if(lvlCase.exploding && !lvlCase.destroyed)
                    {
                        images["box"].draw(ctx, posX, posY, "exploding", 0);
                    }
                    else if(lvlCase.destroyed)
                    {
                        ctx.drawImage(images["stairs"], posX, posY, blockSize, blockSize);
                    }
                    else
                    {
                        images["box"].draw(ctx, posX, posY, "base", 0);
                    }
                   break;
            }
        }
    }
    for (const expl of level.explosions) // Affichage des explosions
    {
        expl.draw(ctx, images["expl"], level, blockSize);     
    }
    for (const bomb of level.bombs) // Affichage des bombes
    {
        // Calcul du clignotement
        let flash = 0;
        if(bomb.timeSincePut >= 2500)
        {
            flash = Math.floor(bomb.timeSincePut / 250 + 1) % 2;
        }
        if(bomb.timeSincePut >= 4000)
        {
            flash = frames % 2;
        }
        images["bomb"].draw(ctx, blockSize * (bomb.x + 1), blockSize * (bomb.y + 1), "fuse", flash); //Dessin de la bombe
    }
    drawCharacter(ctx, images, character, level); // Dessin du personnage
}

// Dessine le sol et les murs
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

// Dessine le personnage
function drawCharacter(ctx, images, character, level)
{
    let blockSize = images["block"].width; // Taille d'une case
    let step = 0;
    if(character.mov > 0) // Si le personnage bouge
    {
        step = Math.floor(character.mov * 4 / blockSize);
    }
    let posX = level.mapToCanvas(character.coords[0]);
    let posY = level.mapToCanvas(character.coords[1]);
    switch(character.direction) // Des images différentes selon la direction
    {
        case directions.NORTH:
            posY -= character.mov;
            images["char"].draw(ctx, posX, posY, "north", step);
            break;
        case directions.EAST:
            posX += character.mov;
            images["char"].draw(ctx, posX, posY, "east", 3 - step);
            break;
        case directions.SOUTH:
            posY += character.mov;
            images["char"].draw(ctx, posX, posY, "south", step);
            break;
        case directions.WEST:
            posX -= character.mov;
            images["char"].draw(ctx, posX, posY, "west", step);
            break;
    }
}

function characterInput(input, level, player) // Gestion des entrées clavier pour le déplacement du personnage
{
    let direction = player.direction; // Direction actuelle du joueur
    let keyPressed = true;
    let blocked = true;
    if(input.isKeyDown("ArrowUp")) // Flèche du haut
    {
        direction = directions.NORTH;
        if(player.coords[1] - 1 >= 0)
        {
            let newCoords = [player.coords[0], player.coords[1] - 1];
            blocked = level.map [player.coords[1] - 1] [player.coords[0]].canBlock();
            blocked = blocked || level.isBombHere(newCoords);
        }
    }
    else if(input.isKeyDown("ArrowDown")) // Flèche du bas
    {
        direction = directions.SOUTH;
        if(player.coords[1] + 1 < level.height)
        {
            let newCoords = [player.coords[0], player.coords[1] + 1];
            blocked = level.map [player.coords[1] + 1] [player.coords[0]].canBlock();
            blocked = blocked || level.isBombHere(newCoords);
        }
    }
    else if(input.isKeyDown("ArrowLeft")) // Flèche gauche
    {
        direction = directions.WEST;
        if(player.coords[0] - 1 >= 0)
        {
            let newCoords = [player.coords[0] - 1, player.coords[1]];
            blocked = level.map[player.coords[1]][player.coords[0] - 1].canBlock();
            blocked = blocked || level.isBombHere(newCoords);
        }
    }
    else if(input.isKeyDown("ArrowRight")) // Flèche droite
    {
        direction = directions.EAST;
        if(player.coords[0] + 1 < level.width)
        {
            let newCoords = [player.coords[0] + 1, player.coords[1]];
            blocked = level.map[player.coords[1]][player.coords[0] + 1].canBlock();
            blocked = blocked || level.isBombHere(newCoords);
        }
    }
    else
    {
        keyPressed = false;
    }
    if(keyPressed) // Si une touche de direction a été appuyée 
    {
        player.turn(direction); // On tourne le personnage
        if(!blocked) player.move(); // S'il n'est pas bloqué, on le fait avancer
    }
}

// Gère les bombes
function updateBombs(input, level, player, actualTime)
{
    let timeSinceLastBomb = actualTime - player.lastBombDate; //Afin de faire un cooldown pour poser une bombe (500 ms) 
    let explDuration = 1000;
    if(input.isKeyDown(" ") && !level.isBombHere(player.coords) && timeSinceLastBomb > 500) // Si la barre espace est appuyée et que le cooldown est passé
    {
        level.bombs.push(new Bombe(actualTime, player.coords)); // On pose une bombe
        player.lastBombDate = actualTime;
    }

    let newBombArray = [];
    for (const bomb of level.bombs) { // On gère les bombes posées
        if(!bomb.explode(actualTime)) // Si le temps est écoulé
        {
            newBombArray.push(bomb); // On garde que les bombes n'ayant pas encore explosé
        }
        else
        {
            level.explosions.push(new Explosion(bomb.x, bomb.y, level, actualTime, explDuration, 2)); // Sinon, on fait une explosion
        }
    }
    level.bombs = newBombArray;
}

//Gère les explosions. Renvoie true si joueur est dedans
function updateExplosions(level, player, actualTime)
{
    let explDuration = 1000; // Durée d'une explosion
    let newExplArray = [];
    for (const expl of level.explosions) {
        if(actualTime - expl.explTime < explDuration) // Les explosions restent pour 1 seconde
        {
            newExplArray.push(expl);
            if(expl.inArea(player.coords)) // On vérifie si le joueur est dans l'explosion
            {
                console.log("Game over");
                return true;
            }
        }      
    }
    level.explosions = newExplArray;
    return false;
}

async function loadLevel(level, lvlNumber, ctx) // Chargement d'un niveau
{
    try
    {
        await level.init("" + lvlNumber); // On lance le chargement
    }
    catch(err) // Si ça échoue, le canvas se met en rouge et un message s'affiche concernant l'erreur
    {
        ctx.fillStyle = "red";
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.font = "20px Arial";
        ctx.fillStyle = "black";
        ctx.textAlign = "center";
        ctx.fillText("Erreur lors du chargement du niveau", ctx.canvas.width / 2, ctx.canvas.height / 2);
        alert("Erreur lors du chargement du niveau : " + err);
        return false;

    }
    return true;
}