class KeyManager //Gestionnaire d'entrées clavier
{
    constructor()
    {
        this.keyMap = {}; //keyMap est un objet associant une touche au fait de si elle est pressée ou non
    }

    keyDown(name) // Quand une touche est préssée
    {
        this.keyMap[name] = true;
    }

    keyUp(name) // Quand une touche est relachée
    {
        this.keyMap[name] = false;
    }

    isKeyDown(name) //Permet de savoir si une touche est appuyée
    {
        if(this.keyMap[name] !== undefined)
        {
            return this.keyMap[name];
        }
        return false;
    }
}