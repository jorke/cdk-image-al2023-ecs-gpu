import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as imagebuilder from 'aws-cdk-lib/aws-imagebuilder';
import * as assets from 'aws-cdk-lib/aws-s3-assets'
import * as path from 'path'
import * as iam from 'aws-cdk-lib/aws-iam'


export class ImagebuilderStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const context = this.node.tryGetContext('info')
    const name = context.name
    
    const driverAsset = new assets.Asset(this, 'driverasset', {
      path: path.join(__dirname, '../nvidia_drivers_cuda.yaml'),
    });

    const rebootAsset = new assets.Asset(this, 'rebootasset', {
      path: path.join(__dirname, '../rebooter.yaml'),
    });

    const drivers = new imagebuilder.CfnComponent(this, 'drivers', {
      name: 'nvidia_driver_cuda',
      platform: 'Linux',
      version: '1.0.0',
      uri: driverAsset.s3ObjectUrl,
      supportedOsVersions: ["Amazon Linux 2023"],
    })

    const reboot = new imagebuilder.CfnComponent(this, 'rebooter', {
      name: 'rebooter',
      platform: 'Linux',
      version: '1.0.0',
      uri: rebootAsset.s3ObjectUrl,
      supportedOsVersions: ["Amazon Linux 2023"],
    })

    const imageRecipe = new imagebuilder.CfnImageRecipe(this, 'mageRecipe', {
      components: [
        { componentArn: drivers.attrArn },
        { componentArn: reboot.attrArn },
      ],
      name,
      parentImage: `arn:aws:imagebuilder:${this.region}:aws:image/amazon-linux-2023-ecs-optimized-x86/x.x.x`,
      version: '1.0.0',
      additionalInstanceConfiguration: {
        systemsManagerAgent: {
          uninstallAfterBuild: false,
        },
        // userDataOverride: 'userDataOverride',
      },
    });

    const ec2role = new iam.Role(this, 'instance-role', {
      assumedBy: new iam.ServicePrincipal("ec2.amazonaws.com"),
    })
    ec2role.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName("EC2InstanceProfileForImageBuilder"))
    ec2role.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName("AmazonSSMManagedInstanceCore"))
    
    const instanceProfileRole = new iam.InstanceProfile(this, "profile-role", {role: ec2role})
    
    const infraConfig = new imagebuilder.CfnInfrastructureConfiguration(this, 'infraConfig', {
      instanceProfileName: instanceProfileRole.instanceProfileName,
      name,
    });

    const distroConfig = new imagebuilder.CfnDistributionConfiguration(this, 'distroConfig', {
      name,
      distributions: [
        { 
          region: 'ap-southeast-2',
          amiDistributionConfiguration: {}
        },
        { 
          region: 'us-east-1',
          amiDistributionConfiguration: {}
        }
      ],
    });

    const imagePipeline = new imagebuilder.CfnImagePipeline(this, 'imagePipeline', {
      infrastructureConfigurationArn: infraConfig.attrArn,
      name,
      distributionConfigurationArn: distroConfig.attrArn,
      imageRecipeArn: imageRecipe.attrArn,
    });

    new cdk.CfnOutput(this, 'pipelinearn', { value: imagePipeline.attrArn, });


  }
}
