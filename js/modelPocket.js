export default class Pocket {
    constructor(name, value, color) {
        this.name = name;
        this.value = value;
        this.color = color;
    }
}

export class PocketModel {
    constructor() {
        this.pockets = [];
    }

    addPocket(pocket) {
        this.pockets.push(pocket);
    }

    getPockets() {
        return this.pockets;
    }
}
