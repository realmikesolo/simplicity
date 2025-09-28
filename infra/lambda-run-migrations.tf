resource "aws_cloudwatch_log_group" "run_migrations" {
  name              = "/aws/lambda/run-migrations"
  retention_in_days = 7
}

data "archive_file" "run_migrations" {
  type             = "zip"
  source_dir       = "${path.module}/../dist/lambda/run-migrations"
  output_path      = "${path.module}/../dist/lambda/run-migrations.zip"
  output_file_mode = "0666"
  depends_on       = [terraform_data.lambda_build]
}

resource "aws_lambda_function" "run_migrations" {
  function_name    = "run-migrations"
  handler          = "run-migrations.handler"
  filename         = data.archive_file.run_migrations.output_path
  source_code_hash = data.archive_file.run_migrations.output_base64sha256
  role             = aws_iam_role.lambda.arn
  runtime          = "nodejs22.x"
  memory_size      = 1024
  timeout          = 6

  environment {
    variables = {
      AURORA_POSTGRESQL_CLUSTER_SECRET_ARN = module.aurora_postgresql.cluster_master_user_secret[0].secret_arn
      AURORA_POSTGRESQL_CLUSTER_ARN        = module.aurora_postgresql.cluster_arn
    }
  }
}
