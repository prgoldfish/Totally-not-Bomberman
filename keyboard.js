class KeyManager
{
    constructor()
    {
        this.keyMap = {};
    }

    keyDown(name)
    {
        this.keyMap[name] = true;
    }

    keyUp(name)
    {
        this.keyMap[name] = false;
    }

    isKeyDown(name)
    {
        if(this.keyMap[name] !== undefined)
        {
            return this.keyMap[name];
        }
        return false;
    }
}