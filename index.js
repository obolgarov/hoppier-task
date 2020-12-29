const { privateEncrypt } = require('crypto');
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
 *   Will assume this means the balance of each participant, because that makes more sense to display
 * 
 * - Music listened to while writing: Ralph Vaughan Williams, Concerto Grosso: https://www.youtube.com/watch?v=AqZMd9Wv20s
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
  
  fs.readFile(productFilename, (err, fileResult) => {
    if (err) {
      // assume the error is because the file doesn't exist. Load data from url.
      
      https.get({
        hostname: 'ca.desknibbles.com',
        path: '/products.json?limit=250',
        headers: {
          'user-agent': 'node-user-agent'
        }
      }, (response) => {
        let httpResult = '';
        response.on('data', (data) => {
          httpResult += data;
        });
        response.on('end', () => {
          // save data to file
          fs.writeFile(productFilename, httpResult, (err) => {
            if (err) {
              console.log(`ERROR WRITING FILE: ${productFilename}`);
              console.log(err);
            }
          });
          
          // resolving data doesn't need to wait for file to be saved asynchronously
          resolve(httpResult);
        })
      }).on('error', reject);

    } else {
      // file exists, return that data
      console.log(`returning cached ${productFilename}`);
      console.log();
      resolve(fileResult);
    }
  })
})

Promise.all([
  getParticipantData,
  getProductData,
]).then(([participantDataResult, productDataResult]) => {

  // convert whatever string data to objects
  const participantData = JSON.parse(participantDataResult);
  const productData = JSON.parse(productDataResult).products;

  // const foundProducts = productData.filter((product) => {
  //   return participantData.some((participant) => {
  //     return product.title.includes(participant.purchases);
  //   });
  // });

  // replacing above with found participants, easier to answer questions with
  const foundParticipants = participantData.filter((participant) => {
    return productData.some((product) => {
      return product.title.includes(participant.purchases);
    });
  });

  // reduce participants' purchases in a list of unique purchases
  const uniqueProducts = foundParticipants.reduce((uniquePurchases, participant) => {
    return uniquePurchases.findIndex((product) => product === participant.purchases) !== -1
      ? uniquePurchases
      : [ ...uniquePurchases, participant.purchases ];
  }, []);

  // get found products using much smaller uniqueProducts list
  const foundProducts = productData.filter((product) => {
    return uniqueProducts.some((uniqueProduct) => product.title.includes(uniqueProduct));
  });


  // helper function for currency math:
  const currencyToNumber = (currency) => {
    return Number(currency.replace(/\$|\,/g, ''));
  };
  const numberFormatter = Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

  // get total price of products
  const totalPrice = numberFormatter.format(
    foundParticipants.reduce((price, participant) => {
      // return price +=;
      const foundProduct = foundProducts.find((product) => product.title.includes(participant.purchases));
      return price += currencyToNumber(foundProduct.variants[0].price);
    }, 0)
  );

  // calculate remaining balances for each participant
  const remainingBalances = foundParticipants.map((participant) => {
    const foundProduct = foundProducts.find((product) => product.title.includes(participant.purchases));
    const remainingBalance = numberFormatter.format(
      currencyToNumber(participant.balance) - currencyToNumber(foundProduct.variants[0].price)
    );
    
    return {
      participant,
      remainingBalance
    };
  })


  console.log('Real product participant emails:')
  console.log(foundParticipants.map((participant) => participant.email));
  console.log();

  console.log('Found real products:')
  console.log(foundProducts.map((product) => product.title));
  console.log();

  console.log('Total price:');
  console.log(totalPrice);
  console.log();

  console.log('Remaining balances:');
  console.log(remainingBalances.map(({participant, remainingBalance}) => {
    return `${participant.email} - ${remainingBalance}`
  }))

}).catch((err) => {
  console.log("ERROR");
  console.log(err);
})