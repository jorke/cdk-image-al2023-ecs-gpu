#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { ImagebuilderStack } from '../lib/imagebuilder-stack';

const app = new cdk.App({
  context: {
    info: {
      name: 'al2023-ecs-optimized-gpu',
    }
  }
});
new ImagebuilderStack(app, 'ImageBuilderStack', {
  tags: {
    'environment:type':'builder',
    'service:name':'build-image',
  },
  env: { region: 'ap-southeast-2' },
});