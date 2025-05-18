# terraform/api_gateway.tf

# 1. Define the API itself
resource "google_api_gateway_api" "user_auth_api" {
  provider     = google-beta 
  project      = var.gcp_project_id
  api_id       = "user-auth-api"
  display_name = "User Authentication API"
}

# 2. Define the API Config, using the OpenAPI spec with the templatefile() function
resource "google_api_gateway_api_config" "user_auth_api_config" {
  provider     = google-beta 
  project       = var.gcp_project_id
  api           = google_api_gateway_api.user_auth_api.api_id
  api_config_id = "user-auth-config-v4" # Increment this version
  display_name  = "User Authentication API Config v4" # Optionally update display name

  openapi_documents {
    document {
      path     = "spec.yaml"
      contents = base64encode(templatefile("${path.module}/openapi-spec.yaml", {
        user_auth_function_url = google_cloudfunctions2_function.user_auth_service.service_config[0].uri,
        firebase_project_id    = var.firebase_project_id
      }))
    }
  }

  #lifecycle {
   # create_before_destroy = true
  #}

  depends_on = [google_cloudfunctions2_function.user_auth_service]
}

# 3. Define the Gateway, which deploys the API Config
resource "google_api_gateway_gateway" "user_auth_gateway" {
  provider     = google-beta 
  project      = var.gcp_project_id
  api_config   = google_api_gateway_api_config.user_auth_api_config.id
  gateway_id   = "user-auth-gateway"
  region       = var.gcp_region
  display_name = "User Authentication Gateway"

  depends_on = [google_api_gateway_api_config.user_auth_api_config]
}

# Output the Gateway URL
output "api_gateway_invoke_url" {
  description = "Invoke URL for the API Gateway."
  value       = "https://${google_api_gateway_gateway.user_auth_gateway.default_hostname}"
}

# IAM: API Gateway needs permission to invoke your Cloud Function.
data "google_project" "project" {
  project_id = var.gcp_project_id
}

resource "google_cloud_run_service_iam_member" "api_gateway_invokes_user_auth_function" {
  provider = google-beta
  project  = var.gcp_project_id
  location = var.gcp_region
  service  = google_cloudfunctions2_function.user_auth_service.name
  role     = "roles/run.invoker"
  member   = "serviceAccount:service-${data.google_project.project.number}@gcp-sa-apigateway.iam.gserviceaccount.com"

  depends_on = [
    google_cloudfunctions2_function.user_auth_service,
    google_api_gateway_gateway.user_auth_gateway
  ]
}