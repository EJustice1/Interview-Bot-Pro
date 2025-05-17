# terraform/iam.tf

resource "google_service_account" "user_auth_function_sa" {
  project      = var.gcp_project_id
  account_id   = "user-auth-service-sa" // Choose a unique ID for the service account
  display_name = "User Authentication Service Account"
}

resource "google_project_iam_member" "user_auth_sa_firebase_auth_viewer" {
  project = var.gcp_project_id
  role    = "roles/firebaseauth.viewer" # Allows reading user properties, useful for token verification context
  member  = "serviceAccount:${google_service_account.user_auth_function_sa.email}"
}

resource "google_project_iam_member" "user_auth_sa_secret_accessor" {
  project = var.gcp_project_id
  role    = "roles/secretmanager.secretAccessor"
  member  = "serviceAccount:${google_service_account.user_auth_function_sa.email}"
}

# Ensure it can access Firestore if it needs to read/write user profile data you manage
resource "google_project_iam_member" "user_auth_sa_firestore_user" {
  project = var.gcp_project_id
  role    = "roles/datastore.user" # Role for Firestore access
  member  = "serviceAccount:${google_service_account.user_auth_function_sa.email}"
}
