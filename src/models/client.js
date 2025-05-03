const { v4: uuidv4 } = require('uuid');

// Almacenamiento en memoria para nuestros clientes
const clients = [];

/**
 * Crea un nuevo cliente OAuth2
 *@param{Object}clientData - Datos del cliente
 *@returns{Object} El cliente creado
 */
const create = (clientData) => {
  const { name, description } = clientData;

  if (!name) {
    throw new Error('El nombre del cliente es requerido');
  }

  const clientId = uuidv4();
  const clientSecret = uuidv4();

  const newClient = {
    id: clientId,
    secret: clientSecret,
    name,
    description: description || '',
    createdAt: new Date().toISOString()
  };

  clients.push(newClient);
  return { ...newClient };
};

/**
 * Obtiene todos los clientes
 *@returns{Array} Lista de todos los clientes (sin los secrets)
 */
const getAll = () => {
  return clients.map(client => ({
    id: client.id,
    name: client.name,
    description: client.description,
    createdAt: client.createdAt
  }));
};

/**
 * Busca un cliente por su ID
 *@param{string}clientId - ID del cliente
 *@returns{Object|null} El cliente encontrado o null
 */
const findById = (clientId) => {
  return clients.find(client => client.id === clientId) || null;
};

/**
 * Valida las credenciales de un cliente
 *@param{string}clientId - ID del cliente
 *@param{string}clientSecret - Secret del cliente
 *@returns{boolean} true si las credenciales son válidas, false en caso contrario
 */
const validateCredentials = (clientId, clientSecret) => {
  const client = findById(clientId);
  return client && client.secret === clientSecret;
};

/**
 * Elimina un cliente
 *@param{string}clientId - ID del cliente a eliminar
 *@returns{boolean} true si se eliminó, false si no existía
 */
const remove = (clientId) => {
  const index = clients.findIndex(client => client.id === clientId);
  if (index === -1) return false;

  clients.splice(index, 1);
  return true;
};

module.exports = {
  create,
  getAll,
  findById,
  validateCredentials,
  remove
};