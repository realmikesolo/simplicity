terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.14"
    }
  }

  required_version = "~> 1.13.3"
}

provider "aws" {
  region = "eu-west-1"
}

data "aws_region" "current" {}
data "aws_caller_identity" "current" {}
