import { withLambda } from "@netlify/aws-lambda-compat";
import serverless from "serverless-http";
import app from "./_shared/backend/app.cjs";

export default withLambda(serverless(app));

