# terraform/backend.tf

terraform {
  backend "gcs" {
    bucket = var.terraform_state_bucket_name
    prefix = "terraform/state" 
  }
}