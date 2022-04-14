// Importing node.js file system module
const fs = require('fs')
 
class LocalDB {
  constructor(filename) {
     
    // Filename where datas are going to store
    if (!filename) {
      throw new Error(
'Filename is required to create a datastore!')
    }
 
    this.filename = filename
 
    try {
      fs.accessSync(this.filename)
    } catch (err) {
 
      // If file not exist
      // it is created with empty array
      fs.writeFileSync(this.filename, '[]')
    }
  }

  // Get data
  async getAllRecords(){
    try {
      const rawRecords = await fs.promises.readFile(this.filename, { encoding: 'utf-8' });
      return JSON.parse(rawRecords);
    }catch(err){
      return [];
    }
  }
 
  // Logic to add data
  async createNewRecord(attributes) {
 
    // Read filecontents of the datastore
    const jsonRecords = await
      fs.promises.readFile(this.filename,{
      encoding : 'utf8'
    })
 
    // Parsing JSON records in JavaScript
    // object type records
    const objRecord = JSON.parse(jsonRecords)
 
    // Adding new record
    objRecord.push(attributes)
 
    // Writing all records back to the file
    await fs.promises.writeFile(
      this.filename,
      JSON.stringify(objRecord, null, 2)  
    )
 
    return attributes;
  }
}

module.exports = {
  LocalDB
}