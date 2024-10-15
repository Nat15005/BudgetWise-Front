export default class PocketView {
    constructor() {
        this.pocketSection = document.querySelector('.pockets-section');
    }

    renderPocket(pocket) {
        const pocketDiv = document.createElement('div');
        pocketDiv.className = 'pocket';
        pocketDiv.style.backgroundColor = pocket.color;
        
        const pocketName = document.createElement('span');
        pocketName.textContent = pocket.name;

        const pocketValue = document.createElement('span');
        pocketValue.textContent = `$${new Intl.NumberFormat().format(pocket.value)}`;

        pocketDiv.appendChild(pocketName);
        pocketDiv.appendChild(pocketValue);

        this.pocketSection.insertBefore(pocketDiv, this.pocketSection.querySelector('.add-pocket-btn'));
    }
}
