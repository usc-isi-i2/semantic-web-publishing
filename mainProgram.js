jsonld = require("jsonld");
http = require("http");
fs = require("fs");

/*
*  Run the very first function to get json data from all URL's mwntioned in the config.json file
*/

runForAll(); 

/* 
*  Read the config file and parse the Json object and run a loop to go over all URL's
*  Call getJson() function for each URL to fetch the individual's information.
*/
function runForAll(){
	
	fs.readFile('./config.json','utf8', function(err,data){
		if(err){
			return console.log(err);
		}
		var UrlObj = JSON.parse(data);

		for(i = 0; i < UrlObj.Config[0].Url_List.length; i++){
			getJson(UrlObj.Config[0].Url_List[i].Url);
			}

	  });
}


/*
* Get request for all URL's to  get the json-LD data which describes the individual's information. 
* Call to convertToRdf() function to convert the recieved json-LD data into RDF triples.
*
* @param
* dest : destination URL recieved from the calling function ( runForAll() ).
*/

function getJson(dest){

var data = "";
var options = {
  host: 'localhost',
  port: '80',
  path: dest
};

http.get(options, function(res) {
  res.on("data", function(chunk) {
    data += chunk;
    convertToRdf(data);
  });
}).on('error', function(e) {
  console.log("Got error: " + e.message);
});
}


/*
*	function to convert the json-LD data into RDF triples.
* 	Call to post_to_rdfStore() function to post the converted triples into an openRDF triplestore.
*   
*   @param
*	doc: recieved individual's json-LD data to convert into RDF.
*/
function convertToRdf(doc){
var tdata = JSON.parse(doc);
jsonld.toRDF(tdata, {format: 'application/nquads'}, function callBack(err, nquads) {
post_to_rdfStore(nquads);
});

}



/*
*  Post the recieved nquads/tripples into the openRDF Tripplestore.	
*/
function post_to_rdfStore(nquads){

	fs.readFile('./config.json','utf8', function(err,data){
		if(err){
			return console.log(err);
		}
		var storeObj = JSON.parse(data);
		post_options = storeObj.Config[1].TrippleStore;
		  var req = http.request(post_options, function(res){
		  console.log('STATUS :'  + res.statusCode);
		  console.log('HEADERS :'  +  JSON.stringify(res.headers));
		  res.setEncoding('utf8');
		  res.on('data', function(chunk){
			  console.log('BODY:' + chunk);
		  });
		  
	   });
	
		req.write(nquads);
		req.end();
	
	});
	
}

