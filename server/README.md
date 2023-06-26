# Api Boilerplate

## Set-up steps

### 1. Update node version to one on the server
####   Make sure to set the version of your local node to match the version on the server to avoid unpredictable results after deploying your code to cloud environments.

### 2. Install mysql
####   Locally or into a docker container

### 3. Create a mysql user and database

### 5. Set environment variables
####   run
    cp .env.sample .env
####   and change values to real ones inside .env.

### 6. Install dependencies
    npm i

### 7. Start app
    npm run dev


## Lambdas deployment

Update `service`, `projectName`, `bucketName`, and `executionRole` to actual values (you can grab them from cloudformation outputs).

If no lambda needs access to DB (or any other internal services), you don't need to do any extra actions. Your lambdas already may be executed and have access to the Internet.

If some of your lambdas need access to DB, you must uncomment and configure `securityGroupId`, `subnetId1`, `subnetId2` (you can grab them from cloudformation outputs). Also, uncomment the `vpc` block under `provider`.

Optionally you may also uncomment `dbHost` and `environment` block to set up environment variables while lambdas creation/updating.
You can also add other environment variables. But be sure you don't add any sensitive data. Such parameters should be added manually on AWS.

If you need to set up different resources/environments/timeout etc. for different functions, it's possible to override them under a particular function definition. You can find a lot of examples [here](https://www.serverless.com/framework/docs/providers/aws/guide/serverless.yml).
