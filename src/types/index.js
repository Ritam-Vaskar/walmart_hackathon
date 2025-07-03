// Product Type
/**
 * @typedef {Object} Product
 * @property {string} id
 * @property {string} name
 * @property {number} price
 * @property {number} [originalPrice]
 * @property {string} image
 * @property {string} category
 * @property {string} description
 * @property {number} rating
 * @property {number} reviews
 * @property {boolean} inStock
 * @property {string} brand
 * @property {string[]} features
 */

// CartItem Type
/**
 * @typedef {Object} CartItem
 * @property {Product} product
 * @property {number} quantity
 */

// User Type
/**
 * @typedef {Object} User
 * @property {string} id
 * @property {string} name
 * @property {string} email
 * @property {{ street: string, city: string, state: string, zipCode: string }} [address]
 */

// Order Type
/**
 * @typedef {Object} Order
 * @property {string} id
 * @property {string} userId
 * @property {CartItem[]} items
 * @property {number} total
 * @property {'pending' | 'processing' | 'shipped' | 'delivered'} status
 * @property {string} orderDate
 * @property {string} [deliveryDate]
 * @property {{ street: string, city: string, state: string, zipCode: string }} shippingAddress
 */

// Category Type
/**
 * @typedef {Object} Category
 * @property {string} id
 * @property {string} name
 * @property {string} image
 * @property {string} icon
 */
