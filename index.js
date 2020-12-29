const fs = require('fs');
const https = require('https');

/**
 * Plan:
 * - open file, store json as object
 * - download json of products from desknibbles path
 * 
 * - To solve task "a", filter desknibbles products for those that are present in 
 *   participant data
 * 
 * - To solve task "b", the filtered products can include each participant email for
 *   whoever purchased the item.
 * 
 * - To solve task "c", the participants can be mapped to the product they purchased, then
 *   those products' prices added together.
 * - The leftover balances would be the participants' blances minus the product they purchased
 * - Not sure if the leftover balance is the total balance of all of the participants, or
 *   the balance of each participant that made a purchase for a product found in desknibbles.
 *   Will provide both.
 */


// get data from both sources (using promises so I can use Promise.all)
const getParticipantData = new Promise((resolve, reject) => {
  fs.readFile('MOCK_PARTICIPANT_DATA.json', (err, result) => {
    if (err) reject(err);
    resolve(result);
  }); 
});

const getProductData = new Promise((resolve, reject) => {
  https.get('https://ca.desknibbles.com/products.json?limit=250', (response) => {
    let result = '';
    response.on('data', (data) => {
      result += data;
    });
    response.on('end', () => {
      resolve(result);
    })
  }).on('error', reject);
})

Promise.all([
  getParticipantData,
  getProductData,
]).then(([participantData, productData]) => {
  console.log(participantData);
  console.log(productData);
})