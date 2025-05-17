# terraform/firebase.tf (or similar)

resource "google_project_service" "firebase_apis" {
  for_each = toset([
    "firebase.googleapis.com",                          
    "identitytoolkit.googleapis.com",
                  
    "firestore.googleapis.com"                        
  ])
  // "firebaseauth.googleapis.com",                      
    //"firebaserules.googleapis.com",   

  project                    = var.gcp_project_id
  service                    = each.key
  disable_dependent_services = false
  disable_on_destroy         = false 
}