// Require objects.
var express  = require('express');
var app      = express();
var aws      = require('aws-sdk');
var queueUrl = "https://sqs.eu-west-1.amazonaws.com/782879011243/MyFirstQueue";
var receipt  = "AQEBle8lwqo13gT7uM/NDxWAmddOQU5UpfkALtQzTGcXNErVk55JjmJiwgK1dlSB6Qs8HhUUXGZ5Ly0qaYO+XZBcsBsTb/kvyKY6cyOjg8OhL/ghhxSixULLlCy2oaXA2NJKbdIef3uxfuzMUr3ygQok1jvknRALS1kk20HG6+l0LIHLhuvO0YSgMIU2edfFKfc3YF57tldpcQ97/3zqD0dz+EBAqyDDIsVJMTPlFDbhjM7LMbuQ2s0jeBrKzHZunMKElHcheo0jwy76MV7D3JQr+QBRZD4sZ2J7uIJu/9G11Ub3dQfOf5zTz4//CFl0LsYuRuykTjl3WByDsufhCBE1EckT2eiDg3Y0vZjF59oIwv+vIO5Jm/NTVLrAE+OLm8sA";
    
// Load your AWS credentials and try to instantiate the object.
aws.config.loadFromPath(__dirname + '/config.json');

// Instantiate SQS.
var sqs = new aws.SQS();
var sns = new aws.SNS();

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
            res.send(data);
        } 
    });
});

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
