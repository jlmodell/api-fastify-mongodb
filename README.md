# api-fastify-mongodb

This is an api built using a framework called fastify (https://github.com/fastify/fastify).

The database is housed in a mongodb.

Queries:

  /api/sales/item_ => searches a {time range} for sales data about {item}
    required params are "start", "end" in YYYY-MM-DD format & "item"
  
  JSON Response of "data" including an array of items which is an object with various data.
  
 note: 
 Early iterations relied on mongodb aggregations but the larger the date range, the slower the response.  
 A change was impemented to make use of a javascript Map() and a single loop to take the raw array response 
 from mongodb and move items into the Map() and then Array.from(Map()) to craft the return response to the api
 consumer.  The response time was reduced to O(n) rather than O(n^2 or 3 in some cases).
 
