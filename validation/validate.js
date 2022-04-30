// Description: a function to enable the system to check and test JSON request values
// Developer: Matt Cole
// Date created: 2022-01-29
// Change history:
//  1. 

const validate = (object, schema) => Object
  .keys(schema)
  .filter(key => !schema[key](object[key]))
  .map(key => new Error(`${key} is invalid.`));

module.exports = validate;