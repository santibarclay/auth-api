const { v4: uuidv4 } = require('uuid');
const config = require('../config');

// Almacenamiento en memoria para nuestros clientes
const clients = [];

/**
 * Crea un nuevo cliente OAuth2
 *@param{Object}clientData - Datos del cliente
 *@returns{Object} El cliente creado
 */
const create = (clientData) => {
  const { name, description, scopes } = clientData;

  if (!name) {
    throw new Error('El nombre del cliente es requerido');
  }

  const clientId = uuidv4();
  const clientSecret = uuidv4();

// Validar scopes
  let validScopes = [];
  if (Array.isArray(scopes) && scopes.length > 0) {
    const allScopes = [
      config.scopes.contacts.read,
      config.scopes.contacts.write,
      config.scopes.contacts.delete
    ];

    validScopes = scopes.filter(scope => allScopes.includes(scope));
  } else {
// Por defecto, solo lectura
    validScopes = [config.scopes.contacts.read];
  }

  const newClient = {
    id: clientId,
    secret: clientSecret,
    name,
    description: description || '',
    scopes: validScopes,
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
    scopes: client.scopes,
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
 *@returns{Object|null} El cliente si las credenciales son válidas, null en caso contrario
 */
const validateCredentials = (clientId, clientSecret) => {
  const client = findById(clientId);
  return client && client.secret === clientSecret ? client : null;
};

/**
 * Actualiza los scopes de un cliente
 *@param{string}clientId - ID del cliente
 *@param{Array}scopes - Nuevos scopes
 *@returns{Object|null} El cliente actualizado o null si no existe
 */
const updateScopes = (clientId, scopes) => {
  const client = findById(clientId);
  if (!client) return null;

// Validar scopes
  const allScopes = [
    config.scopes.contacts.read,
    config.scopes.contacts.write,
    config.scopes.contacts.delete
  ];

  const validScopes = scopes.filter(scope => allScopes.includes(scope));

// Actualizar cliente
  client.scopes = validScopes;

  return {
    id: client.id,
    name: client.name,
    description: client.description,
    scopes: client.scopes,
    createdAt: client.createdAt
  };
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
  updateScopes,
  remove
};