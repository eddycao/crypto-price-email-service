const AWS = require('aws-sdk');
const axios = require('axios');

const region = 'ap-southeast-2'; // Set AWS region to Sydney
AWS.config.update({ region });

const ses = new AWS.SES();
const dynamoDB = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
    try {
        const { cryptoId, userEmail } = JSON.parse(event.body);

        // Validate input parameters
        if (!cryptoId || !userEmail) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: 'Missing cryptoId or userEmail in request body.' })
            };
        }

        // Call CoinGecko API to get cryptocurrency price
        const response = await axios.get(`https://api.coingecko.com/api/v3/simple/price`, {
            params: {
                ids: cryptoId,
                vs_currencies: 'aud'
            }
        });

        if (!response.data || !response.data[cryptoId]) {
            return {
                statusCode: 404,
                body: JSON.stringify({ message: 'Cryptocurrency not found.' })
            };
        }

        const price = response.data[cryptoId].aud;

        // Build email content with HTML formatting
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
                                Crypto Service Team</p>
                                <hr/>
                                <p style="font-size: 12px; color: gray;"><em>Data provided by Jun</em></p>
                            </body>
                            </html>
                        `
                    },
                    Text: {
                        Charset: 'UTF-8',
                        Data: `Hello,\n\nThe current price of ${cryptoId} is $${price}.\n\nRemember, investing in crypto is like riding a roller coaster—thrilling but hold on tight!\n\nBest regards,\nCrypto Service Team\n\nData provided by Jun's demo\n reference: https://api.coingecko.com/api/v3/simple/price`
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
            body: JSON.stringify({ message: 'Email sent successfully.' })
        };
    } catch (error) {
        console.error(error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Internal server error.' })
        };
    }
};
