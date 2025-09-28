module "apigateway_http" {
  source  = "terraform-aws-modules/apigateway-v2/aws"
  version = "5.3.0"

  name                         = "simplicity"
  protocol_type                = "HTTP"
  disable_execute_api_endpoint = false
  create_domain_name           = false
  create_domain_records        = false
  create_certificate           = false

  routes = {
    "GET /announcements" = {
      integration = {
        uri                    = aws_lambda_function.get_announcements.invoke_arn
        payload_format_version = "2.0"
      }
    }
  }
}
