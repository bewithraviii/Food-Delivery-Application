const Restaurant = require("../../models/restaurantModel");
const { Client } = require('@elastic/elasticsearch');

const client = new Client({
    node: process.env.ELASTICSEARCH_URL || 'http://localhost:9200',
});

const searchRestaurant = async (req, res) => { 

    const { query } = req.query;

    try {

        const restaurantsData = await Restaurant.find();
        if(!restaurantsData || restaurantsData.length == 0){
            return res.status(404).json({ message: 'Restaurants not found' });
        }

        const searchQuery = query.toLowerCase();

        const filteredRestaurants = restaurantsData.filter(restaurant => {
            let cuisineMatch = false;

            const nameMatch = restaurant.name && restaurant.name.toLowerCase().includes(searchQuery);

            if (Array.isArray(restaurant.cuisineType)) {
                cuisineMatch = restaurant.cuisineType.some(cuisine => 
                    cuisine.categoryName && cuisine.categoryName.toLowerCase().includes(searchQuery)
                );
            }
            return nameMatch || cuisineMatch;
        });
        
        if (filteredRestaurants.length === 0) {
            return res.status(200).json({ message: 'No matching restaurants found', payload: [] });
        }

        const restaurantsDetails = filteredRestaurants.map(restaurant => ({
            name: restaurant.name,
            address: restaurant.address,
            cuisineType: restaurant.cuisineType,
            id: restaurant._id,
            restaurantRatings: restaurant.restaurantRatings,
            restaurantRatingsCount: restaurant.restaurantRatingsCount,
            address: restaurant.address,
            priceForTwo: restaurant.priceForTwo,
            profileImage: restaurant.profileImage
        }));

        return res.status(200).json({
            message: 'Restaurants data fetched successfully',
            payload: restaurantsDetails
        });


        // const results = await client.search({
        //     index: 'restaurants',
        //     body: {
        //         query: {
        //             multi_match: {
        //                 query: query,
        //                 fields: ["restaurantName", "cuisineCategory"],
        //                 fuzziness: "AUTO"
        //             }
        //         }
        //     }
        // });
        // As per this project requirement
        // body: {
        //     query: {
        //         bool: {
        //             should: [
        //                 {
        //                     match: {
        //                         "name": query // Searching by restaurant name
        //                     }
        //                 },
        //                 {
        //                     nested: {
        //                         path: "cuisineTypes", // Searching in the nested array (if 'cuisineTypes' is nested)
        //                         query: {
        //                             match: {
        //                                 "cuisineTypes.name": query // Searching by cuisine name
        //                             }
        //                         }
        //                     }
        //                 }
        //             ]
        //         }
        //     }
        // if (results.body.hits.total.value === 0) {
        //     return res.status(404).json({ message: 'No matching restaurants found' });
        // }
        // const restaurantsDetails = results.body.hits.hits.map(hit => hit._source);
        // return res.status(200).json({
        //     message: 'Restaurants data fetched successfully',
        //     payload: restaurantsDetails
        // });
    } catch(error){
        console.error("Error in elasticsearch query:", error);
        res.status(500).json({ error: 'Failed to perform search' });
    }

}

module.exports = { searchRestaurant }