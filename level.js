class Level{
	//constructeur exemple, a generer depuis un fichier passé en paramètre
	constructor(){
		//tableau de cases d'une taille de 19x13
		/*this.map = [[0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
					[0, 2, 0, 2, 0, 2, 0, 2, 0, 2, 0, 2, 0, 2, 0, 2, 0, 2, 0],
					[0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
					[1, 2, 1, 2, 0, 2, 0, 2, 0, 2, 0, 2, 0, 2, 0, 2, 0, 2, 0],
					[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
					[0, 2, 0, 2, 0, 2, 0, 2, 0, 2, 0, 2, 0, 2, 0, 2, 0, 2, 0],
					[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
					[0, 2, 0, 2, 0, 2, 0, 2, 0, 2, 0, 2, 0, 2, 0, 2, 0, 2, 0],
					[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0],
					[0, 2, 0, 2, 0, 2, 0, 2, 0, 2, 0, 2, 0, 2, 0, 2, 1, 2, 0],
					[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1],
					[0, 2, 0, 2, 0, 2, 0, 2, 0, 2, 0, 2, 0, 2, 0, 2, 1, 2, 0],
					[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0]];
		*/
		//coordonnées du spawn (en haut à gauche par défaut)
		this.playerSpawn = [0, 0];
		this.width = 19;
		this.height = 13;
		this.map = [];
		for (let i = 0; i < this.height; i++) { // Imitialisation par défaut du niveau (Que de l'herbe)
			let line = [];
			for (let j = 0; j < this.width; j++) {
				line.push(new Case(caseTypes.GROUND));
			}
			this.map.push(line);
		}
		console.log(this.map);
		console.log(JSON.parse(JSON.stringify(lvl)));
	}

	init(lvlName)
	{
		//Requete HTTP avec le nom du niveau (A faire plus tard)
		if(!Level.checkLevel(lvl))
		{
			console.log("NIVEAU INVALIDE");
			return;
		}
		for (const coord of lvl.Boxes) 
		{
			this.putOnMap(coord, caseTypes.BOX)
		}
		for (const coord of lvl.Blocks) 
		{
			this.putOnMap(coord, caseTypes.BLOCK);
		}
		this.putOnMap(lvl.Exit, caseTypes.EXIT);
		this.putOnMap(lvl.PlayerSpawn, caseTypes.PLAYERSPAWN);
		this.playerSpawn = lvl.PlayerSpawn;
	}

	putOnMap(coords, typeCase)
	{
		if(coords[0] < this.width && coords[1] < this.height && coords[0] >= 0 && coords[1] >= 0)
		{
			this.map[coords[1]][coords[0]].type = typeCase;
		}
		else
		{
			console.log(coords);
		}
	}

	static checkLevel(level)
	{
		if(level.Boxes === undefined)
		{
			console.log("Boites");
			return false;
		}
		if(level.Blocks === undefined)
		{
			console.log("Blocs");
			return false;
		}
		if(level.Exit === undefined || level.Exit.length !== 2) // La sortie a 2 coordonnées
		{
			console.log("Exit");
			return false;
		}
		if(level.PlayerSpawn === undefined || level.PlayerSpawn.length !== 2) // Le spawn du joueur a 2 coordonnées
		{
			console.log("Spawn");
			return false;
		}
		return true;

	}
};

class Case
{
	constructor(typeCase)
	{
		this.type = typeCase;
		this.destroyed = false;
	}
}

let caseTypes = {
	GROUND : 0,
	BOX : 1,
	BLOCK : 2,
	EXIT : 3,
	PLAYERSPAWN : 4
};

console.log(JSON.stringify(caseTypes));