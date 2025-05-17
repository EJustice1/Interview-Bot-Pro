# terraform/backend.tf

terraform {
  backend "gcs" {
    bucket = "interviewbotpro-460106-tfstate" 
    prefix = "terraform/state" 
  }
}