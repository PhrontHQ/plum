var DataWorker = require("montage/worker/data-worker").DataWorker;


/**
 * A Worker is any object that can handle messages from a serverless function
 * to implement custom businsess logic
 *
 * @class PlummingIntakeWorker
 * @extends Worker
 */
exports.PlummingDataWorker = DataWorker.specialize( /** @lends PlummingDataWorker.prototype */{
    constructor: {
        value: function DataWorker() {
            this.super();
        }
    },
    
    handleAuthorize: {
        value: async function(event, context, callback) {
            //console.log("PlummingDataWorker -handleAuthorize: event:",event, "context:", context);
            //console.log("PlummingDataWorker -handleConnect: event:",JSON.stringify(event), "context:", JSON.stringify(context));
            return this.super(event, context, callback);
        }
    },

    handleConnect: {
        value: function(event, context, callback) {
            //console.log("PlummingDataWorker -handleConnect: event:",event, "context:", context);
            //console.log("PlummingDataWorker -handleConnect: event:",JSON.stringify(event), "context:", JSON.stringify(context));
            return this.super(event, context, callback);
        }
    },
    handleMessage: {
        value: async function(event, context, callback) {
            //console.log("PlummingDataWorker -handleMessage: event:",JSON.stringify(event), "context:", JSON.stringify(context));
            return this.super(event, context, callback);
        }
    },
    handleDisconnect: {
        value: function(event, context, callback) {
            //console.log("PlummingDataWorker -handleDisconnect: event:",JSON.stringify(event), "context:", JSON.stringify(context));
            return this.super(event, context, callback);
        }
    }

});
