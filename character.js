class Character{
	constructor(spawnCoords, size){
		// coordonnees entieres sur la grille, initialisées au spawn
		this.coords = spawnCoords;
		// permet d'orienter le sprite, initialisé vers le sud (vu de face)
		this.direction = directions.SOUTH;
		// indique la progression du mouvement en pixels entre deux cases, 0 si le personnage n'est pas en mouvement
		this.mov = 0;
		// stocke la taille
		this.size = size;
	}

	//tourne dans une direction, ne fonctionne pas si animation en cours
	turn(direction){
		if(this.mov == 0){
			this.direction = direction;
			return true;
		}
		return false;
	}

	//commence à avancer
	move(){
		if(this.mov == 0){
			this.mov = 1;
			return true;
		}
		return false;
	}

	//appeler a chaque frame, gère les animations et les déplacements
	update(){
		if(this.mov > 0){
			this.mov++;
			if(this.mov >= this.size){
				this.mov = 0;
				switch(this.direction){
					case directions.NORTH:
						this.coords[1] -=1;
						break;
					case directions.EAST:
						this.coords[0] +=1;
						break;
					case directions.SOUTH:
						this.coords[1] +=1;
						break;
					case directions.WEST:
						this.coords[0] -=1;
						break;
				}
			}
		}
	}
}

let directions = {
	NORTH : 0,
	EAST : 1,
	SOUTH : 2,
	WEST : 3
};