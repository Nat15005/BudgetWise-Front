class PocketModel {
    constructor() {
        this.pockets = []; // Arreglo para almacenar los pockets localmente
        this.token = localStorage.getItem('token'); // Suponiendo que el token está en localStorage
        this.APIURL = 'http://localhost:3000/api/pockets/';
        this.loadPockets(); // Cargar los pockets al iniciar la aplicación
    }

    // Cargar todos los pockets desde la API
    async loadPockets() {
        try {
            const token = this.token;
            const response = await fetch(`${this.APIURL}`, {
                headers: {
                    'Authorization': token,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) throw new Error('Error al obtener los pockets');
            const data = await response.json();

            // Limpiar el arreglo antes de cargar nuevos datos
            this.pockets = [];

            // Llenar el arreglo con los datos obtenidos
            data.forEach(item => {
                const pocket = {
                    id: item.id,
                    name: item.name,
                    value: item.value,
                    color: item.color
                };
                this.pockets.push(pocket);
            });
      
        } catch (error) {
            console.error('Error al cargar los pockets:', error);
        }
    }

    // Añadir un nuevo pocket a la API y actualizar localmente
    async addPocket(name, value, color) {
        try {
            const token = this.token;
            const newPocket = { name, value, color };
            const response = await fetch(`${this.APIURL}`, {
                method: 'POST',
                headers: {
                    'Authorization': token,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newPocket)
            });

            if (!response.ok) {
                const errorMessage = await response.text();
                throw new Error(`Error al crear el pocket: ${errorMessage}`);
            }

            const savedPocket = await response.json();
            this.pockets.push(savedPocket);
   
            return savedPocket; // Retornar el pocket creado para ser usado en la vista
        } catch (error) {
            console.error('Error al agregar pocket:', error);
        }
    }

    // Actualizar un pocket existente en la API
    async updatePocket(id, updatedPocketData) {
        try {
            const token = this.token;
            const response = await fetch(`${this.APIURL}${id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': token,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updatedPocketData)
            });

            if (!response.ok) throw new Error('Error al actualizar el pocket');

            const updatedPocket = await response.json();
            const index = this.pockets.findIndex(p => p.id === id);
            this.pockets[index] = updatedPocket;
     
            return updatedPocket; // Retornar el pocket actualizado para ser usado en la vista
        } catch (error) {
            console.error('Error al actualizar el pocket:', error);
        }
    }

    // Eliminar un pocket de la API y actualizar localmente
    async deletePocket(id) {
        try {
            const token = this.token;
            const response = await fetch(`${this.APIURL}${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': token,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const errorMessage = await response.text();
                throw new Error(`Error al eliminar el pocket: ${errorMessage}`);
            }

            this.pockets = this.pockets.filter(pocket => pocket.id !== id); // Remover localmente
        
        } catch (error) {
            console.error('Error al eliminar el pocket:', error);
        }
    }
    async saveMovement(type, movement) {
        try {
            const token = this.token;
            const dateInISOFormat = movement.date.replace(' ', 'T');

            const body = {
                name: movement.name,
                value: movement.value,
                date: dateInISOFormat,
                type: type
            };

            const response = await fetch(`http://localhost:3000/api/movements/`, {
                method: 'POST',
                headers: {
                    'Authorization': token,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)
            });

            if (!response.ok) {
                const responseText = await response.text();
                throw new Error(`Error al guardar el movimiento: ${responseText}`);
            }
        } catch (error) {
            console.error('Error saving movement:', error);
        }
    }

    // Obtener todos los pockets cargados
    getPockets() {
        return this.pockets;
    }
}

export default PocketModel;
