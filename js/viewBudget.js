class FinancialView {
    constructor() {
        this.budgetElement = document.querySelector('.btn-budget');
        this.amountElemnt = document.querySelector('.btn-amount');
        this.movementsTableBody = document.querySelector('.movements-table tbody');

    }

    updateBalance(balance) {
        const realBalance = parseFloat(localStorage.getItem('balance')) || 0;
        this.budgetElement.textContent = `$ ${balance.toLocaleString()} COP`;
        this.amountElemnt.textContent = `$ ${realBalance.toLocaleString()} COP`;
    }

    updateMovements(movements) {
        this.movementsTableBody.innerHTML = '';

        movements.forEach(movement => {
            const row = document.createElement('tr');
            const iconSrc = movement.type === 'income' ? '/resources/Imagenes/arriba.png' : '/resources/Imagenes/abajo.png'; // Ruta de las imágenes
            const iconAlt = movement.type === 'income' ? 'Ingreso' : 'Egreso';

            const dateOnly = movement.date.split(' ')[0];
            row.innerHTML = `
                <td class="icon-cell">
                    <img src="${iconSrc}" alt="${iconAlt}" class="icon-img">
                </td>
                <td>${movement.name}</td>
                <td>$${movement.value.toLocaleString()}</td>
                <td>$${movement.remaining.toLocaleString()}</td>
                <td>${dateOnly}</td>
                <td class="action-cell">
                    <button class="edit-btn action-btn">
                        <img src="/resources/Imagenes/editar.png" alt="Editar" class="action-img">
                    </button>
                    <button class="delete-btn action-btn">
                        <img src="/resources/Imagenes/eliminar.png" alt="Eliminar" class="action-img">
                    </button>
                </td>
            `;
            this.movementsTableBody.prepend(row); // Insertar al principio para que aparezca primero
        });
    }

    setEditHandler(handler) {
        this.movementsTableBody.addEventListener('click', event => {
            if (event.target.closest('.edit-btn')) {
                const rowIndex = Array.from(this.movementsTableBody.children).indexOf(event.target.closest('tr'));
                // Calcular el índice real en el modelo
                const realIndex = this.movementsTableBody.children.length - rowIndex - 1;
                handler(realIndex);
            }
        });
    }
    
    setDeleteHandler(handler) {
        this.movementsTableBody.addEventListener('click', event => {
            if (event.target.closest('.delete-btn')) {
                const rowIndex = Array.from(this.movementsTableBody.children).indexOf(event.target.closest('tr'));
                // Calcular el índice real en el modelo
                const realIndex = this.movementsTableBody.children.length - rowIndex - 1;
                Swal.fire({
                    title: '¿Are you sure?',
                    text: "¡You won't be able to reverse this!",
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#5296be',
                    cancelButtonColor: '#d33',
                    confirmButtonText: 'Yes, delete!',
                }).then((result) => {
                    if (result.isConfirmed) {
                        handler(realIndex);
                        Swal.fire(
                            '¡Deleted!',
                            'Movement deleted.',
                            'success'
                        );
                    }
                });
            }
        });
    }
    
}

export default FinancialView;