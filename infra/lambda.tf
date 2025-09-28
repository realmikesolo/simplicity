resource "terraform_data" "lambda_build" {
  triggers_replace = [timestamp()]

  provisioner "local-exec" {
    command     = "pnpm run build"
    working_dir = "${path.module}/../"
  }
}
