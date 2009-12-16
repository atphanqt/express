
require.paths.unshift('lib')
require('express')
require('express/plugins')

configure(function(){
  use(MethodOverride)
  use(ContentLength)
  use(CommonLogger)
  set('root', dirname(__filename))
  enable('helpful 404')
  enable('show exceptions')
 // enable('cache views')
})

get('/', function(){
    this.render('test.mustache.html', {
      locals: {
          title: "Mustache too",
          users: [{id:1, name:'John'}, 
                   {id:2, name:'Dave'},
                   {id:3, name: 'Bob'}]
      }
    });  
})

run()