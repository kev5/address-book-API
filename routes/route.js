var elasticsearch = require('elasticsearch');
var express = require('express');
var router = express.Router();
bodyParser = require('body-parser');
var client = new elasticsearch.Client({
  host: 'localhost:9200',   //initialize and start the elasticearch server on port 9200
});

var indexName = 'addressbookindex'   // define app using express

// Default route
router.get('/', function(req, res) {
    return client.indices.putMapping({  // initialize the mapping of JSON fields
      index: indexName,
      type: "contact",
      body: {
          properties: {
              name: {type: "text"},        // name :  string
              lastname: {type: "text"},    // lastname:  string
              phone: { type: "text"},      // phone number: number
              email: {type: "text" },      // email: sequence of characters
              address: {type: "text"}      // address: also a keyword
             }
      }
    }, function(err, response){
        if(err) {
            console.log(err);
            res.sendStatus(500);
        }
        else {
            res.status(200).send({ message: 'Address Book API' }); 
        }
    });
});


/*
  Description. GET details of a contact with the name
  (accessed at GET http://localhost:8080/contact/:name)
  name is a req-parameter of the GET request
*/
router.route('/contact/:name')
    .get( function(req, res) {
        var input = req.params.name;

        client.search({       //searching the elasticsearch index
            index: indexName,
            type: 'contact',
            body: {
                query: {
                    match: {
                        name: input
                    }
                }
            }
        }).then(function (resp) {
            var results = resp.hits.hits.map(function(hit){
                return hit._source;
            });
            console.log('GET results', results); //returns the list of the search
            console.log(resp);
            res.status(200).send(results);
        
        });
    });


/*
  Description. GET list of all contacts
  (accessed at http://localhost:8080/contact/?pageSize={}&page={}&query={})
*/
router.route('/contact')
  .get(function(req, res) {
  var pageNum = parseInt(req.query.page); //parse parameters from the req param
  var perPage = parseInt(req.query.pageSize);
  var userQuery = req.query.query;
  var searchParams = {
    index: indexName,
    from: (pageNum - 1) * perPage,
    size: perPage,
    body: {
            "query": {
                "match_all": {query} // elasticsearch query to return all records
            }
         }
  };
  console.log('search parameters', searchParams);
  client.search(searchParams, function (err, resp) {
      if (err) {
        throw err;
    }
  console.log('search_results', {
    results: resp.hits.hits,
    page: pageNum,
    pages: Math.ceil(resp.hits.total / perPage)
  });
  var results = resp.hits.hits.map(function(hit){
        return hit._source.name + " " + hit._source.lastname;
        });
       console.log(results);
       res.status(200).send(results);
  });
});
  

/*
  Description. POST query for inserting a new contact 
  accessed at http://localhost:8080/contact/  
  al params are passed in the req.body
*/
router.route('/contact')  
    .post(function(req, res) {

    	  var input = req.body;

        // Validate phone number
        if (input.phone) {
          if (input.phone.length > 10) {
            res.status(400).send("Phone number must be 10 digits in length");
            return;
          }

          // Check if a valid number
          var isnum = /^\d+$/.test(input.phone);
          if (isnum === false) {
            res.status(400).send("Phone number must contain only digits (0-9)");
            return;
          }
        }

        // Check if an entry already exists
        var my_name = req.params.name;
        var my_lastname = req.params.lastname;
        client.search({       //searching the elasticsearch index
            index: indexName,
            type: 'contact',
            body: {
                query: {
                    match: {
                        name: my_name,
                        lastname: my_lastname
                    }
                }
            }
        }).then(function (resp) {
            var results = resp.hits.hits.map(function(hit){
                return hit._source;
            });
            if (results) {
              res.status(400).send("Duplicate entry already exists");
              return;
            }
        });

        // POST new entry
        client.index({           //client.index is the elasticsearch.js method to insert a document
            index: indexName,
            type: 'contact',
            body: {
                name: input.name, 
                lastname: input.lastname,
                email: input.email,
                phone: parseInt(input.phone),
                address: input.address
            }
        }, function (error,response) {
              if(error) return console.log('ERROR', error);
              else {
                console.log(response);
                res.sendStatus(200);
              }
        });
    }); 


/*
  Description. PUT method to update contact 
  accessed at http://localhost:8080/contact/:name
  name is a req-param, the name of the contact to be updated 
*/
router.route('/contact/:name')
    .put(function(req, res) {
      input = req.body;
      my_name = req.params.name;

      // Check if an entry exists or not
      client.search({       //searching the elasticsearch index
          index: indexName,
          type: 'contact',
          body: {
              query: {
                  match: {
                      name: my_name,
                  }
              }
          }
      }).then(function (resp) {
          var results = resp.hits.hits.map(function(hit){
              return hit._source;
          });
          if (!results) {
            res.status(400).send("No such entry exists");
            return;
          }
      });

      // Update the existing entry
    	client.updateByQuery({ 
          index: indexName,
          type: 'contact',
          body: { 
            query: {
                match: {name: my_name}
            },
            "script":  "ctx._source.name = "+"'"+input.new_name +"'"+";"+"ctx._source.phone = "+"'"+input.new_phone +"'"+";"+"ctx._source.email = "+"'"+input.new_email +"'"+";"+"ctx._source.address = "+"'"+input.new_address +"'"+";"+"ctx._source.lastname = "+"'"+input.new_lastname +"'"+";"
          }
      }, function(err, response) { 
            if (err) { 
               console.log(err);
               res.sendStatus(500);
            } 
            console.log(response);
            res.status(200).send(response);
        })
    });


/*
  Description. DELETE method to deleted contact 
  accessed at http://localhost:8080/contact/:name
  name is a req-param, the name of the contact to be deleted 
*/
 router.route('/contact/:name')
    .delete(function(req, res) {
      input = req.params.name;
      client.deleteByQuery({
          index: indexName,
          type: 'contact',
          body: {
             query: {
                 match: {name: input}
             }
          }
      }, function (error, response) {      
            if(error){
              console.log(error);
              res.sendStatus(500);
            } 
            else {
              res.status(200).send(response);
            }          
      });    	 
    });

module.exports = router;
