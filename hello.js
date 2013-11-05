jsonld = require("jsonld");
http = require("http");
fs = require("fs");

/*
*  Run the very first function to start over all the Urls	
*/
runForAll(); 


/*
*  Post the recieved nquads/tripples into the RDF Tripplestore.	
*/
function post_to_rdfStore(nquads){

	fs.readFile('./config.json','utf8', function(err,data){
		if(err){
			return console.log(err);
		}
		var storeObj = JSON.parse(data);
		//storeObj.Config[1].TrippleStore.headers.Content-Length = nquads.length;
		post_options = storeObj.Config[1].TrippleStore;
		//post_options.headers.Content-Length = nquads.length;
		
//		console.log(storeObj.Config[1].TrippleStore);
		
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

//getJson();
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

function convertToRdf(doc){

/* use try catch */
var tdata = JSON.parse(doc);


jsonld.toRDF(tdata, {format: 'application/nquads'}, function callBack(err, nquads) {
//	console.log(nquads);
   post_to_rdfStore(nquads);
});

}




