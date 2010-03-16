                  
// Express - Session - Copyright TJ Holowaychuk <tj@vision-media.ca> (MIT Licensed)

/**
 * Module dependencies.
 */
require('kiwi').seed('mongodb-native');
 
var utils = require('express/utils'),
    Session= require('./session'),
    Db= require('mongodb/db').Db,
    ObjectID= require('mongodb/bson/bson').ObjectID,
    Server= require('mongodb/connection').Server;

  

// --- Store.Memory
exports.Store= Session.Store;

exports.Store.MongoDb = exports.Store.extend({
  
  /**
   * Datastore name.
   */
  
  name: 'MongoDb',
  
  /**
   * Initialize mongoDb sesusion store.
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
   * (Always check the id of the returned session, if it differs from the one you requested, then
   *  we had to create a new one.)
   *
   * @param  {int} sid
   * @return {Session}
   * @api private
   */
  fetch: function(sid, callback) {
    var self= this;
    this.db.collection('sessions',function(error, collection) {
      if(error) callback(error);
      else {
        collection.findOne({"_id":ObjectID.createFromHexString(sid)}, function(error, session) {
          if(error) callback(error);
          else {
            if( session )  callback( null, self._createSessionFromDocument(session) )
            else {
              self.newId(function(error, newId){ 
                sess= {"_id": ObjectID.createFromHexString(newId) };
                 callback( null, self._createSessionFromDocument(sess) );
              });
            }
          }; 
        });     
      }
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
    this._getSessionCollection(function(error, collection) {
      if(error) callback(error);
      else {
         collection.save(self._createDocumentFromSession(session), function(error, doc) {
            if( error ) callback(error);
            else { 
              callback( null, session )
            }
          });
      }
    });
  },
  
  /**
   * Clear all sessions.
   *
   * @api public
   */
  
  clear: function() {
    this._getSessionCollection(function(error, collection) {
      collection.remove();
    });
  },
  
  /**
   * Destroy session using the given _sid_.
   *
   * @param  {int} sid
   * @api public
   */
  
  destroy: function(sid) {
    this._getSessionCollection(function(error, collection) {
      collection.remove({"_id":ObjectID.createFromHexString(sid)});
    });
  },
  
  /**
   * Return the number of sessions currently stored.
   *
   * @return {int}
   * @api public
   */
  
  length: function(callback) {
    this._getSessionCollection(function(error, collection) {
      if(error) callback(error)
      else {
        collection.count( function(error, count){ 
          if(error) callback(error)
          else callback(null, count)
        });
      }
    }); 
  },
  
  /**
   * Reap sessions older than _ms_.
   *
   * @param  {int} ms
   * @api private
   */
  
  reap: function(ms,callback) {
    var threshold = Number(new Date(Number(new Date) - ms)) 
    this._getSessionCollection(function(error, collection){
      collection.remove({ "lastAccess" : { "$lt" : threshold }}, function(error, foo) {
        //bit worried about this callback being called repeatedly from the mongo driver..
        callback();
      });
    });
  },
  
  /**
   * Retrieve a new id for use as a session identifer
   *
   * @param {function} callback
   * @api private
   */
  newId: function(callback) { 
    this._getSessionCollection(function(error, collection) {
      if(error) callback(error);
      else {
        collection.insert({"lastAccess": Number(new Date())}, function(error, docs) {
          if(error) callback(error);
          else {
            callback(null, docs[0]._id.toHexString());
          }
        });
      }
    });
  },
  
  // Get hold of the active mongodb sessions collection.
  _getSessionCollection: function(callback) {
    this.db.collection('sessions', callback);
  },
  
  //Basic demo-purpose key copying persistences....
  _createSessionFromDocument: function(document) {
    var session= new Session.Base(document._id.toHexString());
    //TODO: do a proper deep merge.
    for(var prop in document) session[prop]= document[prop];
    return session;     
  },
  
  _createDocumentFromSession: function(session) {
     var document=   {};
     for(var prop in session) {
       /* Ughh.. create a default 'Session.Base' at least once on startup to figure out ignorable properties bleurgh
          or perhaps just skip id and functions? */
       if( prop != 'id' && prop != 'init' && prop != 'touch') {
         document[prop]= session[prop];
       }
     }  
     return document;
  }
})