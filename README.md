# AL2023 ECS optimized NVIDIA GPU support

* `npm run build`   compile typescript to js
* `npm run watch`   watch for changes and compile
* `npm run test`    perform the jest unit tests
* `npx cdk deploy`  deploy this stack to your default AWS account/region
* `npx cdk diff`    compare deployed stack with current state
* `npx cdk synth`   emits the synthesized CloudFormation template

# Deploy

`npx cdk deploy`

note the output pipeline arn. eg:

`ImageBuilderStack.pipelinearn = arn:aws:imagebuilder:ap-southeast-2:xxxxx:image-pipeline/al2023-ecs-optimized-gpu`


# Build image

`aws imagebuilder start-image-pipeline-execution --image-pipeline-arn arn:aws:imagebuilder:ap-southeast-2:xxxxx:image-pipeline/al2023-ecs-optimized-gpu`

# List AMIs built.

`aws imagebuilder list-image-pipeline-images --image-pipeline-arn arn:aws:imagebuilder:ap-southeast-2:xxxxx:image-pipeline/al2023-ecs-optimized-gpu`

