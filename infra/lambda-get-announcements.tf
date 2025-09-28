resource "aws_cloudwatch_log_group" "get_announcements" {
  name              = "/aws/lambda/get-announcements"
  retention_in_days = 7
}

data "archive_file" "get_announcements" {
  type             = "zip"
  source_dir       = "${path.module}/../dist/lambda/get-announcements"
  output_path      = "${path.module}/../dist/lambda/get-announcements.zip"
  output_file_mode = "0666"
  depends_on       = [terraform_data.lambda_build]
}

resource "aws_lambda_function" "get_announcements" {
  function_name    = "get-announcements"
  handler          = "get-announcements.handler"
  filename         = data.archive_file.get_announcements.output_path
  source_code_hash = data.archive_file.get_announcements.output_base64sha256
  role             = aws_iam_role.lambda.arn
  runtime          = "nodejs22.x"
  memory_size      = 1024
  timeout          = 6
}

resource "aws_lambda_permission" "get_announcements" {
  function_name = aws_lambda_function.get_announcements.function_name
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${module.apigateway_http.api_execution_arn}/*"
}
