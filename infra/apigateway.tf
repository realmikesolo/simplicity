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
        uri                    = aws_lambda_function.list_announcements.invoke_arn
        payload_format_version = "2.0"
      }
    }

    "POST /announcements" = {
      integration = {
        uri                    = aws_lambda_function.create_announcement.invoke_arn
        payload_format_version = "2.0"
      }
    }

    "GET /announcements/{id}" = {
      integration = {
        uri                    = aws_lambda_function.get_announcement.invoke_arn
        payload_format_version = "2.0"
      }
    }

    "PATCH /announcements/{id}" = {
      integration = {
        uri                    = aws_lambda_function.update_announcement.invoke_arn
        payload_format_version = "2.0"
      }
    }

    "DELETE /announcements/{id}" = {
      integration = {
        uri                    = aws_lambda_function.delete_announcement.invoke_arn
        payload_format_version = "2.0"
      }
    }

    "GET /categories" = {
      integration = {
        uri                    = aws_lambda_function.list_categories.invoke_arn
        payload_format_version = "2.0"
      }
    }

    "POST /categories" = {
      integration = {
        uri                    = aws_lambda_function.create_category.invoke_arn
        payload_format_version = "2.0"
      }
    }
  }
}
