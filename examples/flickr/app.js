var sys= require('sys');
require.paths.unshift('lib')
var flickr= require('support/flickr/lib/flickr')
require('express')
require('express/plugins')

configure(function(){
  use(MethodOverride)
  use(ContentLength)
  use(CommonLogger)
  set('root', dirname(__filename))
  enable('cache views')
  enable('cache statics')
})

/*
function do_index(arguments) {
    this.render('index.haml.html', {
        locals: arguments
      });
}*/
/*
function fail(err) {
    sys.puts(err)
    
    throw new Error(err.code + " -  " + err.message);
};
    */
get('/', function(){
     sys.puts('fooo');
     this.render('index.haml.html', {
         locals: {
           user_name : '',
           api_key : ''
         }
       });     
})

/*post('/', function() {
    var user_name= this.param('user_name');
    var api_key= this.param('api_key');
//    sys.puts('fooo');

    flickr.people.findByUsername(user_name,api_key).addErrback(fail).addCallback(function(user){
  //      sys.puts('found user' +  user.id)
        flickr.photosets.getList(user.id, api_key).addErrback(fail).addCallback(function(photosets){
            flickr.photosets.getPhotos(photosets.photoset[0].id, api_key, ["url_sq", "url_m"]).addErrback(fail).addCallback(function(photoset){
    //            sys.puts("FOO: " + sys.inspect(photoset));
                do_index.apply(this, [{
                  user_name : user_name == null ? '' : user_name ,
                  api_key : api_key == null ? '' : api_key
                }])
            });
        });
    });    
})*/

get('/public/*', function(file){
  this.sendfile(dirname(__filename) + '/public/' + file)
})

get('/error/view', function(){
  this.render('does.not.exist')
})

get('/error', function(){
  throw new Error('oh noes!')
})

run()