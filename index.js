const fs = require('fs');

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