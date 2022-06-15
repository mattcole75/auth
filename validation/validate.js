const validate = (object, schema) => Object
  .keys(schema)
  .filter(key => !schema[key](object[key]))
  .map(key => new Error(`${key} is invalid.`));

module.exports = validate;