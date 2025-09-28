data "aws_rds_engine_version" "postgresql" {
  engine  = "aurora-postgresql"
  version = "17.4"
}

module "aurora_postgresql" {
  source  = "terraform-aws-modules/rds-aurora/aws"
  version = "9.15.0"

  name            = "simplicity-postgresql"
  engine          = data.aws_rds_engine_version.postgresql.engine
  engine_version  = data.aws_rds_engine_version.postgresql.version
  master_username = "root"

  vpc_id               = module.vpc.vpc_id
  db_subnet_group_name = module.vpc.database_subnet_group_name
  security_group_rules = {
    vpc_ingress = {
      cidr_blocks = module.vpc.private_subnets_cidr_blocks
    }
  }

  apply_immediately   = true
  skip_final_snapshot = true

  enable_http_endpoint = true

  serverlessv2_scaling_configuration = {
    min_capacity             = 0
    max_capacity             = 10
    seconds_until_auto_pause = 3600
  }

  instance_class = "db.serverless"
  instances = {
    one = {}
  }
}

data "aws_availability_zones" "available" {}

locals {
  vpc_cidr = "10.0.0.0/16"
  azs      = slice(data.aws_availability_zones.available.names, 0, 3)
}

module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "6.3.0"

  name = "simplicity-vpc"
  cidr = local.vpc_cidr

  azs              = local.azs
  public_subnets   = [for k, v in local.azs : cidrsubnet(local.vpc_cidr, 8, k)]
  private_subnets  = [for k, v in local.azs : cidrsubnet(local.vpc_cidr, 8, k + 3)]
  database_subnets = [for k, v in local.azs : cidrsubnet(local.vpc_cidr, 8, k + 6)]
}
