var sys= require('sys');
var FlickrAPI= require('./lib/flickr/lib/flickr').FlickrAPI;

var INITIAL_API_KEY= "9a0554259914a86fb9e7eb014e4e5d52";
var INITIAL_USER_NAME= "_rebekka";

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
  enable('show exceptions')
})

function do_index(user_name, api_key) {
    var flickr= new FlickrAPI(api_key);
    var request= this;
    flickr.people.findByUsername(user_name).addErrback(fail).addCallback(function(user){
        flickr.photosets.getList(user.id).addErrback(fail).addCallback(function(photosets){
            flickr.photosets.getPhotos(photosets.photoset[0].id, ["url_sq", "url_m"]).addErrback(fail).addCallback(function(photoset){
                request.render('index.haml.html', {
                    locals: {
                      user_name : user_name == null ? '' : user_name ,
                      api_key : api_key == null ? '' : api_key,
                      photos : photoset.photo === undefined ? [] : photoset.photo
                    }
                  });
            });
        });
    });    
}

function fail(err) {
    // Why does this pull the app down, and not get rendered as per the /error route below ?
    throw new Error(err.code + " -  " + err.message);
};
    
get('/', function(){
     do_index.apply(this,[INITIAL_USER_NAME,INITIAL_API_KEY]);
})

post('/', function() {
    do_index.apply(this,[this.param('user_name'),
                         this.param('api_key') ]);
})

get('/public/*', function(file){
  this.sendfile(dirname(__filename) + '/public/' + file)
})

get('/*.css', function(file){
  this.render(file + '.sass.css', { layout: false })
})

get('/error', function(){
  throw new Error('oh noes!')
})

run()