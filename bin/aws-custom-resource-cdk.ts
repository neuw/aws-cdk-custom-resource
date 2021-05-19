import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { AwsCustomResourceCdkStack } from '../lib/aws-custom-resource-cdk-stack';

const app = new cdk.App();
const APP_STAGE = process.env.APP_STAGE || 'DEMO';

new AwsCustomResourceCdkStack(app, 'AwsCustomResourceCdkStack', {

    stackName: 'AwsCustomResourceCdkStack-'+APP_STAGE

});
