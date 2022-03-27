'use strict';
const SQS = require("aws-sdk/clients/sqs");
const DynamoDB = require("aws-sdk/clients/dynamodb");
// ENV
const ORDER_QUEUE_URL = process.env.ORDER_QUEUE_URL;
const ORDER_TABLE_NAME = process.env.ORDER_TABLE_NAME;

module.exports.receiveOrder = async (event) => {
  const sqs = new SQS({ region: 'us-east-1' });
  const body = JSON.parse(event.body);
  try {
    // Enqueue in SQS
    const params = {
      MessageBody: JSON.stringify(body),
      QueueUrl: ORDER_QUEUE_URL,
    }
    const result = await sqs.sendMessage(params).promise();
    return {
      statusCode: 200,
      body: JSON.stringify(result)
    };
  } catch (err) {
    console.log(err);
    return {
      statusCode: 500,
      body: JSON.stringify(err)
    };
  }
};

module.exports.orderProcess = async (event, context) => {
  try {
    let documentClient = new DynamoDB.DocumentClient({ region: "us-east-1" });
    for (let { body } of event.Records) {
      body = JSON.parse(body);
      // verify the product details
      // charge the customer
      // record the order in the db
      let params = {
        TableName: ORDER_TABLE_NAME,
        Item: {
          orderId: body.orderId,
          quantity: body.quantity
        }
      }
      console.log(params);
      await documentClient.put(params).promise();
    }

  } catch (e) {
    console.log(e);
    throw e;
  }
}