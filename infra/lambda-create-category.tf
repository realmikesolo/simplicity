resource "aws_cloudwatch_log_group" "create_category" {
  name              = "/aws/lambda/create-category"
  retention_in_days = 7
}

data "archive_file" "create_category" {
  type             = "zip"
  source_dir       = "${path.module}/../dist/lambda/create-category"
  output_path      = "${path.module}/../dist/lambda/create-category.zip"
  output_file_mode = "0666"
  depends_on       = [terraform_data.lambda_build]
}

resource "aws_lambda_function" "create_category" {
  function_name    = "create-category"
  handler          = "create-category.handler"
  filename         = data.archive_file.create_category.output_path
  source_code_hash = data.archive_file.create_category.output_base64sha256
  role             = aws_iam_role.lambda.arn
  runtime          = "nodejs22.x"
  memory_size      = 1024
  timeout          = 6

  environment {
    variables = local.lambda_common_env
  }
}

resource "aws_lambda_permission" "create_category" {
  function_name = aws_lambda_function.create_category.function_name
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${module.apigateway_http.api_execution_arn}/*"
}
