                  
// Express - Session - Copyright TJ Holowaychuk <tj@vision-media.ca> (MIT Licensed)

/**
 * Module dependencies.
 */
require('kiwi').seed('mongodb-native');
 
var utils = require('express/utils'),
    Session= require('./session'),
    Db= require('mongodb/db').Db,
    Server= require('mongodb/connection').Server;

  

// --- Store.Memory
exports.Store= Session.Store;

exports.Store.MongoDb = exports.Store.extend({
  
  /**
   * Datastore name.
   */
  
  name: 'MongoDb',
  
  /**
   * Initialize mongoDb session store.
   */
  
  init: function() {
    this.db = new Db('testing_mongo', new Server("127.0.0.1", 27017, {auto_reconnect: true}, {}));

    //this open is actually 'non-blocking' so there's a probable issue here if the first request comes in    
    // before the open has completed..
    this.db.open(function(db) {});    
  },
  
  /**
   * Fetch session with the given _sid_ or 
   * a new Session is returned.
   *
   * @param  {int} sid
   * @return {Session}
   * @api private
   */
  fetch: function(sid, callback) { 
    var self= this;
    this.db.collection('sessions',function(error, collection) {
      collection.findOne({"sid":sid}, function(error, session) {
         callback( null, self._createSessionFromDocument(session, sid) ); 
      });
    });
  },
  
  /**
   * Commit _session_ data.
   *
   * @param  {Session} session
   * @api private
   */
  
  commit: function(session, callback) {
    var self= this;
    this.db.collection('sessions',function(error, collection) {
      require('sys').puts('saving session: ' + session.id)
      collection.update(self._createDocumentFromSession(session), function(error, doc) { callback( null, session )})
    });
  },
  
  /**
   * Clear all sessions.
   *
   * @api public
   */
  
  clear: function() {
    //TODO: implement....
    this.store = {}
  },
  
  /**
   * Destroy session using the given _sid_.
   *
   * @param  {int} sid
   * @api public
   */
  
  destroy: function(sid) {
    //TODO: implement....
    delete this.store[sid]
  },
  
  /**
   * Return the number of sessions currently stored.
   *
   * @return {int}
   * @api public
   */
  
  length: function() {
    //TODO: implement....
    
    //return this.store.values.length
    return 0;
  },
  
  /**
   * Reap sessions older than _ms_.
   *
   * @param  {int} ms
   * @api private
   */
  
  reap: function(ms,callback) {
    var threshold = Number(new Date(Number(new Date) - ms))
    //TODO: reap
    callback();
  },
  
  //Basic demo-purpose key copying persistences....
  
  _createSessionFromDocument: function(document, sid) {
    var session= new Session.Base(sid);
    if( document ) {
      for(var prop in document) session[prop]= document[prop];
    }
    return session;     
  },
  
  _createDocumentFromSession: function(session) {
     var document=   {"sid":session.id};
     for(var prop in session) {
       /* Ughh.. create a default 'Session.Base' at least once on startup to figure out ignorable properties bleurgh */
       if( prop != 'id' && prop !='lastAccess' && prop != '_id' && prop != 'init' && prop != 'touch') {
         document[prop]= session[prop];
       }
     }  
     return document;
  }
})