var should = require('chai').should(),
expect = require('chai').expect,
supertest = require('supertest'),
api = supertest('http://localhost:8080');


describe('Contact', function(){

	it('Check if index is created',  function(done){
		api.get('/')
		.set('Accept', 'application/json')
		.expect(200, done);
	});
	
	it('POST should return 200 response',  function(done){
		api.post('/contact/')
	    .set('Accept', 'application/json')
	    .send({
		     name: "jon",
		     lastname: "doe",
		     address: "California",
		     email: "jon@examaple.com",
		     phone: "1234567890"
	    })
	    .expect(200, done);
	});

	it('POST should return 200 response',  function(done){
		api.post('/contact/')
	    .set('Accept', 'application/json')
	    .send({
		     name: "mary",
		     lastname: "jane",
		     address: "Boston",
		     email: "jane@examaple.com",
		     phone: "1234567800"
	    })
	    .expect(200, done);
	});
	
   		it('Waiting for POST to complete', function(done){
      	setTimeout(function(){
        	console.log('Done waiting');
           	done();
       		}, 1900)
   	})

	it('Verifying Contact details', function(done) {
	    api.get('/contact/Lori')
	    .set('Accept', 'application/json')
	    .expect(200)
	    .end(function(err, res) {
	      	expect(res.body).to.include.deep.members(
	      	[{ name: 'jon',
    		lastname: 'doe',
    		email: 'jon@examaple.com',
    		phone: 123456,
    		address: 'California' }]
    		);
 	      	done();
    	});

  	});

	it('Update a Contact', function(done) {
	    api.put('/contact/John')
	    .set('Accept', 'application/json')
	    .send({oldname: 'jon', newname: 'John'})
	    .expect(200, done);
	 });

	it('Get all contacts', function(done) {
	    api.get('/contact/?pageSize=1&page=2&query=test')
	    .set('Accept', 'application/json')
	    .send({
		     pageSize: "1",
		     pageNum: "2",
		     query: "test",
		    })
	    .expect(200, done);
	 });

	it('Delete a contact', function(done) {
	    api.delete('/contact/mary')
	    .set('Accept', 'application/json')
	    .send({name: 'mary'})
	    .expect(200, done);
	 });

}); //end
