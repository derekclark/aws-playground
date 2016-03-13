// Require objects.
var express  = require('express');
var app      = express();
var aws      = require('aws-sdk');
var queueUrl = "https://sqs.eu-west-1.amazonaws.com/782879011243/MyFirstQueue";
    
// Load your AWS credentials and try to instantiate the object.
aws.config.loadFromPath(__dirname + '/config.json');

// Instantiate SQS.
var sqs = new aws.SQS();
var sns = new aws.SNS();

function sendMessage(res){
    var params = {
        MessageBody: 'Hello world!',
        QueueUrl: queueUrl,
        DelaySeconds: 0
    };

    sqs.sendMessage(params, function(err, data) {
        if(err) {
            res.send(err);
        }
   });
};

function receive(res, callback){
    var receiptHandle;
    var params = {
        QueueUrl: queueUrl,
        VisibilityTimeout: 10 // 10 sec wait time for anyone else to process.
    };

    sqs.receiveMessage(params, function(err, data) {
        if(err) {
            res.send(err);
        }
        else {
            receiptHandle =  data.Messages[0]["ReceiptHandle"];
            callback(res,receiptHandle);
        }
    });
};

function setMessageVisibility(res,receiptHandle){
    console.log('setting message visibility for message handle=' + receiptHandle);
    var params = {
       QueueUrl: queueUrl,
       VisibilityTimeout: 100,
       ReceiptHandle: receiptHandle
    };
    sqs.changeMessageVisibility(params, function(err, data) {
        if(err) {
            res.send(err);
        } 
       else {
            res.send(data);
	}
    });
};

// test which creates a message, receives a message, gets its receipt handle and then sets it message visibility
app.get('/messageTest',  function (req, res) {
    sendMessage(res);
    receive(res, setMessageVisibility); 
});

// Send to SQS with message attributes
app.get('/sendWithMessageAttributes', function (req, res) {
    var params = {
       MessageBody: 'locations/v5/glid/TPLN00000012133', /* required */
       QueueUrl: queueUrl, /* required */
       DelaySeconds: 0,
       MessageAttributes: {
         retryCount: {
           DataType: 'Number', /* required */
           StringValue: '1'
         }
       }
    };

    sqs.sendMessage(params, function(err, data) {
        if(err) {
            res.send(err);
        } 
        else {
            res.send(data);
        } 
    });
});

// Creating a sns topic.
app.get('/createSNS', function (req, res) {
    var params = {
        Name: "MyTopic2"
    };
    
    sns.createTopic(params, function(err, data) {
        if(err) {
            res.send(err);
        } 
        else {
            res.send(data);
        } 
    });
});

// list sns topics.
app.get('/listSNSTopics', function (req, res) {
    var params = {
    };
    
    sns.listTopics(params, function(err, data) {
        if(err) {
            res.send(err);
        } 
        else {
            res.send(data);
        } 
    });
});

// Creating a queue.
app.get('/create', function (req, res) {
    var params = {
        QueueName: "MyFirstQueue"
    };
    
    sqs.createQueue(params, function(err, data) {
        if(err) {
            res.send(err);
        } 
        else {
            res.send(data);
        } 
    });
});

// Listing our queues.
app.get('/list', function (req, res) {
    sqs.listQueues(function(err, data) {
        if(err) {
            res.send(err);
        } 
        else {
            res.send(data);
        } 
    });
});

// Sending a message.
// NOTE: Here we need to populate the queue url you want to send to.
// That variable is indicated at the top of app.js.
app.get('/send', function (req, res) {
    var params = {
        MessageBody: 'Hello world!',
        QueueUrl: queueUrl,
        DelaySeconds: 0
    };

    sqs.sendMessage(params, function(err, data) {
        if(err) {
            res.send(err);
        } 
        else {
            res.send(data);
        } 
    });
});

// Receive a message.
// NOTE: This is a great long polling example. You would want to perform
// this action on some sort of job server so that you can process these
// records. In this example I'm just showing you how to make the call.
// It will then put the message "in flight" and I won't be able to 
// reach that message again until that visibility timeout is done.
app.get('/receive', function (req, res) {
    var params = {
        QueueUrl: queueUrl,
        VisibilityTimeout: 600 // 10 min wait time for anyone else to process.
    };
    
    sqs.receiveMessage(params, function(err, data) {
        if(err) {
            res.send(err);
        } 
        else {
//          data object is already JSON
            var receiptHandle =  data.Messages[0]["ReceiptHandle"];
            console.log("Messages 1 ReceiptHandle:", receiptHandle);
            res.send(data);
        } 
    });
});

function getValue(c,d){
	return 'ok';
}

function getJsonValue(jsonKey,jsonString){
  var s = JSON.parse(jsonString, function(k,v){
          if (k === jsonKey) { return 'hi'; }
          return 'k';
  });
  console.log(s);
  return s;
}

// Deleting a message.
app.get('/delete', function (req, res) {
    var params = {
        QueueUrl: queueUrl,
        ReceiptHandle: receipt
    };
    
    sqs.deleteMessage(params, function(err, data) {
        if(err) {
            res.send(err);
        } 
        else {
            res.send(data);
        } 
    });
});

// Purging the entire queue.
app.get('/purge', function (req, res) {
    var params = {
        QueueUrl: queueUrl
    };
    
    sqs.purgeQueue(params, function(err, data) {
        if(err) {
            res.send(err);
        } 
        else {
            res.send(data);
        } 
    });
});

// Publish message to SNS
app.get('/publishSNS', function (req, res) {
  var params = {
    Message: 'This is the email body. This is line 1.', /* required */
    MessageAttributes: {
      someKey: {
        DataType: 'String', /* required */
/*
        BinaryValue: new Buffer('...') || 'STRING_VALUE',
*/
        StringValue: 'my String Value'
      },
      /* anotherKey: ... */
      anotherKey: {
        DataType: 'String', /* required */
/*
        BinaryValue: new Buffer('...') || 'STRING_VALUE',
*/
        StringValue: 'my String Value2'
      }
    },
    MessageStructure: 'STRING_VALUE',
    Subject: 'My subject',
/*    TargetArn:'', either specify targetArn or TopicArn but not both*/
    TopicArn: 'arn:aws:sns:eu-west-1:782879011243:MyTopic'
  };
    
    sns.publish(params, function(err, data) {
        if(err) {
            res.send(err);
        } 
        else {
            res.send(data);
        } 
    });
});



// Start server.
var server = app.listen(80, function () {
    var host = server.address().address;
    var port = server.address().port;

    console.log('AWS SQS example app listening at http://%s:%s', host, port);
});
