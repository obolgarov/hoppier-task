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
  // to stop calling the API all the time, cache result into a file. If the file
  // exists, get data from file instead.
  const productFilename = "PRODUCT_DATA.json";
  
  fs.readFile(productFilename, (err, result) => {
    if (err) {
      // assume the error is because the file doesn't exist. Load data from url.
      
      https.get({
        hostname: 'ca.desknibbles.com',
        path: '/products.json?limit=250',
        headers: {
          'user-agent': 'node-user-agent'
        }
      }, (response) => {
        let result = '';
        response.on('data', (data) => {
          result += data;
        });
        response.on('end', () => {
          // save data to file
          fs.writeFile(productFilename, result, (err) => {
            if (err) {
              console.log(`ERROR WRITING FILE: ${productFilename}`);
              console.log(err);
            }
          });
          
          // resolving data doesn't need to wait for file to be saved asynchronously
          resolve(result);
        })
      }).on('error', reject);

    } else {
      // file exists, return that data
      console.log('returning cached PRODUCT_DATA.json');
      resolve(result);
    }
  })
})

Promise.all([
  getParticipantData,
  getProductData,
]).then(([participantDataResult, productDataResult]) => {

  // convert whatever string data to objects
  const participantData = JSON.parse(participantDataResult);
  const productData = JSON.parse(productDataResult);
  
  // console.log(productData);

}).catch((err) => {
  console.log("ERROR");
  console.log(err);
})