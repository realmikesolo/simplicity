locals {
  lambda_common_env = {
    AURORA_POSTGRESQL_CLUSTER_SECRET_ARN = module.aurora_postgresql.cluster_master_user_secret[0].secret_arn
    AURORA_POSTGRESQL_CLUSTER_ARN        = module.aurora_postgresql.cluster_arn
    DATABASE_NAME                        = "postgres"
  }
}

resource "terraform_data" "lambda_build" {
  triggers_replace = [timestamp()]

  provisioner "local-exec" {
    command     = "pnpm run build"
    working_dir = "${path.module}/../"
  }
}
