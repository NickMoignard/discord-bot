variable "do_token" {}
variable "pvt_key_path" {}
provider "digitalocean" {
  token = var.do_token
}


data "digitalocean_ssh_key" "terraform" {
  name = "warranwood-1"
}