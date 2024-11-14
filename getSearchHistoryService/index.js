const AWS = require('aws-sdk');

// This is the sydney region, not so sure melbourne support these services so leave it with sydney
const region = 'ap-southeast-2';
AWS.config.update({ region });

const dynamoDB = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
    // preflight request
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS'
            },
            body: ''
        };
    }

    try {
        let userEmail;

        //userEmail from query parameters
        if (event.queryStringParameters && event.queryStringParameters.userEmail) {
            userEmail = event.queryStringParameters.userEmail;
        } else {
            return {
                statusCode: 400,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': '*',
                    'Access-Control-Allow-Methods': 'GET, OPTIONS'
                },
                body: JSON.stringify({ message: 'Missing userEmail in query parameters.' })
            };
        }

        // Query DynamoDB to get search history
        const params = {
            TableName: 'CryptoSearchHistory',
            KeyConditionExpression: 'userEmail = :email',
            ExpressionAttributeValues: {
                ':email': userEmail
            },
            ScanIndexForward: false 
        };

        const result = await dynamoDB.query(params).promise();

        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS'
            },
            body: JSON.stringify({ searchHistory: result.Items })
        };
    } catch (error) {
        console.error(error);
        return {
            statusCode: 500,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS'
            },
            body: JSON.stringify({ message: 'Internal server error.' })
        };
    }
};
