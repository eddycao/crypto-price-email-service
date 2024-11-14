const AWS = require('aws-sdk');
const axios = require('axios');

const region = 'ap-southeast-2'; // This is the sydney region, not so sure melbourne support these services so leave it with sydney
AWS.config.update({ region });

const ses = new AWS.SES();
const dynamoDB = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
    //preflight request
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS'
            },
            body: ''
        };
    }

    try {
        const { cryptoId, userEmail } = JSON.parse(event.body);

        
        if (!cryptoId || !userEmail) {
            return {
                statusCode: 400,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': '*',
                    'Access-Control-Allow-Methods': 'POST, OPTIONS'
                },
                body: JSON.stringify({ message: 'No cryptoId or userEmail body.' })
            };
        }

        // Call CoinGecko API
        const response = await axios.get(`https://api.coingecko.com/api/v3/simple/price`, {
            params: {
                ids: cryptoId,
                vs_currencies: 'aud'
            }
        });

        if (!response.data || !response.data[cryptoId]) {
            return {
                statusCode: 404,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': '*',
                    'Access-Control-Allow-Methods': 'POST, OPTIONS'
                },
                body: JSON.stringify({ message: 'Cryptocurrency not found.' })
            };
        }

        const price = response.data[cryptoId].aud;

        // Build email content with HTML and Text formatting
        const emailParams = {
            Destination: {
                ToAddresses: [userEmail]
            },
            Message: {
                Body: {
                    Html: {
                        Charset: 'UTF-8',
                        Data: `
                            <html>
                            <body>
                                <h2 style="color: #2e6c80;">Hello,</h2>
                                <p style="font-size: 16px;">The current price of <strong>${cryptoId}</strong> is <strong>$${price}</strong>.</p>
                                <p style="font-size: 16px;">Remember, investing in crypto is like riding a roller coaster—thrilling but hold on tight!</p>
                                <p style="font-size: 16px;">Best regards,<br/>
                                Demo Service</p>
                                <hr/>
                                <p style="font-size: 12px; color: gray;"><em>Information provided by Jun's demo, data reference: https://api.coingecko.com/api/v3/simple/price</em></p>
                            </body>
                            </html>
                        `
                    },
                    Text: {
                        Charset: 'UTF-8',
                        Data: `Hello,

The current price of ${cryptoId} is $${price}.

Remember, investing in crypto is like riding a roller coaster—thrilling but hold on tight!

Best regards,
Demo Service

Information provided by Jun's demo, data reference: https://api.coingecko.com/api/v3/simple/price`
                    }
                },
                Subject: {
                    Charset: 'UTF-8',
                    Data: `Cryptocurrency Price Update: ${cryptoId}`
                }
            },
            Source: 'cao1542980497@icloud.com'
        };

        // Send email via SES
        await ses.sendEmail(emailParams).promise();

        // Create search record
        const searchRecord = {
            userEmail: userEmail,
            timestamp: new Date().toISOString(),
            cryptoId: cryptoId
        };

        // Save search record to DynamoDB
        const dbParams = {
            TableName: 'CryptoSearchHistory',
            Item: searchRecord
        };

        await dynamoDB.put(dbParams).promise();

        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS'
            },
            body: JSON.stringify({ message: 'Email sent successfully.' })
        };
    } catch (error) {
        console.error(error);
        return {
            statusCode: 500,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS'
            },
            body: JSON.stringify({ message: 'Internal server error.' })
        };
    }
};
