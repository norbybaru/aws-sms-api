'use strict';

const uuid   = require('uuid');
const moment = require('moment');
const AWS    = require('aws-sdk');

class RecordsAdapter
{
    /**
     * Class constructor
     * @param {Object} config
     */
    constructor( config )
    {
        this.config = config;

        AWS.config.update( { region: this.config.aws.region } );
        this.DynamoDB = new AWS.DynamoDB.DocumentClient( {
            convertEmptyValues: true
        } );
    }

    /**
     * Creates a record in the Database for the SMS
     * @param  {Object} sms
     * @return {Promise|Object}
     */
    createRecord( sms )
    {
        const params = {
            TableName: this.config.db.tables.smsRecords,
            Item: {
                'id'         : uuid.v4(),
                'snsId'      : sms.id,
                'phoneNumber': sms.phoneNumber,
                'message'    : sms.message,
                'dateSent'   : moment.utc().format(),
            }
        };

        return new Promise( ( resolve, reject ) => 
        {
            this.DynamoDB.put( params, ( err, data ) => 
            {
                if ( err ) return reject( err );

                resolve( params.Item );
            } );
        } );
    }

    /**
     * Get all the records stored for a phone number
     * @param  {String} phoneNumber
     * @return {Promise|Object}
     */
    getRecords( phoneNumber )
    {
        const params = {
            TableName: this.config.db.tables.smsRecords,
            FilterExpression: 'phoneNumber = :phoneNumber',
            ExpressionAttributeValues: {
                ':phoneNumber': phoneNumber
            }
        };

        return new Promise( ( resolve, reject ) => 
        {
            this.DynamoDB.scan( params, ( err, data ) => 
            {
                if ( err ) return reject( err );

                resolve( data.Items );
            } );
        } );
    }
}

module.exports = RecordsAdapter;
