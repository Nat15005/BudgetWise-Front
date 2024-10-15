import PocketModel from './modelPocket.js';
import PocketView  from './viewPocket.js';

document.addEventListener('DOMContentLoaded', async () => {
    const addPocketBtn = document.querySelector('.add-pocket-btn');
    const popupForm = document.getElementById('popup-pocket-form');
    const closePopup = document.getElementById('close-popup');
    const pocketForm = document.getElementById('pocket-form');
    const pocketsSection = document.querySelector('.pockets-section');
    const amountElement = document.querySelector('.btn-amount');

    let editingPocket = null;
    let pocketModel = new PocketModel();
    let pocketView = new PocketView();

    function createPocketElement(id, name, value, color) {
        const pocketDiv = document.createElement('div');
        pocketDiv.classList.add('pocket');
        pocketDiv.style.backgroundColor = color;
        pocketDiv.innerHTML = `
            <span class="pocket-id" style="display:none;">${id}</span>
            <span class="pocket-name">${name}</span>
            <span class="pocket-value">$${new Intl.NumberFormat().format(value)}</span>
            <button class="delete-pocket-btn">&times;</button>
        `;

        pocketDiv.addEventListener('click', (e) => {
            if (e.target.classList.contains('delete-pocket-btn')) {
                return;
            }
            editingPocket = pocketDiv;
            document.getElementById('pocket-id').value = id;
            document.getElementById('pocket-name').value = name;
            document.getElementById('pocket-value').value = value;
            document.getElementById('pocket-color').value = color;
            document.getElementById('submit-pocket').textContent = 'Update Pocket';
            popupForm.style.display = 'block';
        });

        pocketDiv.querySelector('.delete-pocket-btn').addEventListener('click', (e) => {
            e.stopPropagation();
        
            // Mostrar la alerta de confirmación usando SweetAlert
            Swal.fire({
                title: 'Are you sure?',
                text: 'Do you want to delete this pocket?',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Yes, delete it!',
                cancelButtonText: 'Cancel'
            }).then((result) => {
                if (result.isConfirmed) {
                    const pocketName = pocketDiv.querySelector('.pocket-name').textContent;
                    const pocketValue = parseInt(pocketDiv.querySelector('.pocket-value').textContent.replace(/[^\d]/g, ''), 10); // Extraer el valor numérico
                
                    const pocketIndex = pocketModel.pockets.findIndex(p => p.id === parseInt(id, 10));
                    const index = pocketModel.pockets[pocketIndex].id;
                   
                    pocketModel.deletePocket(index);
                    pocketDiv.remove();
        
                    // Actualizar el balance sumando el valor del bolsillo eliminado
                    storedBalance += pocketValue;
                    amountElement.textContent = `$${new Intl.NumberFormat().format(storedBalance)} COP`;
                    localStorage.setItem('balance', storedBalance);
        
                    // Añadir el movimiento de income
                    addPocketOutcome(pocketName, pocketValue);
        
                    // Actualizar localStorage con los bolsillos restantes
                    pocketModel.loadPockets();
                    localStorage.setItem('pockets', JSON.stringify(pocketModel.getPockets()));
        
                    // Mostrar mensaje de éxito
                    Swal.fire(
                        'Deleted!',
                        'The pocket has been deleted.',
                        'success'
                    );
                }
            });
        });

        pocketsSection.insertBefore(pocketDiv, addPocketBtn);
    }
    
    await pocketModel.loadPockets();
    const storedPockets = pocketModel.getPockets() || [];
    storedPockets.forEach(pocketData => {
        createPocketElement(pocketData.id,pocketData.name, pocketData.value, pocketData.color);
    });

    let storedBalance = localStorage.getItem('balance') || 0;
    storedBalance = parseInt(storedBalance, 10);
    amountElement.textContent = `$${new Intl.NumberFormat().format(storedBalance)} COP`;

    addPocketBtn.addEventListener('click', () => {
        popupForm.style.display = 'block';
        pocketForm.reset();
        document.getElementById('submit-pocket').textContent = 'Add Pocket';
        editingPocket = null;
    });

    closePopup.addEventListener('click', () => {
        popupForm.style.display = 'none';
    });

    window.addEventListener('click', (event) => {
        if (event.target == popupForm) {
            popupForm.style.display = 'none';
        }
    });

    pocketForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('pocket-id').value;
        const name = document.getElementById('pocket-name').value;
        const value = parseInt(document.getElementById('pocket-value').value, 10);
        const color = document.getElementById('pocket-color').value;

        if (editingPocket) {
            console.log('Pockets:', pocketModel.pockets);
           
            const pocketIndex = pocketModel.pockets.findIndex(p => p.id === parseInt(id, 10));

            console.log(pocketIndex);
            if (pocketIndex > -1) {
                const oldValue = pocketModel.pockets[pocketIndex].value;
                const difference = value - oldValue;

                pocketModel.pockets[pocketIndex].id = id;
                pocketModel.pockets[pocketIndex].name = name;
                pocketModel.pockets[pocketIndex].value = value;
                pocketModel.pockets[pocketIndex].color = color;

                editingPocket.querySelector('.pocket-id').textContent = id;
                editingPocket.querySelector('.pocket-name').textContent = name;
                editingPocket.querySelector('.pocket-value').textContent = `$${new Intl.NumberFormat().format(value)}`;
                editingPocket.style.backgroundColor = color;
            
                await pocketModel.updatePocket(id, {name, value, color});
                await pocketModel.loadPockets();
                

                // Actualizar el balance según la diferencia
                storedBalance -= difference;
                amountElement.textContent = `$${new Intl.NumberFormat().format(storedBalance)} COP`;
                localStorage.setItem('balance', storedBalance);

                // Generar movimiento según la diferencia
                if (difference > 0) {
                    addPocketIncome(name, difference);
                } else if (difference < 0) {
                    addPocketOutcome(name, Math.abs(difference));
                }
            }

        } else {
            const pocket = await pocketModel.addPocket(name, value, color);
            createPocketElement(pocket.id, name, value, color);

            // Restar el valor del bolsillo al balance
            storedBalance -= value;
            amountElement.textContent = `$${new Intl.NumberFormat().format(storedBalance)} COP`;
            localStorage.setItem('balance', storedBalance);

            // Añadir el movimiento de outcome
            addPocketIncome(name, value);

            localStorage.setItem('pockets', JSON.stringify(pocketModel.getPockets()));
        }

        popupForm.style.display = 'none';
    });

    // Función para agregar el movimiento de outcome al localStorage
    function addPocketOutcome(name, value) {
        const date = getLocalDate();
        pocketModel.saveMovement('pocketOutcome', {name, value, date});
    }

    // Función para agregar el movimiento de income al localStorage
    function addPocketIncome(name, value) {
        const date = getLocalDate();
        pocketModel.saveMovement('pocketIncome', {name, value, date});
    }

    // Función para obtener la fecha local en formato YYYY-MM-DD
    function getLocalDate() {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Los meses son 0-indexados, así que agregamos 1
        const day = String(date.getDate()).padStart(2, '0');

        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');

        // Combinar la fecha y la hora
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    }
});
