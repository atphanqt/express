var sys= require('sys');
require.paths.unshift('lib')
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

var FlickrAPI= require('support/flickr/lib/flickr').FlickrAPI;

function do_index(arguments) {
    this.render('index.haml.html', {
        locals: arguments
      });
}

function fail(err) {
    sys.puts(err)
    
    throw new Error(err.code + " -  " + err.message);
};
    
get('/', function(){
     do_index.apply(this,[{
        user_name : '',
        api_key : '',
        photos : []
      }])
})

post('/', function() {
    var user_name= this.param('user_name');
    var api_key= this.param('api_key');
    var flickr= new FlickrAPI(api_key);
    var request= this;
    flickr.people.findByUsername(user_name).addErrback(fail).addCallback(function(user){
        flickr.photosets.getList(user.id).addErrback(fail).addCallback(function(photosets){
            flickr.photosets.getPhotos(photosets.photoset[0].id, ["url_sq", "url_m"]).addErrback(fail).addCallback(function(photoset){
                do_index.apply(request, [{
                  user_name : user_name == null ? '' : user_name ,
                  api_key : api_key == null ? '' : api_key,
                  photos : photoset.photo === undefined ? [] : photoset.photo
                }])
            });
        });
    });    
})

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