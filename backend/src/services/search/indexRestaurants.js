
const { Client } = require('@elastic/elasticsearch');
const Restaurant = require('../../models/restaurantModel');
const client = new Client({ node: 'http://localhost:9200' });

const indexName = 'restaurants';

async function createIndexIfNotExists() {
  const exists = await client.indices.exists({ index: indexName });
  if (!exists.body) {
    console.log(`Index "${indexName}" does not exist. Creating now...`);

    await client.indices.create({
      index: indexName,
      body: {
        mappings: {
          properties: {
            name: { type: 'text' },
            cuisine: { type: 'text' },
          }
        }
      }
    });
    console.log(`Index "${indexName}" created successfully.`);
  } else {
    console.log(`Index "${indexName}" already exists.`);
  }
}

async function bulkIndexRestaurants() {
  let restaurants = [];
  const restaurantsData = await Restaurant.find();
  if(restaurantsData){
    restaurants = restaurantsData;
  }


  const bulkBody = restaurants.flatMap(doc => [
    { index: { _index: indexName, _id: doc._id } },
    {
      name: doc.name,
      cuisine: doc.cuisine,
    }
  ]);

  const bulkResponse = await client.bulk({ refresh: true, body: bulkBody });
  if (bulkResponse.body.errors) {
    console.error("Errors occurred during bulk indexing:");
    bulkResponse.body.items.forEach((item) => {
      if (item.index && item.index.error) {
        console.error(item.index.error);
      }
    });
  } else {
    console.log("Bulk indexing completed successfully.");
  }
}

async function verifyIndexedData() {
  const { body } = await client.search({
    index: indexName,
    body: {
      query: {
        match_all: {}
      }
    }
  });
  console.log("Indexed documents:");
  body.hits.hits.forEach(doc => {
    console.log(`ID: ${doc._id} | Data: `, doc._source);
  });
}

async function run() {
  try {
    await createIndexIfNotExists();
    await bulkIndexRestaurants();
    await verifyIndexedData();
  } catch (error) {
    console.error("An error occurred:", error);
  }
}


run();
