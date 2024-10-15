class FinancialView {
    constructor() {
        this.amountElement = document.querySelector('.btn-amount');
        this.movementsTableBody = document.querySelector('.movements-table tbody');
        this.faqPopup = document.getElementById('faqPopup');
        this.questionsContainer = document.getElementById('questionsContainer');
        this.questionInput = document.getElementById('questionInput');
        this.closePopup = document.getElementById('closePopup');
        this.askButton = document.getElementById('askButton');
        this.arrowIcon = document.getElementById('arrowIcon');
    }

    updateBalance(balance) {
        this.amountElement.textContent = `$${balance.toLocaleString()} COP`;
    }

    updateMovements(movements) {
        if (!Array.isArray(movements)) {
            console.error('Expected movements to be an array:', movements);
            return; // Salir si no es un array
        }
    
        this.movementsTableBody.innerHTML = ''; // Limpiar el contenido previo
    
        // Crear el contenido de la tabla usando map y join
        const rows = movements.map(movement => {
            // Definir los íconos según el tipo de movimiento
            let iconSrc, iconAlt, editIcon, deleteIcon, minous;
            switch (movement.type) {
                case 'income':
                    iconSrc = '/resources/Imagenes/arriba.png'; // Icono para ingresos
                    iconAlt = 'Ingreso';
                    editIcon = '/resources/Imagenes/editar.png';
                    deleteIcon = '/resources/Imagenes/eliminar.png';
                    minous = "  ";
                    break;
                case 'outcome':
                    iconSrc = '/resources/Imagenes/abajo.png'; // Icono para egresos
                    iconAlt = 'Egreso';
                    editIcon = '/resources/Imagenes/editar.png';
                    deleteIcon = '/resources/Imagenes/eliminar.png';
                    minous = " ";
                    break;
                case 'pocketIncome':
                    iconSrc = '/resources/Imagenes/pocketIncome.png'; // Icono para ingresos en bolsillo
                    iconAlt = 'Ingreso en Bolsillo';
                    editIcon = '/resources/Imagenes/editPocket.png';
                    deleteIcon = '/resources/Imagenes/deletePocket.png';
                    minous = " ";
                    break;
                case 'pocketOutcome':
                    iconSrc = '/resources/Imagenes/pocketOutcome.png'; // Icono para egresos en bolsillo
                    iconAlt = 'Egreso en Bolsillo';
                    editIcon = '/resources/Imagenes/editPocket.png';
                    deleteIcon = '/resources/Imagenes/deletePocket.png';
                    minous = "   ";
                    break;
                default:
                    iconSrc = '/resources/Imagenes/default.png'; 
                    iconAlt = 'Tipo Desconocido';
                    editIcon = '/resources/Imagenes/default.png';
                    deleteIcon = '/resources/Imagenes/default.png';
            }
    
            // Tomar solo la parte de la fecha, sin la hora
            const dateOnly = movement.date.split('T')[0];
    
            // Crear la fila en formato HTML
            return `
                <tr>
                    <td class="icon-cell">
                        <img src="${iconSrc}" alt="${iconAlt}" class="icon-img">
                    </td>
                    <td>${movement.name}</td>
                    <td>${minous}$${movement.value.toLocaleString()}</td>
                    <td>$${movement.remaining ? movement.remaining.toLocaleString() : '0'}</td>
                    <td>${dateOnly}</td>
                    <td class="action-cell">
                        <button class="edit-btn action-btn">
                            <img src="${editIcon}" alt="Editar" class="action-img">
                        </button>
                        <button class="delete-btn action-btn">
                            <img src="${deleteIcon}" alt="Eliminar" class="action-img">
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    
        // Insertar todas las filas en el cuerpo de la tabla
        this.movementsTableBody.innerHTML = rows; 
    }


    setEditHandler(handler) {
        this.movementsTableBody.addEventListener('click', event => {
            if (event.target.closest('.edit-btn')) {
                const rowIndex = Array.from(this.movementsTableBody.children).indexOf(event.target.closest('tr'));
                const realIndex = this.movementsTableBody.children.length - rowIndex - 1;
                const movementRow = this.movementsTableBody.children[rowIndex];
                const iconImg = movementRow.querySelector('.icon-img');
                const iconAlt = iconImg.alt;
    
                if (iconAlt === 'Ingreso en Bolsillo' || iconAlt === 'Egreso en Bolsillo') {
                    Swal.fire({
                        title: "Can't edit movement",
                        text: "You can't edit a movement from a pocket",
                        icon: 'error',
                        confirmButtonColor: '#eba646',
                        confirmButtonText: 'Ok'
                    });
                } else {
                    handler(realIndex);
                }
            }
        });
    }
    

    setDeleteHandler(handler) {
        this.movementsTableBody.addEventListener('click', event => {
            if (event.target.closest('.delete-btn')) {
                const rowIndex = Array.from(this.movementsTableBody.children).indexOf(event.target.closest('tr'));
                const realIndex = this.movementsTableBody.children.length - rowIndex - 1;
                const movementRow = this.movementsTableBody.children[rowIndex];
                const iconImg = movementRow.querySelector('.icon-img');
                const iconAlt = iconImg.alt;
    
                if (iconAlt === 'Ingreso en Bolsillo' || iconAlt === 'Egreso en Bolsillo') {
                    Swal.fire({
                        title: "Can't delete movement",
                        text: "You can't delete a movement from a pocket",
                        icon: 'error',
                        confirmButtonColor: '#eba646',
                        confirmButtonText: 'Ok'
                    });
                } else {
                    // Mostrar alerta de confirmación
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
            }
        });
    }
    toggleFaqPopup() {
        this.faqPopup.classList.toggle('hidden');
    }

    hideFaqPopup() {
        this.faqPopup.classList.add('hidden');
    }
    hideResponsePopup() {
        const responsePopup = document.getElementById('responsePopup');
        if (responsePopup) {  // Asegurarse de que el elemento existe
            responsePopup.classList.add('hidden'); // Ocultar el popup
        } else {
            console.error('El popup de respuesta no está definido'); // Mensaje de error si no se encuentra
        }
    }
    addQuestionToContainer(question) {
        const questionElement = document.createElement('div');
        questionElement.classList.add('question');
        
        const arrowIcon = document.createElement('span');
        arrowIcon.classList.add('arrow-icon', 'collapsed');
        arrowIcon.addEventListener('click', () => {
            answerContainer.style.display =
                answerContainer.style.display === 'none' ? 'block' : 'none';
            arrowIcon.classList.toggle('collapsed');
        });
    
        // Contenedor para la flecha y el texto juntos
        const textContainer = document.createElement('div');
        textContainer.style.display = 'flex';
        textContainer.style.alignItems = 'center'; // Alineación vertical
        textContainer.style.gap = '8px'; // Espacio entre la flecha y el texto
    
        const questionText = document.createElement('span');
        questionText.textContent = question.text;
    
        textContainer.appendChild(arrowIcon);
        textContainer.appendChild(questionText);
    
        const answerButton = document.createElement('button');
        answerButton.classList.add('answer-button');
        answerButton.textContent = 'Answer';
        answerButton.addEventListener('click', () => {
            this.showResponsePopup(question.id, answerContainer);
        });
    
        const answerContainer = document.createElement('div');
        answerContainer.classList.add('answer-container');
        answerContainer.style.display = 'none'; // Ocultar inicialmente
    
        // Estructura final: Contenedor de texto + botón
        questionElement.appendChild(textContainer);
        questionElement.appendChild(answerButton);
    
        // Agregar pregunta y respuesta al contenedor principal
        this.questionsContainer.appendChild(questionElement);
        this.questionsContainer.appendChild(answerContainer);
    
        if (question.answers && Array.isArray(question.answers)) {
            this.addAnswersToContainer(question.answers, answerContainer);
        }
    }
    
    addAnswersToContainer(answers, answerContainer) {
        answers.forEach(answer => {
            const answerElement = document.createElement('div');
            answerElement.classList.add('answer');
            answerElement.innerHTML = answer.text; // Suponiendo que la respuesta tiene un texto
    
            // Crear viñeta antes de la respuesta
            const bulletPoint = document.createElement('span');
            bulletPoint.textContent = '➜'; // Viñeta
            bulletPoint.classList.add('bullet-point'); // Clase para estilo
            bulletPoint.style.marginRight = '8px'; // Espacio entre la viñeta y el texto
    
            // Añadir la viñeta al inicio de la respuesta
            answerElement.prepend(bulletPoint); 
            answerContainer.appendChild(answerElement);
        });
    }
    

    showResponsePopup(questionId, answerContainer) {
        const responsePopup = document.getElementById('responsePopup');
        const closeResponsePopup = document.getElementById('closeResponsePopup');
        const cancelResponse = document.getElementById('cancelResponse');
        const responseInput = document.getElementById('responseInput');
    
        responsePopup.classList.remove('hidden'); // Mostrar el popup
        responseInput.value = ''; // Limpiar el textarea
    
        cancelResponse.onclick = () => responsePopup.classList.add('hidden');
        closeResponsePopup.onclick = () => responsePopup.classList.add('hidden');
    
        this.responseInput = responseInput;
    
        this.currentAnswerContainer = answerContainer;
        this.currentQuestionId = questionId;
    }

    addAnswerToContainer(answerText, answerContainer) {
        const answerElement = document.createElement('div');
        answerElement.classList.add('answer');
        answerElement.textContent = answerText;

        // Crear la flecha antes de la respuesta
        const arrowBefore = document.createElement('span');
        arrowBefore.classList.add('arrow-icon');
        arrowBefore.style.backgroundImage = 'url("/resources/Imagenes/right-arrow.png")';
        arrowBefore.style.backgroundSize = 'contain';
        arrowBefore.style.width = '16px';
        arrowBefore.style.height = '16px';
        arrowBefore.style.marginRight = '5px';

        answerElement.prepend(arrowBefore); // Añadir flecha antes de la respuesta
        answerContainer.appendChild(answerElement);
    }
    
    
}

export default FinancialView;