import * as cdk from '@aws-cdk/core';
import {CfnOutput, CustomResource, Duration, Fn, Reference} from '@aws-cdk/core';
import {IUserPool, UserPool, UserPoolClient} from "@aws-cdk/aws-cognito";

import {v4 as uuidV4} from "uuid";

const APP_STAGE = process.env.APP_STAGE || 'DEMO';

export class AwsCustomResourceCdkStack extends cdk.Stack {
    constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        let defaultSystemUserPool: IUserPool = new UserPool(this, "SYSTEM" + "-" + APP_STAGE, {
            userPoolName: "SYSTEM-USER-POOL" + "-" + APP_STAGE
        });

        let defaultSystemUserPoolClientId: UserPoolClient = defaultSystemUserPool.addClient(uuidV4(), {
            userPoolClientName: "SYSTEM-DEFAULT-CLIENT" + "-" + APP_STAGE,
            oAuth: {
                callbackUrls: ["http://localhost:3000/callback", "https://neuw.in/callback"],
                logoutUrls: ["http://localhost:3000/logout", "https://neuw.in/logout"]
            },
            accessTokenValidity: Duration.hours(2),
            refreshTokenValidity: Duration.hours(2),
            idTokenValidity: Duration.hours(2)
        });

        let name = APP_STAGE.toLowerCase()+'-clients-ddb-manager-stack';

        let customResource: CustomResource = new CustomResource(this, "defaultClientEntryManager", {
            serviceToken: Fn.importValue(name + '-ServiceToken'),
            properties: {
                "client_id": defaultSystemUserPoolClientId.userPoolClientId,
                "user_pool_name": "SYSTEM-DEFAULT" + "-" + APP_STAGE,
                "user_pool_id": defaultSystemUserPool.userPoolId,
                "client_name": "SYSTEM-DEFAULT-CLIENT" + "-" + APP_STAGE,
                "account_name": "SYSTEM" + "-" + APP_STAGE
            }
        });

        let customResourceResult:Reference = customResource.getAtt("status")

        let customResourceResultOutput: CfnOutput = new CfnOutput(this, 'customResourceResult', {
            value: customResourceResult.toString(),
            exportName: APP_STAGE + '-' + 'customResourceResult',
            description: 'custom Resource Result'
        });

        let defaultSystemUserPoolOutput: CfnOutput = new CfnOutput(this, 'defaultSystemUserPoolArn', {
            value: defaultSystemUserPool.userPoolArn,
            exportName: APP_STAGE + '-' + 'defaultSystemUserPoolArn',
            description: 'default System User Pool Arn'
        });

        let defaultSystemUserPoolClientOutput: CfnOutput = new CfnOutput(this, 'defaultSystemUserPoolClientId', {
            value: defaultSystemUserPoolClientId.userPoolClientId,
            exportName: APP_STAGE + '-' + 'defaultSystemUserPoolClientIdArn',
            description: 'default System User Pool Client Id Arn'
        });

    }
}
