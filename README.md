# Address Book REST API

REST API for an address book using Node.js, ElasticSearch and Express.js.

## Getting Started

1. Make sure you have `npm` installed on your machine. You can install it from [here](https://www.npmjs.com/package/npm).
2. Clone the repository locally and navigate into it.
3. Run `npm install` from your shell to install all the dependencies which are mentioned in the `package.json` file.
4. Download and install ElasticSearch on your machine from [here](https://www.elastic.co/guide/en/elasticsearch/reference/current/install-elasticsearch.html).

## Running Locally

1. Once all the dependencies are installed, you can run `node server.js` from the root of the repository directory to run the server. The server can be accessed at `http://localhost:8080`.
2. To check if your ElasticSearch is running properly, run `curl 'http://localhost:9200/?pretty'` from your shell and it should give you a JSON response.

## API Endpoints

1. **POST** - Add a new contact to your book

```
$ curl -H "Content-Type: application/json" -d "{\"name\": \"jon\", \"lastname\": \"doe\", \"email\": \"k@example.com\", \"phone\": \"2455663456\", \"address\": \"heaven\"}" -X POST http://localhost:8080/contact/
```

*Note that the double quotes are escaped here since I ran this on a Windows machine.*

2. **GET** - Get a user using their name in the URL

`$ curl -X GET http://localhost:8080/contact/jon`

3. **GET** - Get all users using additional parameters

`$ curl -X GET "http://localhost:8080/?pageSize={10}&page={1}&query={\"name\": \"jon\"}"`

Here, we have `pageSize` (number of results that are allowed back), `page` (get specific page numbers), and `query` which is a [Query String Query](https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-query-string-query.html) as defined by Elasticsearch that you can pass directly in the Elasticsearch call.

4. **UPDATE** - Update an existing contact by passing their name

```
$ curl -H "Content-Type: application/json" -d "{\"new_name\": \"John\", \"new_phone\": \"1234567890\"}" -X PUT http://localhost:8080/contact/jon
```

5. **DELETE** - Delete an existing contact by passing their name

`$ curl -X DELETE "http://localhost:8080/contact/jon"`

## Testing

The testing was carried out using Mocha and Chai.
